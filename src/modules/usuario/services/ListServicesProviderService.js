import prisma from "../../../lib/prisma.js";

export default async function ListServicesProviderService(idProvider) {
  // 1. Converte o ID do prestador para número.
  const providerId = parseInt(idProvider, 10);
  // 2. Busca os serviços no banco de dados onde o prestadorId corresponde ao ID do prestador.
  const services = await prisma.servico.findMany({
    where: {
      prestadorId: providerId,
    },
  });

  return services;
}
