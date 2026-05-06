import express from "express";
import {
  crearCliente,
  getClientes,
  getClienteById
} from "../controllers/clientes.controller.js";

const router = express.Router();

router.post("/", crearCliente);
router.get("/", getClientes);
router.get("/:id", getClienteById);

export default router;