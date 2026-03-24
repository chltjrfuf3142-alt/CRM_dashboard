import { useState } from 'react'
import type { Deal, DealStage } from '@/types'
import { DEAL_STAGES } from '@/types'
import type { Buyer } from '@/types'

type FormData = Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'stageMovedAt'>

interface Props {
  buyers: Buyer[]
  initialStage?: DealStage
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export function DealForm({ buyers, initialStage = 'prospecting', onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    buyerId: buyers[0]?.id ?? '',
    buyerName: buyers[0]?.companyName ?? '',
    item: '',
    amount: 0,
    currency: 'USD',
    stage: initialStage,
    expectedCloseDate: '',
    memo: '',
  })

  const set = (k: keyof FormData, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleBuyerChange = (buyerId: string) => {
    const buyer = buyers.find(b => b.id === buyerId)
    set('buyerId', buyerId)
    set('buyerName', buyer?.companyName ?? '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">바이어 *</label>
        <select
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.buyerId}
          onChange={e => handleBuyerChange(e.target.value)}
          required
        >
          {buyers.map(b => (
            <option key={b.id} value={b.id}>{b.companyName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">품목 *</label>
        <input
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.item}
          onChange={e => set('item', e.target.value)}
          placeholder="Steel Plates (HS-7208)"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">금액 *</label>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.amount || ''}
            onChange={e => set('amount', Number(e.target.value))}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">통화</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
          >
            {['USD', 'EUR', 'KRW'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">스테이지</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.stage}
            onChange={e => set('stage', e.target.value as DealStage)}
          >
            {DEAL_STAGES.filter(s => s.id !== 'closed_lost').map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">예상 클로징일 *</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.expectedCloseDate}
            onChange={e => set('expectedCloseDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">메모</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={form.memo}
          onChange={e => set('memo', e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">저장</button>
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">취소</button>
      </div>
    </form>
  )
}
