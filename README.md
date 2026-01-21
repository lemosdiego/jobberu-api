# JobberU - Manifesto e Documentação da API

Este documento é a fonte da verdade para a API do JobberU. Ele detalha nossa missão, as regras de negócio que nos tornam únicos, as decisões de arquitetura que garantem nossa segurança e o guia técnico para desenvolvimento e consumo da API.

---

## 1. A História do JobberU: Simplicidade para a Vida Real

A JobberU nasceu de uma ideia simples: facilitar a vida das pessoas localmente.

Observamos que muitas plataformas que oferecem serviços parecidos se tornam cansativas. Elas exigem o preenchimento de vários e vários formulários, criam processos de orçamento complicados e, no fim, adicionam mais etapas do que soluções.

Nossa visão foi o oposto. Imagine uma plataforma onde você só precisa dizer o que quer e onde está. Por exemplo:

> "Preciso de **Jardinagem** em **Santo André**."

E pronto. A JobberU te conecta instantaneamente aos profissionais da sua região que podem te ajudar.

**Nosso primeiro objetivo de entrega (MVP) é exatamente esse:** conseguir entregar um produto que fosse simples para qualquer usuário, focando na conexão rápida e direta.

---

## 2. O Desafio da Simplicidade e a Nossa Solução Inteligente

Para alcançar essa simplicidade, tomamos uma decisão crucial: **toda e qualquer negociação seria feita de forma privativa, através do WhatsApp do prestador e do cliente.** Isso elimina a necessidade de um chat interno, sistemas de orçamento e outras complexidades. A plataforma conecta, e as pessoas conversam da forma que já estão acostumadas.

Mas essa decisão criou um problema fundamental:

> "Se a negociação e o acerto acontecem fora da plataforma, como vamos saber se o cliente realmente fechou o serviço com o prestador? Como podemos construir um sistema de avaliações confiável?"

A resposta para esse desafio é o coração da JobberU: o **Sistema de Confirmação de Serviço**, ou o nosso "Aperto de Mão Digital".

Funciona assim:

1.  **Iniciativa do Prestador:** Após terminar o trabalho, o prestador (que é o maior interessado em receber uma boa avaliação) entra na JobberU e diz: "Eu finalizei um serviço para o cliente Washington".
2.  **O "Aperto de Mão":** A plataforma envia uma notificação para o Washington perguntando: "O prestador João realmente concluiu o serviço para você?".
3.  **Confirmação do Cliente:** Washington responde "Sim, confirmo".
4.  **Liberação da Avaliação:** **Só depois dessa confirmação** é que a plataforma libera a caixa de avaliação para o Washington.

Com esse fluxo, garantimos que cada avaliação no JobberU venha de um serviço real e verificado, construindo a **economia da confiança** que é a nossa grande missão, sem abrir mão da simplicidade que nos propusemos a entregar.

---

## 3. O Caminho para o MVP: Foco no Essencial

Nosso primeiro lançamento (MVP) está focado em entregar os pilares descritos acima com perfeição. As tarefas restantes são:

1.  **Refatorar a Criação de Avaliação:** Implementar o "cadeado final" do nosso sistema, garantindo que a rota `POST /avaliacao/create` dependa exclusivamente de um `registroId` com status `CONCLUIDO`.
2.  **Implementar Validação de Entrada (Zod):** Adicionar uma camada de segurança na porta da nossa API, validando os dados que chegam em rotas críticas como `POST /usuario/create` para prevenir erros e ataques.
3.  **Implementar a Arquitetura de Moderação:** Adicionar os campos de "aprovação" em fotos e avaliações e ajustar as consultas da API para respeitar esses campos, garantindo que apenas conteúdo revisado seja público.

---

## 4. Tecnologias e Ferramentas

