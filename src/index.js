import discord from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const {
  Client,
  Intents,
  MessageEmbed,
  Permissions,
  WebhookClient
} = discord;

const SUPPORTED_WEBHOOK_CHANNEL_TYPES = new Set(['GUILD_TEXT', 'GUILD_NEWS']);

function defaultConfigPath() {
  const candidates = [
    path.join(process.cwd(), 'config.yml'),
    path.join(process.cwd(), 'config.yaml')
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

const configPath = process.env.CONFIG_PATH || defaultConfigPath();

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  const raw = fs.readFileSync(configPath, 'utf8');
  return YAML.parse(raw) ?? {};
}

const config = loadConfig();
const webhookConfig = config.webhook ?? {};
const threadConfig = config.thread ?? {};
const token = process.env.DISCORD_TOKEN || config.token;
const targetChannelId = String(config.target_channel_id ?? '');
const webhookName = webhookConfig.default_name || webhookConfig.name || 'Webhook Sender';

if (!token || token === 'PUT_YOUR_BOT_TOKEN_HERE') {
  throw new Error('Set the bot token in config.yml or through the DISCORD_TOKEN environment variable.');
}

if (!/^\d{17,20}$/.test(targetChannelId)) {
  throw new Error('Set target_channel_id to a valid Discord channel ID.');
}

function describeDiscordError(error) {
  if (error?.code === 50001) {
    return 'Missing Access: the bot cannot access the configured channel. Check that it is in the server, target_channel_id is correct, and the bot role can view the channel.';
  }

  if (error?.code === 50013) {
    return 'Missing Permissions: the bot can access the channel, but it does not have all required permissions.';
  }

  return error?.message || String(error);
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.MESSAGE_CONTENT
  ],
  partials: ['CHANNEL', 'MESSAGE', 'REACTION']
});

let cachedWebhook = null;

function parseColor(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (String(value).toLowerCase() === 'random') {
    return Math.floor(Math.random() * 0xffffff);
  }

  if (typeof value === 'number') {
    return value;
  }

  const normalized = String(value).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return Number.parseInt(normalized, 16);
  }

  console.warn(`Invalid webhook.color value: ${value}. Using a random color.`);
  return Math.floor(Math.random() * 0xffffff);
}

function roleIdsFromConfig() {
  if (!Array.isArray(config.mentioned_roles)) {
    return [];
  }

  return config.mentioned_roles
    .map((roleId) => String(roleId).trim())
    .filter((roleId) => /^\d{17,20}$/.test(roleId));
}

