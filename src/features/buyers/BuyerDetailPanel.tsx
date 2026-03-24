import type { Buyer, Deal, Meeting } from '@/types'
import { formatCurrency, formatDate, getCountryFlag } from '@/lib/utils'
import { DEAL_STAGES } from '@/types'

interface Props {
  buyer: Buyer | null
  deals: Deal[]
  meetings: Meeting[]
  onClose: () => void
}

const gradeLabels: Record<string, string> = { A: 'VIP', B: 'Active', C: 'Regular', D: 'Inactive' }
const meetingTypeLabels: Record<string, string> = { video: '화상', in_person: '대면', phone: '전화' }

export function BuyerDetailPanel({ buyer, deals, meetings, onClose }: Props) {
  if (!buyer) return null

  const buyerDeals = deals.filter(d => d.buyerId === buyer.id)
  const buyerMeetings = meetings.filter(m => m.buyerId === buyer.id)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getCountryFlag(buyer.countryCode)}</span>
            <div>
              <h2 className="font-bold text-slate-800">{buyer.companyName}</h2>
              <p className="text-sm text-slate-500">{buyer.country} · {buyer.industry}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">기본 정보</h3>
            <div className="space-y-2">
              <Row label="담당자" value={buyer.contactName} />
              <Row label="이메일" value={buyer.contactEmail} />
              {buyer.contactPhone && <Row label="전화" value={buyer.contactPhone} />}
              <Row label="등급" value={`${buyer.grade} (${gradeLabels[buyer.grade]})`} />
              <Row label="총 거래금액" value={formatCurrency(buyer.totalDealAmount)} />
            </div>
            {buyer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {buyer.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{tag}</span>
                ))}
              </div>
            )}
            {buyer.memo && (
              <p className="mt-3 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{buyer.memo}</p>
            )}
          </section>

          {/* Deal 이력 */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Deal 이력 ({buyerDeals.length}건)
            </h3>
            {buyerDeals.length === 0 ? (
              <p className="text-sm text-slate-400">Deal 없음</p>
            ) : (
              <div className="space-y-2">
                {buyerDeals.map(deal => {
                  const stageInfo = DEAL_STAGES.find(s => s.id === deal.stage)
                  return (
                    <div key={deal.id} className="border border-slate-100 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-700">{deal.item}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: stageInfo?.color ?? '#94a3b8' }}
                        >
                          {stageInfo?.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{formatCurrency(deal.amount, deal.currency)}</p>
                      <p className="text-xs text-slate-400 mt-1">마감: {formatDate(deal.expectedCloseDate)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* 미팅 이력 */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              미팅 이력 ({buyerMeetings.length}건)
            </h3>
            {buyerMeetings.length === 0 ? (
              <p className="text-sm text-slate-400">미팅 없음</p>
            ) : (
              <div className="space-y-2">
                {buyerMeetings.map(m => (
                  <div key={m.id} className="border-l-2 border-blue-300 pl-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-medium text-slate-700">{formatDate(m.meetingDate)}</p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {meetingTypeLabels[m.type]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{m.agenda}</p>
                    {m.notes && <p className="text-xs text-slate-400 mt-1">{m.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 font-medium">{value}</span>
    </div>
  )
}
