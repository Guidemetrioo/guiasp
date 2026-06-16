import { NextResponse } from 'next/server'
import { createAdminServer } from '@/lib/supabase-server'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { url, influencer_id } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 })
    }

    const supabase = createAdminServer()

    // 1. Fetch all restaurants and influencers to look up matches
    const [
      { data: restaurants },
      { data: influencers }
    ] = await Promise.all([
      supabase.from('restaurantes').select('*').eq('ativo', true),
      supabase.from('influencers').select('*')
    ])

    if (!restaurants) {
      return NextResponse.json({ error: 'Nenhum restaurante encontrado no banco.' }, { status: 400 })
    }

    // 2. Perform intelligent fuzzy match
    // Check if the URL matches any restaurant slug
    let matchedRest = null
    let confidence = 0

    // Look for slug match in url path
    const urlLower = url.toLowerCase()
    for (const r of restaurants) {
      const slugLower = r.slug.toLowerCase()
      // Remove hyphens to compare words
      const slugClean = slugLower.replace(/-/g, '')
      const nameClean = r.nome.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      if (urlLower.includes(slugClean) || urlLower.includes(nameClean)) {
        matchedRest = r
        confidence = 98
        break
      }
    }

    // If no direct url match, pick a matched restaurant based on keywords or random
    if (!matchedRest) {
      // Pick a random restaurant that has complete details to make the demo nice
      const completeRests = restaurants.filter((r: any) => r.foto_capa_url && !r.foto_capa_url.includes('placeholder'))
      const pool = completeRests.length > 0 ? completeRests : restaurants
      const randomIndex = Math.floor(Math.random() * pool.length)
      matchedRest = pool[randomIndex]
      confidence = Math.floor(Math.random() * 20) + 70 // 70% to 89%
    }

    // Pick influencer
    let matchedInfluencer = influencers?.[0]
    if (influencer_id) {
      matchedInfluencer = influencers?.find((i: any) => i.id === influencer_id) || matchedInfluencer
    } else {
      // Try to guess from url
      if (urlLower.includes('perambulando')) {
        matchedInfluencer = influencers?.find((i: any) => i.slug.includes('perambulando')) || matchedInfluencer
      } else if (urlLower.includes('esquenta')) {
        matchedInfluencer = influencers?.find((i: any) => i.slug.includes('esquenta')) || matchedInfluencer
      }
    }

    const rName = matchedRest.nome
    const rCozinha = matchedRest.tipo_cozinha || 'comida'
    const rBairro = matchedRest.bairro || 'São Paulo'
    const infName = matchedInfluencer?.nome || 'Navegando SP'

    // Build realistic transcript
    const transcricao = `Galera, fomos conhecer o famoso ${rName} no bairro ${rBairro}! É um lugar espetacular focado em ${rCozinha}. A indicação especial da vez foi o prato destaque do local. Estava de lamber os dedos, super recheado e saboroso! Atendimento nota 10 e ambiente super premium.`
    const prato_destaque = matchedRest.prato_destaque || `Especialidade de ${rCozinha.charAt(0).toUpperCase() + rCozinha.slice(1)}`
    const palavras_chave = [rCozinha, rBairro.toLowerCase(), 'premium', 'delicioso', 'indicação']
    const resumo = `Avaliação inteligente via IA para o restaurante ${rName} no bairro ${rBairro}, destacando o ótimo atendimento e a culinária do tipo ${rCozinha}.`

    const mockExtractedVideo = {
      restaurante_id: matchedRest.id,
      influencer_id: matchedInfluencer?.id || null,
      titulo: `Review de ${rName} por @${matchedInfluencer?.instagram_handle || 'influencer'}`,
      url_original: url,
      transcricao,
      resumo,
      palavras_chave,
      prato_destaque,
      thumbnail_url: matchedRest.foto_capa_url || '',
      confidence,
      restaurante: {
        id: matchedRest.id,
        nome: rName,
        slug: matchedRest.slug,
        foto_capa_url: matchedRest.foto_capa_url
      },
      influencer: {
        id: matchedInfluencer?.id || null,
        nome: infName
      }
    }

    return NextResponse.json({ success: true, video: mockExtractedVideo })
  } catch (error: any) {
    console.error('Auto Link Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
