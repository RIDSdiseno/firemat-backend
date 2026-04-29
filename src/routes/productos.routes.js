import { Router } from "express";
import {
  getProductos,
  getProducto,
  crearProducto, // <-- Aquí está definido como 'crearProducto'
  updateProducto,
  deleteProducto,
  reservarProducto,
  confirmarSalida
} from "../controllers/productos.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 🔥 CRUD Productos
router.get("/", getProductos); 
router.get("/", verifyToken, getProductos);

// ANTES: router.post("/", verifyToken, createProducto); 
// AHORA (Corregido):
router.post("/", verifyToken, crearProducto); 

router.get("/:id", getProducto);
router.post("/", crearProducto); 
router.put("/:id", updateProducto);
router.delete("/:id", deleteProducto);
router.post("/:id/reservar", verifyToken, reservarProducto);
router.post("/:id/confirmar", verifyToken, confirmarSalida);

export default router; 