import { prisma } from "../config/db.js";
import { productoSchema } from "../schemas/producto.schema.js";

/* =====================================================
   GET /productos
===================================================== */
export const getProductos = async (req, res) => {
  try {
    const { search, categoria } = req.query;

    const filters = [];

    if (search) {
      const orFilters = [
        {
          nombre: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];

      if (!isNaN(search)) {
        orFilters.push({
          id: Number(search),
        });
      }

      filters.push({ OR: orFilters });
    }

    if (categoria) {
      filters.push({
        categoria: {
          nombre: categoria,
        },
      });
    }

    const productos = await prisma.producto.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      include: {
        categoria: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 🔥 NORMALIZACIÓN CRÍTICA (ARREGLA TU ERROR)
    const data = productos.map((p) => ({
      id: p.id,
      nombre: typeof p.nombre === "string" ? p.nombre : "",
      stock: Number(p.stock) || 0,
      minStock: Number(p.minStock) || 0,
      precio: Number(p.precio) || 0,
      ubicacion: typeof p.ubicacion === "string" ? p.ubicacion : "",
      activo: !!p.activo,
      imagen: typeof p.imagen === "string" ? p.imagen : "",
      criticidad: p.criticidad || "Media",

      // 🔥 CLAVE: SIEMPRE STRING
      categoria: p.categoria?.nombre || "Sin categoría",
      categoriaId: p.categoriaId,
    }));

    res.json(data);
  } catch (error) {
    console.error("ERROR PRODUCTOS:", error);
    res.status(500).json({
      error: "Error al obtener productos",
      detalle: error.message,
    });
  }
};

/* =====================================================
   GET /productos/:id
===================================================== */
export const getProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID es obligatorio" });
    }

    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) },
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
};

/* =====================================================
   POST /productos
===================================================== */
export const crearProducto = async (req, res) => {
  try {
    // 🔥 Validación Zod
    const parsed = productoSchema.safeParse({
      ...req.body,
      stock: Number(req.body.stock),
      precio: Number(req.body.precio),
      minStock:
        req.body.minStock !== undefined && req.body.minStock !== ""
          ? Number(req.body.minStock)
          : 0,
      categoriaId: Number(req.body.categoriaId),
      activo:
        req.body.activo !== undefined
          ? Boolean(req.body.activo)
          : true
    });

    if (!parsed.success) {
      console.log("ERROR ZOD:", parsed.errors);
      return res.status(400).json({
        error: parsed.error.errors
      });
    }

    const data = parsed.data;

    // 👇 tu lógica original (casi intacta)
    const nuevoProducto = await prisma.producto.create({
      data: {
        ...data
      },
    });

    await prisma.movimiento.create({
      data: {
        productoId: nuevoProducto.id,
        tipo: "entrada",
        cantidad: data.stock,
        stockAnterior: 0,
        stockNuevo: data.stock,
        motivo: "Creación de producto",
      },
    });

    res.status(201).json(nuevoProducto);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

/* =====================================================
   PUT /productos/:id
===================================================== */
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID es obligatorio" });
    }

    const {
      nombre,
      categoriaId,
      stock,
      minStock,
      precio,
      descripcion,
      ubicacion,
      activo, // 👈 NUEVO
      imagen, // 👈 NUEVO
      criticidad, // 👈 NUEVO
    } = req.body || {};

    const anteriorProducto = await prisma.producto.findUnique({
      where: { id: Number(id) },
    });

    if (!anteriorProducto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const stockNum =
      stock !== undefined && stock !== null && stock !== ""
        ? Number(stock)
        : anteriorProducto.stock;

    const minStockNum =
      minStock !== undefined && minStock !== null && minStock !== ""
        ? Number(minStock)
        : anteriorProducto.minStock;

    const precioNum =
      precio !== undefined && precio !== null && precio !== ""
        ? Number(precio)
        : anteriorProducto.precio;

    const activoValue =
      activo !== undefined && activo !== null
        ? Boolean(activo)
        : anteriorProducto.activo; // 👈 MANTIENE SI NO VIENE

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: {
        nombre,
        categoriaId,
        stock: stockNum,
        minStock: minStockNum,
        precio: precioNum,
        descripcion,
        ubicacion,
        activo: activoValue,  // 👈 FIX
        imagen: imagen ?? anteriorProducto.imagen, //👈 MEJORA
        criticidad: criticidad ?? anteriorProducto.criticidad, // FIX
      },
    });

    if (stockNum !== anteriorProducto.stock) {
      await prisma.movimiento.create({
        data: {
          productoId: Number(id),
          tipo: "ajuste",
          cantidad: stockNum - anteriorProducto.stock,
          stockAnterior: anteriorProducto.stock,
          stockNuevo: stockNum,
          motivo: "Edición manual",
        },
      });
    }

    res.json(producto);
  } catch (error) {
    console.log("ERROR REAL:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

/* =====================================================
   DELETE /productos/:id
===================================================== */
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID es obligatorio" });
    }

    const productoId = Number(id);

    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // 🔥 BORRAR movimientos primero
    await prisma.movimiento.deleteMany({
      where: { productoId },
    });

    // 🔥 LUEGO borrar producto
    await prisma.producto.delete({
      where: { id: productoId },
    });

    res.json({ message: "Producto eliminado correctamente" });

  } catch (error) {
    console.log("ERROR DELETE:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

export const reservarProducto = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cantidad, motivo, documento } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        message: "Cantidad inválida"
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {

      const producto = await tx.producto.findUnique({
        where: { id }
      });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      const stockReservado = producto.stockReservado || 0;
      const disponible = producto.stock - stockReservado;

      if (cantidad > disponible) {
        throw new Error("No hay stock disponible suficiente");
      }

      const stockAnterior = producto.stock;

      const actualizado = await tx.producto.update({
        where: { id },
        data: {
          stockReservado: stockReservado + cantidad
        }
      });

      await tx.movimiento.create({
        data: {
          tipo: "RESERVA",
          cantidad,
          productoId: id,
          stockAnterior: producto.stockAnterior,
          stockNuevo: producto.stockAnterior + cantidad,
          documento: documento || null,
          motivo: motivo || null,
        }
      });

      return actualizado;
    });

    res.json(resultado);

  } catch (error) {
    console.error("ERROR RESERVA:", error);
    res.status(500).json({
      message: error.message || "Error al reservar producto"
    });
  }
};

