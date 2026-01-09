import prisma from "../../../lib/prisma.js";
import carregarNoCloudinary from "../../../lib/cloudinary.js";

export default async function EditServiceService(
  serviceId,
  prestadorId,
  dados,
  arquivos
) {
  const id = parseInt(serviceId, 10);

  // 1. VERIFICAÇÃO DE AUTORIZAÇÃO
  const servicoExistente = await prisma.servico.findUnique({
    where: { id },
  });

  if (!servicoExistente) {
    throw new Error("Serviço não encontrado.");
  }

  if (servicoExistente.prestadorId !== prestadorId) {
    throw new Error("Você não tem permissão para editar este serviço.");
  }

  // 2. PROCESSAMENTO E CONVERSÃO DOS DADOS
  const dadosParaAtualizar = {
    titulo: dados.titulo,
    descricao: dados.descricao,
    categoria: dados.categoria,
  };

  // Converte 'preco' de string para número, se ele existir.
  if (dados.preco !== undefined && dados.preco !== null && dados.preco !== "") {
    const precoNumerico = parseFloat(dados.preco);
    if (isNaN(precoNumerico)) {
      throw new Error("O preço fornecido é inválido.");
    }
    dadosParaAtualizar.preco = precoNumerico;
  }

  // 3. LÓGICA DE ATUALIZAÇÃO DE IMAGENS
  let imagensFinais = servicoExistente.imagens || [];

  // Remove imagens marcadas para exclusão
  if (dados.imagens_a_remover) {
    const urlsParaRemover = Array.isArray(dados.imagens_a_remover)
      ? dados.imagens_a_remover
      : [dados.imagens_a_remover];

    imagensFinais = imagensFinais.filter(
      (imgUrl) => !urlsParaRemover.includes(imgUrl)
    );
  }

  // Adiciona novas imagens
  if (arquivos && arquivos.length > 0) {
    const uploadPromises = arquivos.map((file) =>
      carregarNoCloudinary(file.path, "imagens_servicos")
    );
    const novasUrls = await Promise.all(uploadPromises);
    imagensFinais.push(...novasUrls);
  }

  dadosParaAtualizar.imagens = imagensFinais;

  // 4. ATUALIZAÇÃO NO BANCO
  const servicoAtualizado = await prisma.servico.update({
    where: { id },
    data: dadosParaAtualizar,
  });

  return servicoAtualizado;
}
