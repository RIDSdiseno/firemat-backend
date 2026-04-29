import prisma from "../prisma/client.js";

export const crearMovimiento = async ({ tipo, cantidad, productoId, userId }) => {
  return prisma.movimiento.create({
    data: {
      tipo,
      cantidad,
      productoId,
      userId
    }
  });
};