import express from "express";
import {
  crearVenta,
  getVentas,
  cambiarEstadoVenta
} from "../controllers/ventas.controller.js";

const router = express.Router();

// rutas
router.post("/", crearVenta);
router.get("/", getVentas);
router.patch("/:id/estado", cambiarEstadoVenta);

export default router;