export const confirmarSalida = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        message: "Cantidad inválida"
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {

      const producto = await tx.producto.findUnique({
        where: { id }
      });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      const stockReservado = producto.stockReservado || 0;

      if (cantidad > stockReservado) {
        throw new Error("No hay suficiente stock reservado");
      }

      const stockAnterior = producto.stock;

      // 🔥 actualizar stock real y reservado
      const actualizado = await tx.producto.update({
        where: { id },
        data: {
          stock: producto.stock - cantidad,
          stockReservado: stockReservado - cantidad
        }
      });

      // 🔥 registrar movimiento
      await tx.movimiento.create({
        data: {
          tipo: "SALIDA",
          cantidad,
          productoId: id,
          stock: producto.stock - cantidad,
          stockReservado: stockReservado - cantidad,
          documento: documento || null,
          motivo: motivo || null,
        }
      });

      return actualizado;
    });

    res.json(resultado);

  } catch (error) {
    console.error("ERROR SALIDA:", error);
    res.status(500).json({
      message: error.message || "Error al confirmar salida"
    });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({
        message: "Cantidad inválida"
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {

      const producto = await tx.producto.findUnique({
        where: { id }
      });

      if (!producto) {
        throw new Error("Producto no encontrado");
      }

      const stockReservado = producto.stockReservado || 0;

      if (cantidad > stockReservado) {
        throw new Error("No puedes cancelar más de lo reservado");
      }

      const nuevoReservado = stockReservado - cantidad;

      const actualizado = await tx.producto.update({
        where: { id },
        data: {
          stockReservado: nuevoReservado
        }
      });

      await tx.movimiento.create({
        data: {
          tipo: "CANCELACION",
          cantidad,
          productoId: id,
          stockAnterior: stockReservado,
          stockNuevo: stockReservado - cantidad,
          documento: documento || null,
          motivo: "Cancelación de reserva",
        }
      });

      return actualizado;
    });

    res.json(resultado);

  } catch (error) {
    console.error("ERROR CANCELAR:", error);
    res.status(500).json({
      message: error.message || "Error al cancelar reserva"
    });
  }
};