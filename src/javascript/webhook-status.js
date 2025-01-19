const selecaoNotas = document.getElementById('status-extra-notes');
const tipoDeStatus = document.getElementById('status-type');
const divDasNotas = document.getElementById('notas-da-manutencao');
const textarea = document.getElementById('status-reason');
const textarea2 = document.getElementById('status-notes');
textPresets();

function sendStatusWebhook() {
    const webhookUrl = document.getElementById('status-webhook-url').value;
    const embed = tipoDeWebhook();

    const payload = JSON.stringify({
        username: "Webhook Bot",
        embeds: [embed]
    });

    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: payload
    })
        .then(response => {
            if (response.ok) {
                alert("Webhook enviado com sucesso!");
            } else {
                alert("Falha ao enviar o webhook.");
            }
        })
        .catch(error => {
            console.error("Erro ao enviar o webhook:", error);
        });
}

function tipoDeWebhook() {
    const tipoSelecionado = document.getElementById('status-type').value;

    switch (tipoSelecionado) {
        case "manutencaoAgendada":
            return embedManutencaoAgendada();
        case "servidorOffline":
            return embedManutencaoIniciada();
        case "manutencaoFinalizada":
            return embedManutencaoFinalizada();
        default:
            return {};
    }
}

function embedManutencaoAgendada() {
    const servidor = document.getElementById('status-server').value;
    const horario = document.getElementById('status-date-start').value;
    const previsao = document.getElementById('status-previsao').value;
    const motivos = document.getElementById('status-reason').value;
    const notas = document.getElementById('status-notes').value;

    // Utilizando a biblioteca Luxon para manipulação de data e hora
    const DateTime = luxon.DateTime;
    const epochTimeInicio = DateTime.fromISO(horario, { zone: 'America/Sao_Paulo' });
    const epochTimeContagem = DateTime.fromISO(horario, { zone: 'America/Sao_Paulo' });

    const horarioIniciar = "<t:" + epochTimeInicio.toSeconds() + ">";
    const cronometragem = "<t:" + epochTimeContagem.toSeconds() + ":R>";

    var descricao = "Uma nova manutenção foi agendada. Manutenções são iniciadas por administradores em algum servidor por algum motivo específico.\n\n# :calendar_spiral: Informações do cronograma\n- **Quando:** " + horarioIniciar + "\n- **Tempo para iniciar:** " + cronometragem + "\n- **Duração prevista:** " + previsao + "\n- **Servidor:** " + servidor + "\n\n# :satellite: Motivo:\n" + motivos;

    // Exibe as notas apenas se estiver habilitado
    if (divDasNotas.style.display != 'none') {
        descricao += "\n\n# :notepad_spiral: Notas:\n" + notas;
    }

    const embed = {
        title: "__**ATUALIZAÇÃO DO STATUS DA REDE**__",
        description: descricao,
        color: 0x0ec5ff
    };

    return embed;
}

function embedManutencaoIniciada() {
    const servidor = document.getElementById('status-server').value;
    const previsao = document.getElementById('duracao-prevista').value;
    const selectedMotivo = getSelectedMotivo();

    var descricao = "Aviso de servidor indisponível, confira as informações abaixo.\n\n# :man_office_worker::skin-tone-1: Informações: \n- **Servidor:** " + servidor + "\n- **Duração prevista:** " + previsao + "\n\n# :pencil2: Motivo:\n- " + selectedMotivo + "\n\n# :placard: Aviso importante:\n- O servidor especificado tem a entrada indisponível durante a manutenção.\n- Será avisado neste canal quando retornar.\n- Atribua-se o cargo @status para ser notificado.";

    const embed = {
        title: "__**ATUALIZAÇÃO DO STATUS DA REDE**__",
        description: descricao,
        color: 0xee433c
    };

    return embed;
}

function embedManutencaoFinalizada() {
    const servidor = document.getElementById('status-server').value;
    const notas = document.getElementById('status-notes').value;
    var notaExtra = "";

    // Exibe as notas extras se estiver habilitado
    if (divDasNotas.style.display != 'none') {
        notaExtra = "\n" + notas;
    }

    var descricao = "Servidores que estavam indisponível agora podem ser acessados novamente.\n\n# :love_letter: Notícias: \n- O servidor " + servidor + "** está online e disponível** novamente." + notaExtra + "\n\n# :snail: Recomendações:\n- Acompanhe as notas de atualização em <#880461818244517949>.\n- Conecte-se ao servidor com `jogar.austv.net`.";



    const embed = {
        title: "__**ATUALIZAÇÃO DO STATUS DA REDE**__",
        description: descricao,
        color: 0x6fff42
    };

    return embed;
}

selecaoNotas.addEventListener('click', function () {
    if (selecaoNotas.checked) {
        divDasNotas.style.display = 'block';
    } else {
        divDasNotas.style.display = 'none';
    }
});

tipoDeStatus.addEventListener('change', function () {
    mostrarTudo();

    switch (tipoDeStatus.value) {

        case "servidorOffline":
            document.getElementById('div-manutencao-start').style.display = 'none';
            document.getElementById('div-manutencao-motivos').style.display = 'none';
            document.getElementById('div-manutencao-radio-notas-extras').style.display = 'none';
            textarea2.value = '- Algum aviso importante que os jogadores precisam saber.';
            break;

        case "manutencaoFinalizada":
            document.getElementById('div-manutencao-start').style.display = 'none';
            document.getElementById('div-manutencao-motivos').style.display = 'none';
            document.getElementById('div-manutencao-previsao').style.display = 'none';
            document.getElementById('div-motivos-offline').style.display = 'none';
            textarea2.value = '- Tivemos mudanças na entrada do servidor.';
            break;

        default:
            document.getElementById('div-motivos-offline').style.display = 'none';
            break;
    }
});

function textPresets() {
    textarea.value = '- Correção de exploits.\n- Atualização para a versão `1.21.1`.';
    textarea2.value = '- O restante dos servidores estarão disponíveis.\n- Jogadores podem esperar no lobby que serão redirecionados automaticamente ao abrir o servidor.';
}

function getSelectedMotivo() {
    const motivosOffline = document.getElementById("div-motivos-offline");
    const radioButtons = motivosOffline.querySelectorAll("input[type='radio']");

    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            // Encontrar o label associado ao rádio selecionado
            const label = radioButton.nextElementSibling;
            return label.textContent;
        }
    }

    return null;
}


function mostrarTudo() {
    const elementosOcultos = document.querySelectorAll("*[style*='display: none']");
    elementosOcultos.forEach(elemento => {
        elemento.style.display = 'block';
    });
}