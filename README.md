# Sistema-Catálogo - Instituto de Embalagens

O **Sistema-Catálogo** é uma aplicação web desenvolvida para o Instituto de Embalagens, projetada para gerenciar e catalogar informações sobre embalagens, cenários de uso, equipes e outros dados relevantes. A aplicação conta com uma arquitetura moderna e distribuída, além de uma integração em tempo real com o Google Sheets para facilitar a visualização e manipulação dos dados.

## Arquitetura

A arquitetura do sistema é baseada em um modelo de três componentes principais, cada um hospedado em uma plataforma de nuvem especializada:

| Componente      | Plataforma                               | Descrição                                                                                                                                                              |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**    | [Vercel](https://vercel.com/)            | A interface do usuário, construída como uma aplicação web moderna e responsiva.                                                                                        |
| **Backend**     | [Railway](https://railway.app/)          | O servidor da aplicação, que contém toda a lógica de negócio, processamento de dados e comunicação com o banco de dados e serviços externos.                             |
| **Banco de Dados** | [Supabase](https://supabase.com/)        | A base de dados primária do sistema, utilizando PostgreSQL.                                                                                                            |

## Tecnologias

O projeto é um monorepositório gerenciado com `pnpm` e utiliza as seguintes tecnologias:

- **Linguagem:** TypeScript
- **Framework Frontend:** (Não especificado, mas provavelmente React, Vue ou Svelte)
- **Estilização:** Tailwind CSS
- **Gerenciador de Pacotes:** pnpm

## Estrutura do Projeto

O repositório está organizado da seguinte forma:

```
/
├── apps/
│   ├── api/      # Backend da aplicação (Railway)
│   └── web/      # Frontend da aplicação (Vercel)
├── packages/
│   └── shared-types/ # Tipos TypeScript compartilhados
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tailwind.config.mjs
```

## Integração com Google Sheets

O sistema possui uma integração com uma [planilha do Google Sheets](https://docs.google.com/spreadsheets/d/1DG8IELG4_PTNeHdb4wT8bGo9UhdMgQqg3R2b_p_As-8/edit?gid=0#gid=0) que espelha os dados do banco de dados. Essa integração é feita através de um webhook que conecta o backend a um App Script na planilha.

### Como funciona o Webhook

1.  **Criação/Atualização de Dados:** Quando um dado é criado ou atualizado na aplicação, o backend (hospedado no Railway) o salva no banco de dados do Supabase.
2.  **Notificação (Webhook):** O backend envia uma notificação para a URL do webhook do App Script.
3.  **Sincronização:** O App Script, ao receber a notificação, atualiza a planilha com os novos dados.

**Atenção:** Toda vez que o App Script é alterado, uma nova URL de webhook é gerada. É **essencial** atualizar a variável de ambiente `SHEETS_WEBHOOK_URL` no Railway para manter a sincronização funcionando.

## Instalação e Configuração

Para rodar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/Instituto-de-Embalagens/Sistema-Catalogo.git
    cd Sistema-Catalogo
    ```

2.  **Instale as dependências:**

    ```bash
    pnpm install
    ```

3.  **Configure as variáveis de ambiente:**

    Crie um arquivo `.env` na raiz do diretório `apps/api` e adicione as seguintes variáveis:

    ```
    DATABASE_URL="sua_url_do_supabase"
    SHEETS_WEBHOOK_URL="sua_url_do_webhook_do_google_sheets"
    ```

4.  **Rode a aplicação:**

    ```bash
    pnpm dev
    ```

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.
