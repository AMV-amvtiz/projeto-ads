const express = require('express');
const path = require('path');
const pool = require('./db');

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

app.listen(PORT, () => {
    console.log(`Servidor funcionando em http://localhost:${PORT}`);
});