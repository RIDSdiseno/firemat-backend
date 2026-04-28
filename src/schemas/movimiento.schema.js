import { z } from "zod";

export const movimientoSchema = z.object({
  productoId: z.union([z.string(), z.number()]),
  tipo: z.enum(["entrada", "salida", "ajuste"]),
  cantidad: z.number().positive("Cantidad debe ser mayor a 0"),
  motivo: z.string().optional(),
  documento: z.string().optional()
});