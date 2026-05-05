import { prisma } from "../config/db.js";

export const crearVenta = async (req, res) => {
  try {
    const { cliente, productoId, cantidad, precio } = req.body;

    if (!cliente || !productoId || !cantidad || !precio) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const producto = await prisma.producto.findUnique({
        where: { id: Number(productoId) }
    });

    if (!producto) {
        return res.status(404).json({
            message: "Producto no existe"
        });
    }

    const total = cantidad * precio;

    const venta = await prisma.venta.create({
        data: {
        cliente,
        cantidad: Number(cantidad),
        precio: Number(precio),
        total,
        estado: "PROSPECTO",

        // 👇 CAMPOS DE VENTA (AFUERA)
        origen: "Manual",
        responsable: "Sin asignar",
        proximaAccion: "Contactar cliente",
        fechaProximaAccion: new Date(),

        // 👇 RELACIÓN (SEPARADA)
        producto: {
            connect: { id: Number(productoId) }
        }
    },
});

    res.status(201).json(venta);

  } catch (error) {
    console.error("ERROR CREAR VENTA:", error); // 👈 IMPORTANTE
  res.status(500).json({ message: error.message });
  }
};

export const getVentas = async (req, res) => {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        producto: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(ventas);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener ventas" });
  }
};

export const cambiarEstadoVenta = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    const venta = await prisma.venta.findUnique({
      where: { id }
    });

    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    if (!venta.proximaAccion || !venta.fechaProximaAccion) {
        return res.status(400).json({
            message: "La venta no tiene proxima acción definida"
        });
    }

    // 🔥 TRANSACCIÓN
    const resultado = await prisma.$transaction(async (tx) => {

      // 1. Cambiar estado
      const updated = await tx.venta.update({
        where: { id },
        data: { estado }
      });

      // 2. LÓGICA SEGÚN ESTADO

      // 👉 RESERVA
      if (estado === "ORDEN_CONFIRMADA") {
        const producto = await tx.producto.findUnique({
          where: { id: venta.productoId }
        });

        const stockReservado = producto.stockReservado || 0;
        const disponible = producto.stock - stockReservado;

        if (venta.cantidad > disponible) {
          throw new Error("No hay stock suficiente para reservar");
        }

        await tx.producto.update({
          where: { id: venta.productoId },
          data: {
            stockReservado: stockReservado + venta.cantidad
          }
        });

        await tx.movimiento.create({
          data: {
            tipo: "RESERVA",
            cantidad: venta.cantidad,
            productoId: venta.productoId,
            stockAnterior: producto.stock,
            stockNuevo: producto.stock,
            motivo: "Reserva por venta"
            }
        });
        }

      // 👉 DESCUENTO REAL
      if (estado === "GANADA") {
        const producto = await tx.producto.findUnique({
          where: { id: venta.productoId }
        });

        const stockNuevo = producto.stock - venta.cantidad;

        await tx.producto.update({
          where: { id: venta.productoId },
          data: {
            stock: stockNuevo,
            stockReservado: producto.stockReservado - venta.cantidad
          }
        });

        await tx.movimiento.create({
          data: {
            tipo: "SALIDA",
            cantidad: venta.cantidad,
            productoId: venta.productoId,
            stockAnterior: producto.stock,
            stockNuevo,
            motivo: "Venta confirmada"
          }
        });
      }

      return updated;
    });

    res.json(resultado);

  } catch (error) {
    console.error("ERROR ESTADO:", error);
    res.status(500).json({ message: error.message });
  }
};

