import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import { promises as fs } from 'fs'

export async function POST(request: Request) {
  try {
    const { url, browser } = await request.json()
    
    if (!url) {
      return NextResponse.json({ success: false, error: 'A URL do Instagram Reel é obrigatória' }, { status: 400 })
    }
    
    // Ensure scripts/download_reel.py exists
    const scriptPath = path.join(process.cwd(), 'scripts', 'download_reel.py')
    try {
      await fs.access(scriptPath)
    } catch {
      return NextResponse.json({ success: false, error: 'Script de download scripts/download_reel.py não encontrado no servidor' }, { status: 500 })
    }
    
    // Set up arguments
    const args = ['scripts/download_reel.py', url]
    if (browser && browser !== 'none') {
      args.push('--browser', browser.toLowerCase())
    }
    
    return new Promise((resolve) => {
      // Spawn python process
      const pythonProcess = spawn('python', args, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1' // Force unbuffered stdout/stderr to get logs immediately
        }
      })
      
      let stdoutData = ''
      let stderrData = ''
      
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString()
        console.log(`[Reel Downloader STDOUT]: ${data}`)
      })
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString()
        console.error(`[Reel Downloader STDERR]: ${data}`)
      })
      
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err)
        resolve(NextResponse.json({ 
          success: false, 
          error: 'Falha ao iniciar o interpretador Python. Verifique se o Python está no PATH.',
          details: err.message
        }, { status: 500 }))
      })
      
      pythonProcess.on('close', (code) => {
        console.log(`Reel Downloader process exited with code ${code}`)
        
        if (code === 0) {
          // Parse out the filename
          // Looking for "Target Filename:  [filename]" or success message
          const fileMatch = stdoutData.match(/Target Filename:\s+([^\n\r]+)/)
          const filename = fileMatch ? fileMatch[1].trim() : null
          
          const dbMatch = stdoutData.match(/Database Caption:\s+([^\n\r]+)/)
          const dbCaption = dbMatch ? dbMatch[1].trim() : null
          
          resolve(NextResponse.json({
            success: true,
            message: 'Download concluído com sucesso!',
            filename,
            dbCaption,
            logs: stdoutData
          }))
        } else {
          // Check if there is a hints block
          let userFriendlyError = 'Erro ao processar o vídeo do Instagram.'
          if (stderrData.includes('login') || stdoutData.includes('login') || stderrData.includes('cookies') || stdoutData.includes('cookies')) {
            userFriendlyError = 'O Instagram barrou o acesso anônimo ao vídeo. Por favor, utilize a opção de cookies do navegador.'
          }
          
          resolve(NextResponse.json({
            success: false,
            error: userFriendlyError,
            details: stderrData || stdoutData
          }, { status: 500 }))
        }
      })
    })
    
  } catch (error: any) {
    console.error('Error in download handler:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
