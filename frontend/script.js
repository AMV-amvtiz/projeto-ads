const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');
const mensagem = document.getElementById('mensagem');

if (formLogin) {

    formLogin.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        const resposta = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            localStorage.setItem('usuario', JSON.stringify(dados));

            window.location.href = 'dashboard.html';
        } else {
            mensagem.textContent = dados.erro;
        }
    });
}

if (formCadastro) {

    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        const resposta = await fetch('/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: nome,
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mensagem.textContent =
                'Cadastro realizado! Aguarde a aprovação do administrador.';
            
            formCadastro.style.display = 'none';
            document.getElementById('cadastroHeader').style.display = 'none';

        } else {
            mensagem.textContent = dados.erro;
        }
    });
}
