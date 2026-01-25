import prisma from "../../../lib/prisma.js";
import crypto from "crypto";

export default async function RequestPasswordResetService(email) {
  if (!email) {
    throw new Error("Email é obrigatório.");
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Segurança: Se o usuário não existe, retornamos null ou uma mensagem genérica
  // para não vazar informações, mas o controller tratará a resposta.
  if (!usuario) {
    return null;
  }

  // 1. Gerar Token Seguro
  const token = crypto.randomBytes(20).toString("hex");

  // 2. Definir Expiração (1 hora)
  const agora = new Date();
  agora.setHours(agora.getHours() + 1);

  // 3. Salvar no Banco
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      token_recuperacao: token,
      token_expiracao: agora,
    },
  });

  return { token, email };
}
