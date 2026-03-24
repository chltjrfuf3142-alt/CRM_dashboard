# CRM Foundation Planning Document

> **Summary**: 해외영업 포트폴리오용 글로벌 바이어 CRM 대시보드의 기반 아키텍처 및 MVP 12개 기능 구현 계획
>
> **Project**: GlobalBuyerCRM Dashboard
> **Version**: 1.0.0
> **Author**: 개발자
> **Date**: 2026-03-18
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 해외영업 담당자가 바이어 정보, Deal 파이프라인, 미팅 이력을 통합 관리할 도구가 없어 업무 효율이 낮고 포트폴리오로 역량을 증명하기 어렵다 |
| **Solution** | React 18 + Vercel AI SDK(OpenAI) 기반 SPA로 바이어 CRUD, Kanban 파이프라인, AI 이메일 생성, 대시보드 시각화를 Repository 패턴으로 확장 가능하게 구현 |
| **Function/UX Effect** | 바이어 등록~Deal 관리~이메일 발송까지 단일 화면에서 처리 가능, AI 스트리밍으로 영문 이메일 즉시 생성, Kanban 드래그앤드롭으로 직관적 파이프라인 관리 |
| **Core Value** | 해외영업 실무 프로세스를 직접 설계·구현한 역량 증명 + AI 업무 자동화 감각을 풀스택으로 보여주는 차별화 포트폴리오 |

---

## 1. Overview

### 1.1 Purpose

해외영업 직무 취업을 위한 포트폴리오로서, 바이어 관리·Deal 파이프라인·AI 이메일 생성 기능을 통합한 CRM 웹앱을 구현한다. 기술 역량과 해외영업 실무 이해도를 동시에 증명하는 것이 목표다.

### 1.2 Background

- 제조/무역 B2B 및 IT/SaaS 해외영업 실무에서 바이어 관리 도구의 필요성을 직접 경험
- AI(OpenAI gpt-4o-mini) 연동으로 영문 이메일 자동 생성 → 업무 자동화 감각 어필
- 다중 에이전트 아키텍처 회의(2026-03-18) 결과를 반영한 기술 스택 및 구조 결정

### 1.3 Related Documents

- 원본 스펙: `GlobalBuyerCRM_Spec.docx`
- 아키텍처 회의 결과: 다중 에이전트 회의 (frontend-architect / bkend-expert / security-architect / enterprise-expert)

---

## 2. Scope

### 2.1 In Scope (MVP 12개 기능)

**M1. 바이어 관리**
- [x] M1-1 바이어 등록 (기본 정보 입력)
- [x] M1-2 바이어 목록 & 실시간 검색
- [x] M1-3 국가/산업 필터
- [x] M1-4 바이어 상세 페이지

**M2. Deal 파이프라인**
- [x] M2-1 Deal 카드 생성
- [x] M2-2 Kanban 파이프라인 (드래그앤드롭)
- [x] M2-3 Deal 금액 합산 표시

**M3. AI 이메일 생성기**
- [x] M3-1 AI 영문 이메일 초안 생성 (OpenAI gpt-4o-mini + 스트리밍)

**M4. 대시보드**
- [x] M4-1 수출 현황 요약 KPI 카드 (4개)
- [x] M4-2 국가별 바이어 분포 차트

**M5. 미팅 관리**
- [x] M5-1 미팅 일정 등록
- [x] M5-2 미팅 이력 타임라인

### 2.2 Out of Scope (2차 확장)

- M1-5 바이어 등급 분류 자동화
- M2-4 Win/Loss 분석
- M3-2 이메일 템플릿 저장
- M4-3 월별 Deal 성과 추이
- M5-3 Action Item / M5-4 미팅 요약 AI
- M6 데이터 가져오기/내보내기
- M7 제품 카탈로그 / 환율 실시간 반영

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 바이어 등록/수정/삭제/조회 (CRUD) | High | Pending |
| FR-02 | 회사명·국가·담당자 실시간 검색 | High | Pending |
| FR-03 | 국가·산업 다중 필터 | High | Pending |
| FR-04 | 바이어 상세 페이지 (거래 이력, 미팅 이력 통합) | High | Pending |
| FR-05 | Deal 카드 생성 (품목, 금액, 바이어 연결, 예상 클로징일) | High | Pending |
| FR-06 | Kanban 5단계 드래그앤드롭 (Prospecting→Closed) | High | Pending |
| FR-07 | 스테이지별 Deal 금액 합산 표시 | High | Pending |
| FR-08 | OpenAI API로 영문 이메일 스트리밍 생성 | High | Pending |
| FR-09 | 4개 KPI 카드 (총 바이어, 파이프라인 총액, 이번 달 미팅, Win Rate) | High | Pending |
| FR-10 | 국가별 바이어 분포 도넛/바 차트 | High | Pending |
| FR-11 | 미팅 일정 등록 (날짜, 방식, 안건) | High | Pending |
| FR-12 | 바이어별 미팅 이력 타임라인 | High | Pending |
| FR-13 | OpenAI API 키를 Vercel API Route에서만 사용 (보안) | High | Pending |
| FR-14 | Repository 패턴으로 LocalStorage 구현 (Supabase 전환 대비) | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 첫 화면 로드 < 2s (Vercel CDN 기준) | Lighthouse |
| Security | API 키 클라이언트 번들 미노출, VITE_ prefix 금지 | Build 검사 |
| UX | Kanban 드래그 즉각 반응 (낙관적 업데이트) | 직접 테스트 |
| Maintainability | Repository 인터페이스로 스토리지 교체 가능 | 코드 리뷰 |
| Accessibility | 주요 인터랙션 키보드 접근 가능 | 수동 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] MVP 12개 기능 전체 동작 확인
- [ ] OpenAI 스트리밍 이메일 생성 정상 동작
- [ ] Kanban 드래그앤드롭 스테이지 이동 + 자동 날짜 기록
- [ ] Vercel 배포 완료 (공개 URL)
- [ ] 실제 무역 현장 느낌의 샘플 데이터 투입 (독일·일본·미국 바이어 등)
- [ ] API 키 서버사이드 처리 확인 (DevTools Network 탭에서 미노출)

