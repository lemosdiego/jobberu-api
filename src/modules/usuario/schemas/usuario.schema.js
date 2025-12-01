// /src/modules/usuario/schemas/usuario.schema.js

import { z } from "zod";

export const criarUsuarioSchema = z.object({
  body: z.object({
    nome: z
      .string({
        required_error: "O nome é obrigatório.",
        invalid_type_error: "O nome deve ser um texto.",
      })
      .min(3, { message: "O nome deve ter no mínimo 3 caracteres." }),

    email: z
      .string({
        required_error: "O email é obrigatório.",
      })
      .email({ message: "Formato de email inválido." }),

    senha: z
      .string({
        required_error: "A senha é obrigatória.",
      })
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),

    telefone: z
      .string({
        required_error: "O telefone é obrigatório.",
      })
      .min(10, {
        message: "O telefone deve ter no mínimo 10 dígitos (com DDD).",
      }),

    cep: z
      .string({
        required_error: "O CEP é obrigatório.",
      })
      .length(8, { message: "O CEP deve ter exatamente 8 dígitos." }),

    is_prestador: z.enum(["true", "false"], {
      required_error:
        "O campo is_prestador é obrigatório e deve ser 'true' ou 'false'.",
    }),

    // Campos opcionais para prestadores
    titulo_profissional: z.string().optional(),
    biografia: z.string().optional(),
    anos_experiencia: z.string().optional(), // Recebemos como string do form-data
    links_redes_sociais: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});
