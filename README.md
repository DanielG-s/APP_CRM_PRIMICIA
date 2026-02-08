# CRM & ERP Integrated System

Este é um sistema completo de CRM (Customer Relationship Management) integrado com ERP, desenvolvido com tecnologias modernas para garantir escalabilidade, performance e facilidade de manutenção.

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Gerenciamento de Estado:** React Hooks / Context API

### Backend
- **Framework:** [NestJS](https://nestjs.com/)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma
- **Documentação API:** Swagger

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v20+)
- Docker & Docker Compose (para ambiente de produção ou banco de dados local)

### 1. Ambiente de Desenvolvimento (Local)

#### Backend
```bash
cd backend
npm install
npx prisma generate
# Configure o .env com sua URL do banco de dados
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
# Configure o .env.local se necessário
npm run dev
```

### 2. Ambiente de Produção (Docker)

O projeto está configurado com Docker Compose para subir todo o ambiente (Frontend, Backend e Banco de Dados) com um único comando.

#### Estrutura Docker
- `frontend/Dockerfile`: Build otimizado em multi-stage (standalone).
- `backend/Dockerfile`: Build otimizado em multi-stage.
- `docker-compose.prod.yml`: Orquestração dos serviços.

#### Executando o Deploy
Na raiz do projeto:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

O sistema estará acessível em:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api/docs (se habilitado)

## 📁 Estrutura do Projeto

```
/
├── backend/                # API NestJS
│   ├── src/                # Código fonte
│   ├── prisma/             # Schema do banco de dados
│   └── Dockerfile          # Configuração Docker Backend
├── frontend/               # Aplicação Next.js
│   ├── app/                # App Router (Páginas)
│   ├── components/         # Componentes Reutilizáveis
│   └── Dockerfile          # Configuração Docker Frontend
├── docker-compose.prod.yml # Orquestração para Produção
└── README.md               # Documentação Geral
```

## 🧪 Testes e Qualidade

- **Linting:** Configurado com ESLint para garantir padrão de código.
- **Tipagem:** TypeScript estrito para evitar erros em tempo de execução.

---
Desenvolvido por Daniel Galdencio.
