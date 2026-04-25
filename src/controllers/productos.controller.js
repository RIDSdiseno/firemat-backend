import { prisma } from "../config/db.js";

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
      filters.push({ categoria });
    }

    const productos = await prisma.producto.findMany({
      where: filters.length > 0 ? { AND: filters } : {},
      orderBy: { createdAt: "desc" },
    });

    res.json(productos);
  } catch (error) {
    console.error("ERROR PRODUCTOS:", error);
    res.status(500).json({ error: "Error al obtener productos", detalle: error.message });
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
    const {
      nombre,
      categoria,
      stock,
      minStock,
      precio,
      descripcion,
      ubicacion,
      activo, // 👈 NUEVO
      imagen, // 👈 NUEVO
      criticidad, // 👈 NUEVO
    } = req.body || {};

    const stockNum = Number(stock);
    const precioNum = Number(precio);

    const minStockNum =
      minStock !== undefined &&
      minStock !== null &&
      minStock !== ""
        ? Number(minStock)
        : 0;

    const activoValue =
      activo !== undefined && activo !== null
        ? Boolean(activo)
        : true; // 👈 default

    if (!nombre || !categoria || isNaN(stockNum) || isNaN(precioNum)) {
      return res.status(400).json({
        error: "Faltan campos obligatorios",
      });
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        categoria,
        stock: stockNum,
        minStock: minStockNum,
        precio: precioNum,
        descripcion,
        ubicacion,
        activo: activoValue, // 👈 FIX
        imagen, // 👈 AGREGAR
      },
    });

    await prisma.movimiento.create({
      data: {
        productoId: nuevoProducto.id,
        tipo: "entrada",
        cantidad: stockNum,
        stockAnterior: 0,
        stockNuevo: stockNum,
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
      categoria,
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
        categoria,
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