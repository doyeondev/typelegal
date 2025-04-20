-- 테스트용 스키마 정의
-- questions 테이블 생성 (H2 DB 용)

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    c_id VARCHAR(255) NOT NULL,
    binding_key VARCHAR(255),
    question_type VARCHAR(50) NOT NULL,
    placeholder TEXT,
    output_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    is_fixed BOOLEAN DEFAULT FALSE,
    m_idx INTEGER,
    q_idx INTEGER,
    title VARCHAR(255),
    question_category VARCHAR(100),
    question_title_ko VARCHAR(255),
    binding_cidx VARCHAR(255),         -- 문자열로 처리 (H2에서는 JSONB 지원X)
    binding_parent VARCHAR(255),
    binding_trigger VARCHAR(255),      -- 문자열로 처리 (H2에서는 JSONB 지원X)
    options_backup VARCHAR(1000),      -- 문자열로 처리 (H2에서는 JSONB 지원X)
    binding_question_ko VARCHAR(255),
    question_title_tag VARCHAR(255),
    question_tip VARCHAR(255),
    question_guide VARCHAR(255)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_questions_cid ON questions (c_id); 

-- H2 테스트용 데이터베이스 스키마 정의

-- 질문 테이블 (domain/question/domain/Question.java 엔티티용)
CREATE TABLE IF NOT EXISTS question (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    status VARCHAR(50),
    priority INT,
    binding_cidx VARCHAR(255),
    created_by VARCHAR(100)
);

-- 계약 조항 테이블
CREATE TABLE IF NOT EXISTS clause (
    id UUID PRIMARY KEY, 
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    status VARCHAR(50)
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP
);

-- 드래프트 테이블
CREATE TABLE IF NOT EXISTS draft (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 