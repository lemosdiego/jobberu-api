import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import carregarNoCloudinary from "../../../lib/cloudinary.js";

export async function criarUsuario(req, res) {
  // Desestrutura campos do req.body
  const {
    nome,
    email,
    senha,
    telefone,
    tipo,
    cep,
    cidade,
    estado,
    titulo_profissional,
    biografia,
    anos_experiencia,
    links_redes_sociais,
  } = req.body;

  const fotoPerfilFile = req.file;

  try {
    // Criptografar a senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // URL da foto (se enviada)
    let fotoPerfilUrl = null;
    if (fotoPerfilFile) {
      try {
        fotoPerfilUrl = await carregarNoCloudinary(
          fotoPerfilFile.path,
          "fotos_perfil_usuarios"
        );
      } catch (erro) {
        console.error("Erro ao carregar foto de perfil:", erro);
        return res
          .status(500)
          .json({ error: "Erro ao carregar foto de perfil" });
      }
    }

    // Montar objeto de cadastro
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

    // Campos específicos de prestador
    if (tipo === "PRESTADOR") {
      if (titulo_profissional !== undefined)
        dadosUsuario.titulo_profissional = titulo_profissional;
      if (biografia !== undefined) dadosUsuario.biografia = biografia;
      if (anos_experiencia !== undefined)
        dadosUsuario.anos_experiencia = parseInt(anos_experiencia, 10);

      // Tratamento do array de links
      if (links_redes_sociais !== undefined) {
        // Se vier como string do form-data (ex: JSON.stringify do frontend)
        if (typeof links_redes_sociais === "string") {
          try {
            dadosUsuario.links_redes_sociais = JSON.parse(links_redes_sociais);
          } catch {
            dadosUsuario.links_redes_sociais = [];
          }
        } else {
          dadosUsuario.links_redes_sociais = links_redes_sociais;
        }
      }
    }

    // Cria usuário no Prisma
    const usuario = await prisma.usuario.create({ data: dadosUsuario });

    // Remove a senha do objeto retornado
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
    // Remover a senha do objeto retornado
    const { senha: _, ...usuarioSemSenha } = usuario;
    return res.status(200).json({ token, usuario: usuarioSemSenha });
  } catch (error) {
    console.error("Erro de autenticação:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}

export async function listarUsuarios(req, res) {
  try {
    const usuario = await prisma.usuario.findMany({
      include: { servicos_oferecidos: true },
    });
    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}

export async function listaUsuarioId(request, response) {
  const { id } = request.params;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id, 10) },
      include: { servicos_oferecidos: true },
    });
    // Retorna apenas profissionais
    if (!usuario || usuario.tipo !== "PRESTADOR") {
      return response
        .status(404)
        .json({ error: "Profissional não encontrado" });
    }
    // Remova o campo senha
    const { senha, ...publico } = usuario;
    return response.status(200).json(publico);
  } catch (error) {
    return response.status(500).json({ error: "Erro ao buscar profissional" });
  }
}
