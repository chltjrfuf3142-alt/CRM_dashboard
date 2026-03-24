# CRM Foundation Design Document

> **Summary**: 글로벌 바이어 CRM 대시보드의 전체 아키텍처, 데이터 모델, 컴포넌트 구조, API 설계
>
> **Project**: GlobalBuyerCRM Dashboard
> **Version**: 1.0.0
> **Author**: 개발자
> **Date**: 2026-03-18
> **Status**: Draft
> **Planning Doc**: [crm-foundation.plan.md](../01-plan/features/crm-foundation.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Repository 패턴으로 LocalStorage/Supabase 전환 시 컴포넌트 코드 변경 없이 가능하게 설계
- Vercel API Route로 OpenAI API 키를 서버 격리 (보안 필수 요건)
- Feature-based 폴더 구조로 모듈 독립성 확보
- Vercel AI SDK `useCompletion`으로 스트리밍 이메일 생성 UX 구현
- @hello-pangea/dnd 기반 Kanban 드래그앤드롭 즉각 반응 (낙관적 업데이트)

### 1.2 Design Principles

- **관심사 분리**: UI 상태(Zustand) / 서버 데이터(TanStack Query) / 스토리지(Repository) 레이어 분리
- **보안 우선**: API 키 클라이언트 번들 완전 배제 (`VITE_` prefix 금지)
- **확장 대비**: 모든 데이터 인터페이스를 Supabase 스키마 기준으로 설계
- **최소 복잡도**: 포트폴리오 스케일에 맞는 구현 (오버엔지니어링 방지)

---

## 2. Architecture

### 2.1 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                      │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │  Buyers  │  │ Pipeline │  │ Email AI │   │
│  │  (M4)    │  │  (M1)    │  │  (M2)    │  │  (M3)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │         │
│  ┌────▼──────────────▼──────────────▼──────┐      │        │
│  │         Repository Layer (Data Access)   │      │        │
│  │  LocalBuyerRepo / LocalDealRepo /...     │      │        │
│  │  (→ SupabaseRepo 전환 시 이 레이어만 교체) │      │        │
│  └──────────────────────────────────────────┘      │        │
│                    LocalStorage                     │        │
└─────────────────────────────────────────────────────┼────────┘
                                                      │ HTTP POST
                                          ┌───────────▼────────┐
                                          │  Vercel API Route  │
                                          │  /api/generate-    │
                                          │  email.ts          │
                                          └───────────┬────────┘
                                                      │ OPENAI_API_KEY (서버 env)
                                          ┌───────────▼────────┐
                                          │   OpenAI API       │
                                          │  gpt-4o-mini       │
                                          └────────────────────┘
```

### 2.2 상태 관리 구조

```
┌─────────────────────────────────────────────────────┐
│                  State Management                    │
│                                                     │
│  Zustand (UI 상태)          TanStack Query (서버)   │
│  ┌──────────────────┐       ┌──────────────────┐    │
│  │ useBuyerStore    │       │ useBuyersQuery   │    │
│  │  - searchTerm    │       │  - buyers[]      │    │
│  │  - activeFilters │       │  - isLoading     │    │
│  │  - selectedBuyer │       │  - error         │    │
│  ├──────────────────┤       ├──────────────────┤    │
│  │ useDealStore     │       │ useDealsQuery    │    │
│  │  - columnOrder   │       │  - deals[]       │    │
│  │  - optimistic    │       │  - by stage      │    │
│  ├──────────────────┤       └──────────────────┘    │
│  │ useUIStore       │                               │
│  │  - modal open    │   Vercel AI SDK               │
│  │  - sidebar       │   ┌──────────────────┐        │
│  └──────────────────┘   │ useCompletion    │        │
│                          │  - completion    │        │
│                          │  - isLoading     │        │
│                          │  - complete()    │        │
│                          └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| features/buyers | lib/data/buyers | 바이어 CRUD |
| features/pipeline | lib/data/deals | Deal 상태 관리 |
| features/email-ai | api/generate-email (Vercel) | AI 이메일 생성 |
| features/dashboard | features/buyers + features/pipeline | KPI 집계 |
| features/meetings | lib/data/meetings | 미팅 이력 |
| lib/data/* | types/index | 타입 정의 |

---

## 3. Data Model

### 3.1 Entity 정의

```typescript
// ─── Buyer (바이어) ───────────────────────────────────
interface Buyer {
  id: string                    // crypto.randomUUID()
  companyName: string           // 회사명
  country: string               // 국가명 (e.g. "Germany")
  countryCode: string           // ISO 2자리 (e.g. "DE")
  industry: string              // 산업 (e.g. "Manufacturing")
  contactName: string           // 담당자명
  contactEmail: string          // 담당자 이메일
  contactPhone?: string         // 담당자 전화
  grade: 'A' | 'B' | 'C' | 'D' // 바이어 등급
  totalDealAmount: number       // 총 거래금액 (USD)
  tags: string[]                // 태그 (e.g. ["OEM", "long-term"])
  memo?: string                 // 메모
  createdAt: string             // ISO 8601
  updatedAt: string             // ISO 8601
}

// ─── Deal (거래 기회) ─────────────────────────────────
type DealStage =
  | 'prospecting'
  | 'contacted'
  | 'negotiating'
  | 'contracting'
  | 'closed_won'
  | 'closed_lost'

interface Deal {
  id: string
  buyerId: string               // FK → Buyer.id
  buyerName: string             // 조인 없이 바로 표시용 (denormalized)
  item: string                  // 품목명
  amount: number                // 예상 금액 (USD)
  currency: 'USD' | 'EUR' | 'KRW'
  stage: DealStage
  expectedCloseDate: string     // ISO 8601
  stageMovedAt: string          // 스테이지 이동 시각 (자동 기록)
  lossReason?: string           // Closed Lost 사유
  memo?: string
  createdAt: string
  updatedAt: string
}

// ─── Meeting (미팅) ───────────────────────────────────
type MeetingType = 'video' | 'in_person' | 'phone'

interface Meeting {
  id: string
  buyerId: string               // FK → Buyer.id
  buyerName: string             // denormalized
  meetingDate: string           // ISO 8601
  type: MeetingType
  agenda: string                // 안건
  notes?: string                // 미팅 메모
  followUpEmail?: string        // AI 생성 후속 이메일
  createdAt: string
  updatedAt: string
}

// ─── EmailTemplate (이메일 템플릿) ─────────────────────
type EmailPurpose =
  | 'first_contact'
  | 'quote_request'
  | 'follow_up'
  | 'thank_you'
  | 'meeting_summary'

type EmailTone = 'formal' | 'friendly' | 'urgent'

interface EmailTemplate {
  id: string
  name: string
  purpose: EmailPurpose
  tone: EmailTone
  content: string               // 이메일 본문 (변수: {buyer_name}, {company_name})
  createdAt: string
  updatedAt: string
}
```

### 3.2 Entity 관계

```
[Buyer] 1 ──── N [Deal]
   │
   └── 1 ──── N [Meeting]

[EmailTemplate] (독립 - 바이어와 직접 연결 없음)
```

### 3.3 Supabase 스키마 (2단계 전환 시)

```sql
-- buyers 테이블
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  industry TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  grade CHAR(1) CHECK (grade IN ('A','B','C','D')) DEFAULT 'C',
  total_deal_amount NUMERIC(15,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- deals 테이블
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  item TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stage TEXT CHECK (stage IN (
    'prospecting','contacted','negotiating',
    'contracting','closed_won','closed_lost'
  )) DEFAULT 'prospecting',
  expected_close_date DATE,
  stage_moved_at TIMESTAMPTZ DEFAULT NOW(),
  loss_reason TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- meetings 테이블
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  type TEXT CHECK (type IN ('video','in_person','phone')),
  agenda TEXT NOT NULL,
  notes TEXT,
  follow_up_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (Supabase 전환 시 필수)
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON buyers FOR SELECT USING (true);
CREATE POLICY "Auth write" ON buyers FOR ALL USING (auth.uid() IS NOT NULL);
```

---

## 4. Repository Pattern (핵심 설계)

### 4.1 인터페이스 정의

```typescript
// src/lib/data/types.ts
export interface BuyerRepository {
  list(): Promise<Buyer[]>
  get(id: string): Promise<Buyer>
  create(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer>
  update(id: string, data: Partial<Omit<Buyer, 'id' | 'createdAt'>>): Promise<Buyer>
  delete(id: string): Promise<void>
}

export interface DealRepository {
  list(): Promise<Deal[]>
  listByBuyer(buyerId: string): Promise<Deal[]>
  get(id: string): Promise<Deal>
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
```

### 4.2 LocalStorage 구현체 패턴

```typescript
// src/lib/data/buyers.local.ts
const STORAGE_KEY = 'crm_buyers'

export class LocalBuyerRepository implements BuyerRepository {
  async list(): Promise<Buyer[]> {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  async create(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer> {
    const buyers = await this.list()
    const now = new Date().toISOString()
    const buyer: Buyer = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...buyers, buyer]))
    return buyer
  }
  // ... update, delete, get
}
```

### 4.3 스위칭 (환경변수)

```typescript
// src/lib/data/index.ts
import { LocalBuyerRepository } from './buyers.local'
import { SupabaseBuyerRepository } from './buyers.supabase'

const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true'

export const buyerRepo: BuyerRepository = useSupabase
  ? new SupabaseBuyerRepository()
  : new LocalBuyerRepository()

export const dealRepo: DealRepository = useSupabase
  ? new SupabaseDealRepository()
  : new LocalDealRepository()

export const meetingRepo: MeetingRepository = useSupabase
  ? new SupabaseMeetingRepository()
  : new LocalMeetingRepository()
```

---

## 5. API Specification

### 5.1 Vercel API Route — AI 이메일 생성

#### `POST /api/generate-email`

**목적**: OpenAI API 키 서버 격리 + 스트리밍 이메일 생성

**Request Body:**
```typescript
{
  buyerName: string       // 담당자명
  companyName: string     // 회사명
  country: string         // 국가
  purpose: EmailPurpose   // 이메일 목적
  tone: EmailTone         // 톤
  additionalNotes?: string // 추가 메모
  dealInfo?: {            // Deal 컨텍스트 (선택)
    item: string
    amount: number
    currency: string
  }
}
```

**Response**: `text/event-stream` (SSE 스트리밍)

**구현:**
```typescript
// src/api/generate-email.ts (Vercel API Route)
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const runtime = 'edge'

export async function POST(req: Request) {
  const body = await req.json()

  const systemPrompt = `You are an expert international business email writer.
Write professional English business emails for Korean exporters dealing with global buyers.
Always maintain appropriate formality based on the tone specified.`

  const userPrompt = buildEmailPrompt(body)

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: 1000,
  })

  return result.toDataStreamResponse()
}

function buildEmailPrompt(params: EmailGenerationRequest): string {
  const toneMap = {
    formal: 'very formal and professional',
    friendly: 'warm and friendly but professional',
    urgent: 'urgent yet polite',
  }
  return `
Write a ${toneMap[params.tone]} business email with the following context:
- Recipient: ${params.buyerName} at ${params.companyName} (${params.country})
- Purpose: ${params.purpose.replace('_', ' ')}
${params.dealInfo ? `- Product/Deal: ${params.dealInfo.item}, ${params.dealInfo.amount} ${params.dealInfo.currency}` : ''}
${params.additionalNotes ? `- Additional context: ${params.additionalNotes}` : ''}

Format: Subject line first, then email body. Sign off as [Your Name] from [Company].`
}
```

### 5.2 Vercel 환경변수

| Variable | Scope | 설명 |
|----------|-------|------|
| `OPENAI_API_KEY` | Server | OpenAI API 인증 (절대 VITE_ 금지) |
| `VITE_USE_SUPABASE` | Client | Supabase 전환 플래그 |
| `VITE_SUPABASE_URL` | Client | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_KEY` | Server | Supabase 서비스 키 |

---

## 6. UI/UX Design

### 6.1 전체 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│ ┌──────────┐  ┌──────────────────────────────────────────┐  │
│ │ Sidebar  │  │           Main Content Area               │  │
│ │  (240px) │  │                                          │  │
│ │  dark bg │  │  ┌──── 현재 페이지 컨텐츠 ────────────┐  │  │
│ │          │  │  │                                   │  │  │
│ │ ● Dashboard  │  │                                   │  │  │
│ │ ○ Buyers │  │  │                                   │  │  │
│ │ ○ Pipeline   │  └───────────────────────────────────┘  │  │
│ │ ○ Meetings   │                                          │  │
│ │ ○ Email AI   └──────────────────────────────────────────┘  │
│ └──────────┘                                                 │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 5개 화면 상세

#### / (대시보드)
```
┌─ KPI Cards ──────────────────────────────────────────────┐
│ [총 바이어: 24]  [파이프라인: $2.4M]  [이번달 미팅: 8]  [Win Rate: 68%] │
└──────────────────────────────────────────────────────────┘
┌─ 좌 (60%) ──────────────┐  ┌─ 우 (40%) ─────────────────┐
│  국가별 바이어 도넛 차트  │  │  최근 Deal 현황 리스트       │
└─────────────────────────┘  └────────────────────────────┘
┌─ 이번 주 예정 미팅 타임라인 ─────────────────────────────┐
```

#### /buyers (바이어 관리)
```
┌─ 검색바 + 필터 태그 ──────────────────────────────────────┐
│ [🔍 검색] [국가 ▼] [산업 ▼] [등급 ▼]  [카드/테이블 전환]  │
└──────────────────────────────────────────────────────────┘
┌─ 바이어 카드 그리드 ───────────────────────────────────────┐
│ ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│ │ 🇩🇪 Müller GmbH │  │ 🇯🇵 Toyota...  │  │ 🇺🇸 ...     │  │
│ │ Hans Müller    │  │ ...            │  │ ...          │  │
│ │ Last: 2026-03  │  │                │  │              │  │
│ │ [A] VIP        │  │ [B]            │  │ [A]          │  │
│ └────────────────┘  └────────────────┘  └─────────────┘  │
└──────────────────────────────────────────────────────────┘
         클릭 시 → 오른쪽에서 상세 슬라이드 패널 등장
```

#### /pipeline (Deal 파이프라인)
```
┌─ Kanban Board ────────────────────────────────────────────┐
│ Prospecting  Contacted  Negotiating  Contracting  Closed  │
│  3건 $450K   2건 $230K   4건 $890K    2건 $340K   5건 ✓   │
│ ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │Deal Card │ │         │ │         │ │         │         │
│ │Müller    │ │         │ │         │ │         │         │
│ │Steel     │ │         │ │         │ │         │         │
│ │$150K     │ │         │ │         │ │         │         │
│ │D-45      │ │         │ │         │ │         │         │
│ └──────────┘ └─────────┘ └─────────┘ └─────────┘         │
└──────────────────────────────────────────────────────────┘
```

#### /email (AI 이메일 생성기)
```
┌─ 좌: 입력 패널 ──────────┐  ┌─ 우: 결과 패널 ────────────┐
│ 바이어 선택 [검색...]     │  │ Subject: Re: Steel Parts  │
│ 이메일 목적 [선택 ▼]     │  │ Inquiry                   │
│ 톤 [Formal] [Friendly]  │  │                           │
│    [Urgent]             │  │ Dear Mr. Müller,          │
│ 추가 메모 [             │  │                           │
│           ]             │  │ Thank you for...          │
│                         │  │ (스트리밍으로 타이핑 효과)  │
│ [✨ 이메일 생성]         │  │                           │
│                         │  │ [복사] [템플릿 저장]       │
└─────────────────────────┘  └────────────────────────────┘
```

### 6.3 컴포넌트 목록

| Component | Location | 책임 |
|-----------|----------|------|
| `AppLayout` | components/layout | 사이드바 + 콘텐츠 래퍼 |
| `Sidebar` | components/layout | 네비게이션 메뉴 |
| `KpiCard` | features/dashboard | 단일 KPI 수치 표시 |
| `BuyerDistributionChart` | features/dashboard | 국가별 도넛 차트 (Recharts) |
| `BuyerCard` | features/buyers | 바이어 카드 (그리드 아이템) |
| `BuyerFilters` | features/buyers | 검색 + 다중 필터 |
| `BuyerDetailPanel` | features/buyers | 슬라이드 상세 패널 |
| `BuyerForm` | features/buyers | 등록/수정 폼 |
| `KanbanBoard` | features/pipeline | @hello-pangea/dnd 보드 |
| `DealCard` | features/pipeline | Kanban 카드 |
| `DealForm` | features/pipeline | Deal 등록 폼 |
| `EmailGenerator` | features/email-ai | AI 이메일 생성 UI |
| `MeetingTimeline` | features/meetings | 바이어별 미팅 타임라인 |
| `MeetingForm` | features/meetings | 미팅 등록 폼 |

---

## 7. Error Handling

### 7.1 에러 유형별 처리

| 상황 | 처리 방법 |
|------|-----------|
| OpenAI API 실패 | 에러 메시지 표시 + 재시도 버튼 |
| LocalStorage 쓰기 실패 | Toast 알림 (용량 초과 등) |
| 바이어 없이 Deal 생성 | 폼 내 인라인 유효성 에러 |
| 빈 검색 결과 | Empty State 컴포넌트 표시 |
| Kanban 드래그 실패 | 낙관적 업데이트 롤백 |

### 7.2 낙관적 업데이트 패턴 (Kanban)

```typescript
// Deal 스테이지 이동 시
const moveStage = (dealId: string, newStage: DealStage) => {
  // 1. 즉시 UI 반영 (낙관적)
  setDeals(prev => prev.map(d =>
    d.id === dealId ? { ...d, stage: newStage } : d
  ))
  // 2. 저장소 업데이트 (비동기)
  dealRepo.moveStage(dealId, newStage).catch(() => {
    // 3. 실패 시 롤백
    setDeals(prev => prev.map(d =>
      d.id === dealId ? { ...d, stage: prevStage } : d
    ))
    toast.error('저장 실패. 다시 시도해주세요.')
  })
}
```

---

## 8. Security Checklist

- [ ] `OPENAI_API_KEY` → Vercel 환경변수에만 저장 (절대 `VITE_` 미사용)
- [ ] `vite.config.ts` → `build.sourcemap: false`
- [ ] `.env` → `.gitignore` 포함
- [ ] `vercel.json` → 보안 헤더 설정

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

- [ ] API Route에서 요청 body 크기 제한 (최대 2KB)
- [ ] `dangerouslySetInnerHTML` 미사용
- [ ] React JSX 자동 이스케이핑 신뢰 (별도 sanitize 불필요)

---

## 9. Clean Architecture — Layer Assignment

### 9.1 레이어 구조 (Dynamic Level)

| Layer | 책임 | 위치 |
|-------|------|------|
| **Presentation** | UI 컴포넌트, 훅, 페이지 | `src/features/*/`, `src/components/` |
| **Application** | 비즈니스 로직, 상태 | `src/stores/`, `src/features/*/hooks/` |
| **Domain** | 엔티티 타입, 순수 로직 | `src/types/` |
| **Infrastructure** | 저장소, API 클라이언트 | `src/lib/data/`, `src/api/` |

### 9.2 주요 파일별 레이어

| 파일 | Layer |
|------|-------|
| `features/buyers/BuyerCard.tsx` | Presentation |
| `features/buyers/useBuyers.ts` | Application |
| `stores/useBuyerStore.ts` | Application |
| `types/index.ts` | Domain |
| `lib/data/buyers.local.ts` | Infrastructure |
| `api/generate-email.ts` | Infrastructure |

---

## 10. Implementation Guide

### 10.1 프로젝트 초기 설정 명령어

```bash
# 1. Vite + React + TypeScript 프로젝트 생성
npm create vite@latest crm-dashboard -- --template react-ts
cd crm-dashboard

# 2. 핵심 의존성 설치
npm install \
  @hello-pangea/dnd \
  recharts \
  zustand \
  @tanstack/react-query \
  date-fns \
  react-big-calendar \
  ai @ai-sdk/openai \
  react-router-dom \
  clsx tailwind-merge

# 3. shadcn/ui 초기화
npx shadcn@latest init

# 4. Tailwind 설정
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. 주요 shadcn 컴포넌트 추가
npx shadcn@latest add button input card badge dialog sheet
```

### 10.2 구현 순서 (Day by Day)

```
Day 1: 프로젝트 세팅
  ├── Vite + React TS + Tailwind + shadcn 설치
  ├── 폴더 구조 생성 (features/, lib/, stores/, types/)
  ├── AppLayout + Sidebar + React Router 라우팅
  └── types/index.ts — Buyer, Deal, Meeting 타입 정의

Day 2: 샘플 데이터 + Repository 레이어
  ├── lib/sample-data/index.ts — 현실적 더미 데이터 10개 바이어
  ├── lib/data/buyers.local.ts — LocalBuyerRepository
  ├── lib/data/deals.local.ts — LocalDealRepository
  └── lib/data/meetings.local.ts — LocalMeetingRepository

Day 3: 바이어 관리 (M1)
  ├── features/buyers/BuyerList.tsx
  ├── features/buyers/BuyerCard.tsx
  ├── features/buyers/BuyerFilters.tsx (검색 + 다중 필터)
  └── features/buyers/BuyerForm.tsx (등록/수정)

Day 4: 바이어 상세 슬라이드 패널
  ├── features/buyers/BuyerDetailPanel.tsx
  └── stores/useBuyerStore.ts (선택 상태)

Day 5: Deal 파이프라인 (M2)
  ├── features/pipeline/KanbanBoard.tsx (@hello-pangea/dnd)
  ├── features/pipeline/DealCard.tsx
  ├── features/pipeline/DealForm.tsx
  └── lib/data/deals.local.ts moveStage() + 낙관적 업데이트

Day 6: 대시보드 (M4)
  ├── features/dashboard/KpiCards.tsx
  └── features/dashboard/BuyerDistributionChart.tsx (Recharts)

Day 7: AI 이메일 생성기 (M3) - 핵심 기능
  ├── api/generate-email.ts (Vercel API Route + OpenAI)
  └── features/email-ai/EmailGenerator.tsx (useCompletion 스트리밍)

Day 8: 미팅 관리 (M5)
  ├── features/meetings/MeetingTimeline.tsx
  └── features/meetings/MeetingForm.tsx

Day 9-10: 완성도
  ├── 반응형 처리 (모바일 사이드바 햄버거 메뉴)
  ├── Loading skeleton, Empty state
  ├── Toast 알림 (sonner)
  └── vercel.json 보안 헤더

Day 11-12: 배포
  ├── Vercel 프로젝트 생성 + OPENAI_API_KEY 환경변수 설정
  ├── GitHub 연동 + 자동 배포
  └── 포트폴리오 README 작성
```

### 10.3 샘플 데이터 가이드

무역 현장 현실감을 위한 필수 포함 항목:
- 바이어: 독일(DE), 일본(JP), 미국(US), 중국(CN), 인도(IN) 포함
- 산업: Manufacturing, Automotive, Electronics, Chemical, Textile
- 태그: OEM, long-term, steel, automotive-parts, HS-7208 등 HS코드 포함
- Deal 금액: $50,000 ~ $2,000,000 USD 범위
- 실제 무역 용어: FOB, CIF, L/C, T/T 등 결제 조건 메모에 포함

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-18 | Initial draft (Plan 문서 기반, 다중 에이전트 회의 반영) | 개발자 |
