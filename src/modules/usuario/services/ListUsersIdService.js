import prisma from "../../../lib/prisma.js";

export default async function ListUsersIdService(userId) {
  const id = parseInt(userId, 10);

  const usuario = await prisma.usuario.findUnique({
    where: { id },
    include: {
      servicos_oferecidos: true,
      avaliacoes_recebidas: {
        include: {
          cliente: {
            select: {
              nome: true,
              foto_perfil_url: true,
            },
          },
        },
      },
    },
  });
  if (!usuario) {
    throw new Error("Usuário não encontrado");
  }
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}
