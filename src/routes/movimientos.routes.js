import { Router } from "express";
import {
    crearMovimiento,
  getMovimientos,
  getMovimientosByProducto,
} from "../controllers/movimientos.controller.js";

const router = Router();

router.get("/", getMovimientos);
router.get("/producto/:productoId", getMovimientosByProducto);
router.post("/", crearMovimiento);

export default router;