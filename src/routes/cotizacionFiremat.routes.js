import express from "express";

import {
  getCotizaciones,
  getCotizacionById,
  crearCotizacion,
  cambiarEstadoCotizacion,
  eliminarCotizacion
} from "../controllers/cotizacionFiremat.controller.js";

const router = express.Router();

// ✅ LISTAR
router.get("/", getCotizaciones);

// ✅ OBTENER UNA
router.get("/:id", getCotizacionById);

// ✅ CREAR
router.post("/", crearCotizacion);

// ✅ CAMBIAR ESTADO
router.patch("/:id/estado", cambiarEstadoCotizacion);

// ✅ ELIMINAR
router.delete("/:id", eliminarCotizacion);

export default router;