import { useState } from 'react'
import type { Buyer, BuyerGrade } from '@/types'

type FormData = Omit<Buyer, 'id' | 'createdAt' | 'updatedAt' | 'totalDealAmount'>

interface Props {
  initial?: Partial<Buyer>
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

const industries = ['Manufacturing', 'Automotive', 'Electronics', 'Chemical', 'Textile', 'Food', 'Other']
const grades: BuyerGrade[] = ['A', 'B', 'C', 'D']

export function BuyerForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormData>({
    companyName: initial?.companyName ?? '',
    country: initial?.country ?? '',
    countryCode: initial?.countryCode ?? '',
    industry: initial?.industry ?? industries[0],
    contactName: initial?.contactName ?? '',
    contactEmail: initial?.contactEmail ?? '',
    contactPhone: initial?.contactPhone ?? '',
    grade: initial?.grade ?? 'C',
    tags: initial?.tags ?? [],
    memo: initial?.memo ?? '',
  })
  const [tagInput, setTagInput] = useState('')

  const set = (k: keyof FormData, v: unknown) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter(t => t !== tag))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">회사명 *</label>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.companyName}
            onChange={e => set('companyName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">국가명 *</label>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.country}
            onChange={e => set('country', e.target.value)}
            placeholder="Germany"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">국가 코드 *</label>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.countryCode}
            onChange={e => set('countryCode', e.target.value.toUpperCase().slice(0, 2))}
            placeholder="DE"
            maxLength={2}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">산업</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.industry}
            onChange={e => set('industry', e.target.value)}
          >
            {industries.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">등급</label>
          <select
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.grade}
            onChange={e => set('grade', e.target.value as BuyerGrade)}
          >
            {grades.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">담당자명 *</label>
          <input
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.contactName}
            onChange={e => set('contactName', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">이메일 *</label>
          <input
            type="email"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.contactEmail}
            onChange={e => set('contactEmail', e.target.value)}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">태그</label>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="태그 입력 후 Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              추가
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">×</button>
              </span>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">메모</label>
          <textarea
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={form.memo}
            onChange={e => set('memo', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}
