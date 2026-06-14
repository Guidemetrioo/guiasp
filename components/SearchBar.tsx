'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface SearchBarProps {
  initialValue?: string
  placeholder?: string
}

export default function SearchBar({
  initialValue = '',
  placeholder = 'hambúrguer com cheddar, omakase no Itaim, brunch em Pinheiros...',
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/busca')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden focus-within:border-brand-gold focus-within:ring-1 focus-within:ring-brand-gold transition-all shadow-xl pr-2">
        <div className="pl-6 text-zinc-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none py-4 px-4 text-white placeholder-zinc-500 text-sm md:text-base font-sans"
        />
        <button
          type="submit"
          className="bg-brand-gold hover:bg-brand-goldHover text-black font-semibold px-6 py-2.5 rounded-full text-sm md:text-base transition-colors shrink-0 font-sans"
        >
          Buscar
        </button>
      </div>
    </form>
  )
}
