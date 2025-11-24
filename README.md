# Vibe Coding Study Organizer

Esta aplicação web foi criada como parte de uma disciplina de Metodologia do Ensino Superior e de um projeto de mestrado sobre **Vibe Coding**.

O objetivo é que estudantes descrevam, em linguagem natural, uma aplicação simples para organizar atividades de estudo. A aplicação então usa um modelo da OpenAI para gerar uma página HTML com base nessa descrição, permitindo investigar como o nível de conhecimento em computação afeta a qualidade do resultado.

## Funcionalidades

- Seleção de nível de familiaridade com Programação/Computação.
- Campo de texto para o estudante escrever **um único prompt** descrevendo a aplicação desejada.
- Geração de uma página HTML com base nessa descrição (via OpenAI API).
- Visualização da página gerada em um iframe no próprio site.
- Formulário de avaliação, onde o estudante indica se a página correspondeu ou não ao que imaginava, e pode deixar comentários.
- Persistência dos dados em um banco SQLite:
  - nível do estudante;
  - prompt enviado;
  - HTML gerado;
  - avaliação (match) e comentário.

## Arquitetura

- **Frontend**
  - HTML/CSS/JS simples em `public/`
  - `public/main.js` cuida:
    - da captura do nível e do prompt;
    - da chamada à API (`/api/submissions`);
    - da atualização do iframe com o HTML retornado;
    - do envio do feedback de avaliação.

- **Backend**
  - Node.js + Express em `src/`
  - `src/server.mjs`: configura o servidor HTTP, arquivos estáticos e rotas da API.
  - `src/services/openaiClient.mjs`: chama a OpenAI API e aplica o system prompt com as regras do experimento.
  - `src/db.mjs`: configura o SQLite (via `better-sqlite3`) e cria a tabela `submissions`.
  - `src/repositories/submissionRepository.mjs`: funções para salvar submissões e feedback.
  - `src/routes/submissions.mjs`: rotas:
    - `POST /api/submissions` – cria submissão e retorna o HTML.
    - `POST /api/submissions/:id/feedback` – registra a avaliação.

## Requisitos

- Node.js 18+ (recomendado)  
- NPM  
- Chave de API da OpenAI em uma variável de ambiente:

```bash
export OPENAI_API_KEY="SUA_CHAVE_AQUI"
```

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Configure a variável de ambiente:

```bash
export OPENAI_API_KEY="SUA_CHAVE_AQUI"
```

3. Inicie o servidor em modo desenvolvimento (por exemplo, com nodemon):

```bash
npm run dev
```

4. Acesse no navegador:

http://localhost:3000

## Observações
- Esta aplicação foi projetada para ser usada principalmente em dispositivos móveis, mas se adapta também ao desktop.
- Os dados de submissão e feedback são armazenados em um arquivo SQLite em data/vibe_coding.sqlite.
- O código foi pensado para fins educacionais e de pesquisa, não como um produto final.