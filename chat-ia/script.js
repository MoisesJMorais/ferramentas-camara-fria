let baseConhecimento = [];

async function carregarBaseDados() {
    try {
        const resposta = await fetch('database.json');
        baseConhecimento = await resposta.json();
        adicionarMensagem("Olá! Sou o assistente da Câmara Fria. Como posso ajudar com os procedimentos hoje?", 'bot');
    } catch (erro) {
        adicionarMensagem("Erro ao carregar os dados do sistema.", 'bot');
        console.error(erro);
    }
}

function adicionarMensagem(texto, remetente) {
    const chatMessages = document.getElementById('chat-messages');
    const mensagemDiv = document.createElement('div');
    mensagemDiv.classList.add('message', remetente);
    mensagemDiv.textContent = texto;
    chatMessages.appendChild(mensagemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processarMensagem(entradaUsuario) {
    const textoLimpo = entradaUsuario.toLowerCase().trim();
    let respostaEncontrada = "Desculpe, não entendi. Tente perguntar sobre 'temperatura', 'epi' ou 'emergência'.";

    for (let item of baseConhecimento) {
        for (let palavraChave of item.palavrasChave) {
            if (textoLimpo.includes(palavraChave)) {
                respostaEncontrada = item.resposta;
                break;
            }
        }
        if (respostaEncontrada !== "Desculpe, não entendi. Tente perguntar sobre 'temperatura', 'epi' ou 'emergência'.") {
            break;
        }
    }

    setTimeout(() => {
        adicionarMensagem(respostaEncontrada, 'bot');
    }, 500);
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
