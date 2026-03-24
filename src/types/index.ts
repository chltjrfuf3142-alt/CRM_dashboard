// ─── Buyer ─────────────────────────────────────────────────
export type BuyerGrade = 'A' | 'B' | 'C' | 'D'

export interface Buyer {
  id: string
  companyName: string
  country: string
  countryCode: string
  industry: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  grade: BuyerGrade
  totalDealAmount: number
  tags: string[]
  memo?: string
  createdAt: string
  updatedAt: string
}

// ─── Deal ───────────────────────────────────────────────────
export const DEAL_STAGES = [
  { id: 'prospecting',  label: 'Prospecting',  color: '#94a3b8' },
  { id: 'contacted',    label: 'Contacted',    color: '#60a5fa' },
  { id: 'negotiating',  label: 'Negotiating',  color: '#f59e0b' },
  { id: 'contracting',  label: 'Contracting',  color: '#a78bfa' },
  { id: 'closed_won',   label: 'Closed Won',   color: '#34d399' },
  { id: 'closed_lost',  label: 'Closed Lost',  color: '#f87171' },
] as const

export type DealStage = typeof DEAL_STAGES[number]['id']

export interface Deal {
  id: string
  buyerId: string
  buyerName: string
  item: string
  amount: number
  currency: 'USD' | 'EUR' | 'KRW'
  stage: DealStage
  expectedCloseDate: string
  stageMovedAt: string
  lossReason?: string
  memo?: string
  createdAt: string
  updatedAt: string
}

// ─── Meeting ────────────────────────────────────────────────
export type MeetingType = 'video' | 'in_person' | 'phone'

export interface Meeting {
  id: string
  buyerId: string
  buyerName: string
  meetingDate: string
  type: MeetingType
  agenda: string
  notes?: string
  followUpEmail?: string
  createdAt: string
  updatedAt: string
}

// ─── Email ──────────────────────────────────────────────────
export type EmailPurpose =
  | 'first_contact'
  | 'quote_request'
  | 'follow_up'
  | 'thank_you'
  | 'meeting_summary'

export type EmailTone = 'formal' | 'friendly' | 'urgent'

export interface EmailTemplate {
  id: string
  name: string
  purpose: EmailPurpose
  tone: EmailTone
  subject: string
  body: string
  createdAt: string
}
