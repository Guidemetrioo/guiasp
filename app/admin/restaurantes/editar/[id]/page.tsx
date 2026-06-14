'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function EditarRestaurante() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [descricao, setDescricao] = useState('')
  const [bairro, setBairro] = useState('')
  const [tipoCozinha, setTipoCozinha] = useState('')
  const [precoMedio, setPrecoMedio] = useState('$$')
  const [instagram, setInstagram] = useState('')
  const [fotoCapaUrl, setFotoCapaUrl] = useState('')
  const [capa, setCapa] = useState<File | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (id) {
      fetchRestaurant()
    }
  }, [id])

  const fetchRestaurant = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setNome(data.nome)
        setSlug(data.slug)
        setDescricao(data.descricao || '')
        setBairro(data.bairro || '')
        setTipoCozinha(data.tipo_cozinha || '')
        setPrecoMedio(data.preco_medio || '$$')
        setInstagram(data.instagram_handle || '')
        setFotoCapaUrl(data.foto_capa_url || '')
      }
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao carregar dados do restaurante.' })
    } finally {
      setLoading(false)
    }
  }

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNome(val)
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      let updatedFotoCapaUrl = fotoCapaUrl

      if (capa) {
        const fileExt = capa.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `restaurantes/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('eathub')
          .upload(filePath, capa, {
            cacheControl: '3600',
            upsert: false
          })

        if (!uploadError) {
          const { data } = supabase.storage.from('eathub').getPublicUrl(filePath)
          updatedFotoCapaUrl = data.publicUrl
        } else {
          console.warn('Storage upload failed, keeping old cover. Reason:', uploadError.message)
        }
      }

      const { error } = await supabase
        .from('restaurantes')
        .update({
          nome,
          slug,
          descricao,
          bairro,
          tipo_cozinha: tipoCozinha.toLowerCase(),
          preco_medio: precoMedio,
          instagram_handle: instagram,
          foto_capa_url: updatedFotoCapaUrl,
        })
        .eq('id', id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Restaurante atualizado com sucesso!' })
      setTimeout(() => {
        router.push('/admin/restaurantes')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar restaurante.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-60 flex items-center justify-center">
        <span className="text-zinc-500 text-sm animate-pulse">Carregando dados...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link
          href="/admin/restaurantes"
          className="p-2 bg-zinc-900/60 border border-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Editar Restaurante</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Atualize as informações do restaurante parceiro.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'success'
              ? 'bg-green-950/20 text-green-400 border border-green-900/50'
              : 'bg-red-950/20 text-red-400 border border-red-900/50'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-zinc-950/40 border border-zinc-900 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl backdrop-blur-md">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nome do Restaurante</label>
            <input
              type="text"
              required
              value={nome}
              onChange={handleNomeChange}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl shadow-inner focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
              placeholder="Ex: Borger Hamburgueria"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-950 border border-zinc-900 text-zinc-500 rounded-xl sm:text-sm focus:outline-none"
              placeholder="borger-hamburgueria"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Instagram Handle</label>
            <div className="mt-1.5 flex rounded-xl shadow-sm overflow-hidden">
              <span className="inline-flex items-center px-4 bg-zinc-900 border border-r-0 border-zinc-850 text-zinc-500 text-sm">
                @
              </span>
              <input
                type="text"
                required
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="flex-1 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-r-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
                placeholder="borger"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Bairro</label>
            <input
              type="text"
              required
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
              placeholder="Ex: Pinheiros"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Tipo de Cozinha</label>
            <input
              type="text"
              required
              value={tipoCozinha}
              onChange={(e) => setTipoCozinha(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
              placeholder="Ex: hamburguer, japonês, italiano"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Preço Médio</label>
            <select
              value={precoMedio}
              onChange={(e) => setPrecoMedio(e.target.value)}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm"
            >
              <option value="$">$ (Econômico)</option>
              <option value="$$">$$ (Moderado)</option>
              <option value="$$$">$$$ (Luxo)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="mt-1.5 block w-full px-4 py-3 bg-zinc-900/85 border border-zinc-850 focus:border-brand-gold text-white rounded-xl focus:outline-none focus:ring-0 sm:text-sm placeholder-zinc-650"
              placeholder="Descreva o restaurante..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Alterar Foto de Capa (Opcional)</label>
            <div className="mt-2 flex flex-col sm:flex-row items-center gap-4">
              {fotoCapaUrl && (
                <div className="w-28 h-20 rounded-lg overflow-hidden border border-zinc-850 bg-zinc-950 shrink-0">
                  <img src={fotoCapaUrl} alt="Atual" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCapa(e.target.files?.[0] || null)}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-zinc-850 file:text-xs file:font-semibold file:bg-zinc-900 file:text-zinc-350 hover:file:bg-zinc-850 file:transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-zinc-900">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-brand-gold hover:bg-brand-goldHover text-black text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-brand-gold/10"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
