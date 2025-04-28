/**
 * 현재 로그인한 사용자 정보를 조회하는 API 라우트
 * 백엔드 서버의 /api/auth/me 엔드포인트로 요청을 프록시합니다.
 */

import { getAuthHeaders } from '../services/httpClient';

// 백엔드 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default async function handler(req, res) {
	// GET 요청만 허용
	if (req.method !== 'GET') {
		return res.status(405).json({ message: '허용되지 않는 메서드입니다.' });
	}

	try {
		// 쿠키 및 인증 헤더 설정
		const headers = {
			'Content-Type': 'application/json',
			Cookie: req.headers.cookie || '',
		};

		// 백엔드 API로 요청 전달
		const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
			method: 'GET',
			headers,
			credentials: 'include',
		});

		// 응답 상태 코드와 내용 가져오기
		const data = await response.json();

		// 백엔드 응답을 클라이언트에 그대로 전달
		res.status(response.status).json(data);
	} catch (error) {
		console.error('사용자 정보 조회 실패:', error);
		res.status(500).json({
			message: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
			error: error.message,
		});
	}
}
