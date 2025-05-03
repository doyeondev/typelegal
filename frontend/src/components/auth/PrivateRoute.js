import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import userService from '../../services/userService';
import Spinner from '../ui/Spinner';

/**
 * 인증이 필요한 페이지를 보호하는 컴포넌트
 * 로그인되지 않은 사용자는 로그인 페이지로 리디렉션
 *
 * @param {Object} props 컴포넌트 프롭스
 * @param {React.ReactNode} props.children 자식 컴포넌트
 * @param {string} [props.redirectTo='/login'] 인증되지 않은 경우 리디렉션할 경로
 * @param {Object} [props.initialUserData] 초기 사용자 데이터
 * @returns {React.ReactNode} 인증된 경우 자식 컴포넌트, 미인증 시 로딩 화면
 */
export default function PrivateRoute({ children, redirectTo = '/login', initialUserData }) {
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState(null);
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	useEffect(() => {
		// 인증 상태 확인 함수
		async function checkAuth() {
			setIsCheckingAuth(true);

			try {
				// SSR에서 이미 인증 확인이 된 경우 (props로 initialUserData가 전달된 경우)
				if (initialUserData) {
					console.log('SSR에서 이미 인증됨, 클라이언트 측 인증 확인 건너뜀');
					setIsAuthenticated(true);
					setIsCheckingAuth(false);
					return;
				}

				// 로그인 상태 확인
				const isLoggedIn = userService.isLoggedIn();

				if (!isLoggedIn) {
					console.log('인증되지 않은 사용자 - 로그인 페이지로 리디렉션');

					// 현재 페이지 경로 저장 (로그인 후 리디렉션을 위해)
					const currentPath = router.asPath;
					sessionStorage.setItem('redirectAfterLogin', currentPath);

					// 로그인 페이지로 리디렉션
					router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
					return;
				}

				// 토큰이 유효한지 서버에 확인
				try {
					await userService.getCurrentUser();
					setIsAuthenticated(true);
				} catch (error) {
					console.error('사용자 정보 조회 실패:', error);

					// 인증 오류 (토큰 만료 등)
					if (error.status === 401 || error.status === 403) {
						// 인증 상태 초기화
						localStorage.removeItem('is_logged_in');
						sessionStorage.removeItem('member_key');

						// 현재 페이지 경로 저장
						const currentPath = router.asPath;
						sessionStorage.setItem('redirectAfterLogin', currentPath);

						// 로그인 페이지로 리디렉션 (토큰 만료 메시지 포함)
						router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}&tokenExpired=true`);
					} else {
						// 다른 오류는 인증 완료로 간주 (사용자 정보만 없는 경우)
						setIsAuthenticated(true);
					}
				}
			} catch (error) {
				console.error('인증 확인 중 오류 발생:', error);
				setIsAuthenticated(false);
			} finally {
				setIsCheckingAuth(false);
			}
		}

		// 로컬 저장소 접근은 클라이언트 사이드에서만 수행
		if (typeof window !== 'undefined') {
			checkAuth();
		} else {
			// 서버 사이드에서는 기본적으로 인증된 것으로 간주
			// (SSR에서는 getServerSideProps에서 인증 체크가 이미 이루어짐)
			setIsAuthenticated(true);
			setIsCheckingAuth(false);
		}
	}, [router, redirectTo, children, initialUserData]);

	// 인증 확인 중이면 로딩 화면 표시
	if (isCheckingAuth) {
		return (
			<div className="flex items-center justify-center h-screen">
				<Spinner />
			</div>
		);
	}

	// 인증되지 않았으면 null 반환 (리디렉션 처리 중)
	if (!isAuthenticated) {
		return null;
	}

	// 인증된 경우 자식 컴포넌트 렌더링
	return children;
}
