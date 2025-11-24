import prisma from "../lib/prisma.js";

export default async function createUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}
