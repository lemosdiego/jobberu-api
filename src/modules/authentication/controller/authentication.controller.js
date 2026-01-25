import AuthenticateUserService from "../services/AuthenticateUserService.js";
import RequestPasswordResetService from "../services/RequestPasswordResetService.js";
import ResetPasswordService from "../services/ResetPasswordService.js";
import nodemailer from "nodemailer";

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

// Solicitar Recuperação de Senha
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório." });
    }

    const resultado = await RequestPasswordResetService(email);

    if (resultado) {
      // Usa a URL do front-end definida no .env ou um padrão
      const frontendUrl = process.env.FRONTEND_URL;

      const resetLink = `${frontendUrl}/recover-my-password?token=${resultado.token}`;

      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
      ) {
        throw new Error(
          "Credenciais de e-mail não configuradas. Verifique SMTP_HOST, SMTP_USER e SMTP_PASS no arquivo .env.",
        );
      }

      // 1. Configuração do Transporter (Quem envia)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // 2. Envio do E-mail
      await transporter.sendMail({
        from:
          process.env.SMTP_FROM ||
          '"Equipe JobberU" <nao-responda@jobberu.com>',
        to: resultado.email,
        subject: "Recuperação de Senha - JobberU",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #4CAF50;">Recuperação de Senha</h2>
            <p>Você solicitou a redefinição de sua senha no JobberU.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p>
              <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Redefinir Minha Senha</a>
            </p>
            <p style="font-size: 12px; color: #777; margin-top: 20px;">Se não foi você, ignore este e-mail. O link expira em 1 hora.</p>
          </div>
        `,
      });
    }

    return res
      .status(200)
      .json({ message: "Se o email existir, um link foi enviado." });
  } catch (error) {
    console.error("Erro ao solicitar recuperação:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
}

// Redefinir Senha
export async function resetPassword(req, res) {
  try {
    const { token, newPassword, novaSenha } = req.body;
    const senhaParaSalvar = novaSenha || newPassword;

    const resultado = await ResetPasswordService({
      token,
      novaSenha: senhaParaSalvar,
    });
    return res.status(200).json(resultado);
  } catch (error) {
    if (
      error.message === "Token inválido ou expirado." ||
      error.message === "Token e nova senha são obrigatórios."
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Erro ao redefinir senha:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
}
