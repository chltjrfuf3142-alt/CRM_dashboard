import { LocalBuyerRepository } from './buyers.local'
import { LocalDealRepository } from './deals.local'
import { LocalMeetingRepository } from './meetings.local'

// 환경변수로 Supabase 전환 가능 (기본: LocalStorage)
// const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'

export const buyerRepo = new LocalBuyerRepository()
export const dealRepo = new LocalDealRepository()
export const meetingRepo = new LocalMeetingRepository()
