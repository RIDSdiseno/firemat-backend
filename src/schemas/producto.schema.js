import { z } from "zod";

export const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  categoriaId: z.union([z.string(), z.number()]),
  stock: z.number().int().nonnegative("Stock inválido"),
  minStock: z.number().int().nonnegative().optional(),
  precio: z.number().positive("Precio inválido"),
  descripcion: z.string().optional(),
  ubicacion: z.string().optional(),
  activo: z.boolean().optional(),
  imagen: z.string().optional(),
  criticidad: z.string().optional()
});