import type { Buyer } from '@/types'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/utils'
import { cn } from '@/lib/utils'

const gradeColors: Record<string, string> = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-slate-100 text-slate-600',
}

interface Props {
  buyer: Buyer
  onClick: (buyer: Buyer) => void
}

export function BuyerCard({ buyer, onClick }: Props) {
  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all"
      onClick={() => onClick(buyer)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getCountryFlag(buyer.countryCode)}</span>
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">{buyer.companyName}</p>
            <p className="text-xs text-slate-500">{buyer.country}</p>
          </div>
        </div>
        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', gradeColors[buyer.grade])}>
          {buyer.grade}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>👤</span>
          <span>{buyer.contactName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>🏭</span>
          <span>{buyer.industry}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>💰</span>
          <span>{formatCurrency(buyer.totalDealAmount)}</span>
        </div>
      </div>

      {buyer.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {buyer.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">업데이트: {formatDate(buyer.updatedAt)}</p>
    </div>
  )
}
