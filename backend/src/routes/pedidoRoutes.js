
const express = require("express");
const router = express.Router();

const {
    listarPedidos,
    obtenerPedido,
    registrarPedido,
    actualizarPedido,
    eliminarPedido
} = require("../controllers/pedidoController");

router.get("/", listarPedidos);
router.get("/:id", obtenerPedido);
router.post("/", registrarPedido);
router.put("/:id", actualizarPedido);
router.delete("/:id", eliminarPedido);

module.exports = router;
