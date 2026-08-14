//Desenvolvido por Moisés J. M. Lima | WhatsApp (44) 99732-6752

const USUARIOS_PERMITIDOS = {
	"moises.morais": "71239856",
	"MOISES.MORAIS": "71239856",
	"kenyi.aguirre": "abc123",
	"eduardo.costa": "386511",
	"jhonn.santos": "1910",
	"geazi.mathias": "abc123",
	"carlos.domingos": "@prats5000",
	"otavio.godoy": "@prats5000",
	"claudio.ribeiro": "146080",
	"alex.floriani": "@prats5000",
};

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const erroMsg = document.getElementById('erro');

        if (USUARIOS_PERMITIDOS[user] && USUARIOS_PERMITIDOS[user] === pass) {
            // Salva o login na sessão (apaga ao fechar o navegador)
            sessionStorage.setItem('usuarioLogado', user);
            sessionStorage.setItem('autenticado', 'true');
            window.location.href = 'rep-nfc.html';
        } else {
            erroMsg.style.display = 'block';
        }
    });
}

function verificarAutenticacao() {
    if (sessionStorage.getItem('autenticado') !== 'true') {
        window.location.href = 'login-rep-nfc.html';
    }
}
