function indentPatchNotes() {
    const patchNotes = document.getElementById("patch-content").value;
    const replacements = {
        "feat:": "<:att_feat:1325932929301352508> ",
        "improv:": "<:att_improv:1325932933491593227> ",
        "perf:": "<:att_perfomance:1325932935118848060> ",
        "task:": "<:att_task:1325932940089229522> ",
        "change:": "<:att_change:1325932927686807613> ",
        "refact:": "<:att_refact:1325932936737849365> ",
        "fix:": "<:att_fix:1325932930853507277> ",
        "remove:": "<:att_remove:1325906723407532102> "
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

    // Concatenar todas as categorias na ordem desejada, com uma linha em branco entre elas
    const sortedNotes = Object.values(categorized)
        .filter(category => category.length > 0) // Ignorar categorias vazias
        .map(category => category.join('\n'))    // Concatenar linhas dentro de cada categoria
        .join('\n\n');                           // Adicionar duas quebras de linha entre categorias

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
        "skyten": "eb2664",
        "lobby": "372d86",
        "rede": "372d86",
        "ausevento": "d188fd"
    };

    const serverSelected = document.getElementById("patch-server").value.toLowerCase();
    console.log("Cor selecionada: " + colors[serverSelected]);
    return [urls[serverSelected], colors[serverSelected]];
}

function getWebhookTitle() {
    const serverSelected = document.getElementById("patch-server").value;
    const versionNumber = document.getElementById("patch-version").value;

    return "**Nota de atualização " + serverSelected + "** `" + versionNumber + "`";
}

function sendWebhook() {
    const serverInfos = getServerInfo();

    const webhookUrl = document.getElementById("patch-webhook-url").value;
    const webhookContent = indentPatchNotes();
    const webhookTitle = getWebhookTitle();
    const webhookImage = serverInfos[0];
    const webhookColor = parseInt(serverInfos[1], 16);

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
                saveLatestVersion();
                sendRoleNotification(webhookUrl);
            } else {
                console.error("Erro ao enviar webhook:", response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error("Erro de conexão ao enviar webhook:", error);
        });
}

function saveLatestVersion() {
    const serverSelected = document.getElementById("patch-server").value;
    const versionNumber = document.getElementById("patch-version").value;

    const saveRef = serverSelected + "_version";
    localStorage.setItem(saveRef, versionNumber);
}

function savePatchDraft() {
    const patchNotes = document.getElementById("patch-content").value;
    const serverSelect = document.getElementById("patch-server").value;
    const saveRef = serverSelect + "_draft";
    console.log("Salvo rascunho " + patchNotes + " para o saveRef = " + saveRef);
    localStorage.setItem(saveRef, patchNotes);
}

function sendRoleNotification(webhookUrl) {
    const message = "<@&939951821701644328>";

    const payload = {
        content: message
    };

    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (response.ok) {
                console.log("Mensagem adicional enviada com sucesso!");
            } else {
                console.error("Erro ao enviar mensagem adicional:", response.status, response.statusText);
            }
        })
        .catch(error => {
            console.error("Erro de conexão ao enviar mensagem adicional:", error);
        });
}
