import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import carregarNoCloudinary from "../../../lib/cloudinary.js";

export default async function EditUserService(userId, data, file) {
  const novosDados = { ...data };

  // 1. Converte 'is_prestador' de string para booleano, se existir.
  if (novosDados.is_prestador !== undefined) {
    novosDados.is_prestador = novosDados.is_prestador === "true";
  }

  // 2. Se uma nova foto de perfil for enviada, faz o upload.
  if (file) {
    const fotoPerfilUrl = await carregarNoCloudinary(
      file.path,
      "fotos_perfil_usuarios"
    );
    novosDados.foto_perfil_url = fotoPerfilUrl;
  }

  // 3. Se uma nova senha for enviada, criptografa.
  if (novosDados.senha) {
    novosDados.senha = await bcrypt.hash(novosDados.senha, 10);
  }

  // 4. Atualiza o usuário no banco.
  const usuarioAtualizado = await prisma.usuario.update({
    where: { id: userId },
    data: novosDados,
  });

  const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;
  return usuarioSemSenha;
}
