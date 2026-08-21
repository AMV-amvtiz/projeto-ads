const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');
const formSolicitacao = document.getElementById('formSolicitacao');
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

if (formSolicitacao) {

    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
        window.location.href = 'index.html';
    }

    formSolicitacao.addEventListener('submit', async function (event) {
        event.preventDefault();

        const cliente = document.getElementById('cliente').value;
        const obra = document.getElementById('obra').value;
        const endereco = document.getElementById('endereco').value;
        const numeroPedido = document.getElementById('numeroPedido').value;
        const tipoServico = document.getElementById('tipoServico').value;
        const observacoes = document.getElementById('observacoes').value;

        const resposta = await fetch('/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliente: cliente,
                obra: obra,
                endereco: endereco,
                numero_pedido: numeroPedido,
                tipo_servico: tipoServico,
                observacoes: observacoes,
                usuario_id: usuario.id
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mensagem.textContent =
                'Solicitação de medição registrada com sucesso!';

            formSolicitacao.style.display = 'none';
            document.getElementById('solicitacaoHeader').style.display = 'none';

        } else {
            mensagem.textContent = dados.erro;
        }
    });
}
