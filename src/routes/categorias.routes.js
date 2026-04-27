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

// ✅ GET
router.get("/", getCategorias);

// ✅ POST (🔥 ESTO FALTABA)
router.post("/", crearCategoria);

// ✅ PUT
router.put("/:id", updateCategoria);

// ✅ DELETE (opcional pero recomendado)
router.delete("/:id", deleteCategoria);

router.get("/", verifyToken, getCategorias);

export default router;