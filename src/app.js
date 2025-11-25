import express from "express";
import cors from "cors";
import usuarioRouter from "./modules/usuario/routes/usuario.routes.js";
import servicoRouter from "./modules/servico/routes/servico.routes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/usuario", usuarioRouter);
app.use("/servico", servicoRouter);

export default app;
