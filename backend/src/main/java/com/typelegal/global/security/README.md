# Security 패키지

이 패키지는 애플리케이션의 보안 관련 기능을 담당합니다.

## 주요 클래스

- `SecurityConfig`: Spring Security 설정
- `JwtConfig`: JWT 관련 설정 및 유틸리티
- `JwtAuthenticationFilter`: JWT 인증 필터
- `PasswordConfig`: 비밀번호 암호화 관련 설정

## 패키지 위치

`com.typelegal.global.security` 패키지는 보안이 인프라보다는 전역적인 관심사이므로 global 패키지 하위에 위치합니다.

## 참고사항

이 패키지의 클래스들은 다른 도메인 패키지들에서 공통으로 사용됩니다.

## 구조

```
com.typelegal.security/
├── JwtConfig.java              # JWT 토큰 생성 및 검증 설정
├── JwtAuthenticationFilter.java # JWT 인증 필터
└── SecurityConfig.java         # Spring Security 설정
```

## 주요 기능

- JWT 기반 인증 처리
- 사용자 인증 및 권한 관리
- CORS 설정 및 보안 관련 설정
- 인증이 필요한 엔드포인트 보호
