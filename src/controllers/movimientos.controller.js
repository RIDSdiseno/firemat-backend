import { prisma } from "../config/db.js";

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
export const crearMovimiento = async (req, res) => {
  try {
    let { productoId, tipo, cantidad, motivo, documento } = req.body;

    // 🔥 NORMALIZAR
    tipo = tipo?.toLowerCase();

    if (!productoId || !tipo || cantidad == null) {
      return res.status(400).json({
        error: "productoId, tipo y cantidad son obligatorios",
      });
    }

    if (cantidad < 0) {
      return res.status(400).json({
        error: "La cantidad no puede ser negativa",
      });
    }

    // 🔥 TRANSACTION
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Buscar producto
      const producto = await tx.producto.findUnique({
        where: { id: Number(productoId) },
      });

      if (!producto) {
        throw new Error("NOT_FOUND");
      }

      // 🔥 VALIDAR ACTIVO
      if (producto.activo === false) {
        throw new Error("INACTIVO");
      }

      const stockAnterior = producto.stock;
      let stockNuevo = stockAnterior;
      let cantidadFinal = cantidad;

      // 2. Lógica de negocio
      if (tipo === "entrada") {
        if (cantidad <= 0) throw new Error("CANTIDAD_INVALIDA");
        stockNuevo += cantidad;

      } else if (tipo === "salida") {
        if (cantidad <= 0) throw new Error("CANTIDAD_INVALIDA");
        if (cantidad > stockAnterior) throw new Error("STOCK_INSUFICIENTE");
        stockNuevo -= cantidad;

      } else if (tipo === "ajuste") {
        stockNuevo = cantidad;
        cantidadFinal = stockNuevo - stockAnterior;

      } else {
        throw new Error("TIPO_INVALIDO");
      }

      // 3. Actualizar producto
      await tx.producto.update({
        where: { id: Number(productoId) },
        data: { stock: stockNuevo },
      });

      // 4. Crear movimiento
      const movimiento = await tx.movimiento.create({
        data: {
          productoId: Number(productoId),
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

    // 🔥 MANEJO DE ERRORES LIMPIO
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

    if (error.message === "CANTIDAD_INVALIDA") {
      return res.status(400).json({ error: "Cantidad inválida" });
    }

    res.status(500).json({ error: "Error al crear movimiento" });
  }
};