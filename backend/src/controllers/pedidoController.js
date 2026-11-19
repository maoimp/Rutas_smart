
const pool = require("../db");

// Estados permitidos
const estadosPermitidos = [
    "pendiente",
    "asignado",
    "en_ruta",
    "entregado",
    "cancelado",
    "novedad"
];

// =====================================
// LISTAR TODOS LOS PEDIDOS
// =====================================
const listarPedidos = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                p.*,
                c.nombre AS cliente,
                c.telefono,
                c.correo
            FROM pedidos p
            INNER JOIN clientes c
                ON p.cliente_id = c.id
            ORDER BY p.id DESC
        `);

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al consultar los pedidos"
        });
    }
};

// =====================================
// CONSULTAR UN PEDIDO
// =====================================
const obtenerPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(`
            SELECT
                p.*,
                c.nombre AS cliente,
                c.telefono,
                c.correo
            FROM pedidos p
            INNER JOIN clientes c
                ON p.cliente_id = c.id
            WHERE p.id = $1
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al consultar el pedido"
        });
    }
};

// =====================================
// REGISTRAR PEDIDO
// =====================================
const registrarPedido = async (req, res) => {
    try {
        const {
            cliente_id,
            direccion_entrega,
            descripcion,
            fecha_entrega,
            observaciones
        } = req.body;

        if (
            !cliente_id ||
            !direccion_entrega ||
            !descripcion ||
            !fecha_entrega
        ) {
            return res.status(400).json({
                mensaje: "Todos los campos obligatorios deben completarse"
            });
        }

        const fecha = new Date(fecha_entrega);

        if (Number.isNaN(fecha.getTime())) {
            return res.status(400).json({
                mensaje: "La fecha de entrega no es válida"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO pedidos (
                cliente_id,
                direccion_entrega,
                descripcion,
                fecha_entrega,
                observaciones
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                cliente_id,
                direccion_entrega.trim(),
                descripcion.trim(),
                fecha,
                observaciones || null
            ]
        );

        res.status(201).json({
            mensaje: "Pedido registrado correctamente",
            pedido: resultado.rows[0]
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                mensaje: "El cliente seleccionado no existe"
            });
        }

        console.error(error);
        res.status(500).json({
            mensaje: "Error al registrar el pedido"
        });
    }
};

// =====================================
// ACTUALIZAR PEDIDO
// =====================================
const actualizarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            cliente_id,
            direccion_entrega,
            descripcion,
            fecha_entrega,
            estado,
            observaciones
        } = req.body;

        if (
            !cliente_id ||
            !direccion_entrega ||
            !descripcion ||
            !fecha_entrega ||
            !estado
        ) {
            return res.status(400).json({
                mensaje: "Completa todos los campos obligatorios"
            });
        }

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                mensaje: "El estado del pedido no es válido"
            });
        }

        const fecha = new Date(fecha_entrega);

        if (Number.isNaN(fecha.getTime())) {
            return res.status(400).json({
                mensaje: "La fecha de entrega no es válida"
            });
        }

        const resultado = await pool.query(
            `UPDATE pedidos
             SET cliente_id = $1,
                 direccion_entrega = $2,
                 descripcion = $3,
                 fecha_entrega = $4,
                 estado = $5,
                 observaciones = $6
             WHERE id = $7
             RETURNING *`,
            [
                cliente_id,
                direccion_entrega.trim(),
                descripcion.trim(),
                fecha,
                estado,
                observaciones || null,
                id
            ]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        res.json({
            mensaje: "Pedido actualizado correctamente",
            pedido: resultado.rows[0]
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                mensaje: "El cliente seleccionado no existe"
            });
        }

        console.error(error);
        res.status(500).json({
            mensaje: "Error al actualizar el pedido"
        });
    }
};

// =====================================
// ELIMINAR PEDIDO
// =====================================
const eliminarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "DELETE FROM pedidos WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Pedido no encontrado"
            });
        }

        res.json({
            mensaje: "Pedido eliminado correctamente"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al eliminar el pedido"
        });
    }
};

module.exports = {
    listarPedidos,
    obtenerPedido,
    registrarPedido,
    actualizarPedido,
    eliminarPedido
};
