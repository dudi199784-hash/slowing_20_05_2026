# SLOWIND

맞춤 유니폼·로고·스포츠 용품 AI 시안 제작 서비스 (제출·배포용 레포지토리)

## 구조

| 폴더 | 설명 |
|------|------|
| `backend/` | Spring Boot API (기본 포트 `8090`) |
| `frontend/` | Next.js 앱 (기본 포트 `3000`) |

개발 과정·이전 프론트 버전(`frontend_ver2` 등)은 포트폴리오용 레포에서 확인할 수 있습니다.  
→ [chunchunhee_slowind_2026](https://github.com/dudi199784-hash/chunchunhee_slowind_2026)

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
