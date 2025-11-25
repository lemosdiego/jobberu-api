import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import carregarNoCloudinary from "../../../lib/cloudinary.js";

export async function criarUsuario(req, res) {
  //Campos gerais para ambos os tipos de usuário
  //Desestrutura os campos que serao req.body
  const {
    //Campos para ("CLIENTE" e "PRESTADOR")
    nome,
    email,
    senha,
    telefone,
    tipo,
    cep,
    cidade,
    estado,
    //Campos adicionais para profissionais("PRESTADOR")
    titulo_profissional,
    biografia,
    anos_experiencia,
    links_redes_sociais,
  } = req.body;

  //Arquivo da foto de perfil enviado que sera um req.file
  const fotoPerfilFile = req.file;

  try {
    //criptografar a senha antes de salvar
    const senhaHash = await bcrypt.hash(senha, 10);

    //variavel para armazenar a url da foto de perfil
    let fotoPerfilUrl = null;

    //logica para carregar a foto de perfil no cloudinary se o arquivo existir

    if (fotoPerfilFile) {
      try {
        //chama a funcao de carregar no cloudinary passando o caminho do arquivo e a pasta de destino
        fotoPerfilUrl = await carregarNoCloudinary(
          fotoPerfilFile.path,
          "fotos_perfil_usuarios"
        );
      } catch (erro) {
        // Se ocorrer um erro ao carregar a foto, retorna um erro 500
        console.error("Erro ao carregar foto de perfil:", erro);
        return res
          .status(500)
          .json({ error: "Erro ao carregar foto de perfil" });
      }
    }
    //montar o objeto de dados do usuario para salvar no banco
    const dadosUsuario = {
      nome,
      email,
      senha: senhaHash,
      telefone,
      tipo,
      cep,
      cidade,
      estado,
      foto_perfil_url: fotoPerfilUrl,
    };
    //se o tipo for "PRESTADOR" adiciona os campos especificos
    if (tipo === "PRESTADOR") {
      if (titulo_profissional !== undefined)
        dadosUsuario.titulo_profissional = titulo_profissional;
      if (biografia !== undefined) dadosUsuario.biografia = biografia;
      if (anos_experiencia !== undefined) {
        // Converte a string recebida do form-data para um número inteiro.
        dadosUsuario.anos_experiencia = parseInt(anos_experiencia, 10);
      }
      if (links_redes_sociais !== undefined)
        dadosUsuario.links_redes_sociais = links_redes_sociais;
    }

    //Cria o usuario no banco de dados
    const usuario = await prisma.usuario.create({ data: dadosUsuario });

    //remover a senha do objeto retornado
    const { senha: _, ...usuarioSemSenha } = usuario;
    return res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    // Caso contrário, retorna um erro genérico
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
