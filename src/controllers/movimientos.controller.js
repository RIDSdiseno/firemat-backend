import { prisma } from "../config/db.js";
import { movimientoSchema } from "../schemas/movimiento.schema.js";

// GET /movimientos
export const getMovimientos = async (req, res) => {
  try {
    const movimientos = await prisma.movimiento.findMany({
      include: {
        producto: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(movimientos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener movimientos" });
  }
};

// GET /movimientos/producto/:productoId
export const getMovimientosByProducto = async (req, res) => {
  try {
    const { productoId } = req.params;

    const movimientos = await prisma.movimiento.findMany({
      where: {
        productoId: Number(productoId),
      },
      include: {
        producto: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(movimientos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener movimientos del producto" });
  }
};

// POST /movimientos
import { movimientoSchema } from "../schemas/movimiento.schema.js";

export const crearMovimiento = async (req, res) => {
  try {
    const parsed = movimientoSchema.safeParse({
      ...req.body,
      productoId: Number(req.body.productoId),
      tipo: req.body.tipo?.toLowerCase(),
      cantidad: Number(req.body.cantidad)
    });

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const { productoId, tipo, cantidad, motivo, documento } = parsed.data;

    // 🔥 TRANSACTION
    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: productoId },
      });

      if (!producto) throw new Error("NOT_FOUND");
      if (producto.activo === false) throw new Error("INACTIVO");

      const stockAnterior = producto.stock;
      let stockNuevo = stockAnterior;
      let cantidadFinal = cantidad;

      if (tipo === "entrada") {
        stockNuevo += cantidad;

      } else if (tipo === "salida") {
        if (cantidad > stockAnterior) throw new Error("STOCK_INSUFICIENTE");
        stockNuevo -= cantidad;

      } else if (tipo === "ajuste") {
        stockNuevo = cantidad;
        cantidadFinal = stockNuevo - stockAnterior;

      } else {
        throw new Error("TIPO_INVALIDO");
      }

      await tx.producto.update({
        where: { id: productoId },
        data: { stock: stockNuevo },
      });

      const movimiento = await tx.movimiento.create({
        data: {
          productoId,
          tipo,
          cantidad: cantidadFinal,
          stockAnterior,
          stockNuevo,
          motivo,
          documento,
        },
      });

      return movimiento;
    });

    res.status(201).json(resultado);

  } catch (error) {
    console.log("ERROR MOVIMIENTO:", error.message);

    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    if (error.message === "INACTIVO") {
      return res.status(400).json({ error: "Producto inactivo" });
    }

    if (error.message === "STOCK_INSUFICIENTE") {
      return res.status(400).json({ error: "Stock insuficiente" });
    }

    if (error.message === "TIPO_INVALIDO") {
      return res.status(400).json({ error: "Tipo inválido" });
    }

    res.status(500).json({ error: "Error al crear movimiento" });
  }
};