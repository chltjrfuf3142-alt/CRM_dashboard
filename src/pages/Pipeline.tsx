import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd'
import { DealCard } from '@/features/pipeline/DealCard'
import { DealForm } from '@/features/pipeline/DealForm'
import { useDealStore } from '@/stores/useDealStore'
import { buyerRepo, dealRepo } from '@/lib/data'
import type { Buyer, DealStage } from '@/types'
import { DEAL_STAGES } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'

const KANBAN_STAGES = DEAL_STAGES.filter(s => s.id !== 'closed_lost')

export function Pipeline() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { deals, setDeals, moveStageOptimistic, rollbackStage } = useDealStore()

  useEffect(() => {
    Promise.all([buyerRepo.list(), dealRepo.list()]).then(([b, d]) => {
      setBuyers(b)
      setDeals(d)
    })
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination || destination.droppableId === source.droppableId) return

    const prevStage = source.droppableId as DealStage
    const newStage = destination.droppableId as DealStage

    moveStageOptimistic(draggableId, newStage)

    try {
      await dealRepo.moveStage(draggableId, newStage)
    } catch {
      rollbackStage(draggableId, prevStage)
      toast.error('저장 실패. 다시 시도해주세요.')
    }
  }

  const handleCreate = async (data: Omit<Parameters<typeof dealRepo.create>[0], 'stageMovedAt'>) => {
    const deal = await dealRepo.create({ ...data, stageMovedAt: new Date().toISOString() })
    setDeals([...deals, deal])
    setIsFormOpen(false)
    toast.success('Deal이 등록되었습니다.')
  }

  const dealsByStage = (stageId: string) =>
    deals.filter(d => d.stage === stageId)

  const stageTotalAmount = (stageId: string) =>
    dealsByStage(stageId).reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">
            총 {deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length}건 · {formatCurrency(deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + d.amount, 0))}
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          + Deal 등록
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map(stage => {
            const stageDeals = dealsByStage(stage.id)
            return (
              <div key={stage.id} className="min-w-56 flex flex-col">
                {/* 컬럼 헤더 */}
                <div className="bg-white rounded-xl p-3 mb-3 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <p className="text-sm font-semibold text-slate-700">{stage.label}</p>
                    <span className="ml-auto text-xs text-slate-400">{stageDeals.length}건</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{formatCurrency(stageTotalAmount(stage.id))}</p>
                </div>

                {/* Droppable 컬럼 */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-32 rounded-xl p-2 space-y-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-slate-50'
                      }`}
                    >
                      {stageDeals.map((deal, index) => {
                        const buyer = buyers.find(b => b.id === deal.buyerId)
                        return (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            index={index}
                            buyerCountryCode={buyer?.countryCode}
                          />
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* Deal 등록 모달 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setIsFormOpen(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Deal 등록</h2>
            <DealForm buyers={buyers} onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
