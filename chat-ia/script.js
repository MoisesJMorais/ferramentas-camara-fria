let baseConhecimento = [];

async function carregarBaseDados() {
    try {
        const resposta = await fetch('database.json');
        baseConhecimento = await resposta.json();
    } catch (erro) {
        console.error("Erro ao carregar banco de dados:", erro);
    }
}

function alternarTela(temMensagens) {
    const welcomeScreen = document.getElementById('welcome-screen');
    const messagesList = document.getElementById('messages-list');
    
    if (temMensagens) {
        welcomeScreen.style.display = 'none';
        messagesList.style.display = 'flex';
    } else {
        welcomeScreen.style.display = 'block';
        messagesList.style.display = 'none';
        messagesList.innerHTML = '';
    }
}

function adicionarMensagem(texto, remetente) {
    alternarTela(true);
    const messagesList = document.getElementById('messages-list');
    
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('message-row', remetente);
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    
    if (remetente === 'bot') {
        bubbleDiv.innerHTML = `<div style="font-weight: 600; margin-bottom: 4px; color: #10a37f; font-size: 0.8rem;">Assistente Câmara Fria</div><div>${texto}</div>`;
    } else {
        bubbleDiv.textContent = texto;
    }
    
    rowDiv.appendChild(bubbleDiv);
    messagesList.appendChild(rowDiv);
    
    const container = document.getElementById('chat-container');
    container.scrollTop = container.scrollHeight;
}

function processarResposta(textoUsuario) {
    const textoLimpo = textoUsuario.toLowerCase().trim();
    let resposta = "Não encontrei informações específicas sobre isso no banco de dados. Tente perguntar sobre temperatura, EPIs ou emergências.";

    for (let item of baseConhecimento) {
        for (let palavra of item.palavrasChave) {
            if (textoLimpo.includes(palavra)) {
                resposta = item.resposta;
                break;
            }
        }
        if (resposta !== "Não encontrei informações específicas sobre isso no banco de dados. Tente perguntar sobre temperatura, EPIs ou emergências.") {
            break;
        }
    }

    setTimeout(() => {
        adicionarMensagem(resposta, 'bot');
    }, 400);
}

function processarEnvio() {
    const textarea = document.getElementById('user-input');
    const texto = textarea.value.trim();
    if (!texto) return;

    textarea.value = '';
    textarea.style.height = 'auto';
    
    adicionarMensagem(texto, 'user');
    processarResposta(texto);
}

function enviarSugestao(texto) {
    adicionarMensagem(texto, 'user');
    processarResposta(texto);
}

function limparChat() {
    alternarTela(false);
}

const textarea = document.getElementById('user-input');
textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processarEnvio();
    }
});

carregarBaseDados();
