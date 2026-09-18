# 🚀 Guia Passo a Passo: Deploy do Sistema da Clínica no Render.com

Este guia foi preparado para você colocar sua aplicação no ar no **Render** de forma rápida, segura e profissional.

---

## 🎯 Método 1: Deploy com 1 Clique (Via Render Blueprint) — *Mais Fácil*

1. Envie suas alterações para o GitHub:
   ```bash
   git add .
   git commit -m "prepara deploy no Render"
   git push origin main
   ```
2. Acesse o **[Render Dashboard](https://dashboard.render.com)**.
3. Clique no botão **"New +"** no topo direito e escolha **"Blueprint"**.
4. Conecte o repositório do seu projeto.
5. O Render detectará automaticamente o arquivo `render.yaml` e configurará o serviço, os comandos de build/start, o banco SQLite persistente e a chave secreta JWT.
6. Clique em **"Apply"** e aguarde o deploy! 🚀

---

## 🛠️ Método 2: Deploy Manual (Passo a Passo no Painel)

Caso prefira criar o **Web Service** manualmente no painel do Render:

### 1. Criar o Web Service
1. No dashboard do Render, clique em **"New +"** -> **"Web Service"**.
2. Selecione a opção **"Build and deploy from a Git repository"** e escolha o repositório da clínica.

### 2. Configurações Principais
Preencha os campos exatamente assim:

| Campo | Valor |
| :--- | :--- |
| **Name** | `clinica-backend` (ou o nome que desejar) |
| **Region** | Oregon (US West) ou a de sua preferência |
| **Branch** | `main` |
| **Root Directory** | *(deixe em branco)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start` |

### 3. Variáveis de Ambiente (Environment Variables)
Role até a seção **Environment Variables** e adicione as seguintes chaves:

- `NODE_ENV` ➔ `production`
- `JWT_SECRET` ➔ `gere_uma_chave_segura_ou_cole_uma_string_longa`
- `CORS_ORIGIN` ➔ `*`
- `SESSION_TIMEOUT` ➔ `3600`

### 4. Disco Persistente para o Banco SQLite (Opcional, mas Recomendado)
Para garantir que os cadastros de pacientes, produtos e agendamentos continuem salvos mesmo se o servidor for reiniciado:

1. Na página do seu Web Service, vá na aba **Disks** no menu lateral esquerdo.
2. Clique em **"Add Disk"**.
3. Defina:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: `1 GB` (Suficiente para milhares de registros)
4. Em **Environment Variables**, adicione ou atualize:
   - `DATABASE_URL` ➔ `/opt/render/project/src/data/database.sqlite`

---

## ✅ 5. Testando seu Deploy

Assim que o deploy for concluído, o Render fornecerá uma URL pública HTTPS (ex: `https://clinica-backend-xyz.onrender.com`).

Para testar se está tudo funcionando perfeitamente, acesse no navegador:

👉 **`https://sua-url.onrender.com/api/health`**

Se retornar `{"success": true, "data": {"status": "ok"}}`, seu sistema está **100% no ar e operacional!** 🚀
