# Documentação Detalhada: Arquitetura de Segurança Merxios CRM

Esta documentação fornece uma visão profunda de como o sistema protege os dados e como o fluxo de automação (CI/CD) gerencia segredos sem expô-los.

---

## 1. O Fluxo de Deploy (GitHub Actions)

Este é o coração da segurança do seu servidor. O objetivo é que **os segredos nunca fiquem salvos permanentemente na VPS**.

### Diagrama de Fluxo
```text
[ Desenvolvedor ] -- git push --> [ GitHub Repo ]
                                       |
                                [ GitHub Actions ]
                                (Pega os "Secrets")
                                       |
                                 --- SSH Auth ---
                                       |
                                 [ Hetzner VPS ]
                                       |
                      (Cria .env Temporário -> Docker Up -> Apaga .env)
```

### Passo a Passo Detalhado:
1. **Trigger:** Você ou seu sócio dão um `git push` para a branch `main`.
2. **Ambiente Isolado:** O GitHub cria uma máquina virtual temporária (Runner) apenas para o seu deploy.
3. **Injeção:** O Runner carrega as variáveis que você configurou em `Settings > Secrets`. Elas ficam apenas na memória RAM dessa máquina temporária.
4. **Conexão SSH:** O GitHub usa a sua `HETZNER_SSH_KEY` para abrir um túnel seguro com a VPS.
5. **Execução remota:** O comando dentro do script de deploy (`echo "KEY=${{ secrets.KEY }}" > .env`) cria o arquivo `.env` na VPS **apenas no segundo do deploy**.
6. **Docker Compose:** O Docker lê o arquivo, injeta os valores nos containers (onde eles ficam protegidos dentro do ambiente isolado do Docker) e sobe a aplicação.
7. **Finalização:** Como o Docker agora tem as chaves em sua própria rede interna, o arquivo `.env` físico pode ser removido, deixando o disco da VPS limpo.

---

## 2. Camadas de Proteção de Segredos

### Camada 1: Segredos de Repositório (Configuração Global)
Estes são os segredos que afetam todo o sistema.
- **Master Encryption Key:** A chave "mãe". Sem ela, nenhum dado de cliente pode ser lido.
- **Database URL:** A senha do banco de dados principal.
- **Clerk Secret:** A chave que valida os logins dos usuários.

### Camada 2: Segredos de Processo (Memória)
Quando o NestJS (Backend) sobe, ele lê a `MASTER_ENCRYPTION_KEY` e a guarda na memória RAM. Ela **nunca** é escrita em logs ou arquivos de erro. Se o servidor for desligado, a chave "some" da memória, sendo reinjetada apenas no próximo deploy/start controlado.

### Camada 3: Segredos de Clientes (Multi-tenancy)
Aqui está a inteligência para escalar para muitos clientes:
1. **Entrada:** Cliente cadastra sua API Key do WhatsApp.
2. **Criptografia AES-256-GCM:** O sistema gera um código único e ilegível.
3. **Armazenamento:** O banco de dados guarda apenas o código ilegível.
4. **Isolamento:** Cada linha possui um `tenantId`. O código garante que o segredo do Cliente A jamais seja usado para o Cliente B.

---

## 3. Guia de Configuração (O que você precisa fazer)

Para que o fluxo funcione, você deve adicionar estes segredos no seu GitHub (`Settings > Secrets and variables > Actions`):

| Segredo | Descrição |
| :--- | :--- |
| `HETZNER_HOST` | O IP da sua VPS Hetzner. |
| `HETZNER_USER` | O usuário de acesso (geralmente `root` ou um usuário sudo). |
| `HETZNER_SSH_KEY` | Sua chave privada SSH (o conteúdo do arquivo `.id_rsa`). |
| `DATABASE_URL` | A string de conexão do PostgreSQL de produção. |
| `MASTER_ENCRYPTION_KEY` | **IMPORTANTE:** Crie uma string longa e aleatória (ex: 32+ caracteres). |
| `CLERK_SECRET_KEY` | Sua chave secreta do Clerk Dashboard. |
| `JWT_SECRET` | Uma chave aleatória para assinar tokens internos. |

---

## 4. Segurança em Tempo de Execução (Runtime)

### Mascaramento de Dados (Masking)
Mesmo que você ou um funcionário tenha acesso ao painel administrativo, o sistema foi programado para **nunca mostrar o segredo real**.
- Se o Backend enviar os dados para o Frontend, ele substitui automaticamente o segredo por `********`.
- O token real só é descriptografado internamente no servidor NestJS segundos antes de fazer uma chamada para a API (ex: API do WhatsApp).

## 5. Resumo de Comandos Úteis
- **Verificar logs sem ver segredos:** `docker-compose logs -f backend` (os segredos são omitidos).
- **Testar criptografia localmente:** Garanta que tenha uma `MASTER_ENCRYPTION_KEY` no seu `.env` local.

---
*Documentação atualizada em 26/02/2026 por Antigravity Security Agent.*
