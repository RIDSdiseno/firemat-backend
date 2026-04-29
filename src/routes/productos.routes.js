import { Router } from "express";
import {
  getProductos,
  getProducto,
  crearProducto,
  updateProducto,
  deleteProducto,
  reservarProducto,
  confirmarSalida
} from "../controllers/productos.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 🔐 Todas protegidas (recomendado)
router.get("/", verifyToken, getProductos);
router.get("/:id", verifyToken, getProducto);

router.post("/", verifyToken, crearProducto);
router.put("/:id", verifyToken, updateProducto);
router.delete("/:id", verifyToken, deleteProducto);

// 🔥 NUEVAS FUNCIONALIDADES
router.post("/:id/reservar", verifyToken, reservarProducto);
router.post("/:id/confirmar", verifyToken, confirmarSalida);

export default router;