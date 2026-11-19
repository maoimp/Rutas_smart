
const pool = require("../db");

// =====================================
// LISTAR TODOS LOS CLIENTES
// =====================================
const listarClientes = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT *
            FROM clientes
            ORDER BY id DESC
        `);

        res.json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al consultar los clientes"
        });
    }
};

// =====================================
// CONSULTAR UN CLIENTE
// =====================================
const obtenerCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "SELECT * FROM clientes WHERE id = $1",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al consultar el cliente"
        });
    }
};

// =====================================
// REGISTRAR CLIENTE
// =====================================
const registrarCliente = async (req, res) => {
    try {
        const { nombre, telefono, correo } = req.body;

        if (!nombre || !telefono) {
            return res.status(400).json({
                mensaje: "El nombre y el teléfono son obligatorios"
            });
        }

        const resultado = await pool.query(
            `INSERT INTO clientes (nombre, telefono, correo)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [nombre.trim(), telefono.trim(), correo || null]
        );

        res.status(201).json({
            mensaje: "Cliente registrado correctamente",
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al registrar el cliente"
        });
    }
};

// =====================================
// ACTUALIZAR CLIENTE
// =====================================
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, correo } = req.body;

        if (!nombre || !telefono) {
            return res.status(400).json({
                mensaje: "El nombre y el teléfono son obligatorios"
            });
        }

        const resultado = await pool.query(
            `UPDATE clientes
             SET nombre = $1,
                 telefono = $2,
                 correo = $3
             WHERE id = $4
             RETURNING *`,
            [nombre.trim(), telefono.trim(), correo || null, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.json({
            mensaje: "Cliente actualizado correctamente",
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al actualizar el cliente"
        });
    }
};

// =====================================
// ELIMINAR CLIENTE
// =====================================
const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            "DELETE FROM clientes WHERE id = $1 RETURNING *",
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.json({
            mensaje: "Cliente eliminado correctamente"
        });

    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                mensaje: "No se puede eliminar este cliente porque tiene pedidos asociados"
            });
        }

        console.error(error);
        res.status(500).json({
            mensaje: "Error al eliminar el cliente"
        });
    }
};

module.exports = {
    listarClientes,
    obtenerCliente,
    registrarCliente,
    actualizarCliente,
    eliminarCliente
};
