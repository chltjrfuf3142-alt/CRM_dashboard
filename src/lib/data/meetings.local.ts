import type { Meeting } from '@/types'
import type { MeetingRepository } from './types'
import { sampleMeetings } from '@/lib/sample-data'

const KEY = 'crm_meetings'

function load(): Meeting[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Meeting[]
    localStorage.setItem(KEY, JSON.stringify(sampleMeetings))
    return sampleMeetings
  } catch {
    return sampleMeetings
  }
}

function save(meetings: Meeting[]) {
  localStorage.setItem(KEY, JSON.stringify(meetings))
}

export class LocalMeetingRepository implements MeetingRepository {
  async list(): Promise<Meeting[]> {
    return load().sort(
      (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
    )
  }

  async listByBuyer(buyerId: string): Promise<Meeting[]> {
    return load()
      .filter(m => m.buyerId === buyerId)
      .sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime())
  }

  async create(data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const meetings = load()
    const now = new Date().toISOString()
    const meeting: Meeting = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    save([...meetings, meeting])
    return meeting
  }

  async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const meetings = load()
    const idx = meetings.findIndex(m => m.id === id)
    if (idx === -1) throw new Error(`Meeting ${id} not found`)
    const updated = { ...meetings[idx], ...data, updatedAt: new Date().toISOString() }
    meetings[idx] = updated
    save(meetings)
    return updated
  }

  async delete(id: string): Promise<void> {
    save(load().filter(m => m.id !== id))
  }
}
