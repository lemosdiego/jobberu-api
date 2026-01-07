import prisma from "../../../lib/prisma.js";

export default async function ListProvidersByCityService(cidade, categoria) {
  // Função auxiliar para normalizar strings (remove acentos e converte para minúsculas)
  const normalizarString = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const cidadeBuscadaNormalizada = normalizarString(cidade.replace(/-/g, " "));

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
      biografia: true,
      cidade: true,
      estado: true,
      nivel_prestador: true,
      avaliacoes_recebidas: {
        where: { aprovada: true },
        select: { nota: true },
      },
      servicos_oferecidos: {
        where: { aprovado: true },
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
      biografia: prestador.biografia,
      cidade: prestador.cidade,
      estado: prestador.estado,
      nivel_prestador: prestador.nivel_prestador,
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

  return cardsDePrestadores;
}
