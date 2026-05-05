-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cliente" TEXT NOT NULL,
    "contacto" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PROSPECTO',
    "responsable" TEXT,
    "fechaCierre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaDetalle" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VentaDetalle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaDetalle" ADD CONSTRAINT "VentaDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
