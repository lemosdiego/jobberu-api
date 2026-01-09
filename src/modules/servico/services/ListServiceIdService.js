import prisma from "../../../lib/prisma.js";

export default async function ListServiceIdService(serviceId) {
  const id = parseInt(serviceId, 10);
  const servico = await prisma.servico.findUnique({
    where: { id },
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

  if (!servico) {
    throw new Error("Serviço não encontrado");
  }

  return servico;
}
