import prisma from "../../../lib/prisma.js";
import bcrypt from "bcryptjs";
import carregarNoCloudinary from "../../../lib/cloudinary.js";
import CreateUserService from "../services/CreateUserService.js";
import AuthenticateUserService from "../services/AuthenticateUserService.js";
import ListUserService from "../services/ListUserService.js";
import ListUsersIdService from "../services/ListUsersIdService.js";

//Criar Usuario
export async function createUser(req, res) {
  try {
    const user = await CreateUserService(req.body, req.file);
    return res.status(201).json(user);
  } catch (error) {
    if (error.message === "CEP inválido") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
}
//Autenticar Usuario
export async function authenticateUser(req, res) {
  try {
    const resultado = await AuthenticateUserService(req.body);
    return res.status(200).json(resultado);
  } catch (error) {
    if (error.message === "Credenciais inválidas") {
      return res.status(401).json({ error: error.message });
    }
    if (error.message === "Sua conta está pendente de aprovação.") {
      return res.status(403).json({ error: error.message });
    }
    console.error("Erro de autenticação:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
}
//Listar Usuarios
export async function listUsers(req, res) {
  try {
    const usuarios = await ListUserService();
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários" });
  }
}
//Buscar Usuario
export async function listUsersId(req, res) {
  try {
    const { id } = req.params;
    const usuario = await ListUsersIdService(id);
    return res.status(200).json(usuario);
  } catch (error) {
    if (error.message === "Usuário não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}
//Listar Servicos do Prestador
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

    // --- INÍCIO DA CORREÇÃO ---
    // 2. Converte 'is_prestador' de string para booleano, se existir.
    if (novosDados.is_prestador !== undefined) {
      novosDados.is_prestador = novosDados.is_prestador === "true";
    }
    // --- FIM DA CORREÇÃO ---

    // 3. Se uma nova foto de perfil for enviada, faz o upload.
    if (fotoPerfilFile) {
      const fotoPerfilUrl = await carregarNoCloudinary(
        fotoPerfilFile.path,
        "fotos_perfil_usuarios"
      );
      novosDados.foto_perfil_url = fotoPerfilUrl;
    }

    // 4. Se uma nova senha for enviada, criptografa.
    if (novosDados.senha) {
      novosDados.senha = await bcrypt.hash(novosDados.senha, 10);
    }

    // 5. Atualiza o usuário no banco.
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioIdToken },
      data: novosDados,
    });

    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;
    return response.status(200).json(usuarioSemSenha);
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    // Adiciona mais detalhes ao log de erro para facilitar a depuração
    if (error.code === "P2025") {
      // Exemplo de código de erro do Prisma
      return response.status(404).json({ error: "Usuário não encontrado." });
    }
    return response.status(500).json({
      error: "Erro interno ao editar usuário",
      details: error.message,
    });
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
  const cidadeDaUrl = request.params.cidade;
  const { categoria } = request.query; // 1. Captura a categoria da query string

  // Função auxiliar para normalizar strings (remove acentos e converte para minúsculas)
  const normalizarString = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const cidadeBuscadaNormalizada = normalizarString(
    cidadeDaUrl.replace(/-/g, " ")
  );

  try {
    // 2. Constrói o filtro para serviços de forma dinâmica
    const filtroServicos = { aprovado: true };
    if (categoria) {
      filtroServicos.categoria = {
        equals: categoria,
        mode: "insensitive", // Torna a busca por categoria insensível a maiúsculas/minúsculas
      };
    }

    // 1. Busca TODOS os prestadores aprovados que possuem serviços aprovados
    const todosPrestadoresAprovados = await prisma.usuario.findMany({
      where: {
        is_prestador: true,
        aprovado: true, // MODERAÇÃO: Só busca usuários (prestadores) aprovados.
        servicos_oferecidos: {
          some: filtroServicos, // 3. Aplica o filtro de serviços (com ou sem categoria)
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
        nivel_prestador: true, // Incluímos o nível na busca do banco
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

    // 2. Filtra a lista na aplicação para garantir a correspondência exata da cidade
    const prestadoresDoBanco = todosPrestadoresAprovados.filter((prestador) => {
      if (!prestador.cidade) return false; // Garante que o prestador tem uma cidade cadastrada
      const cidadeDoPrestadorNormalizada = normalizarString(prestador.cidade);
      return cidadeDoPrestadorNormalizada === cidadeBuscadaNormalizada;
    });

    // 3. Mapeia os dados brutos para o formato que o Card do frontend precisa
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
        nivel_prestador: prestador.nivel_prestador, // Passamos o nível para o frontend
        total_avaliacoes: totalDeAvaliacoes,
        soma_das_notas: somaDasNotas,
        // Lógica refatorada: Monta o objeto do serviço se ele existir,
        // e a imagem só é adicionada se o array de imagens não estiver vazio.
        primeiro_servico: primeiroServico
          ? {
              // Retorna os dados do serviço
              preco: primeiroServico.preco,
              categoria: primeiroServico.categoria,
              // A imagem só é incluída se existir
              imagem_url: primeiroServico.imagens?.[0] || null,
            }
          : null, // Caso contrário, retorna null
      };
    });

    // 4. Retorna a lista de cards formatados
    return response.status(200).json({ prestadores: cardsDePrestadores });
  } catch (error) {
    console.error("Erro ao listar prestadores por cidade:", error);
    return response.status(500).json({ error: "Erro ao buscar prestadores" });
  }
}

// --- FUNÇÕES DE GAMIFICAÇÃO ---
//Regras de Nivel de Prestadores

//Iniciante: Estado Padrão de todos os usuarios.
//Bronze: Mais que 8 avaliações com nota média igual ou maior que 4.5
//prata Mais que 20 avaliações com nota média igual ou maior que 4.5
//Ouro: Mais que 50 avaliações com nota média igual ou maior que 4.5
//Platina: Mais que 70 avaliações com nota média igual ou maior que 4.5
//Diamante: Mais que 100 avaliações com nota média igual ou maior que 4.5

/**
 * Calcula e atualiza o nível (selo) do prestador com base nas avaliações recebidas.
 * Deve ser chamada sempre que uma nova avaliação for aprovada.
 */
export async function atualizarNivelPrestador(usuarioId) {
  try {
    const id =
      typeof usuarioId === "string" ? parseInt(usuarioId, 10) : usuarioId;

    // 1. Busca estatísticas das avaliações APROVADAS
    const estatisticas = await prisma.avaliacao.aggregate({
      where: {
        prestadorId: id,
        aprovada: true,
      },
      _avg: {
        nota: true,
      },
      _count: {
        nota: true,
      },
    });

    const totalAvaliacoes = estatisticas._count.nota || 0;
    const mediaNota = estatisticas._avg.nota || 0;

    // 2. Regras de Gamificação (Baseado nas suas definições)
    // Nota média deve ser sempre >= 4.5 para subir de nível
    let novoNivel = "Iniciante";

    if (totalAvaliacoes > 100 && mediaNota >= 4.5) {
      novoNivel = "Diamante";
    } else if (totalAvaliacoes > 70 && mediaNota >= 4.5) {
      novoNivel = "Platina";
    } else if (totalAvaliacoes > 50 && mediaNota >= 4.5) {
      novoNivel = "Ouro";
    } else if (totalAvaliacoes > 20 && mediaNota >= 4.5) {
      novoNivel = "Prata";
    } else if (totalAvaliacoes > 8 && mediaNota >= 4.5) {
      novoNivel = "Bronze";
    }

    // 3. Atualiza o usuário no banco
    await prisma.usuario.update({
      where: { id: id },
      data: { nivel_prestador: novoNivel },
    });

    return novoNivel;
  } catch (error) {
    console.error(`Erro ao atualizar nível do prestador ${usuarioId}:`, error);
  }
}
