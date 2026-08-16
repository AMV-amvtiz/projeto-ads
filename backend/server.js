const express = require('express');
const path = require('path');
const pool = require('./db');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

pool.query('SELECT NOW()', (error, result) => {
    if (error) {
        console.error('Erro ao conectar ao PostgreSQL:', error);
    } else {
        console.log('PostgreSQL conectado:', result.rows[0]);
    }
});

app.post('/pedidos', (req, res) => {
    
    const {
        numero_pedido,
        tipo_servico,
        observacoes,
        obra_id,
        usuario_id
    } = req.body;

    console.log(numero_pedido);
    console.log(tipo_servico);
    console.log(observacoes);
    console.log(obra_id);
    console.log(usuario_id);

    const sql = `
        INSERT INTO pedido
            (numero_pedido, tipo_servico, observacoes, obra_id, usuario_id)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    pool.query(
        sql,
        [numero_pedido, tipo_servico, observacoes, obra_id, usuario_id],
        (error, result) => {
            if (error) {
                console.error('Erro ao inserir pedido:', error);
                return res.status(500).json({ erro: 'Erro ao inserir pedido' });
            }

            res.status(201).json(result.rows[0]);
        }
    );
});

app.post('/usuarios', async (req, res) => {

    const {
        nome,
        email,
        senha
    } = req.body;

    try {

        const senha_hash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuario
                (nome, email, senha_hash, perfil, ativo)
            VALUES
                ($1, $2, $3, NULL, false)
            RETURNING id, nome, email, perfil, ativo;
        `;

        const result = await pool.query(
            sql,
            [nome, email, senha_hash]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao cadastrar usuário:', error);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário'
        });
    }
});    

app.listen(PORT, () => {
    console.log(`Servidor funcionando em http://localhost:${PORT}`);
});