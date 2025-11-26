# API JobberU

Backend da plataforma JobberU, uma aplicação para conectar clientes a prestadores de serviços profissionais. Esta API é responsável pelo gerenciamento de usuários (clientes e prestadores), serviços, avaliações e autenticação.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript no servidor.
- **Express.js**: Framework para construção da API.
- **Prisma**: ORM para interação com o banco de dados.
- **PostgreSQL**: Banco de dados relacional.
- **JSON Web Tokens (JWT)**: Para autenticação e autorização de rotas.
- **Multer**: Middleware para upload de arquivos (multipart/form-data).
- **Cloudinary**: Serviço para armazenamento de imagens na nuvem.
- **Bcrypt.js**: Para criptografia de senhas.

---

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 18.x ou superior)
- [Yarn](https://yarnpkg.com/) ou [NPM](https://www.npmjs.com/) (gerenciador de pacotes)
- [Docker](https://www.docker.com/) (para rodar o banco de dados PostgreSQL facilmente)

---

## 🚀 Como Rodar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone <url-do-seu-repositorio>
    cd api-jobberu
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure o banco de dados com Docker:**
    (Se você já tem um PostgreSQL rodando, pule este passo)

    ```bash
    docker run --name jobberu-db -e POSTGRES_PASSWORD=docker -e POSTGRES_USER=docker -e POSTGRES_DB=jobberu -p 5432:5432 -d postgres
    ```

4.  **Configure as variáveis de ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto, copiando o conteúdo de `.env.example` (se existir) ou usando o modelo abaixo.

    ```env
    # Configuração do Banco de Dados
    DATABASE_URL="postgresql://docker:docker@localhost:5432/jobberu?schema=public"

    # Segredo para assinatura do JWT
    JWT_SECRET="SEU_SEGREDO_SUPER_SECRETO_AQUI"

    # Credenciais do Cloudinary
    CLOUDINARY_CLOUD_NAME="seu_cloud_name"
    CLOUDINARY_API_KEY="sua_api_key"
    CLOUDINARY_API_SECRET="seu_api_secret"
    ```

5.  **Rode as migrações do Prisma:**
    Este comando irá criar as tabelas no seu banco de dados com base no `schema.prisma`.

    ```bash
    npx prisma migrate dev
    ```

6.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```

O servidor estará rodando em `http://localhost:3000`.

---

## 📖 Documentação dos Endpoints

O prefixo para todas as rotas de usuário é `/usuario` e para serviços é `/servico`.

### Módulo de Usuário (`/usuario`)

#### `POST /usuario/create`

- **Descrição:** Cria um novo usuário (Cliente ou Prestador).
- **Autenticação:** Pública.
- **Tipo de Corpo:** `multipart/form-data` (devido ao upload de imagem).
- **Campos do Corpo:**
  - `nome` (String, Obrigatório)
  - `email` (String, Obrigatório, Único)
  - `senha` (String, Obrigatório)
  - `telefone` (String, Obrigatório)
  - `tipo` (Enum: `CLIENTE` ou `PRESTADOR`, Obrigatório)
  - `foto_perfil` (File, Opcional) - Imagem de perfil.
  - `cep`, `cidade`, `estado` (String, Opcional)
  - `titulo_profissional`, `biografia`, `anos_experiencia`, `links_redes_sociais` (Campos específicos para `PRESTADOR`)

#### `POST /usuario/login`

- **Descrição:** Autentica um usuário e retorna um token JWT.
- **Autenticação:** Pública.
- **Tipo de Corpo:** `application/json`.
- **Campos do Corpo:**
  - `email` (String, Obrigatório)
  - `senha` (String, Obrigatório)
- **Resposta de Sucesso (200):**
  ```json
  {
    "token": "seu.jwt.token",
    "usuario": { ...dados do usuário sem a senha }
  }
  ```

#### `GET /usuario`

- **Descrição:** Lista todos os usuários cadastrados.
- **Autenticação:** Pública.

#### `GET /usuario/:id`

- **Descrição:** Busca um usuário específico do tipo `PRESTADOR` pelo seu ID.
- **Autenticação:** Pública.

#### `GET /usuario/:id/servicos`

- **Descrição:** Lista todos os serviços oferecidos por um prestador específico.
- **Autenticação:** Pública.

---

### Módulo de Serviço (`/servico`)

#### `POST /servico/create`

- **Descrição:** Cria um novo serviço. Apenas usuários autenticados do tipo `PRESTADOR` podem usar esta rota.
- **Autenticação:** Protegida (requer token JWT no cabeçalho `Authorization: Bearer <token>`).
- **Tipo de Corpo:** `multipart/form-data`.
- **Campos do Corpo:**
  - `titulo` (String, Obrigatório)
  - `descricao` (String, Obrigatório)
  - `categoria` (String, Obrigatório)
  - `preco` (Number, Opcional)
  - `imagens_servico` (File[], Opcional) - Array de até 5 imagens para o portfólio do serviço.

#### `GET /servico`

- **Descrição:** Lista todos os serviços cadastrados na plataforma.
- **Autenticação:** Pública.

#### `GET /servico/:id`

- **Descrição:** Busca um serviço específico pelo seu ID, incluindo informações públicas do prestador.
- **Autenticação:** Pública.

---

## Estrutura do Projeto

```
api-jobberu/
├── prisma/
│   └── schema.prisma      # Definição do banco de dados
├── src/
│   ├── lib/               # Módulos de suporte (Prisma, Cloudinary, Multer)
│   ├── middlewares/       # Middlewares customizados (ex: autenticacao.js)
│   └── modules/           # Módulos principais da aplicação
│       ├── usuario/
│       │   ├── controller/
│       │   └── routes/
│       └── servico/
│           ├── controller/
│           └── routes/
├── .env                   # Variáveis de ambiente (local)
├── .gitignore             # Arquivos ignorados pelo Git
└── package.json
```
