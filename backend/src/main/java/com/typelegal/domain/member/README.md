# Member 도메인

회원 관련 기능을 담당하는 도메인입니다.

## 패키지 구조

```
com.typelegal.domain.member
├── api
│   └── 컨트롤러 클래스들
├── application
│   └── 서비스 클래스들
├── domain
│   └── 엔티티 클래스들
├── dto
│   └── 데이터 전송 객체들
├── dao
│   └── 리포지토리 클래스들
└── exception
    └── 예외 클래스들
```

## 주요 클래스

- `Member`: 회원 엔티티
- `MemberService`: 회원 비즈니스 로직
- `MemberController`: 회원 API 엔드포인트

## 패키지 위치

`com.typelegal.domain.member` 패키지는 DDD 기반 구조에 따라 도메인 계층의 member 도메인으로 정의되었습니다.
