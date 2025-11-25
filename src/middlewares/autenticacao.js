import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export default async function autenticacao(request, response, next) {
  // 1. Pega o cabeçalho de autorização da requisição.
  const cabecalhoAutenticacao = request.headers.authorization;

  // 2. Verifica se o cabeçalho foi fornecido.
  if (!cabecalhoAutenticacao) {
    return response
      .status(401)
      .json({ mensagem: "Token de autenticação não fornecido." });
  }

  // 3. O cabeçalho vem no formato "Bearer SEU_TOKEN".
  //    O split(' ') separa a string em um array ['Bearer', 'SEU_TOKEN']
  //    e pegamos apenas o segundo elemento (o token).
  const [, token] = cabecalhoAutenticacao.split(" ");

  try {
    // 4. Verifica se o token é válido usando o segredo.
    //    Se for inválido (expirado, assinatura errada), ele vai pular para o 'catch'.
    const dadosDecodificados = jwt.verify(token, process.env.JWT_SECRET);

    // 5. O 'dadosDecodificados' contém o payload do token, que é { userId: ... }.
    //    Usamos o userId para buscar o usuário completo no banco.
    const usuario = await prisma.usuario.findUnique({
      where: { id: dadosDecodificados.userId },
    });

    // 6. Se o usuário não for encontrado no banco (pode ter sido deletado), retorna erro.
    if (!usuario) {
      return response.status(401).json({ mensagem: "Usuário não encontrado." });
    }

    // 7. Anexa o objeto do usuário (sem a senha) à requisição para ser usado nos controllers.
    const { senha: _, ...usuarioSemSenha } = usuario;
    request.usuario = usuarioSemSenha;

    // 8. Libera a passagem para o próximo middleware ou para o controller.
    return next();
  } catch (erro) {
    // Se jwt.verify falhar, o token é inválido.
    return response
      .status(401)
      .json({ mensagem: "Token inválido ou expirado." });
  }
}
