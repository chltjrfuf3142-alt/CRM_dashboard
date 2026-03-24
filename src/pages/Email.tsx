import { useState } from 'react'
import { useCompletion } from '@ai-sdk/react'
import { buyerRepo } from '@/lib/data'
import type { Buyer, EmailPurpose, EmailTone } from '@/types'
import { useEffect } from 'react'
import { toast } from 'sonner'

const purposeLabels: Record<EmailPurpose, string> = {
  first_contact: '첫 접촉 (First Contact)',
  quote_request: '견적 요청 (Quote Request)',
  follow_up: '팔로업 (Follow-up)',
  thank_you: '감사 인사 (Thank You)',
  meeting_summary: '미팅 요약 (Meeting Summary)',
}

const toneLabels: Record<EmailTone, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  urgent: 'Urgent',
}

export function Email() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [selectedBuyerId, setSelectedBuyerId] = useState('')
  const [purpose, setPurpose] = useState<EmailPurpose>('first_contact')
  const [tone, setTone] = useState<EmailTone>('formal')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [hasError, setHasError] = useState(false)

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate-email',
    onError: () => {
      setHasError(true)
      toast.error('이메일 생성에 실패했습니다. API 키를 확인하세요.')
    },
    onFinish: () => setHasError(false),
  })

  useEffect(() => {
    buyerRepo.list().then(b => {
      setBuyers(b)
      if (b.length > 0) setSelectedBuyerId(b[0].id)
    })
  }, [])

  const selectedBuyer = buyers.find(b => b.id === selectedBuyerId)

  const handleGenerate = () => {
    if (!selectedBuyer) return
    setHasError(false)
    complete('', {
      body: {
        buyerName: selectedBuyer.contactName,
        companyName: selectedBuyer.companyName,
        country: selectedBuyer.country,
        purpose,
        tone,
        additionalNotes,
        dealInfo: undefined,
      },
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(completion)
    toast.success('클립보드에 복사되었습니다.')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Email AI</h1>
        <p className="text-sm text-slate-500 mt-1">OpenAI가 영문 비즈니스 이메일을 자동으로 작성합니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 패널 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">이메일 설정</h2>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">바이어 선택</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedBuyerId}
              onChange={e => setSelectedBuyerId(e.target.value)}
            >
              {buyers.map(b => (
                <option key={b.id} value={b.id}>
                  {b.companyName} — {b.contactName} ({b.country})
                </option>
              ))}
            </select>
          </div>

          {selectedBuyer && (
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              ✉️ {selectedBuyer.contactEmail} · 🏭 {selectedBuyer.industry}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">이메일 목적</label>
            <select
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={purpose}
              onChange={e => setPurpose(e.target.value as EmailPurpose)}
            >
              {Object.entries(purposeLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">톤 선택</label>
            <div className="flex gap-2">
              {(Object.entries(toneLabels) as [EmailTone, string][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setTone(k)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors font-medium ${
                    tone === k
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">추가 메모 (선택)</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="예: 지난 달 샘플 테스트 결과에 대한 피드백 요청, 3월 방문 일정 조율..."
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !selectedBuyer}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>생성 중...</span>
              </>
            ) : (
              <>✨ 이메일 생성</>
            )}
          </button>
        </div>

        {/* 결과 패널 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">생성된 이메일</h2>
            {completion && (
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
              >
                📋 복사
              </button>
            )}
          </div>

          {!completion && !isLoading && hasError ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-sm mb-3">이메일 생성에 실패했습니다.</p>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedBuyer}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : !completion && !isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="text-4xl mb-3">✉️</p>
                <p className="text-sm">이메일 설정 후 생성 버튼을 누르세요</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap min-h-64 overflow-y-auto leading-relaxed">
              {completion}
              {isLoading && <span className="animate-pulse text-blue-500">▌</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
