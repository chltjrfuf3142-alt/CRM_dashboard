import { formatCurrency } from '@/lib/utils'
import type { Buyer, Deal, Meeting } from '@/types'

interface Props {
  buyers: Buyer[]
  deals: Deal[]
  meetings: Meeting[]
}

export function KpiCards({ buyers, deals, meetings }: Props) {
  const totalPipeline = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.amount, 0)

  const now = new Date()
  const thisMonthMeetings = meetings.filter(m => {
    const d = new Date(m.meetingDate)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  const closedDeals = deals.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost')
  const winRate = closedDeals.length > 0
    ? Math.round((deals.filter(d => d.stage === 'closed_won').length / closedDeals.length) * 100)
    : 0

  const cards = [
    { label: '총 바이어', value: `${buyers.length}개사`, icon: '🌐', color: 'bg-blue-50 text-blue-700' },
    { label: '파이프라인 총액', value: formatCurrency(totalPipeline), icon: '💰', color: 'bg-emerald-50 text-emerald-700' },
    { label: '이번 달 미팅', value: `${thisMonthMeetings}건`, icon: '📅', color: 'bg-violet-50 text-violet-700' },
    { label: 'Win Rate', value: `${winRate}%`, icon: '🏆', color: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-500">{card.label}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${card.color}`}>
              {card.icon}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
