# 🚀 Guia Completo de Deploy — Sistema Web para Clínica

Este documento contém tudo o que você precisa para colocar o **Sistema de Clínica** em produção em qualquer provedor de hospedagem (Render, Railway, VPS/Docker, PM2, Fly.io).

---

## 🛠️ 1. Pré-requisitos & Variáveis de Ambiente

Antes de fazer o deploy, configure as variáveis de ambiente no painel da sua hospedagem ou no arquivo `.env`:

| Variável | Descrição | Exemplo em Produção |
| :--- | :--- | :--- |
| `NODE_ENV` | Define o modo de execução da aplicação | `production` |
| `PORT` | Porta em que o servidor escutará (definida automaticamente por PaaS) | `3000` ou dinamica |
| `JWT_SECRET` | Chave secreta longa e segura para tokens JWT | Use `openssl rand -base64 32` |
| `SESSION_TIMEOUT` | Duração da sessão em segundos (ex: 3600 = 1 hora, 86400 = 24 horas) | `3600` |
| `CORS_ORIGIN` | Domínio do seu frontend ou `*` para permitir qualquer origem | `https://suaclinica.com` |
| `DATABASE_URL` | Caminho do arquivo SQLite (opcional, padrão `database.sqlite`) | `/app/data/database.sqlite` |

---

## 🐳 2. Deploy com Docker Compose (VPS / Server Próprio) — *Recomendado*

Se você usa uma VPS (Ubuntu, Debian, DigitalOcean, Hetzner, AWS EC2):

1. **Clone o repositório na VPS:**
   ```bash
   git clone https://github.com/seu-usuario/clinica-backend.git
   cd clinica-backend
   ```

2. **Crie o arquivo `.env` de produção:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   *(Ajuste o `JWT_SECRET` e o `CORS_ORIGIN`)*

3. **Suba a aplicação em segundo plano:**
   ```bash
   docker compose up -d --build
   ```

4. **Verifique se o container está saudável:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

---

## ☁️ 3. Deploy no Railway (Gratuito / PaaS Simples)

1. Acesse **[railway.app](https://railway.app)** e crie um novo projeto.
2. Selecione **"Deploy from GitHub repo"** e conecte seu repositório.
3. Nas configurações do serviço em **Variables**, adicione:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `gerar_uma_chave_segura`
   - `CORS_ORIGIN`: `*`
4. Na aba **Settings**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. O Railway gerará uma URL pública HTTPS automaticamente!

---

## 🌐 4. Deploy no Render (Web Service)

1. Acesse **[render.com](https://render.com)** -> **New +** -> **Web Service**.
2. Conecte seu repositório GitHub.
3. Configure os campos:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Em **Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `sua_chave_segura`
5. *(Opcional)* Em **Disk**, adicione um disco persistente montado em `/app/data` para garantir a persistência dos dados SQLite em reinicializações do serviço.

---

## ⚡ 5. Deploy em VPS Linux Tradicional com PM2 & Nginx

Caso não utilize Docker na VPS:

1. **Instale o Node.js 20 e o PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Compile e inicie com PM2:**
   ```bash
   npm install
   npm run build
   pm2 start dist/src/main/server.js --name "clinica-app"
   pm2 save
   pm2 startup
   ```

3. **Configuração Nginx (Reverse Proxy com HTTPS):**
   ```nginx
   server {
       server_name suaclinica.com.br;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🧪 6. Teste de Sanidade em Produção

Após o deploy, verifique a saúde da aplicação executando:

```bash
curl https://sua-url-de-producao.com/api/health
```

Resposta esperada:
```json
{"success": true, "data": {"status": "ok"}}
```

Pronto! Seu sistema está configurado de forma profissional para rodar em produção com alta segurança e performance. 🚀
