import prisma from "../../../lib/prisma.js";

export async function solicitarConfirmacao(request, response) {
  try {
    // 1. VERIFICAÇÃO DE PERMISSÃO
    if (!request.usuario.is_prestador) {
      return response.status(403).json({
        mensagem: "Apenas prestadores podem solicitar confirmação de serviço.",
      });
    }
    //coleta os ids
    const prestadorId = request.usuario.id;
    const { clienteId } = request.body;

    //o cliente foi fornecido?
    if (!clienteId) {
      return response
        .status(400)
        .json({ mensagem: "O ID do cliente é ogrigatório " });
    }
    //o prestador nao pode soliciat a si proprio
    if (prestadorId === clienteId) {
      return response.status(400).json({
        mensagem: "Voce nao pode solicitar confirmacao para si mesmo",
      });
    }
    //verifica se o cliente existe
    const cliente = await prisma.usuario.findUnique({
      where: { id: clienteId },
    });
    if (!cliente) {
      return response.status(404).json({ mensagem: "Cliente nao encontrado" });
    }
    //verifica se o prestador existe
    const registroExistente = await prisma.registroServico.findFirst({
      where: { prestadorId, clienteId, status: "PENDENTE" },
    });
    if (registroExistente) {
      return response.status(409).json({
        mensagem: "Já existe uma solicitação pendente para este cliente",
      });
    }
    //Passando por tofas as etapas, cria o registro
    const novoRegistro = await prisma.registroServico.create({
      data: {
        prestadorId,
        clienteId,
        status: "PENDENTE",
      },
    });
    return response.status(201).json(novoRegistro);
  } catch (error) {
    console.error("Erro ao solicitar confirmação:", error);
    return response.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}
export async function responderSolicitacao(request, response) {
  try {
    // 1. COLETA DAS INFORMAÇÕES
    const registroId = parseInt(request.params.id, 10);
    const clienteIdLogado = request.usuario.id;
    const { resposta } = request.body; // 'CONCLUIDO' ou 'RECUSADO'

    // 2. REGRAS DE NEGÓCIO E SEGURANÇA

    // REGRA 2.1: A resposta é válida?
    if (!["CONCLUIDO", "RECUSADO"].includes(resposta)) {
      return response
        .status(400)
        .json({ mensagem: "A resposta deve ser 'CONCLUIDO' ou 'RECUSADO'." });
    }

    // REGRA 2.2: Busca o registro no banco
    const registro = await prisma.registroServico.findUnique({
      where: { id: registroId },
    });

    if (!registro) {
      return response
        .status(404)
        .json({ mensagem: "Solicitação de serviço não encontrada." });
    }

    // REGRA 2.3: O usuário logado é o cliente correto para esta solicitação?
    if (registro.clienteId !== clienteIdLogado) {
      return response
        .status(403)
        .json({
          mensagem: "Você não tem permissão para responder a esta solicitação.",
        });
    }

    // REGRA 2.4: A solicitação ainda está pendente?
    if (registro.status !== "PENDENTE") {
      return response
        .status(409)
        .json({
          mensagem: `Esta solicitação já foi respondida com o status: ${registro.status}.`,
        });
    }

    // 3. ATUALIZAÇÃO DO REGISTRO
    const registroAtualizado = await prisma.registroServico.update({
      where: { id: registroId },
      data: {
        status: resposta, // Atualiza o status com a resposta do cliente
      },
    });

    return response.status(200).json(registroAtualizado);
  } catch (error) {
    console.error("Erro ao responder solicitação:", error);
    return response.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}
