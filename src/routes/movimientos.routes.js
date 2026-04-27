import { Router } from "express";
import {
  crearMovimiento, // <-- El nombre importado es "crearMovimiento"
  getMovimientos,
  getMovimientosByProducto,
} from "../controllers/movimientos.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 1. Obtener todos los movimientos
router.get("/", verifyToken, getMovimientos);

// 2. Obtener movimientos por producto
router.get("/producto/:productoId", verifyToken, getMovimientosByProducto);

// 3. Crear un movimiento (Debe ser POST y usar el nombre correcto)
// Cambiamos 'createMovimiento' por 'crearMovimiento'
router.post("/", verifyToken, crearMovimiento); 

export default router;