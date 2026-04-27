import { Router } from "express";
import {
    getInventario,
    movimientoStock,
    getMovimientos,
} from "../controllers/inventario.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 🔥 Rutas RELATIVAS (sin repetir "inventario")
router.get("/", getInventario);
router.get("/", verifyToken, getInventario);
router.post("/movimiento", movimientoStock);
router.get("/movimientos", getMovimientos);

export default router;