| Categoria          | Tecnologia          | Propósito                                                     |
| :----------------- | :------------------ | :------------------------------------------------------------ |
| **Core**           | Node.js, Express.js | Ambiente de execução e framework da API.                      |
| **Banco de Dados** | PostgreSQL, Prisma  | Banco de dados relacional robusto e um ORM moderno.           |
| **Segurança**      | JWT, Bcrypt.js      | Autenticação stateless e criptografia de senhas.              |
| **Mídia**          | Cloudinary, Multer  | Armazenamento de imagens na nuvem e gerenciamento de uploads. |
| **Geolocalização** | ViaCEP, Nominatim   | Enriquecimento de dados de endereço e geocodificação.         |

---

## 5. Guia de Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio> && cd api-jobberu
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o banco de dados com Docker:**
    ```bash
    docker run --name jobberu-db -e POSTGRES_PASSWORD=docker -e POSTGRES_USER=docker -e POSTGRES_DB=jobberu -p 5432:5432 -d postgres
    ```
4.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto (use `.env.example` como modelo).

5.  **Aplique as migrações do banco de dados:**
    ```bash
    npx prisma migrate dev
    ```
6.  **Inicie o servidor de desenvolvimento:**
    `bash
npm run dev
`
    O servidor estará disponível em `http://localhost:3000`.

---

## 6. Documentação dos Endpoints da API

Endpoints marcados com `🔒` requerem um Token de Autenticação (`Authorization: Bearer <token>`).

### Módulo de Usuário

| Método   | Rota                                  | Descrição                                        | Autenticação |
| :------- | :------------------------------------ | :----------------------------------------------- | :----------- |
| `POST`   | `/usuario/create`                     | Cria um novo usuário.                            | Pública      |
| `POST`   | `/usuario/login`                      | Autentica um usuário e retorna um token JWT.     | Pública      |
| `GET`    | `/usuario/:id`                        | Busca o perfil público de um usuário.            | Pública      |
| `GET`    | `/usuario/prestadores/cidade/:cidade` | Lista prestadores de uma cidade específica.      | Pública      |
| `PATCH`  | `/usuario/atualizar/:id`              | Permite que um usuário edite seu próprio perfil. | `🔒`         |
| `DELETE` | `/usuario/excluir/:id`                | Permite que um usuário delete sua própria conta. | `🔒`         |

### Módulo de Serviço

| Método   | Rota                     | Descrição                                           | Autenticação |
| :------- | :----------------------- | :-------------------------------------------------- | :----------- |
| `POST`   | `/servico/create`        | Cria um novo serviço (requer `is_prestador: true`). | `🔒`         |
| `GET`    | `/servico/:id`           | Busca um serviço específico.                        | Pública      |
| `PATCH`  | `/servico/atualizar/:id` | Edita um serviço próprio.                           | `🔒`         |
| `DELETE` | `/servico/excluir/:id`   | Deleta um serviço próprio.                          | `🔒`         |

### Módulo de Registro de Serviço (O Coração da Confiança)

| Método  | Rota                              | Descrição                                       | Autenticação |
| :------ | :-------------------------------- | :---------------------------------------------- | :----------- |
| `POST`  | `/registro-servico/solicitar`     | Prestador solicita a confirmação de um serviço. | `🔒`         |
| `PATCH` | `/registro-servico/:id/responder` | Cliente responde a uma solicitação.             | `🔒`         |

### Módulo de Avaliação (O Resultado da Confiança)

| Método   | Rota                | Descrição                                            | Autenticação |
| :------- | :------------------ | :--------------------------------------------------- | :----------- |
| `POST`   | `/avaliacao/create` | Cria uma avaliação vinculada a um `RegistroServico`. | `🔒`         |
| `PATCH`  | `/avaliacao/:id`    | Edita uma avaliação própria.                         | `🔒`         |
| `DELETE` | `/avaliacao/:id`    | Deleta uma avaliação própria.                        | `🔒`         |

---

## 7. Infraestrutura e Decisões de Deploy

Para garantir que a JobberU seja escalável, segura e financeiramente viável desde o primeiro dia, adotamos uma arquitetura **Serverless** e baseada em **Containers**.

