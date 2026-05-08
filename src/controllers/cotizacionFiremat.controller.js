import { prisma } from "../config/db.js";

// ✅ LISTAR COTIZACIONES
export const getCotizaciones = async (req, res) => {
  try {

    const cotizaciones = await prisma.cotizacionFiremat.findMany({
      include: {
        CotizacionFirematDetalle: {
          include: {
            Producto: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(cotizaciones);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo cotizaciones"
    });
  }
};

// ✅ OBTENER UNA COTIZACION
export const getCotizacionById = async (req, res) => {
  try {

    const id = Number(req.params.id);

    const cotizacion = await prisma.cotizacionFiremat.findUnique({
      where: { id },
      include: {
        CotizacionFirematDetalle: {
          include: {
            Producto: true
          }
        }
      }
    });

    if (!cotizacion) {
      return res.status(404).json({
        message: "Cotización no encontrada"
      });
    }

    res.json(cotizacion);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error obteniendo cotización"
    });
  }
};

// ✅ CREAR COTIZACION
export const crearCotizacion = async (req, res) => {
  try {

    const {
      cliente,
      contacto,
      responsable,
      observaciones,
      productos
    } = req.body;

    if (!cliente || !productos || productos.length === 0) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    // 🔥 generar numero
    const totalCotizaciones =
      await prisma.cotizacionFiremat.count();

    const numero =
      `COT-2026-${String(totalCotizaciones + 1).padStart(4, "0")}`;

    let subtotal = 0;

    // 🔥 recorrer productos
    const detalles = await Promise.all(

      productos.map(async (item) => {

        const producto =
          await prisma.producto.findUnique({
            where: {
              id: Number(item.productoId)
            }
          });

        if (!producto) {
          throw new Error(
            `Producto ${item.productoId} no encontrado`
          );
        }

        const cantidad = Number(item.cantidad);
        const precioUnitario = Number(item.precioUnitario);

        const subtotalLinea =
          cantidad * precioUnitario;

        subtotal += subtotalLinea;

        return {
          productoId: producto.id,
          cantidad,
          precioUnitario,
          subtotal: subtotalLinea,
          stockDisponible: producto.stock
        };
      })
    );

    const impuesto = subtotal * 0.19;
    const total = subtotal + impuesto;

    // 🔥 crear cotizacion + detalles
    const cotizacion =
      await prisma.cotizacionFiremat.create({
        data: {
          numero,
          cliente,
          contacto,
          responsable,
          observaciones,
          subtotal,
          impuesto,
          total,

          CotizacionFirematDetalle: {
            create: detalles
          }
        },
        include: {
          CotizacionFirematDetalle: {
            include: {
              Producto: true
            }
          }
        }
      });

    res.status(201).json(cotizacion);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};

// ✅ CAMBIAR ESTADO
export const cambiarEstadoCotizacion = async (req, res) => {
  try {

    const id = Number(req.params.id);

    const { estado } = req.body;

    const cotizacion =
      await prisma.cotizacionFiremat.findUnique({
        where: { id },
        include: {
          CotizacionFirematDetalle: true
        }
      });

    if (!cotizacion) {
      return res.status(404).json({
        message: "Cotización no encontrada"
      });
    }

    const updated =
      await prisma.cotizacionFiremat.update({
        where: { id },
        data: {
          estado
        }
      });

    // 🔥 SI ACEPTADA → CREAR VENTA
    if (estado === "ACEPTADA") {

      for (const item of cotizacion.CotizacionFirematDetalle) {

        const producto =
          await prisma.producto.findUnique({
            where: {
              id: item.productoId
            }
          });

        if (!producto) {
          throw new Error("Producto no encontrado");
        }

        const stockNuevo =
          producto.stock - item.cantidad;

        if (stockNuevo < 0) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}`
          );
        }

        // 🔥 actualizar stock
        await prisma.producto.update({
          where: {
            id: producto.id
          },
          data: {
            stock: stockNuevo
          }
        });

        // 🔥 movimiento
        await prisma.movimiento.create({
          data: {
            tipo: "SALIDA",
            cantidad: item.cantidad,
            productoId: producto.id,
            stockAnterior: producto.stock,
            stockNuevo,
            motivo: `Venta desde cotización ${cotizacion.numero}`
          }
        });

        // 🔥 crear venta
        await prisma.venta.create({
          data: {
            cliente: cotizacion.cliente,
            productoId: producto.id,
            cantidad: item.cantidad,
            precio: item.precioUnitario,
            total: item.subtotal,
            estado: "GANADA",
            origen: "COTIZACION",
            responsable:
              cotizacion.responsable || "CRM",
            proximaAccion:
              "Venta generada desde cotización",
            fechaProximaAccion: new Date()
          }
        });
      }
    }

    res.json(updated);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
};

// ✅ ELIMINAR
export const eliminarCotizacion = async (req, res) => {
  try {

    const id = Number(req.params.id);

    await prisma.cotizacionFiremat.delete({
      where: { id }
    });

    res.json({
      message: "Cotización eliminada"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error eliminando cotización"
    });
  }
};