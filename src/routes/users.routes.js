import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// GET TODOS LOS USUARIOS
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

export default router;