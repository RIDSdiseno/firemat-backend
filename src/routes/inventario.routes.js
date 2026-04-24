import { Router } from "express";
import {
    getInventario,
    movimientoStock,
    getMovimientos,
} from "../controllers/inventario.controller.js";

const router = Router();

// 🔥 Rutas RELATIVAS (sin repetir "inventario")
router.get("/", getInventario);
router.post("/movimiento", movimientoStock);
router.get("/movimientos", getMovimientos);

export default router;