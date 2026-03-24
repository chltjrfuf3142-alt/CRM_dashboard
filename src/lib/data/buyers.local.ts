import type { Buyer } from '@/types'
import type { BuyerRepository } from './types'
import { sampleBuyers } from '@/lib/sample-data'

const KEY = 'crm_buyers'

function load(): Buyer[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Buyer[]
    const initial = sampleBuyers
    localStorage.setItem(KEY, JSON.stringify(initial))
    return initial
  } catch {
    return sampleBuyers
  }
}

function save(buyers: Buyer[]) {
  localStorage.setItem(KEY, JSON.stringify(buyers))
}

export class LocalBuyerRepository implements BuyerRepository {
  async list(): Promise<Buyer[]> {
    return load()
  }

  async get(id: string): Promise<Buyer | null> {
    return load().find(b => b.id === id) ?? null
  }

  async create(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer> {
    const buyers = load()
    const now = new Date().toISOString()
    const buyer: Buyer = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    save([...buyers, buyer])
    return buyer
  }

  async update(id: string, data: Partial<Omit<Buyer, 'id' | 'createdAt'>>): Promise<Buyer> {
    const buyers = load()
    const idx = buyers.findIndex(b => b.id === id)
    if (idx === -1) throw new Error(`Buyer ${id} not found`)
    const updated = { ...buyers[idx], ...data, updatedAt: new Date().toISOString() }
    buyers[idx] = updated
    save(buyers)
    return updated
  }

  async delete(id: string): Promise<void> {
    save(load().filter(b => b.id !== id))
  }
}