### 4.2 Quality Criteria

- [ ] Zero lint errors
- [ ] Build 성공 (sourcemap: false)
- [ ] `vercel.json` 보안 헤더 설정
- [ ] `.env` `.gitignore` 포함 확인

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| react-beautiful-dnd React 18 충돌 | High | High | @hello-pangea/dnd (호환 포크)로 교체 |
| OpenAI API 키 프론트 노출 | High | High | Vercel API Route 프록시 필수 |
| LocalStorage 구조가 Supabase와 불일치 | Medium | Medium | Supabase 스키마 먼저 설계 후 LocalStorage 미러링 |
| 캘린더 라이브러리 구현 비용 초과 | Medium | Medium | react-big-calendar 최소 기능만 사용, 일정 지연 시 리스트 뷰로 대체 |
| 샘플 데이터 부실로 포트폴리오 임팩트 감소 | Medium | Medium | HS코드·Incoterms 포함한 현실적 더미 데이터 사전 설계 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React+Vite / Vue | **React 18 + Vite** | SPA 충분, Next.js 불필요 오버스펙 |
| State Management | Context / Zustand / Redux | **Zustand + TanStack Query** | Zustand(UI상태) + TanStack Query(서버데이터) 역할 분리 |
| DnD Library | react-beautiful-dnd / @dnd-kit / @hello-pangea/dnd | **@hello-pangea/dnd** | 기존 API 호환 포크, React 18 안정 |
| AI SDK | 직접 fetch / Vercel AI SDK | **Vercel AI SDK** | 스트리밍 자동 처리, 프로바이더 교체 용이 |
| AI Provider | Claude API / OpenAI | **OpenAI gpt-4o-mini** | 빠른 TTFT, 저비용, 면접 인지도 |
| API Security | 프론트 직접 / Vercel API Route | **Vercel API Route** | API 키 서버 격리 (보안 필수) |
| Styling | Tailwind / CSS Modules | **Tailwind CSS + shadcn/ui** | 빠른 프로급 UI |
| Charts | Chart.js / Recharts / Victory | **Recharts** | React 친화적, 커스텀 용이 |
| Storage | LocalStorage / Supabase | **LocalStorage → Supabase (Repository 패턴)** | MVP 속도 + 전환 비용 제로 |
| Exchange Rate | Open Exchange Rates / frankfurter.app | **frankfurter.app** | API 키 불필요, 무제한 무료 |
| Deployment | Vercel / Netlify | **Vercel** | GitHub 연동, 환경변수 관리 |

### 6.3 Folder Structure (Dynamic Level)

```
src/
├── features/
│   ├── buyers/              # M1: 바이어 관리
│   │   ├── BuyerList.tsx
│   │   ├── BuyerCard.tsx
│   │   ├── BuyerFilters.tsx
│   │   ├── BuyerForm.tsx
│   │   └── useBuyers.ts
│   ├── pipeline/            # M2: Kanban 파이프라인
│   │   ├── KanbanBoard.tsx
│   │   ├── DealCard.tsx
│   │   └── usePipeline.ts
│   ├── email-ai/            # M3: AI 이메일 생성기
│   │   ├── EmailGenerator.tsx
│   │   └── useEmailGeneration.ts
│   ├── dashboard/           # M4: KPI + 차트
│   │   ├── KpiCards.tsx
│   │   ├── BuyerChart.tsx
│   │   └── useDashboard.ts
│   └── meetings/            # M5: 미팅 관리
│       ├── MeetingCalendar.tsx
│       ├── MeetingTimeline.tsx
│       └── useMeetings.ts
├── components/ui/           # shadcn/ui + 공통 컴포넌트
├── lib/
│   ├── ai/
│   │   └── provider.ts      # AI 프로바이더 팩토리
│   ├── data/
│   │   ├── buyers.ts        # BuyerRepository 인터페이스
│   │   ├── buyers.local.ts  # LocalStorage 구현체
│   │   └── buyers.supabase.ts # Supabase 구현체 (2단계)
│   └── sample-data/
│       └── index.ts         # 현실적 무역 더미 데이터
├── stores/
│   ├── useBuyerStore.ts     # UI 상태 (검색어, 필터, 선택)
│   ├── useDealStore.ts      # Kanban 컬럼 순서
│   └── useUIStore.ts        # 모달, 사이드바
├── types/
│   └── index.ts             # Buyer, Deal, Meeting 타입
└── api/
    └── generate-email.ts    # Vercel API Route (OpenAI 프록시)
```