function webhookCredentialsFromConfig() {
  if (webhookConfig.url) {
    const match = String(webhookConfig.url).trim()
      .match(/^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/(\d{17,20})\/([^/?#\s]+)(?:[/?#].*)?$/);

    if (!match) {
      throw new Error('Invalid webhook.url. Expected: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN');
    }

    return {
      id: match[1],
      token: match[2]
    };
  }

  if (webhookConfig.id && webhookConfig.token) {
    return {
      id: String(webhookConfig.id),
      token: String(webhookConfig.token)
    };
  }

  return null;
}

function threadNameFromConfig(sentMessage) {
  const fallbackName = `${webhookName} Discussion`;
  const template = threadConfig.name || fallbackName;
  const name = String(template)
    .replaceAll('{webhook_name}', webhookName)
    .replaceAll('{message_id}', sentMessage.id)
    .trim();

  return (name || fallbackName).slice(0, 100);
}

function threadAutoArchiveDuration() {
  const allowedDurations = new Set([60, 1440, 4320, 10080]);
  const duration = Number(threadConfig.auto_archive_duration ?? 1440);

  return allowedDurations.has(duration) ? duration : 1440;
}

function buildEmbed(message) {
  const embed = new MessageEmbed()
    .setDescription(message.content || '\u200b');

  const color = parseColor(webhookConfig.color);
  if (color !== undefined) {
    embed.setColor(color);
  }

  if (webhookConfig.title) {
    embed.setTitle(String(webhookConfig.title));
  }

  if (webhookConfig.footer) {
    embed.setFooter(String(webhookConfig.footer), webhookConfig.footer_icon_url || undefined);
  }

  if (webhookConfig.timestamp !== false) {
    embed.setTimestamp(new Date());
  }

  if (webhookConfig.show_original_author) {
    embed.setAuthor(
      message.member?.displayName || message.author.username,
      message.author.displayAvatarURL()
    );
  } else if (webhookConfig.author_name) {
    embed.setAuthor(String(webhookConfig.author_name), webhookConfig.author_icon_url || undefined);
  }

  if (webhookConfig.thumbnail_url) {
    embed.setThumbnail(String(webhookConfig.thumbnail_url));
  }

  if (webhookConfig.image_url) {
    embed.setImage(String(webhookConfig.image_url));
  }

  return embed;
}

function hasCreateWebhookSupport(channel) {
  return SUPPORTED_WEBHOOK_CHANNEL_TYPES.has(channel.type);
}

async function ensureWebhook(channel) {
  if (cachedWebhook) {
    return cachedWebhook;
  }

  const webhookCredentials = webhookCredentialsFromConfig();
  if (webhookCredentials) {
    cachedWebhook = new WebhookClient(webhookCredentials);
    return cachedWebhook;
  }

  if (!hasCreateWebhookSupport(channel)) {
    throw new Error('This channel type does not support automatic webhook creation.');
  }

  const webhooks = await channel.fetchWebhooks();
  const existingWebhook = webhooks.find((webhook) => (
    webhook.name === webhookName && webhook.owner?.id === client.user.id
  ));

  if (existingWebhook) {
    cachedWebhook = existingWebhook;
    return cachedWebhook;
  }

  cachedWebhook = await channel.createWebhook(webhookName, {
    avatar: webhookConfig.avatar_url || undefined,
    reason: 'Webhook used by the bot to format channel messages.'
  });

  return cachedWebhook;
}

async function sendRoleMentionMessage(webhook) {
  const roleIds = roleIdsFromConfig();
  if (roleIds.length === 0) {
    return;
  }

  const roleMentions = roleIds.map((roleId) => `<@&${roleId}>`).join(' ');
  const mentionTemplate = config.mention_message || '{roles}';
  const content = String(mentionTemplate).replaceAll('{roles}', roleMentions).trim();

  if (!content) {
    return;
  }

  await webhook.send({
    username: webhookName,
    avatarURL: webhookConfig.avatar_url || undefined,
    content,
    allowedMentions: {
      parse: [],
      roles: roleIds
    }
  });
}

async function reactToFormattedMessage(channel, sentMessage) {
  const reactions = [config.reactions?.up || '\u2B06\uFE0F', config.reactions?.down || '\u2B07\uFE0F']
    .filter(Boolean);

  if (reactions.length === 0) {
    return;
  }

  const messageToReact = sentMessage?.react
    ? sentMessage
    : await channel.messages.fetch(sentMessage.id);

  for (const reaction of reactions) {
    await messageToReact.react(reaction);
  }
}

async function createDiscussionThread(channel, sentMessage) {
  if (threadConfig.enabled === false) {
    return;
  }

  try {
    const messageToThread = sentMessage?.startThread
      ? sentMessage
      : await channel.messages.fetch(sentMessage.id);

    if (!messageToThread?.startThread) {
      console.warn('Could not create a discussion thread: the sent message does not support threads.');
      return;
    }

    await messageToThread.startThread({
      name: threadNameFromConfig(messageToThread),
      autoArchiveDuration: threadAutoArchiveDuration(),
      reason: 'Thread created for users to discuss the patch notes.'
    });
  } catch (error) {
    console.warn(`Could not create discussion thread: ${describeDiscordError(error)}`);
  }
}

async function checkChannelPermissions(channel) {
  const me = channel.guild.members.me ?? await channel.guild.members.fetch(client.user.id);
  const permissions = channel.permissionsFor(me);

  const requiredPermissions = [
    Permissions.FLAGS.VIEW_CHANNEL,
    Permissions.FLAGS.SEND_MESSAGES,
    Permissions.FLAGS.MANAGE_MESSAGES,
    Permissions.FLAGS.ADD_REACTIONS,
    Permissions.FLAGS.READ_MESSAGE_HISTORY
  ];

  if (!webhookCredentialsFromConfig()) {
    requiredPermissions.push(Permissions.FLAGS.MANAGE_WEBHOOKS);
  }

  if (threadConfig.enabled !== false) {
    requiredPermissions.push(
      Permissions.FLAGS.CREATE_PUBLIC_THREADS,
      Permissions.FLAGS.SEND_MESSAGES_IN_THREADS
    );
  }

  const missing = requiredPermissions
    .filter((permission) => !permissions?.has(permission))
    .map((permission) => permission.toString());

  if (missing.length > 0) {
    console.warn(`Missing permissions in channel ${channel.id}: ${missing.join(', ')}`);
  }
}

client.once('ready', async () => {
  console.log(`Bot online as ${client.user.tag}. Configured channel: ${targetChannelId}.`);

  try {
    const channel = await client.channels.fetch(targetChannelId);

    if (!channel?.isText() || !channel.guild) {
      console.error('target_channel_id must point to a server text channel.');
      return;
    }

    await checkChannelPermissions(channel);
    await ensureWebhook(channel);

    console.log(`Watching channel ${targetChannelId}.`);
  } catch (error) {
    console.error(`Could not validate channel ${targetChannelId}: ${describeDiscordError(error)}`);
    console.error('The bot will stay online, but it will only work after the channel or permissions are fixed.');
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || message.webhookId || message.channelId !== targetChannelId) {
    return;
  }

  try {
    const webhook = await ensureWebhook(message.channel);
    const embed = buildEmbed(message);

    const sentMessage = await webhook.send({
      username: webhookName,
      avatarURL: webhookConfig.avatar_url || undefined,
      embeds: [embed],
      allowedMentions: { parse: [] },
      wait: true
    });

    if (config.delete_original !== false) {
      await message.delete();
    }

    await createDiscussionThread(message.channel, sentMessage);
    await sendRoleMentionMessage(webhook);
    await reactToFormattedMessage(message.channel, sentMessage);
  } catch (error) {
    console.error(`Failed to format message: ${describeDiscordError(error)}`);
  }
});

client.login(token);
