import { prisma } from "../config/db.js";

// 🔥 CREAR CLIENTE
export const crearCliente = async (req, res) => {
  try {
    const { nombre, rut, email, telefono, direccion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        message: "El nombre es obligatorio"
      });
    }

    // 🔍 evitar duplicados por RUT
    if (rut) {
      const existe = await prisma.cliente.findUnique({
        where: { rut }
      });

      if (existe) {
        return res.status(400).json({
          message: "Ya existe un cliente con ese RUT"
        });
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        rut,
        email,
        telefono,
        direccion
      }
    });

    res.status(201).json(cliente);

  } catch (error) {
    console.error("ERROR CREAR CLIENTE:", error);
    res.status(500).json({ message: "Error al crear cliente" });
  }
};


// 🔥 OBTENER TODOS LOS CLIENTES
export const getClientes = async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(clientes);

  } catch (error) {
    console.error("ERROR GET CLIENTES:", error);
    res.status(500).json({ message: "Error al obtener clientes" });
  }
};


// 🔥 OBTENER CLIENTE POR ID
export const getClienteById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        oportunidades: true // 👈 importante para CRM
      }
    });

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente no encontrado"
      });
    }

    res.json(cliente);

  } catch (error) {
    console.error("ERROR GET CLIENTE:", error);
    res.status(500).json({ message: "Error al obtener cliente" });
  }
};