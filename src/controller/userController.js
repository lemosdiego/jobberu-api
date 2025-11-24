import prisma from "../lib/prisma.js";

export async function createUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

export async function getUser(req, res) {
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
