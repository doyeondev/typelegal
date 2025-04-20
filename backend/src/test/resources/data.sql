-- 테스트 사용자 데이터
INSERT INTO users (id, email, password, name, role, created_at, updated_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'test@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Test User', 'ROLE_USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000002', 'admin@example.com', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KsnmG', 'Admin User', 'ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 질문 데이터
INSERT INTO question (id, title, description, created_at, updated_at, status, priority, binding_cidx, created_by)
VALUES 
('2659d665-c2c2-4d7e-aa99-aae0a7c22031', '첫 번째 질문', '첫 번째 질문 설명', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE', 1, 'binding-cidx-1', 'test@example.com'),
('00000000-0000-0000-0000-000000000001', '두 번째 질문', '두 번째 질문 설명', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE', 2, 'binding-cidx-2', 'test@example.com');

-- 테스트 계약 조항 데이터
INSERT INTO clause (id, title, content, category, created_at, updated_at, status)
VALUES 
('00000000-0000-0000-0000-000000000001', '기밀유지 조항', '모든 당사자는 비밀을 유지해야 합니다...', '일반', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE'),
('00000000-0000-0000-0000-000000000002', '계약 해지 조항', '이 계약은 다음과 같은 경우에 해지될 수 있습니다...', '특별', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE'),
('00000000-0000-0000-0000-000000000003', '분쟁 해결 조항', '계약과 관련된 모든 분쟁은...', '일반', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ACTIVE'); 