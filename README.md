# Discord Webhook Sender

A simple Discord bot that watches one channel, deletes messages sent there, and republishes their content as a formatted webhook embed. The original text is placed in the embed description, so Discord Markdown such as lists, bold text, inline code, code blocks, links, and visual mentions stays intact.

When `mentioned_roles` is configured, the role mention message is also sent by the same webhook to keep the same visual name and avatar.

## Requirements

- Node.js 20 or newer
- A bot created in the Discord Developer Portal
- `Message Content Intent` enabled for the bot
- Channel permissions:
  - View Channels
  - Send Messages
  - Manage Messages
  - Manage Webhooks
  - Add Reactions
  - Read Message History
  - Create Public Threads
  - Send Messages in Threads

## Invite The Bot

1. Open the Discord Developer Portal:
   https://discord.com/developers/applications

2. Open your bot application.

3. Go to **OAuth2** > **URL Generator**.

4. Under **Scopes**, select:
   - `bot`

5. Under **Bot Permissions**, select:
   - View Channels
   - Send Messages
   - Manage Messages
   - Manage Webhooks
   - Add Reactions
   - Read Message History
   - Create Public Threads
   - Send Messages in Threads

6. Copy the generated URL at the bottom of the page and open it in your browser.

You can also use this template URL, replacing `YOUR_CLIENT_ID` with your bot's **Application ID / Client ID**:

```text
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=309774593088&scope=bot
```

After inviting the bot, also check the channel configured in `target_channel_id` and make sure the bot role can view and send messages in that channel.

## Configuration

1. Install dependencies:

```bash
npm install
```

2. Copy the example config:

```bash
copy config.example.yml config.yml
```

In PowerShell, this also works:

```powershell
Copy-Item config.example.yml config.yml
```

3. Edit `config.yml`

### Main Fields

- `token`: bot token. You can also provide it through the `DISCORD_TOKEN` environment variable.
- `target_channel_id`: channel the bot should watch.
- `delete_original`: when `true`, deletes the original message after the webhook sends the formatted version.
- `mentioned_roles`: roles that will be mentioned in the next message sent by the same webhook.
- `mention_message`: text used for the mention message. Use `{roles}` where the role mentions should appear.
- `webhook.default_name`: name used by the webhook.
- `webhook.avatar_url`: avatar used by the webhook. Leave it empty to use Discord's default.
- `webhook.footer`: embed footer.
- `webhook.color`: embed color in hexadecimal, such as `#ff9900`, or `random`.
- `webhook.show_original_author`: when `true`, shows the original message author in the embed.
- `thread.enabled`: when `true`, creates a discussion thread on the patch notes message.
- `thread.name`: optional custom thread name. You can use `{webhook_name}` and `{message_id}` placeholders.
- `thread.auto_archive_duration`: thread auto-archive duration in minutes. Discord accepts `60`, `1440`, `4320`, or `10080`.
- `reactions.up` and `reactions.down`: reactions added by the bot to the formatted message.

If `webhook.id` and `webhook.token` are empty, the bot automatically creates or reuses a webhook in the channel. This requires the `Manage Webhooks` permission.

## Start

```bash
npm start
```

## Common Errors

### Missing Access

If `Missing Access` appears, the bot started correctly, but Discord denied access to the channel configured in `target_channel_id`.

Check that:

- the bot is in the same server as the channel;
- `target_channel_id` is actually the channel ID, not a category, server, or message ID;
- the bot role can view the channel;
- the bot role is not blocked by channel-specific role overwrites;
- the channel allows `View Channels`, `Send Messages`, `Manage Messages`, `Manage Webhooks`, `Add Reactions`, `Read Message History`, `Create Public Threads`, and `Send Messages in Threads`.

## Example

Original message:

```text
- Fixed Mirage map without PvP.
- Fixed Besta Treta without arrows in the starter kit.
```

The bot deletes the original message, sends an embed through the webhook while preserving the list formatting, creates a discussion thread on that patch notes message, sends the configured role mentions through the same webhook, and reacts with up/down arrows.
