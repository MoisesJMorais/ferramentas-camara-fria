// Variável que guardará os dados do JSON
let knowledgeBase = [];
const defaultResponse = "Desculpe, não encontrei essa informação na base de dados da Câmara Fria. Tente perguntar usando termos como 'temperatura ideal' ou 'códigos laranja integral nacional'.";

// ====================================================
// 1. CARREGAMENTO DO BANCO DE DADOS EXTERNO (JSON)
// ====================================================
async function carregarBancoDeDados() {
  try {
    const response = await fetch('database.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar JSON: ${response.status}`);
    }
    knowledgeBase = await response.json();
    console.log('Base de dados carregada com sucesso!');
  } catch (error) {
    console.error('Falha ao carregar a base de dados:', error);
  }
}

// Inicializa a leitura do arquivo JSON assim que o script carrega
carregarBancoDeDados();

// ====================================================
// 2. MOTOR DE BUSCA / CORRESPONDÊNCIA
// ====================================================
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s]/gi, "");      // Remove pontuação
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
      
      // Match por frase completa
      if (cleanInput.includes(cleanKeyword)) {
        score += cleanKeyword.split(" ").length * 2;
      }

      // Match por palavra isolada
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
// 3. INTERAÇÃO E DOM
// ====================================================
const chatContainer = document.getElementById("chat-container");
const messagesList = document.getElementById("messages-list");
const welcomeScreen = document.getElementById("welcome-screen");
const userInput = document.getElementById("user-input");

// Redimensionamento automático do textarea
userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
});

// Envio ao teclar Enter (sem Shift)
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    processarEnvio();
  }
});

// Clique nos cards de sugestão
function enviarSugestao(texto) {
  userInput.value = texto;
  processarEnvio();
}

// Processador de envio
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

// Limpar conversa atual
function limparChat() {
  messagesList.innerHTML = "";
  if (welcomeScreen) {
    welcomeScreen.style.display = "flex";
  }
  userInput.value = "";
  userInput.style.height = "auto";
}
