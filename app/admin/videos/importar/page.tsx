'use client'

import React, { useState } from 'react'
import { Download, CheckCircle2, AlertCircle, RefreshCw, Flame } from 'lucide-react'

const PREVIEW_VIDEOS = [
  { restaurante: 'Borger Hamburgueria', influencer: 'Navegando SP', prato: 'Smash Burger com Cheddar', bairro: 'Pinheiros' },
  { restaurante: 'Shin-Zushi', influencer: 'Guia por SP', prato: 'Omakase Tradicional', bairro: 'Paraíso' },
  { restaurante: 'Vicolo Nostro', influencer: 'São Paulo Dicas', prato: 'Risoto de Funghi Trufado', bairro: 'Brooklin' },
  { restaurante: 'HM Food Cafe', influencer: 'Navegando SP', prato: 'Ovos Mexidos com Bacon e Panquecas', bairro: 'Pinheiros' },
  { restaurante: 'Taqueria La Sabrosa', influencer: 'Guia por SP', prato: 'Tacos al Pastor', bairro: 'Augusta' },
  { restaurante: 'Rufinos', influencer: 'São Paulo Dicas', prato: 'Grelhada de Frutos do Mar', bairro: 'Itaim Bibi' },
  { restaurante: 'A Casa do Porco', influencer: 'Navegando SP', prato: 'Porco San Zé', bairro: 'Centro' },
  { restaurante: 'Tan Tan', influencer: 'Guia por SP', prato: 'Shoyu Ramen Tradicional', bairro: 'Pinheiros' },
  { restaurante: 'Z Deli Sandwiches', influencer: 'Navegando SP', prato: 'Sanduíche de Pastrami', bairro: 'Pinheiros' },
  { restaurante: 'Mocotó', influencer: 'São Paulo Dicas', prato: 'Dadinhos de Tapioca', bairro: 'Vila Medeiros' },
  { restaurante: 'Maní', influencer: 'São Paulo Dicas', prato: 'Peixe com Tucupi e Coco', bairro: 'Jardins' },
  { restaurante: 'Evvai', influencer: 'Guia por SP', prato: 'Gnocchi Soufflé com Trufa', bairro: 'Pinheiros' },
  { restaurante: 'Fasano', influencer: 'Guia por SP', prato: 'Filet Mignon à Parmegiana', bairro: 'Jardins' },
  { restaurante: 'Bacio di Latte', influencer: 'Navegando SP', prato: 'Gelato de Pistache', bairro: 'Jardins' },
  { restaurante: 'D.O.M.', influencer: 'São Paulo Dicas', prato: 'Pirarucu Grelhado com Tucupi', bairro: 'Jardins' },
]

export default function ImportarVideos() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/videos/import', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Erro inesperado durante a importação.',
        })
      }
    } catch (err: any) {
      console.error(err)
      setResult({
        success: false,
        message: 'Falha na conexão com a API de importação.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Importar Vídeos</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Carregue a curadoria inicial de 15 restaurantes gastronômicos premium de São Paulo.
        </p>
      </div>

      {/* Action Banner */}
      <div className="bg-zinc-900/30 p-8 rounded-2xl border border-zinc-900 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-gold" />
            Curadoria Inicial GuiaSP
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl">
            Este assistente irá preencher automaticamente os dados de 3 influencers embaixadores,
            15 restaurantes famosos em São Paulo, 15 planos de assinatura ativos e 15 vídeos
            transcritos com tags prontas no banco de dados.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className="flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-brand-gold hover:bg-brand-goldHover text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-gold/10 shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Importando dados...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Importar 15 Vídeos</span>
            </>
          )}
        </button>
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className={`p-5 rounded-2xl border flex items-start space-x-3 shadow-lg ${
            result.success
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              : 'bg-red-950/20 border-red-900/40 text-red-300'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          )}
          <div className="space-y-1">
            <h4 className="font-bold text-sm">{result.success ? 'Importação Concluída' : 'Erro na Importação'}</h4>
            <p className="text-xs text-zinc-350">{result.message}</p>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-zinc-900/80 bg-zinc-950/40">
          <h3 className="font-serif font-bold text-base text-white">Conteúdo Disponível para Importação ({PREVIEW_VIDEOS.length} itens)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 font-semibold uppercase tracking-wider">
                <th className="px-6 py-3.5">Restaurante</th>
                <th className="px-6 py-3.5">Bairro</th>
                <th className="px-6 py-3.5">Influencer</th>
                <th className="px-6 py-3.5">Prato Indicado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/45 text-zinc-300">
              {PREVIEW_VIDEOS.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-950/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{item.restaurante}</td>
                  <td className="px-6 py-4 font-medium text-zinc-400 capitalize">{item.bairro}</td>
                  <td className="px-6 py-4 text-brand-gold/90 font-serif">@{item.influencer}</td>
                  <td className="px-6 py-4 italic text-zinc-400">{item.prato}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
