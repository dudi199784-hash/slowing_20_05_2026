# SLOWIND

맞춤 유니폼·로고·스포츠 용품 AI 시안 제작 서비스

## GitHub 저장소

| 구분 | 저장소 | 설명 |
|------|--------|------|
| **포트폴리오 제출용** (이 레포) | [slowind-fullstack](https://github.com/dudi199784-hash/slowind-fullstack) | 완성된 서비스 구조를 정리하고 런 테스트를 거친 **최종 제출·배포용** 저장소 (`frontend` + `backend` 모노레포) |
| **개발 과정** | [chunchunhee_slowind_2026](https://github.com/dudi199784-hash/chunchunhee_slowind_2026) | 백엔드 API 설계 → UI 골격 프론트 → API 연동 → 최종 디자인 적용까지, **완성 전 과정**과 `frontend_ver2`·`ver3` 등 버전 이력이 담긴 저장소 |

## 구조

| 폴더 | 설명 |
|------|------|
| `backend/` | Spring Boot API (기본 포트 `8090`) |
| `frontend/` | Next.js 앱 (기본 포트 `3000`) |

## 로컬 실행

### 백엔드

```bash
cd backend
./gradlew bootRun
```

Swagger: `http://localhost:8090/swagger-ui.html`

### 프론트엔드

```bash
cd frontend
npm install
cp .env.example .env.local   # 파일이 있으면 — API URL 확인
npm run dev
```

`frontend/.env.local` 예시:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
```

브라우저: `http://localhost:3000`

## 주요 기능

- AI 로고·유니폼·축구화·키퍼 글러브·스포츠 용품 시안 생성
- 내 디자인 저장 · 구경하기(공개) · 장바구니 · 주문
- 회원 배송지 · 주문 내역
