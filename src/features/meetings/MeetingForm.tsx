import { useState } from 'react'
import type { Meeting, MeetingType } from '@/types'
import type { Buyer } from '@/types'

type FormData = Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  buyers: Buyer[]
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export function MeetingForm({ buyers, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    buyerId: buyers[0]?.id ?? '',
    buyerName: buyers[0]?.companyName ?? '',
    meetingDate: '',
    type: 'video',
    agenda: '',
    notes: '',
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
    onSubmit({ ...form, meetingDate: new Date(form.meetingDate).toISOString() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">바이어 *</label>
        <select
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.buyerId}
          onChange={e => handleBuyerChange(e.target.value)}
        >
          {buyers.map(b => <option key={b.id} value={b.id}>{b.companyName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">날짜/시간 *</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.meetingDate}
            onChange={e => set('meetingDate', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">방식</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.type}
            onChange={e => set('type', e.target.value as MeetingType)}
          >
            <option value="video">화상</option>
            <option value="in_person">대면</option>
            <option value="phone">전화</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">안건 *</label>
        <input
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.agenda}
          onChange={e => set('agenda', e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">메모</label>
        <textarea
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">저장</button>
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg">취소</button>
      </div>
    </form>
  )
}
