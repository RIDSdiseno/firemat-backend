// src/services/movimiento.service.js
import prisma from "../prisma/client.js";

export const crearMovimiento = async ({ tipo, cantidad, productoId, userId, motivo }) => {
  // 1. Buscamos el producto para conocer su stock anterior y criticidad
  const producto = await prisma.producto.findUnique({
    where: { id: productoId }
  });

  if (!producto) throw new Error("Producto no encontrado");

  // 2. Calculamos el nuevo stock basado en el tipo de movimiento
  let nuevoStock = producto.stock;
  if (tipo === "ENTRADA") nuevoStock += cantidad;
  if (tipo === "SALIDA") nuevoStock -= cantidad;
  if (tipo === "AJUSTE") nuevoStock = cantidad; // En ajuste solemos setear el valor real

  // 3. Ejecutamos una TRANSACCIÓN (Regla del Doc Técnico para integridad)
  return prisma.$transaction([
    // Actualizamos el stock del producto
    prisma.producto.update({
      where: { id: productoId },
      data: { stock: nuevoStock }
    }),
    // Creamos el registro del movimiento para el historial (Kardex)
    prisma.movimiento.create({
      data: {
        tipo,
        cantidad,
        productoId,
        userId,
        motivo: motivo || `Movimiento de tipo ${tipo}`,
        stockAnterior: producto.stock,
        stockNuevo: nuevoStock
      }
    })
  ]);
};