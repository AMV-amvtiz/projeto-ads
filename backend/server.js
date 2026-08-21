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

app.post('/pedidos', async (req, res) => {

    const {
        cliente,
        obra,
        endereco,
        numero_pedido,
        tipo_servico,
        observacoes,
        usuario_id
    } = req.body;

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        let clienteResult = await client.query(
            `
                SELECT id
                FROM cliente
                WHERE nome = $1
                ORDER BY id
                LIMIT 1;
            `,
            [cliente]
        );

        let clienteId;

        if (clienteResult.rows.length > 0) {

            clienteId = clienteResult.rows[0].id;

        } else {

            clienteResult = await client.query(
                `
                    INSERT INTO cliente (nome)
                    VALUES ($1)
                    RETURNING id;
                `,
                [cliente]
            );

            clienteId = clienteResult.rows[0].id;
        }

        const obraResult = await client.query(
            `
                INSERT INTO obra
                    (nome, endereco, cliente_id)
                VALUES
                    ($1, $2, $3)
                RETURNING id;
            `,
            [obra, endereco, clienteId]
        );

        const obraId = obraResult.rows[0].id;

        const pedidoResult = await client.query(
            `
                INSERT INTO pedido
                    (
                        numero_pedido,
                        tipo_servico,
                        observacoes,
                        obra_id,
                        usuario_id
                    )
                VALUES
                    ($1, $2, $3, $4, $5)
                RETURNING *;
            `,
            [
                numero_pedido,
                tipo_servico,
                observacoes,
                obraId,
                usuario_id
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            mensagem: 'Solicitação registrada com sucesso',
            pedido: pedidoResult.rows[0]
        });

    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Erro ao registrar solicitação:', error);

        res.status(500).json({
            erro: 'Erro ao registrar solicitação'
        });

    } finally {

        client.release();
    }
});

app.get('/pedidos', async (req, res) => {

    const { usuario_id } = req.query;

    try {

        let sql = `
            SELECT
                p.id,
                p.numero_pedido,
                p.tipo_servico,
                p.observacoes,
                c.nome AS cliente,
                o.nome AS obra,
                o.endereco,
                u.id AS usuario_id,
                u.nome AS solicitado_por
            FROM pedido p
            JOIN obra o
                ON o.id = p.obra_id
            JOIN cliente c
                ON c.id = o.cliente_id
            JOIN usuario u
                ON u.id = p.usuario_id
        `;

        const valores = [];

        if (usuario_id) {
            sql += `
                WHERE p.usuario_id = $1
            `;

            valores.push(usuario_id);
        }

        sql += `
            ORDER BY p.id DESC;
        `;

        const result = await pool.query(sql, valores);

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao buscar solicitações:', error);

        res.status(500).json({
            erro: 'Erro ao buscar solicitações'
        });
    }
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
                (nome, email, senha_hash, perfil, ativo, status)
            VALUES
                ($1, $2, $3, NULL, false, 'PENDENTE')
            RETURNING id, nome, email, perfil, ativo, status;
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

app.get('/usuarios', async (req, res) => {

    try {

        const sql = `
            SELECT id, nome, email, perfil, ativo, status
            FROM usuario
            ORDER BY id DESC;
        `;

        const result = await pool.query(sql);

        res.json(result.rows);

    } catch (error) {

        console.error('Erro ao buscar usuários:', error);

        res.status(500).json({
            erro: 'Erro ao buscar usuários'
        });
    }
});

app.put('/usuarios/:id/aprovar', async (req, res) => {

    const { id } = req.params;
    const { perfil } = req.body;

    const perfisPermitidos = [
        'ADMIN',
        'GERENTE',
        'VENDEDOR',
        'TECNICO'
    ];

    if (!perfisPermitidos.includes(perfil)) {
        return res.status(400).json({
            erro: 'Perfil inválido'
        });
    }

    try {

        const sql = `
            UPDATE usuario
            SET perfil = $1,
                status = 'ATIVO',
                ativo = true
            WHERE id = $2
              AND status = 'PENDENTE'
            RETURNING id, nome, email, perfil, ativo, status;
        `;

        const result = await pool.query(sql, [perfil, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                erro: 'Usuário pendente não encontrado'
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        console.error('Erro ao aprovar usuário:', error);

        res.status(500).json({
            erro: 'Erro ao aprovar usuário'
        });
    }
});

app.post('/login', async (req, res) => {

    const { email, senha } = req.body;

    try {

        const sql = `
            SELECT id, nome, email, senha_hash, perfil, ativo, status
            FROM usuario
            WHERE email = $1;
        `;

        const result = await pool.query(sql, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                erro: 'E-mail ou senha inválidos'
            });
        }

        const usuario = result.rows[0];

        const senhaValida = await bcrypt.compare(
            senha,
            usuario.senha_hash
        );

        if (!senhaValida) {
            return res.status(401).json({
                erro: 'E-mail ou senha inválidos'
            });
        }

        if (usuario.status !== 'ATIVO' || !usuario.ativo) {
            return res.status(403).json({
                erro: 'Usuário sem acesso liberado'
            });
        }

        res.json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        });

    } catch (error) {

        console.error('Erro ao realizar login:', error);

        res.status(500).json({
            erro: 'Erro ao realizar login'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando em http://localhost:${PORT}`);
});
