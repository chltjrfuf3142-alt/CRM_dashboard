import { useEffect, useState } from 'react'
import { KpiCards } from '@/features/dashboard/KpiCards'
import { BuyerDistributionChart } from '@/features/dashboard/BuyerDistributionChart'
import { buyerRepo, dealRepo, meetingRepo } from '@/lib/data'
import type { Buyer, Deal, Meeting } from '@/types'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/utils'
import { DEAL_STAGES } from '@/types'

export function Dashboard() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    Promise.all([buyerRepo.list(), dealRepo.list(), meetingRepo.list()]).then(
      ([b, d, m]) => { setBuyers(b); setDeals(d); setMeetings(m) }
    )
  }, [])

  const recentDeals = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const upcomingMeetings = meetings
    .filter(m => new Date(m.meetingDate) >= new Date())
    .sort((a, b) => new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">글로벌 바이어 수출 현황 overview</p>
      </div>

      <KpiCards buyers={buyers} deals={deals} meetings={meetings} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <BuyerDistributionChart buyers={buyers} />
        </div>

        {/* 최근 Active Deals */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Active Deals</h3>
          {recentDeals.length === 0 ? (
            <p className="text-sm text-slate-400">진행 중인 Deal 없음</p>
          ) : (
            <div className="space-y-3">
              {recentDeals.map(deal => {
                const stageInfo = DEAL_STAGES.find(s => s.id === deal.stage)
                const buyer = buyers.find(b => b.id === deal.buyerId)
                return (
                  <div key={deal.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      {buyer && <span className="text-base">{getCountryFlag(buyer.countryCode)}</span>}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{deal.buyerName}</p>
                        <p className="text-xs text-slate-500">{deal.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(deal.amount, deal.currency)}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: stageInfo?.color ?? '#94a3b8' }}
                      >
                        {stageInfo?.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 예정 미팅 */}
      {upcomingMeetings.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">예정 미팅</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {upcomingMeetings.map(m => {
              const buyer = buyers.find(b => b.id === m.buyerId)
              const typeLabel = { video: '화상', in_person: '대면', phone: '전화' }[m.type]
              return (
                <div key={m.id} className="min-w-48 border border-slate-100 rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center gap-1.5 mb-2">
                    {buyer && <span>{getCountryFlag(buyer.countryCode)}</span>}
                    <p className="text-xs font-semibold text-slate-700">{m.buyerName}</p>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{m.agenda}</p>
                  <p className="text-xs text-slate-400">{formatDate(m.meetingDate)}</p>
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded mt-1 inline-block">{typeLabel}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
