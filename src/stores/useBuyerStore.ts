import { create } from 'zustand'

interface BuyerFilters {
  countries: string[]
  industries: string[]
  grades: string[]
}

interface BuyerStore {
  searchTerm: string
  filters: BuyerFilters
  selectedBuyerId: string | null
  isDetailOpen: boolean

  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<BuyerFilters>) => void
  clearFilters: () => void
  selectBuyer: (id: string | null) => void
  openDetail: (id: string) => void
  closeDetail: () => void
}

export const useBuyerStore = create<BuyerStore>((set) => ({
  searchTerm: '',
  filters: { countries: [], industries: [], grades: [] },
  selectedBuyerId: null,
  isDetailOpen: false,

  setSearchTerm: (term) => set({ searchTerm: term }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () =>
    set({ filters: { countries: [], industries: [], grades: [] }, searchTerm: '' }),
  selectBuyer: (id) => set({ selectedBuyerId: id }),
  openDetail: (id) => set({ selectedBuyerId: id, isDetailOpen: true }),
  closeDetail: () => set({ isDetailOpen: false, selectedBuyerId: null }),
}))
