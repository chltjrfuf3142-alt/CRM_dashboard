import type { Deal, DealStage } from '@/types'
import type { DealRepository } from './types'
import { sampleDeals } from '@/lib/sample-data'

const KEY = 'crm_deals'

function load(): Deal[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Deal[]
    localStorage.setItem(KEY, JSON.stringify(sampleDeals))
    return sampleDeals
  } catch {
    return sampleDeals
  }
}

function save(deals: Deal[]) {
  localStorage.setItem(KEY, JSON.stringify(deals))
}

export class LocalDealRepository implements DealRepository {
  async list(): Promise<Deal[]> {
    return load()
  }

  async listByBuyer(buyerId: string): Promise<Deal[]> {
    return load().filter(d => d.buyerId === buyerId)
  }

  async get(id: string): Promise<Deal | null> {
    return load().find(d => d.id === id) ?? null
  }

  async create(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    const deals = load()
    const now = new Date().toISOString()
    const deal: Deal = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    save([...deals, deal])
    return deal
  }

  async update(id: string, data: Partial<Deal>): Promise<Deal> {
    const deals = load()
    const idx = deals.findIndex(d => d.id === id)
    if (idx === -1) throw new Error(`Deal ${id} not found`)
    const updated = { ...deals[idx], ...data, updatedAt: new Date().toISOString() }
    deals[idx] = updated
    save(deals)
    return updated
  }

  async moveStage(id: string, stage: DealStage): Promise<Deal> {
    return this.update(id, { stage, stageMovedAt: new Date().toISOString() })
  }

  async delete(id: string): Promise<void> {
    save(load().filter(d => d.id !== id))
  }
}
