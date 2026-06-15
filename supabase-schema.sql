-- Garfo Supabase SQL Schema

-- Enable uuid-ossp extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. influencers
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  foto_url TEXT,
  instagram_handle TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 2. restaurantes
CREATE TABLE IF NOT EXISTS restaurantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  horario_abertura TEXT,
  horario_fechamento TEXT,
  distancia_km NUMERIC,
  descricao TEXT,
  bairro TEXT,
  cidade TEXT DEFAULT 'São Paulo',
  tipo_cozinha TEXT,
  preco_medio TEXT, -- "$", "$$" ou "$$$"
  instagram_handle TEXT,
  foto_capa_url TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- 3. planos
CREATE TABLE IF NOT EXISTS planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ativo', -- "ativo", "pausado", "cancelado"
  valor_mensal NUMERIC,
  inicio_em TIMESTAMPTZ DEFAULT now(),
  renovacao_em TIMESTAMPTZ
);

-- 4. videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id UUID REFERENCES restaurantes(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
  titulo TEXT,
  url_original TEXT,
  transcricao TEXT,
  resumo TEXT,
  palavras_chave TEXT[],
  prato_destaque TEXT,
  thumbnail_url TEXT,
  publicado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Indexes for search performance and relationships
CREATE INDEX IF NOT EXISTS idx_restaurantes_busca ON restaurantes
  USING GIN (to_tsvector('portuguese', coalesce(nome,'') || ' ' || coalesce(descricao,'') || ' ' || coalesce(bairro,'') || ' ' || coalesce(tipo_cozinha,'')));

CREATE INDEX IF NOT EXISTS idx_videos_busca ON videos
  USING GIN (to_tsvector('portuguese', coalesce(transcricao,'') || ' ' || coalesce(prato_destaque,'')));

CREATE INDEX IF NOT EXISTS idx_videos_restaurante_influencer ON videos (restaurante_id, influencer_id);

-- buscar_restaurantes search function
CREATE OR REPLACE FUNCTION buscar_restaurantes(
  p_q TEXT DEFAULT '',
  p_tipo TEXT DEFAULT NULL,
  p_influencer_id UUID DEFAULT NULL,
  p_bairro TEXT DEFAULT NULL,
  p_preco TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  nome TEXT,
  slug TEXT,
  horario_abertura TEXT,
  horario_fechamento TEXT,
  distancia_km NUMERIC,
  descricao TEXT,
  bairro TEXT,
  tipo_cozinha TEXT,
  preco_medio TEXT,
  foto_capa_url TEXT,
  prato_destaque TEXT,
  palavras_chave TEXT[],
  thumbnail_url TEXT,
  influencer_nome TEXT,
  influencer_foto TEXT,
  influencer_slug TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, 
    r.nome, 
    r.slug, 
    r.horario_abertura,
    r.horario_fechamento,
    r.distancia_km,
    r.descricao,
    r.bairro, 
    r.tipo_cozinha, 
    r.preco_medio, 
    r.foto_capa_url,
    v.prato_destaque, 
    v.palavras_chave, 
    v.thumbnail_url,
    i.nome AS influencer_nome, 
    i.foto_url AS influencer_foto, 
    i.slug AS influencer_slug
  FROM restaurantes r
  LEFT JOIN videos v ON v.restaurante_id = r.id
  LEFT JOIN influencers i ON v.influencer_id = i.id
  WHERE r.ativo = true
    AND (
      p_q = '' OR
      to_tsvector('portuguese',
        coalesce(r.nome,'') || ' ' ||
        coalesce(r.descricao,'') || ' ' ||
        coalesce(v.transcricao,'') || ' ' ||
        coalesce(v.prato_destaque,'') || ' ' ||
        array_to_string(coalesce(v.palavras_chave, '{}'), ' ')
      ) @@ plainto_tsquery('portuguese', p_q)
    )
    AND (p_tipo IS NULL OR p_tipo = '' OR r.tipo_cozinha = p_tipo)
    AND (p_influencer_id IS NULL OR i.id = p_influencer_id)
    AND (p_bairro IS NULL OR p_bairro = '' OR r.bairro = p_bairro)
    AND (p_preco IS NULL OR p_preco = '' OR r.preco_medio = p_preco);
END;
$$;
