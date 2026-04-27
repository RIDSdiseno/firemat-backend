import { Router } from "express";
import {
  getProductos,
  getProducto,
  crearProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/productos.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 🔥 CRUD Productos
router.get("/", getProductos);        // Listar con filtros
router.get("/", verifyToken, getProductos);
router.post("/", verifyToken, createProducto);
router.get("/:id", getProducto);      // Obtener por ID
router.post("/", crearProducto);      // Crear
router.put("/:id", updateProducto);   // Actualizar
router.delete("/:id", deleteProducto); // Eliminar

export default router;