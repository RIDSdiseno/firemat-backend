import { Router } from "express";
import {
    crearMovimiento,
  getMovimientos,
  getMovimientosByProducto,
} from "../controllers/movimientos.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", getMovimientos);
router.get("/", verifyToken, createMovimiento);
router.get("/producto/:productoId", getMovimientosByProducto);
router.post("/", crearMovimiento);

export default router;