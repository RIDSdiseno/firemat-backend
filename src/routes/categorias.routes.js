// src/routes/categorias.routes.js
import { Router } from "express";
import { getCategorias, updateCategoria } from "../controllers/categorias.controller.js";

const router = Router();

router.get("/", getCategorias);
router.put("/categorias/:id", updateCategoria);

export default router;