// src/routes/categorias.routes.js
import { Router } from "express";
import {
  getCategorias,
  crearCategoria,
  updateCategoria,
  deleteCategoria,
} from "../controllers/categorias.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// ✅ GET - Listar categorías (Protegido con token)
router.get("/", verifyToken, getCategorias);

// ✅ POST - Crear categoría (Protegido con token)
router.post("/", verifyToken, crearCategoria);

// ✅ PUT - Actualizar (Protegido con token)
router.put("/:id", verifyToken, updateCategoria);

// ✅ DELETE - Eliminar (Protegido con token)
router.delete("/:id", verifyToken, deleteCategoria);

export default router;