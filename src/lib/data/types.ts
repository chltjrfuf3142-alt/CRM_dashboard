import type { Buyer, Deal, DealStage, Meeting } from '@/types'

export interface BuyerRepository {
  list(): Promise<Buyer[]>
  get(id: string): Promise<Buyer | null>
  create(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer>
  update(id: string, data: Partial<Omit<Buyer, 'id' | 'createdAt'>>): Promise<Buyer>
  delete(id: string): Promise<void>
}

export interface DealRepository {
  list(): Promise<Deal[]>
  listByBuyer(buyerId: string): Promise<Deal[]>
  get(id: string): Promise<Deal | null>
  create(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal>
  update(id: string, data: Partial<Deal>): Promise<Deal>
  moveStage(id: string, stage: DealStage): Promise<Deal>
  delete(id: string): Promise<void>
}

export interface MeetingRepository {
  list(): Promise<Meeting[]>
  listByBuyer(buyerId: string): Promise<Meeting[]>
  create(data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting>
  update(id: string, data: Partial<Meeting>): Promise<Meeting>
  delete(id: string): Promise<void>
}
