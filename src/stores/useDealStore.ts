import { create } from 'zustand'
import { DEAL_STAGES } from '@/types'
import type { Deal, DealStage } from '@/types'

interface DealStore {
  deals: Deal[]
  isLoaded: boolean
  columnOrder: DealStage[]
  setDeals: (deals: Deal[]) => void
  moveStageOptimistic: (dealId: string, newStage: DealStage) => void
  rollbackStage: (dealId: string, prevStage: DealStage) => void
}

export const useDealStore = create<DealStore>((set) => ({
  deals: [],
  isLoaded: false,
  columnOrder: DEAL_STAGES.map((s) => s.id),

  setDeals: (deals) => set({ deals, isLoaded: true }),

  moveStageOptimistic: (dealId, newStage) =>
    set((state) => ({
      deals: state.deals.map((d) =>
        d.id === dealId
          ? { ...d, stage: newStage, stageMovedAt: new Date().toISOString() }
          : d
      ),
    })),

  rollbackStage: (dealId, prevStage) =>
    set((state) => ({
      deals: state.deals.map((d) =>
        d.id === dealId ? { ...d, stage: prevStage } : d
      ),
    })),
}))
