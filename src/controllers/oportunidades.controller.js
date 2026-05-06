import { prisma } from "../config/db.js";

// ✅ CREAR OPORTUNIDAD
export const crearOportunidad = async (req, res) => {
  try {
    const {
      clienteId,
      monto,
      probabilidad,
      etapa,
      titulo,
      unidadNegocio
    } = req.body;

    if (!clienteId || !monto || !titulo || !unidadNegocio) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    const oportunidad = await prisma.oportunidad.create({
      data: {
        clienteId: Number(clienteId),
        montoEstimado: Number(monto),
        probabilidad: probabilidad || 50,
        etapa: etapa || "PROSPECTO",
        titulo,
        unidadNegocio
      },
      include: {
        cliente: true,
      }
    });

    res.status(201).json(oportunidad);

  } catch (error) {
    console.error("ERROR CREAR OPORTUNIDAD:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ LISTAR OPORTUNIDADES
export const getOportunidades = async (req, res) => {
  try {
    const oportunidades = await prisma.oportunidad.findMany({
      include: {
        cliente: true,
        producto: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(oportunidades);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener oportunidades" });
  }
};

// ✅ CAMBIAR ETAPA (pipeline)
export const cambiarEtapa = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { etapa } = req.body;

    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id }
    });

    if (!oportunidad) {
      return res.status(404).json({
        message: "Oportunidad no encontrada"
      });
    }

    const updated = await prisma.oportunidad.update({
      where: { id },
      data: { etapa }
    });

    res.json(updated);

  } catch (error) {
    console.error("ERROR ETAPA:", error);
    res.status(500).json({ message: error.message });
  }
};