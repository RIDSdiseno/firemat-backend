// src/controllers/categorias.controller.js
import { prisma } from "../lib/prisma.js";

export const getCategorias = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      select: {
        categoria: true,
      },
    });

    // 🔥 Sacar categorías únicas
    const categoriasUnicas = [
      ...new Set(productos.map((p) => p.categoria)),
    ];

    res.json(categoriasUnicas);
  } catch (error) {
    console.error("ERROR REAL:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre },
    });

    res.json(categoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar categoria" });
  }
}; 