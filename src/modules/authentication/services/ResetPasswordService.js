import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";

export default async function ResetPasswordService({ token, novaSenha }) {
  if (!token || !novaSenha) {
    throw new Error("Token e nova senha são obrigatórios.");
  }

  // 1. Buscar usuário pelo token e verificar validade
  const usuario = await prisma.usuario.findFirst({
    where: {
      token_recuperacao: token,
      token_expiracao: {
        gt: new Date(), // Deve ser maior que agora
      },
    },
  });

  if (!usuario) {
    throw new Error("Token inválido ou expirado.");
  }

  // 2. Criptografar nova senha
  const hashSenha = await bcrypt.hash(novaSenha, 10);

  // 3. Atualizar senha e limpar token
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      senha: hashSenha,
      token_recuperacao: null,
      token_expiracao: null,
    },
  });

  return { message: "Senha alterada com sucesso." };
}
