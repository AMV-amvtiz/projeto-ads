const formLogin = document.getElementById('formLogin');
const mensagem = document.getElementById('mensagem');

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

        mensagem.textContent = 'Login realizado com sucesso!';
    } else {
        mensagem.textContent = dados.erro;
    }
});


