import { useEffect, useState } from 'react'
import { MeetingForm } from '@/features/meetings/MeetingForm'
import { buyerRepo, meetingRepo } from '@/lib/data'
import type { Buyer, Meeting } from '@/types'
import { formatDate, getCountryFlag } from '@/lib/utils'
import { toast } from 'sonner'

const meetingTypeLabels: Record<string, string> = { video: '📹 화상', in_person: '🤝 대면', phone: '📞 전화' }
const meetingTypeColors: Record<string, string> = { video: 'bg-blue-100 text-blue-600', in_person: 'bg-emerald-100 text-emerald-600', phone: 'bg-amber-100 text-amber-600' }

export function Meetings() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    Promise.all([buyerRepo.list(), meetingRepo.list()]).then(([b, m]) => {
      setBuyers(b); setMeetings(m)
    })
  }, [])

  const handleCreate = async (data: Parameters<typeof meetingRepo.create>[0]) => {
    const m = await meetingRepo.create(data)
    setMeetings(prev => [m, ...prev])
    setIsFormOpen(false)
    toast.success('미팅이 등록되었습니다.')
  }

  const upcoming = meetings.filter(m => new Date(m.meetingDate) >= new Date())
  const past = meetings.filter(m => new Date(m.meetingDate) < new Date())

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meetings</h1>
          <p className="text-sm text-slate-500 mt-1">전체 {meetings.length}건 · 예정 {upcoming.length}건</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          + 미팅 등록
        </button>
      </div>

      {/* 예정 미팅 */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">예정 미팅 ({upcoming.length}건)</h2>
          <div className="space-y-3">
            {upcoming.map(m => <MeetingRow key={m.id} meeting={m} buyers={buyers} />)}
          </div>
        </section>
      )}

      {/* 미팅 이력 타임라인 */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 mb-3">미팅 이력 ({past.length}건)</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-4">
              {past.map(m => (
                <div key={m.id} className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 z-10">
                    {getCountryFlag(buyers.find(b => b.id === m.buyerId)?.countryCode ?? 'XX')}
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">{m.buyerName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${meetingTypeColors[m.type]}`}>
                        {meetingTypeLabels[m.type]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{m.agenda}</p>
                    {m.notes && <p className="text-xs text-slate-400">{m.notes}</p>}
                    <p className="text-xs text-slate-400 mt-1">{formatDate(m.meetingDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {meetings.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm">등록된 미팅이 없습니다.</p>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">미팅 등록</h2>
            <MeetingForm buyers={buyers} onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

function MeetingRow({ meeting, buyers }: { meeting: Meeting; buyers: Buyer[] }) {
  const buyer = buyers.find(b => b.id === meeting.buyerId)
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 flex gap-4">
      <div className="text-2xl">{getCountryFlag(buyer?.countryCode ?? 'XX')}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-slate-800">{meeting.buyerName}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${meetingTypeColors[meeting.type]}`}>
            {meetingTypeLabels[meeting.type]}
          </span>
        </div>
        <p className="text-sm text-slate-600">{meeting.agenda}</p>
        {meeting.notes && <p className="text-xs text-slate-500 mt-1">{meeting.notes}</p>}
        <p className="text-xs font-medium text-blue-600 mt-1">📅 {formatDate(meeting.meetingDate)}</p>
      </div>
    </div>
  )
}
