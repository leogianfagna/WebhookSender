<div align="center">
  <h1>🤖 Fast Patch Notes</h1>
  <p>Bot para Discord que transforma suas mensagens rápidas em patch notes padronizados.</p>

  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=discord,js,npm" alt="Tecnologias" />
  </a>
</div>

<div align="center">
  <br/>
  <img src="https://img.shields.io/github/created-at/leogianfagna/EnchantCooldown" alt="GitHub Created At" />
  <img src="https://img.shields.io/github/contributors-anon/leogianfagna/EnchantCooldown" alt="GitHub Contributors" />
  <img src="https://img.shields.io/github/commit-activity/t/leogianfagna/EnchantCooldown" alt="GitHub Commit Activity" />
  <img src="https://img.shields.io/github/issues/leogianfagna/EnchantCooldown" alt="GitHub Issues" />
  <img src="https://img.shields.io/github/v/release/leogianfagna/EnchantCooldown" alt="GitHub Release" />
  <img src="https://img.shields.io/github/stars/leogianfagna/EnchantCooldown" alt="GitHub Stars" />
</div>


<div align="center">
  <h1>🔥 Features</h1>
</div>

asdasd


## Requirements</h1>
- Node.js 20 or newer
- A bot created in the Discord Developer Portal

> [!TIP]
> <details>
>  <summary>How to create and invite a bot</summary>
>  
> ## Invite The Bot
> 
> 1. Open the Discord Developer Portal:
>    https://discord.com/developers/applications
> 
> 2. Open your bot application.
> 
> 3. Go to **OAuth2** > **URL Generator**.
> 
> 4. Under **Scopes**, select:
>    - `bot`
> 
> 5. Under **Bot Permissions**, select:
>    - View Channels
>    - Send Messages
>    - Manage Messages
>    - Manage Webhooks
>    - Add Reactions
>    - Read Message History
>    - Create Public Threads
>    - Send Messages in Threads
> 
> 6. Copy the generated URL at the bottom of the page and open it in your browser.
> 
> 
> *After inviting the bot, also check the channel configured in `target_channel_id` and make sure the bot role can view and send messages in that channel.*
> </details>


## Configuration

1. Install dependencies:

```bash
npm install
```

2. Copy the example config:

```bash
copy config.example.yml config.yml
```

3. Edit `config.yml`

4. Start:

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
