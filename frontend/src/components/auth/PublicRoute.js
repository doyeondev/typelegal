import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import userService from '../../services/userService';
import Spinner from '../ui/Spinner';

/**
 * 로그인하지 않은 사용자만 접근할 수 있는 페이지를 위한 컴포넌트 (로그인, 회원가입 등)
 * 이미 인증된 사용자는 대시보드 또는 지정된 경로로 리디렉션
 *
 * @param {Object} props 컴포넌트 프롭스
 * @param {React.ReactNode} props.children 자식 컴포넌트
 * @param {boolean} [props.restricted=false] true면 인증된 사용자 접근 제한(로그인/회원가입), false면 모두 접근 가능
 * @param {string} [props.redirectTo='/dashboard'] 인증된 사용자가 리디렉션될 경로
 * @returns {React.ReactNode} 조건에 맞는 경우 자식 컴포넌트
 */
export default function PublicRoute({ children, restricted = false, redirectTo = '/dashboard' }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(true);
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		// 인증 상태 확인
		function checkAuthStatus() {
			setIsLoading(true);
			try {
				// 로그인 상태 확인
				const isLoggedIn = userService.isLoggedIn();

				// 제한된 페이지(로그인/회원가입)에 이미 로그인한 사용자가 접근하는 경우
				if (isLoggedIn && restricted) {
					console.log('이미 인증된 사용자 - 대시보드로 리디렉션');

					// 현재 경로가 이미 리다이렉트 목적지인 경우 리다이렉트를 수행하지 않음
					if (router.pathname === redirectTo) {
						console.log('이미 목적지에 있습니다. 리다이렉트 건너뜀');
						setShouldRender(false);
						setIsLoading(false);
						return;
					}

					// redirect 쿼리 파라미터가 있는 경우 해당 경로로 리디렉션
					// (로그인 후 이동할 페이지가 지정된 경우)
					const redirectParam = router.query.redirect;
					const redirectPath = redirectParam || redirectTo;

					// URL이 외부 URL인지 확인 (보안)
					if (redirectParam && (redirectParam.startsWith('http') || redirectParam.startsWith('//'))) {
						console.warn('외부 URL로 리디렉션 시도 감지. 대시보드로 리디렉션합니다.');
						router.replace(redirectTo);
					} else {
						// replace를 사용하여 브라우저 히스토리에 현재 페이지를 남기지 않음
						router.replace(redirectPath);
					}
					return;
				}

				// 인증되지 않은 사용자 또는 제한되지 않은 페이지
				setShouldRender(true);
			} catch (error) {
				console.error('인증 상태 확인 중 오류 발생:', error);
				// 오류 발생 시 안전하게 렌더링 허용 (대부분의 경우 비인증 상태)
				setShouldRender(true);
			} finally {
				setIsLoading(false);
			}
		}

		// 로컬 저장소 접근은 클라이언트 사이드에서만 수행
		if (typeof window !== 'undefined') {
			checkAuthStatus();
		} else {
			// 서버 사이드에서는 기본적으로 렌더링 허용
			setShouldRender(true);
			setIsLoading(false);
		}
	}, [router, restricted, redirectTo]);

	// 로딩 중이면 스피너 표시
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Spinner />
			</div>
		);
	}

	// 렌더링 조건에 맞는 경우 자식 컴포넌트 반환
	return shouldRender ? children : null;
}
