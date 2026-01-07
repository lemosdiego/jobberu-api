import prisma from "../../../lib/prisma.js";

export default async function DeleteUserService(userId) {
  await prisma.usuario.delete({
    where: { id: userId },
  });
}
