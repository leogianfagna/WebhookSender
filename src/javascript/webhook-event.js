function sendEventWebhook() {
    const webhookUrl = document.getElementById('event-webhook-url').value;
    const message = document.getElementById('event-description').value;
    const server = document.getElementById('event-server').value;
    const eventTitle = document.getElementById('event-title').value;
    const dateStartInput = document.getElementById('event-date-start').value;
    const dateEndInput = document.getElementById('event-date-end').value;
    const imageInput = document.getElementById('event-image').files[0];

    if (!webhookUrl || !message || !dateStartInput) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Utilizando a biblioteca Luxon para manipulação de data e hora
    const DateTime = luxon.DateTime;

    // Convertendo a data para epoch time no fuso horário do Brasil (America/Sao_Paulo)
    const date = DateTime.fromISO(dateStartInput, { zone: 'America/Sao_Paulo' });
    const dateEnd = DateTime.fromISO(dateEndInput, { zone: 'America/Sao_Paulo' });
    const epochTimeStart = "<t:" + date.toSeconds() + ">";
    const epochTimeEnd = "<t:" + dateEnd.toSeconds() + ">";

    const formData = new FormData();
    const mensagemEvento = "# [" + server + "] " + eventTitle + "\n" + message + "\n# Duração do evento:\n" + epochTimeStart + " até " + epochTimeEnd;
    formData.append('content', mensagemEvento);
    if (imageInput) {
        formData.append('file', imageInput);
    }

    fetch(webhookUrl, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (response.ok) {
            alert('Mensagem enviada com sucesso!');
        } else {
            alert('Erro ao enviar mensagem.');
        }
    }).catch(error => {
        alert('Erro: ' + error.message);
    });
};

// Adicionando suporte para Ctrl+V (colar imagem do clipboard)
document.addEventListener('paste', function (event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            const imageInput = document.getElementById('event-image');
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;
            break;
        }
    }
});
