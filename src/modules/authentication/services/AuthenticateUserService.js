import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function AuthenticateUserService({ email, senha }) {
  // 1. Buscar usuário
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw new Error("Credenciais inválidas");
  }

  // 2. Comparar senha
  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw new Error("Credenciais inválidas");
  }

  // 3. MODERAÇÃO: Verifica se o usuário foi aprovado.
  if (usuario.aprovado !== true) {
    throw new Error("Sua conta está pendente de aprovação.");
  }

  // 4. Gerar token
  const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // 5. Remover a senha do objeto retornado
  const { senha: _, ...usuarioSemSenha } = usuario;

  return { token, usuario: usuarioSemSenha };
}
