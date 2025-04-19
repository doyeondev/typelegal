/**
 * 인증 토큰을 확인하고 필요시 재설정하는 함수
 * @returns {boolean} 토큰이 재설정되었는지 여부
 */
export function resetAuthToken() {
	console.log('인증 토큰 재설정 시도');
	// 토큰 확인
	const token = localStorage.getItem('auth_token');
	if (!token) {
		// 임시 토큰 발급 (익명 사용자용)
		console.log('토큰이 없음 - 임시 토큰 발급');
		localStorage.setItem('auth_token', 'anonymous_token_' + Date.now());
		return true;
	}
	return false;
}
