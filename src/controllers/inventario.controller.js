// src/controllers/inventario.controller.js
import { prisma } from "../lib/prisma.js";

// 🔹 Obtener inventario (productos con stock)
export const getInventario = async (req, res) => {
    try {
    const productos = await prisma.producto.findMany({
        orderBy: { nombre: "asc" },
    });

    res.json(productos);
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener inventario" });
    }
};

// 🔹 Movimiento de stock (entrada, salida, ajuste)
export const movimientoStock = async (req, res) => {
    try {
    const { productoId, tipo, cantidad, motivo, documento } = req.body;

    if (!productoId || !tipo || !cantidad) {
        return res.status(400).json({
        error: "Datos incompletos",
        });
    }

    const producto = await prisma.producto.findUnique({
        where: { id: Number(productoId) },
    });

    if (!producto) {
        return res.status(404).json({
        error: "Producto no encontrado",
        });
    }

    const stockAnterior = producto.stock;
    let stockNuevo = stockAnterior;

    // 🔥 lógica según tipo
    if (tipo === "entrada") {
        stockNuevo = stockAnterior + Number(cantidad);
    }

    if (tipo === "salida") {
        stockNuevo = stockAnterior - Number(cantidad);

        if (stockNuevo < 0) {
        return res.status(400).json({
            error: "Stock insuficiente",
        });
        }
    }

    if (tipo === "ajuste") {
        stockNuevo = Number(cantidad);
    }

    // 🔥 actualizar producto
    const productoActualizado = await prisma.producto.update({
        where: { id: producto.id },
        data: { stock: stockNuevo },
    });

    // 🔥 guardar movimiento
    const movimiento = await prisma.movimiento.create({
        data: {
        productoId: producto.id,
        tipo,
        cantidad: Number(cantidad),
        stockAnterior,
        stockNuevo,
        motivo: motivo || "",
        documento: documento || "",
        },
    });

    res.json({
        producto: productoActualizado,
        movimiento,
    });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en movimiento de stock" });
    }
};

export const getMovimientos = async (req, res) => {
    try {
        const movimientos = await prisma.movimiento.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(movimientos);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener movimientos "});
    }
};

