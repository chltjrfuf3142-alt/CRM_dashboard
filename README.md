# 🌐 Global Buyer CRM Dashboard

해외영업 담당자를 위한 바이어 관리 · 딜 파이프라인 · AI 이메일 자동화 CRM 대시보드

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss)

---

## 📌 프로젝트 개요

해외 B2B 영업 현장에서 필요한 기능을 하나의 대시보드로 통합했습니다.
바이어 정보 관리부터 딜 진행 상황 추적, AI 기반 영문 이메일 작성까지 실무 흐름을 그대로 구현했습니다.

**핵심 기능 4가지:**
1. **바이어 관리** — 국가/산업군/등급 필터링 + 상세 패널
2. **딜 파이프라인** — 드래그 앤 드롭 Kanban 보드
3. **미팅 일정** — 예정/완료 타임라인
4. **AI 이메일** — OpenAI gpt-4o-mini 기반 영문 비즈니스 이메일 스트리밍 생성

---

## 🖥️ 화면 구성

### Dashboard
- 총 바이어 수 · 파이프라인 금액 · 이번 달 미팅 · 승률 KPI 카드
- 국가별 바이어 분포 도넛 차트 (Recharts)
- 진행 중인 딜 목록 · 예정 미팅 목록

### Buyers
- 바이어 카드 그리드 (국가 국기 이모지, 등급 배지)
- 실시간 검색 (회사명 / 국가 / 담당자)
- 국가 · 산업군 · 등급 멀티 필터
- 우측 슬라이드 상세 패널 (연결된 딜 · 미팅 이력)

### Pipeline
- 5단계 Kanban 보드 (Prospecting → Contacted → Negotiating → Contracting → Closed Won)
- 드래그 앤 드롭으로 스테이지 이동 (낙관적 업데이트 + 실패 시 롤백)
- D-day 카운트다운 배지

### Meetings
- 예정 미팅 카드 (Video / In-person / Phone 타입)
- 지난 미팅 타임라인

### Email AI
- 바이어 선택 → 목적 · 톤 설정 → AI 이메일 생성
- OpenAI 스트리밍 실시간 출력
- 클립보드 복사

---

## ⚙️ 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, TypeScript 5.9, Vite 8 |
| Styling | Tailwind CSS v4 |
| 상태 관리 | Zustand 5 (UI state), TanStack Query 5 (서버 상태) |
| 드래그 앤 드롭 | @hello-pangea/dnd (react-beautiful-dnd fork, React 19 호환) |
| 차트 | Recharts |
| AI | Vercel AI SDK (@ai-sdk/react), OpenAI gpt-4o-mini |
| 라우팅 | React Router DOM v7 |
| 알림 | Sonner |
| 데이터 | Repository 패턴 (LocalStorage → Supabase 교체 가능) |
| 배포 | Vercel (Edge Function) |

---

## 🏗️ 아키텍처

```
src/
├── types/          # 도메인 엔티티 (Buyer, Deal, Meeting)
├── lib/
│   ├── data/       # Repository 패턴 (LocalStorage 구현체)
│   │   ├── types.ts           # Repository 인터페이스
│   │   ├── buyers.local.ts    # LocalBuyerRepository
│   │   ├── deals.local.ts     # LocalDealRepository
│   │   └── meetings.local.ts  # LocalMeetingRepository
│   └── sample-data/  # 현실적인 무역 샘플 데이터
├── stores/         # Zustand 스토어 (UI 상태)
├── features/       # 기능별 컴포넌트
│   ├── buyers/
│   ├── dashboard/
│   ├── pipeline/
│   └── meetings/
├── pages/          # 라우트 페이지
└── components/     # 공통 레이아웃

api/
└── generate-email.ts  # Vercel Edge Function (OpenAI 프록시)
```

**Repository 패턴 적용 이유:**
`LocalStorage`와 `Supabase` 전환 시 페이지/컴포넌트 코드를 **전혀 수정하지 않아도** 됩니다.
`src/lib/data/index.ts`에서 구현체만 교체하면 됩니다.

---

## 🚀 로컬 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 OpenAI API 키를 입력합니다:

```
OPENAI_API_KEY=sk-...
```

> Email AI 기능을 사용하지 않는다면 API 키 없이도 나머지 모든 기능이 정상 동작합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:5173** 접속

---

## 📦 빌드

```bash
npm run build
npm run preview
```

---

## 📊 샘플 데이터

앱 첫 실행 시 LocalStorage에 아래 데이터가 자동 삽입됩니다:

| 구분 | 내용 |
|------|------|
| 바이어 | 10개사 (독일·일본·미국·중국·인도·프랑스·베트남·한국) |
| Deal | 8건 ($60K~$1.2M, FOB/CIF/L/C 등 실제 무역 용어 적용) |
| 미팅 | 4건 (Video·In-person·Phone 타입) |

**데이터 초기화:**
브라우저 DevTools → Application → Local Storage → Clear

---

## 🔒 보안

- OpenAI API 키는 서버(Vercel Edge Function)에서만 사용 (`VITE_` prefix 미사용)
- API 요청 바디 크기 제한 (2KB)
- `vercel.json` 보안 헤더 설정 (X-Frame-Options, X-Content-Type-Options 등)
- `dangerouslySetInnerHTML` 미사용

---

## 🗺️ 향후 계획 (Phase 2)

- [ ] Supabase 연동 (Repository 패턴으로 구현체 교체만으로 전환 가능)
- [ ] 이메일 템플릿 저장/불러오기
- [ ] 모바일 반응형 사이드바
- [ ] 대시보드 차트 확장 (월별 매출 추이, 스테이지별 전환율)

---

## 👤 Author

포트폴리오 프로젝트 — 해외영업 CRM 도메인을 직접 설계하고 구현했습니다.