### Escolha das Plataformas

1.  **Google Cloud Run (Aplicação):**
    - **Decisão:** Opttei pelo Cloud Run para rodar nossa API containerizada (Docker).
    - **Por que?** Ele abstrai a complexidade de servidores (infraestrutura gerenciada), escala automaticamente conforme a demanda (Scale-to-Zero) e oferece segurança robusta com HTTPS nativo. Isso permite focar 100% na regra de negócio.

2.  **Neon Tech (Banco de Dados):**
    - **Decisão:** PostgreSQL Serverless.
    - **Por que?** O Neon separa computação de armazenamento. Isso significa custos reduzidos em momentos de inatividade e escalabilidade instantânea em picos de acesso, alinhando-se perfeitamente com a arquitetura do Cloud Run.

3.  **Cloudinary (Gestão de Mídia):**
    - **Decisão:** CDN e Armazenamento de Imagens.
    - **Por que?** Em ambientes containerizados efêmeros, não devemos salvar arquivos no disco local. O Cloudinary resolve isso gerenciando uploads, otimização automática e entrega rápida de imagens.

### Operação e Manutenção

O projeto conta com um fluxo de deploy documentado e padronizado. Para detalhes técnicos, comandos de CLI e procedimentos de atualização de banco de dados, consulte o nosso **Manual de Operações (DEPLOY.md)**.

---

## 8. Conclusão

O desenvolvimento da API JobberU foi estruturado para simular um ambiente real de startup de alta performance.

Não se tratou apenas de escrever código, mas de orquestrar um ecossistema:

- Modelagem de dados complexa com Prisma.
- Segurança e Autenticação com JWT.
- Integração de serviços em nuvem.
- Containerização e Deploy em Produção.

> "Com isso, pude realmente ter uma ideia clara e colocar em prática conceitos avançados de engenharia de software, garantindo assim o fluxo completo de um desenvolvimento: da arquitetura à produção."

---

## 9. Visão de Futuro e Próximos Passos

O lançamento do MVP é apenas o primeiro passo na jornada da JobberU. O verdadeiro desafio é transformar uma ideia promissora em um serviço real que impacte positivamente a vida das pessoas, construindo um ecossistema de confiança e oportunidade.

Nossos próximos objetivos estão focados em evoluir a plataforma de forma sustentável, aprimorando o código para se tornar cada vez mais funcional e profissional, e aprendendo na prática com a implementação de novas funcionalidades.

### Roadmap de Desenvolvimento

1.  **Próxima Atualização (Foco em Engajamento):**
    - **Módulo de Favoritos:** Permitir que clientes salvem seus prestadores preferidos para facilitar a recontratação e fortalecer o relacionamento na plataforma.
    - **Avaliação Invertida:** Implementar a funcionalidade para que prestadores também possam avaliar os clientes após um serviço concluído, criando um sistema de reputação 360º e incentivando o bom comportamento de ambas as partes.

2.  **Evolução da Plataforma (Foco em Gestão e Escalabilidade):**
    - **Módulo de Administração:** Desenvolver um painel de controle dedicado para administradores. Este módulo será crucial para a moderação de conteúdo (aprovação de perfis, fotos e avaliações), gerenciamento de usuários e visualização de métricas da plataforma.

3.  **Visão de Longo Prazo (Foco em Monetização e Ecossistema):**
    - **Integração de Pagamentos:** Implementar um sistema de pagamentos seguro dentro da plataforma, oferecendo mais conveniência e segurança para transações.
    - **Carteira Digital (Wallet):** Criar uma carteira interna onde usuários (clientes e prestadores) possam gerenciar seus saldos, facilitando pagamentos e recebimentos de forma instantânea.

Este roadmap guiará nosso desenvolvimento, garantindo que cada nova funcionalidade agregue valor real ao nosso ecossistema e nos aproxime da nossa missão de simplificar a contratação de serviços locais.