### 6.4 Repository Pattern (핵심)

```typescript
// 처음부터 Supabase 스키마 기준으로 설계
interface Buyer {
  id: string              // crypto.randomUUID()
  companyName: string
  country: string
  countryCode: string
  industry: string
  contactName: string
  contactEmail: string
  grade: 'A' | 'B' | 'C' | 'D'
  totalDealAmount: number
  tags: string[]
  memo: string
  createdAt: string       // ISO 8601
  updatedAt: string
}

interface BuyerRepository {
  list(): Promise<Buyer[]>
  get(id: string): Promise<Buyer>
  create(data: Omit<Buyer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Buyer>
  update(id: string, data: Partial<Buyer>): Promise<Buyer>
  delete(id: string): Promise<void>
}

// 환경변수로 스위칭
export const buyerRepo: BuyerRepository =
  import.meta.env.VITE_USE_SUPABASE === 'true'
    ? new SupabaseBuyerRepository()
    : new LocalBuyerRepository()
```

---

## 7. Convention Prerequisites

### 7.1 Environment Variables 정의

| Variable | Purpose | Scope | Required |
|----------|---------|-------|:--------:|
| `OPENAI_API_KEY` | OpenAI API 인증 | Server only (Vercel) | ☑ |
| `AI_PROVIDER` | ai 프로바이더 선택 (openai/anthropic) | Server | ☐ |
| `VITE_USE_SUPABASE` | Supabase 전환 플래그 | Client | ☐ |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | Client | ☐ |
| `SUPABASE_SERVICE_KEY` | Supabase 서비스 키 | Server only | ☐ |

> ⚠️ **보안**: `OPENAI_API_KEY`는 절대 `VITE_` 접두사 사용 금지. Vercel 환경변수에만 저장.

### 7.2 Coding Conventions

| Category | Rule |
|----------|------|
| 컴포넌트 명 | PascalCase (`BuyerCard.tsx`) |
| 훅 명 | camelCase + use 접두사 (`useBuyers.ts`) |
| 타입/인터페이스 | PascalCase (`Buyer`, `Deal`) |
| 스토어 | camelCase + use + Store (`useBuyerStore`) |
| 상수 | UPPER_SNAKE_CASE |
| API Route | kebab-case (`generate-email.ts`) |

### 7.3 보안 체크리스트

- [ ] `.env` → `.gitignore` 추가
- [ ] `vite.config.ts`: `build.sourcemap: false`
- [ ] `vercel.json`: 보안 헤더 (X-Frame-Options, X-Content-Type-Options)
- [ ] OpenAI 호출은 반드시 `api/` 디렉토리 내 Vercel Function에서만

---

## 8. Development Schedule

### 개발 우선순위 (다중 에이전트 회의 결과 기반)

| Phase | 기간 | 작업 | 산출물 |
|-------|------|------|--------|
| **Phase 1** | Day 1-2 | 프로젝트 세팅 + 샘플 데이터 설계 + Data Layer | 폴더구조, Repository 인터페이스, 더미 데이터 |
| **Phase 2** | Day 3-5 | 바이어 관리(M1) + Deal 파이프라인(M2) | CRUD + Kanban (핵심 70%) |
| **Phase 3** | Day 6-8 | 대시보드 차트(M4) + AI 이메일 생성기(M3) | KPI 카드, 차트, 스트리밍 이메일 |
| **Phase 4** | Day 9-10 | 미팅 관리(M5) + 완성도 (반응형, 에러 처리) | 캘린더 + 타임라인 |
| **Phase 5** | Day 11-12 | Supabase 전환(선택) + Vercel 배포 | 공개 URL, 포트폴리오 문서화 |

> **핵심 변경점**: 샘플 데이터 설계를 Day 1로 앞당김 → 모든 컴포넌트 일관성 확보

---

## 9. Next Steps

1. [ ] Design 문서 작성 (`crm-foundation.design.md`)
2. [ ] 샘플 데이터 스키마 확정 (Buyer 10개, Deal 15개, Meeting 20개)
3. [ ] Vercel 프로젝트 생성 + GitHub 연동 + 환경변수 설정
4. [ ] 구현 시작 (Phase 1 — 프로젝트 세팅)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-03-18 | Initial draft (다중 에이전트 회의 기반) | 개발자 |
