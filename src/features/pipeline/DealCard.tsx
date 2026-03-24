import { Draggable } from '@hello-pangea/dnd'
import type { Deal } from '@/types'
import { formatCurrency, getDaysUntil, getCountryFlag } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  deal: Deal
  index: number
  buyerCountryCode?: string
}

export function DealCard({ deal, index, buyerCountryCode }: Props) {
  const daysLeft = getDaysUntil(deal.expectedCloseDate)
  const isOverdue = daysLeft < 0
  const isUrgent = daysLeft >= 0 && daysLeft <= 7

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'bg-white rounded-lg p-3 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing',
            snapshot.isDragging && 'shadow-lg rotate-1 border-blue-300'
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {buyerCountryCode && (
                <span className="text-sm">{getCountryFlag(buyerCountryCode)}</span>
              )}
              <p className="text-xs font-semibold text-slate-700 leading-tight">{deal.buyerName}</p>
            </div>
            <span className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded',
              isOverdue ? 'bg-red-100 text-red-600' :
              isUrgent ? 'bg-amber-100 text-amber-600' :
              'bg-slate-100 text-slate-500'
            )}>
              {isOverdue ? `D+${Math.abs(daysLeft)}` : `D-${daysLeft}`}
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-2 leading-tight">{deal.item}</p>

          <p className="text-base font-bold text-slate-800">
            {formatCurrency(deal.amount, deal.currency)}
          </p>
        </div>
      )}
    </Draggable>
  )
}
