# TypeLegal 프론트엔드

<div align="center">
  <img src="public/images/typelegal_logo.png" alt="TypeLegal 로고" width="150" />
  <p>Next.js 기반 TypeLegal 서비스의 프론트엔드</p>
</div>

## 🚀 소개

TypeLegal 프론트엔드는 Next.js를 기반으로 한 현대적이고 반응형 웹 애플리케이션입니다. 사용자들이 법률 지식 없이도 쉽게 계약서를 작성할 수 있도록 직관적인 UI/UX를 제공합니다.

## 📋 주요 기능

- **Q&A 기반 인터페이스**: 사용자 친화적인 질문-답변 방식 계약서 작성
- **실시간 미리보기**: 작성 중인 계약서를 실시간으로 확인
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **다국어 지원**: 한국어/영어 인터페이스
- **대시보드**: 사용자별 계약서 관리 페이지
- **계약서 내보내기**: PDF/Word 형식으로 변환 및 다운로드

## 💻 기술 스택

- **Next.js**: React 기반 프레임워크
- **React**: UI 컴포넌트 구축
- **TypeScript**: 타입 안전성 보장
- **TailwindCSS**: 유틸리티 기반 CSS 프레임워크
- **Material UI**: React UI 라이브러리
- **SWR**: 데이터 페칭 및 캐싱
- **Jest & Playwright**: 테스트 자동화

## 🛠️ 개발 환경 설정

### 요구 사항

- Node.js 18.x 이상
- npm 9.x 이상 또는 yarn 1.22.x 이상

### 설치 방법

1. 저장소 클론 (루트 디렉토리에서 이미 클론했다면 생략)

```bash
git clone https://github.com/yourusername/typelegal.git
cd typelegal/frontend
```

2. 의존성 설치

```bash
npm install
# 또는
yarn
```

3. 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 편집해 필요한 환경 변수를 설정하세요
```

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 개발 서버를 확인할 수 있습니다.

## 📚 프로젝트 구조

```
frontend/
├── components/         # 재사용 UI 컴포넌트
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── common/         # 공통 컴포넌트 (버튼, 입력 필드 등)
│   ├── contract/       # 계약서 관련 컴포넌트
│   └── layout/         # 레이아웃 컴포넌트
├── config/             # 애플리케이션 설정
├── lib/                # 유틸리티 및 헬퍼 함수
├── pages/              # 페이지 컴포넌트
│   ├── api/            # API 라우트
│   ├── dashboard/      # 대시보드 페이지
│   └── draft/          # 계약서 작성 페이지
├── public/             # 정적 리소스
│   ├── images/         # 이미지 파일
│   └── fonts/          # 폰트 파일
├── styles/             # 글로벌 스타일
├── utils/              # 유틸리티 함수
└── tests/              # 테스트 파일
```

## 🧪 테스트

### 유닛 테스트 실행

```bash
npm test
# 또는
yarn test
```

### 특정 테스트 실행

```bash
npm test -- -t "test name"
# 또는
yarn test -t "test name"
```

### E2E 테스트 실행

```bash
npm run test:e2e
# 또는
yarn test:e2e
```

### 테스트 커버리지 보고서 생성

```bash
npm run test:coverage
# 또는
yarn test:coverage
```

## 📦 빌드

프로덕션용 빌드를 생성하려면:

```bash
npm run build
# 또는
yarn build
```

빌드된 애플리케이션 실행:

```bash
npm start
# 또는
yarn start
```

## 🔍 코드 품질

### 린트 실행

```bash
npm run lint
# 또는
yarn lint
```

### 린트 자동 수정 실행

```bash
npm run lint -- --fix
# 또는
yarn lint --fix
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 공개됩니다.

## 📮 문의

질문이나 피드백이 있으시면 [hello@typelegal.io](mailto:hello@typelegal.io)로 연락주세요.
