
const express = require("express");
const router = express.Router();

const {
    listarClientes,
    obtenerCliente,
    registrarCliente,
    actualizarCliente,
    eliminarCliente
} = require("../controllers/clienteController");

// Consultar todos los clientes
router.get("/", listarClientes);

// Consultar un cliente por ID
router.get("/:id", obtenerCliente);

// Registrar cliente
router.post("/", registrarCliente);

// Actualizar cliente
router.put("/:id", actualizarCliente);

// Eliminar cliente
router.delete("/:id", eliminarCliente);

module.exports = router;
