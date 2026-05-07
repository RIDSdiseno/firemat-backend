import express from "express";
import {
    crearOportunidad,
    getOportunidades,
    cambiarEtapa,
    eliminarOportunidad
} from "../controllers/oportunidades.controller.js";

const router = express.Router();

router.post("/", crearOportunidad);
router.get("/", getOportunidades);
router.patch("/:id/etapa", cambiarEtapa);
router.delete("/:id", eliminarOportunidad);

export default router;