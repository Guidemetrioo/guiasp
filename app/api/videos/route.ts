import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createServer } from '@/lib/supabase-server'

// Keep in sync with scripts/download_reel.py sanitize_filename
function sanitizeFilename(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove emojis and non-alphanumeric except spaces/hyphens
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading/trailing hyphens
}

export async function GET() {
  const folderParts = ['public', 'videos']
  const videosDir = path.join(process.cwd(), ...folderParts)
  
  try {
    // Ensure directory exists
    await fs.mkdir(videosDir, { recursive: true })
    
    // Read files
    const files = await fs.readdir(videosDir)
    const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'))
    
    // Fetch videos from DB/mock
    const supabase = createServer()
    const { data: dbVideos } = await supabase
      .from('videos')
      .select(`
        id,
        titulo,
        prato_destaque,
        restaurante_id,
        influencer_id,
        restaurantes ( nome, foto_capa_url ),
        influencers ( nome )
      `)
    
    // Map local files to DB videos
    const videosList = mp4Files.map(filename => {
      const baseName = filename.substring(0, filename.lastIndexOf('.'))
      
      // Try to find matching video in DB based on sanitized title
      const dbVideo = dbVideos?.find((v: any) => {
        if (!v.titulo) return false
        return sanitizeFilename(v.titulo) === baseName
      })
      
      return {
        filename,
        title: dbVideo?.titulo || baseName,
        pratoDestaque: dbVideo?.prato_destaque || null,
        restauranteId: dbVideo?.restaurante_id || null,
        restauranteNome: dbVideo?.restaurantes?.nome || null,
        fotoCapaUrl: dbVideo?.restaurantes?.foto_capa_url || null,
        influencerNome: dbVideo?.influencers?.nome || null,
        dbVideoId: dbVideo?.id || null
      }
    })
    
    return NextResponse.json({ success: true, videos: videosList })
  } catch (error: any) {
    console.error('Error fetching local videos:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')
  
  if (!filename) {
    return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 })
  }
  
  // Guard against path traversal
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\') ||
    !filename.toLowerCase().endsWith('.mp4')
  ) {
    return NextResponse.json({ success: false, error: 'Invalid file name' }, { status: 400 })
  }
  
  const folderParts = ['public', 'videos']
  const filePath = path.join(process.cwd(), ...folderParts, filename)
  
  try {
    await fs.unlink(filePath)
    return NextResponse.json({ success: true, message: `File ${filename} deleted successfully` })
  } catch (error: any) {
    console.error(`Error deleting file ${filename}:`, error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
