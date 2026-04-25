// src/controllers/categorias.controller.js
import { prisma } from "../lib/prisma.js";

/* =====================================================
   GET /api/categorias
===================================================== */
export const getCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: "asc" },
    });

    res.json(categorias);
  } catch (error) {
    console.error("ERROR GET CATEGORIAS:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

/* =====================================================
   POST /api/categorias
===================================================== */
export const crearCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        error: "El nombre de la categoría es obligatorio",
      });
    }

    // 🔥 evitar duplicados
    const existente = await prisma.categoria.findFirst({
      where: {
        nombre: nombre.trim(),
      },
    });

    if (existente) {
      return res.status(400).json({
        error: "La categoría ya existe",
      });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
      },
    });

    res.status(201).json(nuevaCategoria);
  } catch (error) {
    console.error("ERROR CREAR CATEGORIA:", error);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

/* =====================================================
   PUT /api/categorias/:id
===================================================== */
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        error: "El nombre es obligatorio",
      });
    }

    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nombre: nombre.trim() },
    });

    res.json(categoria);
  } catch (error) {
    console.error("ERROR UPDATE CATEGORIA:", error);

    res.status(500).json({
      error: "Error al actualizar categoría",
    });
  }
};

/* =====================================================
   DELETE /api/categorias/:id (opcional pero útil)
===================================================== */
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.categoria.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    console.error("ERROR DELETE CATEGORIA:", error);

    res.status(500).json({
      error: "Error al eliminar categoría",
    });
  }
};