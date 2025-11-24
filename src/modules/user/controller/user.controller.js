import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function createUser(req, res) {
  const { nome, email, senha, telefone, tipo, cep, cidade, estado } = req.body;
  try {
    //criptografar a senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        telefone,
        tipo,
        cep,
        cidade,
        estado,
      },
    });
    //remover a senha do objeto retornado
    const { senha: _, ...usuarioSemSenha } = usuario;

    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}

export async function authenticateUser(req, res) {
  const { email, senha } = req.body;
  try {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    // Gerar token
    const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Erro de autenticação:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}

export async function getUser(req, res) {
  try {
    const usuario = await prisma.usuario.findMany();
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
