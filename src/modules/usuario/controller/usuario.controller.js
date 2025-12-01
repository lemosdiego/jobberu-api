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

  // Converte o valor de 'is_prestador' de string para boolean
  const isPrestadorBoolean = is_prestador === "true";

  try {
    let dadosEndereco = {};
    let lat = null;
    let lon = null;

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

    // --- ENRIQUECIMENTO DE DADOS GEOGRÁFICOS ---
    if (cep) {
      // 1. Busca dados do endereço pelo CEP
      const respostaViaCep = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );
      dadosEndereco = await respostaViaCep.json();

      if (dadosEndereco.erro) {
        return res.status(400).json({ error: "CEP inválido" });
      }

      // 2. Busca coordenadas pelo endereço obtido
      const enderecoCompleto = `${dadosEndereco.logradouro}, ${dadosEndereco.localidade}, ${dadosEndereco.uf}`;
      const respostaNominatim = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          enderecoCompleto
        )}`,
        {
          headers: {
            // Adicionar um User-Agent é uma exigência da política de uso do Nominatim
            // para evitar bloqueios por excesso de requisições.
            "User-Agent": "JobberU App/1.0 (seu-contato@email.com)",
          },
        }
      );
      const dadosGeograficos = await respostaNominatim.json();

      // 3. Extrai latitude e longitude se encontradas
      if (dadosGeograficos && dadosGeograficos.length > 0) {
        // Usamos parseFloat para garantir que o valor seja um número
        lat = parseFloat(dadosGeograficos[0].lat);
        lon = parseFloat(dadosGeograficos[0].lon);
      }
    }

    // Montar objeto de cadastro
    const dadosUsuario = {
      nome,
      email,
      senha: senhaHash,
      telefone,
      is_prestador: isPrestadorBoolean,
      cep,
      cidade: dadosEndereco.localidade || cidade, // Usa o dado do ViaCEP, ou o original se falhar
      estado: dadosEndereco.uf || estado, // Usa o dado do ViaCEP, ou o original se falhar
      latitude: lat,
      longitude: lon,
      foto_perfil_url: fotoPerfilUrl,
    };

    // Campos específicos de prestador
    if (isPrestadorBoolean) {
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

    // MODERAÇÃO: Verifica se o usuário foi aprovado.
    if (!usuario.aprovado) {
      return res
        .status(403)
        .json({ error: "Sua conta está pendente de aprovação." });
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
    // Se nenhum usuário for encontrado com o ID, retorna 404.
    if (!usuario) {
      return response.status(404).json({ error: "Usuário não encontrado" });
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

export async function listarPrestadoresPorCidade(request, response) {
  // 1. Pega o nome da cidade da URL (ex: "Santo-Andre")
  const cidadeDaUrl = request.params.cidade;

  // 2. Formata o nome para corresponder ao formato do banco de dados (ex: "Santo Andre")
  //    Isso substitui todos os hifens por espaços.
  const cidadeFormatada = cidadeDaUrl.replace(/-/g, " ");

  try {
    // 1. Busca os prestadores e INCLUI seus serviços e avaliações
    const prestadoresDoBanco = await prisma.usuario.findMany({
      where: {
        cidade: {
          equals: cidadeFormatada,
          mode: "insensitive", // Ignora maiúsculas/minúsculas
        },
        is_prestador: true,
        aprovado: true, // MODERAÇÃO: Só busca usuários (prestadores) aprovados.
        // ADICIONADO: Garante que só virão prestadores que têm
        // pelo menos um serviço cadastrado.
        servicos_oferecidos: {
          some: {
            aprovado: true, // E que pelo menos um desses serviços esteja aprovado.
          },
        },
      },
      // Usar 'select' é mais explícito e otimizado do que 'include'
      select: {
        id: true,
        nome: true,
        foto_perfil_url: true,
        titulo_profissional: true,
        biografia: true, // 1. Adicionamos a biografia à seleção de dados
        cidade: true,
        estado: true,
        avaliacoes_recebidas: {
          where: { aprovada: true }, // MODERAÇÃO: Só considera avaliações aprovadas para o cálculo da nota.
          select: { nota: true },
        },
        servicos_oferecidos: {
          where: { aprovado: true }, // MODERAÇÃO: Só exibe serviços aprovados.
          take: 1,
          orderBy: { data_criacao: "desc" },
        },
      },
    });

    // 2. Mapeia os dados brutos para o formato que o Card do frontend precisa
    const cardsDePrestadores = prestadoresDoBanco.map((prestador) => {
      // Soma as notas e conta o total de avaliações
      const somaDasNotas = prestador.avaliacoes_recebidas.reduce(
        (acc, avaliacao) => acc + avaliacao.nota,
        0
      );
      const totalDeAvaliacoes = prestador.avaliacoes_recebidas.length;

      // Pega os dados do primeiro serviço (se existir)
      const primeiroServico = prestador.servicos_oferecidos[0];

      // Monta o objeto final para o card
      return {
        id: prestador.id,
        nome: prestador.nome,
        foto_perfil_url: prestador.foto_perfil_url,
        titulo_profissional: prestador.titulo_profissional,
        biografia: prestador.biografia, // 2. Incluímos a biografia no objeto de retorno
        cidade: prestador.cidade,
        estado: prestador.estado,
        total_avaliacoes: totalDeAvaliacoes,
        soma_das_notas: somaDasNotas,
        // Lógica mais segura: verifica se o serviço e o array de imagens existem e não estão vazios
        // Lógica corrigida
        primeiro_servico:
          primeiroServico && primeiroServico.imagens?.length > 0 // Verifica se o serviço existe e se o array de imagens não está vazio
            ? {
                // Se for verdade, monta o objeto
                imagem_url: primeiroServico.imagens[0], // Pega a primeira imagem do array
                preco: primeiroServico.preco,
                categoria: primeiroServico.categoria,
              }
            : null, // Caso contrário, retorna null
      };
    });

    // 3. Retorna a lista de cards formatados
    return response.status(200).json({ prestadores: cardsDePrestadores });
  } catch (error) {
    console.error("Erro ao listar prestadores por cidade:", error);
    return response.status(500).json({ error: "Erro ao buscar prestadores" });
  }
}
