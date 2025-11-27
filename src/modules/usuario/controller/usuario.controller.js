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
    is_prestador,
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
      fotoPerfilUrl = await carregarNoCloudinary(
        fotoPerfilFile.path,
        "fotos_perfil_usuarios"
      );
    }

    // Montar objeto de cadastro
    const dadosUsuario = {
      nome,
      email,
      senha: senhaHash,
      telefone,
      is_prestador,
      cep,
      cidade,
      estado,
      foto_perfil_url: fotoPerfilUrl,
    };

    // Campos específicos de prestador
    if (is_prestador === true) {
      if (titulo_profissional !== undefined)
        dadosUsuario.titulo_profissional = titulo_profissional;
      if (biografia !== undefined) dadosUsuario.biografia = biografia;
      if (anos_experiencia !== undefined)
        dadosUsuario.anos_experiencia = parseInt(anos_experiencia, 10);
      if (links_redes_sociais !== undefined) {
        dadosUsuario.links_redes_sociais = Array.isArray(links_redes_sociais)
          ? links_redes_sociais
          : [links_redes_sociais];
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
      include: {
        servicos_oferecidos: true,
        avaliacoes_recebidas: true, // Adicione esta linha
      },
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
      include: {
        servicos_oferecidos: true,
        avaliacoes_recebidas: true, // Garanta que esta linha esteja aqui
      },
    });
    // Retorna apenas profissionais
    if (!usuario || usuario.is_prestador === false) {
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

export async function listarServicosDoPrestador(request, response) {
  try {
    // 1. Pega o ID do prestador vindo dos parâmetros da URL.
    const { id } = request.params;

    // 2. Converte o ID para um número inteiro para usar na busca.
    const prestadorId = parseInt(id, 10);

    // 3. Busca na tabela de serviços todos que correspondem ao prestadorId.
    const servicos = await prisma.servico.findMany({
      where: {
        prestadorId: prestadorId,
      },
    });

    // 4. Retorna a lista de serviços encontrados (pode ser um array vazio).
    return response.status(200).json(servicos);
  } catch (error) {
    console.error("Erro ao listar serviços do prestador:", error);
    return response.status(500).json({ error: "Erro ao buscar os serviços." });
  }
}

export async function listarMinhasAvaliacoes(request, response) {
  try {
    const clienteId = request.usuario.id;

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

    return response.status(200).json(avaliacoesFeitas);
  } catch (error) {
    console.error("Erro ao listar minhas avaliações:", error);
    return response.status(500).json({ error: "Erro ao buscar avaliações." });
  }
}

export async function editarUsuario(request, response) {
  try {
    const usuarioIdParams = parseInt(request.params.id, 10);
    const usuarioIdToken = request.usuario.id;

    // 1. REGRA DE SEGURANÇA: O usuário só pode editar a si mesmo.
    if (usuarioIdParams !== usuarioIdToken) {
      return response.status(403).json({
        mensagem: "Acesso negado. Você só pode editar seu próprio perfil.",
      });
    }

    const novosDados = request.body;
    const fotoPerfilFile = request.file;

    // 2. Se uma nova foto de perfil for enviada, faz o upload.
    if (fotoPerfilFile) {
      const fotoPerfilUrl = await carregarNoCloudinary(
        fotoPerfilFile.path,
        "fotos_perfil_usuarios"
      );
      novosDados.foto_perfil_url = fotoPerfilUrl;
    }

    // 3. Se uma nova senha for enviada, criptografa.
    if (novosDados.senha) {
      novosDados.senha = await bcrypt.hash(novosDados.senha, 10);
    }

    // 4. Atualiza o usuário no banco.
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioIdToken },
      data: novosDados,
    });

    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;
    return response.status(200).json(usuarioSemSenha);
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    return response.status(500).json({ error: "Erro ao editar usuário" });
  }
}

export async function deletarUsuario(request, response) {
  try {
    const usuarioIdParams = parseInt(request.params.id, 10);
    const usuarioIdToken = request.usuario.id;

    // 1. REGRA DE SEGURANÇA: O usuário só pode deletar a si mesmo.
    if (usuarioIdParams !== usuarioIdToken) {
      return response.status(403).json({
        mensagem: "Acesso negado. Você só pode deletar seu próprio perfil.",
      });
    }

    // 2. Deleta o usuário. O Prisma cuidará de deletar os serviços em cascata.
    await prisma.usuario.delete({
      where: { id: usuarioIdToken },
    });

    return response.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return response.status(500).json({ error: "Erro ao deletar usuário" });
  }
}
