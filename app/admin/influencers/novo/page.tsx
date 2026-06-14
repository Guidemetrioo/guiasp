'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function NovoInfluencer() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNome(val)
    // Auto generate slug
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
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      let foto_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80'

      if (foto) {
        const fileExt = foto.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `influencers/${fileName}`

        // Try to upload to bucket 'eathub'
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('eathub')
          .upload(filePath, foto, {
            cacheControl: '3600',
            upsert: false
          })

        if (!uploadError) {
          const { data } = supabase.storage.from('eathub').getPublicUrl(filePath)
          foto_url = data.publicUrl
        } else {
          console.warn('Storage upload failed, using fallback placeholder URL. Reason:', uploadError.message)
        }
      }

      const { error } = await supabase.from('influencers').insert([
        {
          nome,
          slug,
          bio,
          instagram_handle: instagram,
          foto_url,
        },
      ])

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Influencer cadastrado com sucesso!' })
      setTimeout(() => {
        router.push('/admin')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Erro ao cadastrar influencer.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Cadastrar Influencer</h1>
        <p className="mt-1 text-sm text-slate-500">
          Adicione um novo influencer parceiro que indicará restaurantes.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Nome</label>
            <input
              type="text"
              required
              value={nome}
              onChange={handleNomeChange}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              placeholder="Ex: Navegando SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 sm:text-sm"
              placeholder="navegando-sp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Instagram Handle</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                @
              </span>
              <input
                type="text"
                required
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="flex-1 block w-full px-3 py-2 border border-slate-300 rounded-r-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
                placeholder="navegandosp"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm text-slate-900"
              placeholder="Breve biografia sobre o influencer..."
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Foto do Perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Influencer'}
          </button>
        </div>
      </form>
    </div>
  )
}
