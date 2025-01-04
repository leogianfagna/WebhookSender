function indentPatchNotes() {
    const patchNotes = document.getElementById("patch").value;
    const replacements = {
        "feat:": "✨ ",
        "improv:": "🔧 ",
        "perf:": "⚡ ",
        "task:": "✅ ",
        "change:": "🛠️ ",
        "refact:": "♻️ ",
        "fix:": "🐛 ",
        "remove:": "❌ "
    };

    // Organizar e substituir as ocorrências na string
    let formattedNotes = patchNotes;
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(key, 'g'); // Criar um regex global para substituir todas as ocorrências
        formattedNotes = formattedNotes.replace(regex, value);
    }

    // Separar as linhas e organizá-las por categoria e tamanho
    const lines = formattedNotes.split('\n').filter(line => line.trim() !== "");
    const categorized = Object.keys(replacements).reduce((acc, key) => {
        acc[key] = [];
        return acc;
    }, {});

    lines.forEach(line => {
        for (const [key, value] of Object.entries(replacements)) {
            if (line.includes(value)) {
                categorized[key].push(line);
                break;
            }
        }
    });

    // Organizar cada categoria por tamanho da linha
    for (const key in categorized) {
        categorized[key].sort((a, b) => a.length - b.length);
    }

    // Concatenar todas as categorias na ordem desejada
    const sortedNotes = Object.values(categorized).flat().join('\n');

    return sortedNotes;
}

function getServerInfo() {
    const urls = {
        "henesys": "https://i.imgur.com/JruPKjo.png",
        "vanillew": "https://i.imgur.com/9MqS2Py.png",
        "skyten": "https://i.imgur.com/AUovi3U.png",
        "lobby": "https://i.imgur.com/kW913SV.png",
        "rede": "https://i.imgur.com/kW913SV.png",
        "ausevento": "https://i.imgur.com/z8B7NjB.png"
    };
    const colors = {
        "henesys": "aec83a",
        "vanillew": "00d9ff",
        "skyten:": "eb2664",
        "lobby": "372d86",
        "rede": "372d86",
        "ausevento": "d188fd"
    };

    const serverSelected = document.getElementById("server").value.toLowerCase();
    return [urls[serverSelected], colors[serverSelected]];
}

function getWebhookTitle() {
    const serverSelected = document.getElementById("server").value;
    const versionNumber = document.getElementById("version").value;

    return "**Nota de atualização " + serverSelected + "** `" + versionNumber + "`";
}

function sendWebhook() {
    const serverInfos = getServerInfo();

    const webhookUrl = document.getElementById("url").value;
    const webhookContent = indentPatchNotes();
    const webhookTitle = getWebhookTitle();
    const webhookImage = serverInfos[0];
    const webhookColor = parseInt(serverInfos[1], 16);
    console.log("Server infos: " + serverInfos);

    // Corpo do webhook
    const payload = {
        embeds: [
            {
                title: webhookTitle,
                description: webhookContent,
                color: webhookColor,
                image: {
                    url: webhookImage
                }
            }
        ]
    };

    // Enviar o webhook usando fetch
    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            console.log("Webhook enviado com sucesso!");
        } else {
            console.error("Erro ao enviar webhook:", response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error("Erro de conexão ao enviar webhook:", error);
    });
}
