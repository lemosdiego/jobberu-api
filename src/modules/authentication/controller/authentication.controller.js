import AuthenticateUserService from "../services/AuthenticateUserService.js";

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
