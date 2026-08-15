// Desenvolvido por Moisés J. M. Lima | WhatsApp (44) 99732-6752

const CACHE_NAME = 'ferramentas-camara-fria-pwa';
// É essencial incluir a barra final e o index.html explicitando o subdiretório
const ASSETS_TO_CACHE = [
  '/ferramentas-camara-fria/',
  '/ferramentas-camara-fria/index.html',
  '/ferramentas-camara-fria/manifest.json',
];

// Evento de Instalação: Armazena os arquivos essenciais no cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      // Força o Service Worker a se tornar ativo imediatamente
      return self.skipWaiting();
    })
  );
});

// Evento de Ativação: Limpa caches antigos se houver atualização de versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Permite que o Service Worker passe a controlar a página imediatamente
      return self.clients.claim();
    })
  );
});

// Evento Fetch com estratégia Network First (Rede Primeiro)
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam do protocolo HTTP/HTTPS (como extensões ou chrome-extension)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a resposta for válida, atualiza o cache dinamicamente
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se a rede falhar (offline), busca o recurso no cache
        return caches.match(event.request);
      })
  );
});
