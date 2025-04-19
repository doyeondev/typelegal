# TypeLegal 백엔드

<div align="center">
  <img src="../frontend/public/images/typelegal_logo.png" alt="TypeLegal 로고" width="150" />
  <p>Spring Boot 기반 TypeLegal 서비스의 백엔드</p>
</div>

## 🚀 소개

TypeLegal 백엔드는 Spring Boot 기반의 RESTful API 서버로, 계약서 템플릿 관리, 사용자 인증, 데이터 저장 등 TypeLegal 서비스의 핵심 기능을 제공합니다. PostgreSQL 데이터베이스와 JPA를 활용하여 효율적인 데이터 관리 시스템을 구현했습니다.

## 📋 주요 기능

- **인증 및 권한 관리**: JWT 기반 보안 인증 시스템
- **계약서 템플릿 관리**: JSON 기반 동적 템플릿 처리
- **사용자 데이터 관리**: 계정 및 계약 데이터 관리
- **계약서 생성 엔진**: 사용자 응답에 따른 동적 계약서 생성
- **API 엔드포인트**: 프론트엔드와 통신하는 RESTful API

## 💻 기술 스택

- **Spring Boot**: 자바 기반 백엔드 프레임워크
- **Spring Security**: 인증 및 권한 관리
- **Spring Data JPA**: 데이터베이스 접근 계층
- **PostgreSQL**: 관계형 데이터베이스
- **JSONB**: 계약서 템플릿 및 질문 데이터 저장
- **JWT**: 토큰 기반 인증
- **Maven**: 의존성 관리
- **Docker**: 컨테이너화 및 배포
- **JUnit & Mockito**: 테스트 자동화

## 🛠️ 개발 환경 설정

### 요구 사항

- Java 17 이상
- Maven 3.8 이상
- PostgreSQL 14 이상
- Docker (선택사항)

### 설치 방법

1. 저장소 클론 (루트 디렉토리에서 이미 클론했다면 생략)

```bash
git clone https://github.com/yourusername/typelegal.git
cd typelegal/backend
```

2. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집해 필요한 환경 변수를 설정하세요
```

3. PostgreSQL 데이터베이스 설정

```bash
# PostgreSQL이 실행 중인지 확인하고, 필요한 데이터베이스를 생성하세요
createdb typelegal
```

4. 애플리케이션 빌드

```bash
./mvnw clean install
```

### 서버 실행

```bash
./mvnw spring-boot:run
```

API 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

## 📚 프로젝트 구조

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/typelegal/
│   │   │   ├── domain/         # 도메인 계층 (DDD 기반 구조)
│   │   │   │   ├── member/     # 회원 도메인
│   │   │   │   │   ├── api/          # 컨트롤러 (외부 요청 처리)
│   │   │   │   │   ├── application/  # 서비스 (비즈니스 로직)
│   │   │   │   │   ├── domain/       # 엔티티 (도메인 모델)
│   │   │   │   │   ├── dto/          # 데이터 전송 객체
│   │   │   │   │   ├── dao/          # 데이터 접근 객체 (리포지토리)
│   │   │   │   │   └── exception/    # 도메인별 예외 처리
│   │   │   │   ├── template/    # 계약서 템플릿 도메인
│   │   │   │   ├── question/    # 질문 도메인
│   │   │   │   ├── clause/      # 계약 조항 도메인
│   │   │   │   └── drafting/    # 계약서 작성 도메인
│   │   │   ├── global/          # 공통 기능
│   │   │   │   ├── auth/        # 인증 관련 기능
│   │   │   │   ├── config/      # 전역 설정
│   │   │   │   ├── security/    # 보안 설정
│   │   │   │   ├── error/       # 전역 예외 처리
│   │   │   │   ├── common/      # 공통 유틸리티
│   │   │   │   └── util/        # 유틸리티 함수
│   │   │   ├── infra/           # 외부 인프라 계층
│   │   │   │   ├── email/       # 이메일 송신 인프라
│   │   │   │   └── log/         # 로깅 인프라
│   │   │   └── BackendApplication.java  # 메인 애플리케이션 클래스
│   │   └── resources/
│   │       ├── application.properties  # 애플리케이션 설정
│   │       └── templates/       # 이메일 템플릿 등
│   └── test/                    # 테스트 코드
├── pom.xml                      # Maven 설정 및 의존성
└── docker-compose.yml           # Docker 컴포즈 설정
```

### 패키지 구조 설명

TypeLegal 백엔드는 도메인 주도 설계(DDD) 패턴을 기반으로 구성되어 있습니다:

- **Domain Layer**: 비즈니스 도메인별로 독립적인 패키지 구조

  - 각 도메인은 api, application, domain, dto, dao, exception 등의 하위 패키지로 구성
  - 도메인 간 의존성 최소화로 유지보수성과 확장성 향상

- **Global Layer**: 도메인 간 공유되는 공통 기능

  - 인증, 보안, 예외 처리, 공통 유틸리티 등을 포함

- **Infrastructure Layer**: 외부 시스템과의 연동
  - 이메일, 로깅, 외부 API 연동 등의 인프라 관련 기능

이러한 구조는 각 도메인의 경계를 명확하게 하여 변경 영향 범위를 최소화하고,
확장성과 유지보수성을 높이는 데 기여합니다.

## 🧪 테스트

### 단위 테스트 실행

```bash
./mvnw test
```

### 통합 테스트 실행

```bash
./mvnw verify
```

### 테스트 커버리지 보고서 생성

```bash
./mvnw test jacoco:report
```

### Docker 환경에서 테스트

```bash
docker-compose -f docker-compose-test.yml up
```

## 📦 빌드 및 배포

### JAR 파일 생성

```bash
./mvnw clean package
```

### Docker 이미지 빌드

```bash
docker build -t typelegal-backend .
```

### Docker로 실행

```bash
docker-compose up
```

## 📝 API 문서

API 문서는 Swagger를 통해 제공됩니다. 서버 실행 후 다음 URL에서 확인할 수 있습니다:

```
http://localhost:8080/swagger-ui.html
```

### 주요 API 엔드포인트

| 경로                  | 메소드 | 설명                    |
| --------------------- | ------ | ----------------------- |
| `/api/auth/signup`    | POST   | 회원가입                |
| `/api/auth/login`     | POST   | 로그인                  |
| `/api/templates`      | GET    | 계약서 템플릿 목록 조회 |
| `/api/templates/{id}` | GET    | 특정 템플릿 조회        |
| `/api/contracts`      | POST   | 계약서 생성             |
| `/api/contracts/{id}` | GET    | 특정 계약서 조회        |
| `/api/user/dashboard` | GET    | 사용자 대시보드 데이터  |

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 공개됩니다.

## 📮 문의

기술적인 질문이나 피드백이 있으시면 [dev@typelegal.io](mailto:dev@typelegal.io)로 연락주세요.
