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
            unidadNegocio,
            productoId
        } = req.body;
        
        if (!clienteId || !monto || !titulo || !unidadNegocio) {
            return res.status(400).json({
                message: "Datos incompletos"
            });
        }
        
        const oportunidad = await prisma.oportunidad.create({
            data: {
                clienteId: Number(clienteId),
                productoId: Number(productoId),
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
            where: { id },
            include: {
            cliente: true,
            producto: true
        }
    })
    
    if (!oportunidad) {
        return res.status(404).json({
            message: "Oportunidad no encontrada"
        });
    }

        const resultado = await prisma.$transaction(async (tx) => {

        // 1. Actualizar etapa
        const updated = await tx.oportunidad.update({
            where: { id },
            data: { etapa }
        });

      // 🔥 2. SI SE GANA → CREAR VENTA AUTOMÁTICA
        if (etapa === "GANADA") {

        if (!oportunidad.productoId) {
            throw new Error("La oportunidad no tiene producto asociado")
        }

        // ⚠️ Evitar duplicar ventas
        const ventaExistente = await tx.venta.findFirst({
            where: {
            cliente: oportunidad.cliente.nombre,
            total: oportunidad.montoEstimado
        }
        });

        if (!ventaExistente) {

            await tx.venta.create({
            data: {
                cliente: oportunidad.cliente?.nombre || "Cliente sin nombre",
                productoId: oportunidad.productoId,
                cantidad: 1,  
                precio: oportunidad.montoEstimado,
                total: oportunidad.montoEstimado,
                estado: "GANADA",
                origen: "CRM",
                responsable: "Auto CRM",
                proximaAccion: "Venta generada automáticamente",
                fechaProximaAccion: new Date()
            }
        });
            const producto = await tx.producto.findUnique({
                where: { id: oportunidad.productoId }
            });

            if (!producto) {
                throw new Error("Producto no encontrado");
            }

            const cantidad = 1;
            const stockNuevo = producto.stock - cantidad;

            if (stockNuevo < 0) {
                throw new Error("Stock insuficiente para venta automatica");
            }

            await tx.producto.update({
                where: { id: oportunidad.productoId },
                data: {
                    stock: stockNuevo
                }
            });

            await tx.movimiento.create({
                data: { 
                    tipo: "SALIDA",
                    cantidad: cantidad,
                    productoId: oportunidad.productoId,
                    stockAnterior: producto.stock,
                    stockNuevo,
                    motivo: "Venta automatica desde CRM"
                }
            });
        }
    }
    
    return updated;
    });

    res.json(resultado);
} catch (error) {
    console.error("ERROR ETAPA:", error);
    res.status(500).json({ message: error.message });
}
};

export const eliminarOportunidad = async (req, res) => {
  try {

    const id = Number(req.params.id);

    const oportunidad = await prisma.oportunidad.findUnique({
      where: { id }
    });

    if (!oportunidad) {
      return res.status(404).json({
        message: "Oportunidad no encontrada"
      });
    }

    await prisma.oportunidad.delete({
      where: { id }
    });

    res.json({
      message: "Oportunidad eliminada"
    });

  } catch (error) {
    console.error("ERROR ELIMINAR:", error);

    res.status(500).json({
      message: error.message
    });
  }
};