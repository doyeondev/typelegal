-- 테스트 데이터 초기화
DELETE FROM questions WHERE id IS NOT NULL;

-- 테스트 데이터 삽입
INSERT INTO questions (id, c_id, binding_key, question_type, placeholder, output_type, is_default, is_fixed, m_idx, q_idx, title, question_category, question_title_ko)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'contract_type', 'contract_type', 'dropdown', '계약 유형을 선택하세요', 'string', true, true, 1, 1, 'Contract Type', 'basic', '계약 유형'),
  ('00000000-0000-0000-0000-000000000002', 'contract_date', 'contract_date', 'date', '계약 날짜를 입력하세요', 'date', true, false, 1, 2, 'Contract Date', 'basic', '계약 날짜'),
  ('00000000-0000-0000-0000-000000000003', 'contract_term', 'contract_term', 'number', '계약 기간을 입력하세요', 'number', false, false, 1, 3, 'Contract Term', 'basic', '계약 기간'),
  ('00000000-0000-0000-0000-000000000004', 'contract_type_standard', 'contract_type_standard', 'radio', '표준 계약서 유형을 선택하세요', 'string', false, false, 2, 1, 'Standard Contract Type', 'advanced', '표준 계약서 유형'),
  ('00000000-0000-0000-0000-000000000005', 'payment_type', 'payment_type', 'dropdown', '지급 방식을 선택하세요', 'string', true, false, 2, 2, 'Payment Type', 'payment', '지급 방식'); 