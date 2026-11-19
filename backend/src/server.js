
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Conexión con PostgreSQL
const pool = require("./db");

// Importar rutas de los módulos
const clienteRoutes = require("./routes/clienteRoutes");
const pedidoRoutes = require("./routes/pedidoRoutes");

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// CONFIGURACIONES GENERALES
// =====================================
app.use(cors());
app.use(express.json());

// =====================================
// RUTA PRINCIPAL
// =====================================
app.get("/", (req, res) => {
    res.json({
        proyecto: "RutaSmart",
        mensaje: "API funcionando correctamente",
        version: "1.0.0"
    });
});

// =====================================
// VERIFICAR CONEXIÓN POSTGRESQL
// =====================================
app.get("/api/health", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT NOW() AS fecha, current_database() AS base_datos"
        );

        res.json({
            estado: "Conectado",
            baseDatos: resultado.rows[0].base_datos,
            fecha: resultado.rows[0].fecha
        });

    } catch (error) {
        console.error("Error PostgreSQL:", error.message);

        res.status(500).json({
            estado: "Error",
            mensaje: "No se pudo conectar con PostgreSQL"
        });
    }
});

// =====================================
// RUTAS DE CLIENTES
// =====================================
app.use("/api/clientes", clienteRoutes);

// =====================================
// RUTAS DE PEDIDOS
// =====================================
app.use("/api/pedidos", pedidoRoutes);

// =====================================
// INICIAR SERVIDOR
// =====================================
app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("       RUTASMART API");
    console.log("----------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log(`Clientes: http://localhost:${PORT}/api/clientes`);
    console.log(`Pedidos:  http://localhost:${PORT}/api/pedidos`);
    console.log("----------------------------------");
});
