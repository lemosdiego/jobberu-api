import prisma from "../../../lib/prisma.js";

export default async function ListServiceService() {
  const servicos = await prisma.servico.findMany();
  return servicos;
}
