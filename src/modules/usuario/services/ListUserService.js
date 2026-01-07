import prisma from "../../../lib/prisma.js";

export default async function ListUserService() {
  const usuarios = await prisma.usuario.findMany({
    include: {
      servicos_oferecidos: true,
      // Ao invés de 'true', usamos um objeto para incluir os dados do cliente na avaliação.
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
  return usuarios;
}
