<br/>

<table>
  <tr>
    <td width="58%" valign="middle">
      <h1>Fast Patch Notes</h1>
      <p>
        <strong>Bot para Discord que transforma suas mensagens rápidas em patch notes padronizados.</strong>
      </p>
      <p>
        Escreva uma atualização simples no canal configurado e deixe o bot cuidar do resto:
        ele republica a mensagem como embed por webhook, cria uma thread de discussão,
        menciona cargos configurados e adiciona reações para feedback.
      </p>
      <p>
        <img src="https://img.shields.io/badge/Discord-Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Bot" />
        <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+" />
        <img src="https://img.shields.io/badge/Webhook-Embeds-00C7D9?style=for-the-badge" alt="Webhook Embeds" />
      </p>
    </td>
    <td width="42%" align="center" valign="middle">
      <img src=".github/logo.png" width="320" alt="Fast Patch Notes logo" />
    </td>
  </tr>
</table>

<br/>

<div align="center">
  <h2>Features</h2>
</div>

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Patch notes automaticos</h3>
      <p>Transforma mensagens comuns em embeds organizados, mantendo listas e quebras de linha.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Envio por webhook</h3>
      <p>Usa um webhook configurado ou cria um automaticamente para publicar com nome e avatar personalizados.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>Threads de discussao</h3>
      <p>Cria uma thread na mensagem de patch notes para centralizar conversas sobre a atualizacao.</p>
    </td>
    <td width="50%" valign="top">
      <h3>Mencoes e reacoes</h3>
      <p>Envia mencoes de cargos configurados e adiciona reacoes de voto positivo e negativo.</p>
    </td>
  </tr>
</table>

<br/>

<div align="center">
  <h2>Preview</h2>
  <p>Veja o fluxo do bot formatando uma mensagem em patch notes.</p>
  <img src=".github/Gravando%202026-07-11%20111810.gif" alt="Demonstração do Fast Patch Notes" width="860" />
</div>

<br/>

## Requirements

- Node.js 20 or newer
- A bot created in the Discord Developer Portal
- `Message Content Intent` enabled for the bot
- Discord channel permissions for messages, webhooks, reactions and threads

<details>
  <summary><strong>How to create and invite a bot</strong></summary>

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

After inviting the bot, check the channel configured in `target_channel_id` and make sure the bot role can view and send messages there.

</details>

## Configuration

Install dependencies:

```bash
npm install
```

Copy the example config:

```bash
copy config.example.yml config.yml
```

Edit `config.yml` and start the bot:

```bash
npm start
```

## Example

Original message:

```text
- Fixed Mirage map without PvP.
- Fixed Besta Treta without arrows in the starter kit.
```

Fast Patch Notes deletes the original message, sends a formatted embed through the webhook, creates a discussion thread, sends the configured role mentions and reacts with the configured arrows.

## Common Errors

### Missing Access

If `Missing Access` appears, the bot started correctly, but Discord denied access to the channel configured in `target_channel_id`.

Check that:

- the bot is in the same server as the channel;
- `target_channel_id` is actually the channel ID, not a category, server or message ID;
- the bot role can view the channel;
- the bot role is not blocked by channel-specific role overwrites;
- the channel allows `View Channels`, `Send Messages`, `Manage Messages`, `Manage Webhooks`, `Add Reactions`, `Read Message History`, `Create Public Threads` and `Send Messages in Threads`.
