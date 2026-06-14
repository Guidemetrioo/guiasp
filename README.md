# eat.hub — Busca de Restaurantes Curada por Influencers

O **eat.hub** é uma plataforma premium de busca de restaurantes que reúne a curadoria dos principais influencers de gastronomia. O diferencial técnico está na transcrição automática de indicações em vídeo (via OpenAI Whisper) e extração de dados estruturados (via Claude API), tornando o conteúdo falado dos vídeos em dados totalmente pesquisáveis por palavra-chave.

A identidade visual segue o conceito de *dark luxury food*, utilizando fundo preto, tipografia serifada elegante (Playfair Display) e acentos em âmbar (`#F59E0B`).

---

## 🛠️ Stack Técnica

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Banco de Dados & Auth:** Supabase (PostgreSQL, Auth Magic Link, Storage de Imagens)
- **Busca:** Supabase Full-text search em português
- **Processamento de Áudio/Vídeo:** OpenAI Whisper API
- **IA e Extração de Metadados:** Anthropic Claude API (Claude 3.5 Sonnet)

---

## 📋 Pré-requisitos

Antes de iniciar, você vai precisar de:

- **Node.js** (versão 18 ou superior)
- Uma conta no **Supabase** (com um projeto PostgreSQL configurado)
- Chaves de API do **OpenAI** e **Anthropic** (caso queira rodar a transcrição real em produção, caso contrário o sistema conta com um mock robusto para desenvolvimento local)

---

## ⚙️ Configuração Local

### 1. Clonar o projeto e instalar dependências

```bash
# Navegue até a pasta do projeto
cd eathub

# Instale os pacotes
npm install
```

### 2. Configurar variáveis de ambiente

Renomeie ou crie um arquivo `.env.local` na raiz do projeto com as chaves correspondentes:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key
OPENAI_API_KEY=sua_openai_api_key
ANTHROPIC_API_KEY=sua_anthropic_api_key
```

### 3. Executar o Schema do Banco no Supabase

Copie o conteúdo do arquivo [supabase-schema.sql](file:///c:/Users/guide/OneDrive/Desktop/Next.hub/eathub/supabase-schema.sql) e execute-o dentro do **SQL Editor** no painel do seu projeto no Supabase. Isso criará todas as tabelas, índices GIN de busca em português e a função de busca dinâmica.

*Nota: Garanta que você criou um bucket de storage público chamado `eathub` no painel do Supabase para que os uploads de fotos funcionem corretamente.*

### 4. Rodar o script de Seed

Popule o banco de dados com os dados de demonstração (influencers, restaurantes variados, vídeos de indicação e planos ativos) executando:

```bash
npx tsx scripts/seed.ts
```

### 5. Iniciar o servidor local

```bash
npm run dev
```

Abra [http://localhost:3001](http://localhost:3001) no seu navegador para ver o resultado.

---

## 🚀 Deploy na Vercel

Para subir a aplicação em produção na Vercel, certifique-se de configurar as mesmas variáveis de ambiente do `.env.local` no painel de configurações da Vercel.

```bash
# Usando a Vercel CLI
vercel --prod
```
