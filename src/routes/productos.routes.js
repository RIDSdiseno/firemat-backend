import { Router } from "express";
import {
  getProductos,
  getProducto,
  crearProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/productos.controller.js";

const router = Router();

// 🔥 CRUD Productos
router.get("/", getProductos);        // Listar con filtros
router.get("/:id", getProducto);      // Obtener por ID
router.post("/", crearProducto);      // Crear
router.put("/:id", updateProducto);   // Actualizar
router.delete("/:id", deleteProducto); // Eliminar

export default router;