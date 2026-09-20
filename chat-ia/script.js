let knowledgeBase = [];
const defaultResponse = "Desculpe, não encontrei essa informação na base de dados da Câmara Fria. Tente perguntar usando termos como 'temperatura ideal' ou 'códigos laranja integral nacional'.";

// ====================================================
// 1. CARREGAMENTO DO BANCO DE DADOS (JSON)
// ====================================================
async function carregarBancoDeDados() {
  try {
    const response = await fetch('database.json');
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    knowledgeBase = await response.json();
    console.log('Base de dados carregada com sucesso.');
  } catch (error) {
    console.error('Erro ao carregar o arquivo database.json:', error);
  }
}

// Inicia a leitura da base de dados assim que a aplicação abre
carregarBancoDeDados();

// ====================================================
// 2. MOTOR DE BUSCA E CORRESPONDÊNCIA
// ====================================================
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "");
}

function findBestResponse(userInput) {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    return "A base de dados ainda está sendo carregada ou não foi encontrada. Tente novamente em alguns instantes.";
  }

  const cleanInput = normalizeText(userInput);
  const inputWords = cleanInput.split(/\s+/);

  let bestMatch = null;
  let highestScore = 0;

  knowledgeBase.forEach(item => {
    let score = 0;
    item.keywords.forEach(keyword => {
      const cleanKeyword = normalizeText(keyword);
      
      // Avalia coincidência exata da expressão
      if (cleanInput.includes(cleanKeyword)) {
        score += cleanKeyword.split(" ").length * 2;
      }

      // Avalia coincidência por palavras isoladas
      inputWords.forEach(word => {
        if (cleanKeyword === word) {
          score += 1;
        }
      });
    });

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  });

  return highestScore > 0 ? bestMatch.response : defaultResponse;
}

// ====================================================
// 3. INTERAÇÃO E MANIPULAÇÃO DA INTERFACE
// ====================================================
document.addEventListener("DOMContentLoaded", () => {
  const chatContainer = document.getElementById("chat-container");
  const messagesList = document.getElementById("messages-list");
  const welcomeScreen = document.getElementById("welcome-screen");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const newChatBtn = document.getElementById("new-chat-btn");

  // Expansão dinâmica do textarea
  if (userInput) {
    userInput.addEventListener("input", () => {
      userInput.style.height = "auto";
      userInput.style.height = userInput.scrollHeight + "px";
    });

    // Envio com a tecla Enter
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        processarEnvio();
      }
    });
  }

  // Evento no botão de enviar
  if (sendBtn) {
    sendBtn.addEventListener("click", processarEnvio);
  }

  // Evento no botão Nova Conversa
  if (newChatBtn) {
    newChatBtn.addEventListener("click", limparChat);
  }

  // Função global para acionamento pelos cards da tela inicial
  window.enviarSugestao = function(texto) {
    if (userInput) {
      userInput.value = texto;
      processarEnvio();
    }
  };

  function processarEnvio() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeScreen && welcomeScreen.style.display !== "none") {
      welcomeScreen.style.display = "none";
    }

    appendMessage("user", text);
    userInput.value = "";
    userInput.style.height = "auto";

    const typingId = showTypingIndicator();

    setTimeout(() => {
      removeTypingIndicator(typingId);
      const botResponse = findBestResponse(text);
      appendMessage("bot", botResponse);
    }, 500);
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);

    const metaSpan = document.createElement("span");
    metaSpan.classList.add("meta-tag");
    metaSpan.textContent = sender === "user" ? "Operador" : "Assistente CF";

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.innerText = text;

    msgDiv.appendChild(metaSpan);
    msgDiv.appendChild(contentDiv);

    messagesList.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const id = "typing-" + Date.now();
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", "bot");
    msgDiv.id = id;

    const metaSpan = document.createElement("span");
    metaSpan.classList.add("meta-tag");
    metaSpan.textContent = "Assistente CF";

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    contentDiv.innerHTML = `
      <div class="typing-indicator">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;

    msgDiv.appendChild(metaSpan);
    msgDiv.appendChild(contentDiv);
    messagesList.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function limparChat() {
    messagesList.innerHTML = "";
    if (welcomeScreen) {
      welcomeScreen.style.display = "flex";
    }
    if (userInput) {
      userInput.value = "";
      userInput.style.height = "auto";
    }
  }
});
