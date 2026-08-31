let baseConhecimento = [];

async function carregarBaseDados() {
    try {
        const resposta = await fetch('database.json');
        baseConhecimento = await resposta.json();
        adicionarMensagem("Olá! Como posso ajudar você com os procedimentos da câmara fria hoje?", 'bot');
    } catch (erro) {
        adicionarMensagem("Erro ao carregar os dados de procedimentos do sistema.", 'bot');
        console.error(erro);
    }
}

function adicionarMensagem(texto, remetente) {
    const chatMessages = document.getElementById('chat-messages');
    const mensagemDiv = document.createElement('div');
    mensagemDiv.classList.add('message', remetente);
    
    if (remetente === 'bot') {
        mensagemDiv.innerHTML = `<div style="font-weight: 600; margin-bottom: 4px; color: #10a37f; font-size: 0.85rem;">Assistente</div><div>${texto}</div>`;
    } else {
        mensagemDiv.textContent = texto;
    }

    chatMessages.appendChild(mensagemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processarMensagem(entradaUsuario) {
    const textoLimpo = entradaUsuario.toLowerCase().trim();
    let respostaEncontrada = "Desculpe, não encontrei informações sobre isso. Tente perguntar sobre 'temperatura', 'epi' ou 'emergência'.";

    for (let item of baseConhecimento) {
        for (let palavraChave of item.palavrasChave) {
            if (textoLimpo.includes(palavraChave)) {
                respostaEncontrada = item.resposta;
                break;
            }
        }
        if (respostaEncontrada !== "Desculpe, não encontrei informações sobre isso. Tente perguntar sobre 'temperatura', 'epi' ou 'emergência'.") {
            break;
        }
    }

    setTimeout(() => {
        adicionarMensagem(respostaEncontrada, 'bot');
    }, 400);
}

document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('user-input');
    const texto = input.value;
    if (texto.trim() === "") return;

    adicionarMensagem(texto, 'user');
    processarMensagem(texto);
    input.value = "";
});

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});

carregarBaseDados();
