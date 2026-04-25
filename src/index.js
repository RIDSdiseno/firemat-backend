import express from "express";
import cors from "cors";

import productosRoutes from "./routes/productos.routes.js";
import movimientosRoutes from "./routes/movimientos.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🔥 Rutas bien definidas (con prefijos claros)
app.use("/api/productos", productosRoutes);
app.use("/api/movimientos", movimientosRoutes);
app.use("/api/categorias", categoriasRoutes);

// ✅ AQUÍ ESTABA EL ERROR
app.use("/inventario", inventarioRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API Firemat funcionando 🔥");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});