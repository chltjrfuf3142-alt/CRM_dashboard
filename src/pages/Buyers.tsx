import { useEffect, useState, useMemo } from 'react'
import { BuyerCard } from '@/features/buyers/BuyerCard'
import { BuyerForm } from '@/features/buyers/BuyerForm'
import { BuyerDetailPanel } from '@/features/buyers/BuyerDetailPanel'
import { useBuyerStore } from '@/stores/useBuyerStore'
import { buyerRepo, dealRepo, meetingRepo } from '@/lib/data'
import type { Buyer, Deal, Meeting } from '@/types'
import { toast } from 'sonner'

const GRADES = ['A', 'B', 'C', 'D']

export function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const { searchTerm, filters, selectedBuyerId, isDetailOpen, setSearchTerm, setFilters, openDetail, closeDetail } = useBuyerStore()

  useEffect(() => {
    reload()
  }, [])

  const reload = async () => {
    setIsDataLoading(true)
    const [b, d, m] = await Promise.all([buyerRepo.list(), dealRepo.list(), meetingRepo.list()])
    setBuyers(b); setDeals(d); setMeetings(m)
    setIsDataLoading(false)
  }

  const allCountries = useMemo(() => [...new Set(buyers.map(b => b.country))].sort(), [buyers])
  const allIndustries = useMemo(() => [...new Set(buyers.map(b => b.industry))].sort(), [buyers])

  const filtered = useMemo(() => {
    return buyers.filter(b => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q ||
        b.companyName.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q)
      const matchCountry = filters.countries.length === 0 || filters.countries.includes(b.country)
      const matchIndustry = filters.industries.length === 0 || filters.industries.includes(b.industry)
      const matchGrade = filters.grades.length === 0 || filters.grades.includes(b.grade)
      return matchSearch && matchCountry && matchIndustry && matchGrade
    })
  }, [buyers, searchTerm, filters])

  const handleCreate = async (data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'totalDealAmount'>) => {
    await buyerRepo.create({ ...data, totalDealAmount: 0 })
    await reload()
    setIsFormOpen(false)
    toast.success('바이어가 등록되었습니다.')
  }

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId) ?? null

  const toggleFilter = (type: 'countries' | 'industries' | 'grades', value: string) => {
    const current = filters[type]
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    setFilters({ [type]: updated })
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buyers</h1>
          <p className="text-sm text-slate-500 mt-1">전체 {buyers.length}개사 · 검색 결과 {filtered.length}개사</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 바이어 등록
        </button>
      </div>

      {/* 검색 + 필터 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6 space-y-3">
        <input
          className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="🔍 회사명, 국가, 담당자 검색..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {allCountries.map(c => (
            <button
              key={c}
              onClick={() => toggleFilter('countries', c)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.countries.includes(c)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {c}
            </button>
          ))}
          <span className="text-slate-300 text-xs self-center">|</span>
          {allIndustries.map(i => (
            <button
              key={i}
              onClick={() => toggleFilter('industries', i)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filters.industries.includes(i)
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {i}
            </button>
          ))}
          <span className="text-slate-300 text-xs self-center">|</span>
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => toggleFilter('grades', g)}
              className={`text-xs px-2.5 py-1 rounded-full border font-bold transition-colors ${
                filters.grades.includes(g)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      {isDataLoading && buyers.length === 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-2/3 mb-4" />
              <div className="h-6 bg-slate-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(buyer => (
            <BuyerCard key={buyer.id} buyer={buyer} onClick={b => openDetail(b.id)} />
          ))}
        </div>
      )}

      {/* 바이어 등록 모달 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">바이어 등록</h2>
            <BuyerForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}

      {/* 상세 패널 */}
      {isDetailOpen && (
        <BuyerDetailPanel
          buyer={selectedBuyer}
          deals={deals}
          meetings={meetings}
          onClose={closeDetail}
        />
      )}
    </div>
  )
}
