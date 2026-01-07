import prisma from "../../../lib/prisma.js";

export default async function ListMyReviewsService(clienteId) {
  const avaliacoesFeitas = await prisma.avaliacao.findMany({
    where: {
      clienteId: clienteId,
    },
    include: {
      prestador: {
        select: {
          id: true,
          nome: true,
          foto_perfil_url: true,
        },
      },
    },
  });

  return avaliacoesFeitas;
}
