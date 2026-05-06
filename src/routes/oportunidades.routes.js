import express from "express";
import {
    crearOportunidad,
    getOportunidades,
    cambiarEtapa
} from "../controllers/oportunidades.controller.js";

const router = express.Router();

router.post("/", crearOportunidad);
router.get("/", getOportunidades);
router.patch("/:id/etapa", cambiarEtapa);

export default router;