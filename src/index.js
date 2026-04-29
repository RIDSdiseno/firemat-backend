import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import productosRoutes from "./routes/productos.routes.js";
import movimientosRoutes from "./routes/movimientos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Auth
app.use("/api/auth", authRoutes);

// 🔥 Rutas bien definidas (con prefijos claros)
app.use("/api/productos", productosRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/users", usersRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API Firemat funcionando 🔥");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});