import { Router } from "express";
import {
    getInventario,
    movimientoStock,
    getMovimientos,
} from "../controllers/inventario.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// ✅ Obtener estado actual del inventario (Protegido)
router.get("/", verifyToken, getInventario);

// ✅ Registrar un movimiento de stock (Entrada/Salida)
// Se cambia a POST porque altera datos y se añade seguridad
router.post("/movimiento", verifyToken, movimientoStock);

// ✅ Historial de movimientos
router.get("/movimientos", verifyToken, getMovimientos);

export default router;