import { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';

// 사용자 컨텍스트 생성
const UserContext = createContext(null);

/**
 * 사용자 정보 제공자 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.initialUserData - 서버에서 초기화된 사용자 정보
 * @param {ReactNode} props.children - 자식 컴포넌트
 */
export function UserProvider({ initialUserData, children }) {
	// 서버에서 받은 초기 사용자 정보 또는 null로 상태 초기화
	const [user, setUser] = useState(initialUserData || null);
	const [isLoading, setIsLoading] = useState(!initialUserData);

	// 초기 마운트 시 사용자 정보 로드 (서버에서 받지 못한 경우)
	useEffect(() => {
		if (!user) {
			loadUserFromServer();
		}
	}, [user]);

	// 세션 스토리지 변경 감지 및 주기적 인증 상태 확인
	useEffect(() => {
		// 다른 탭/윈도우에서 세션 스토리지 변경 시 동기화
		const handleStorageChange = () => {
			loadUserFromStorage();
		};

		// 로그인 상태 확인 주기적으로 수행 (서버 API 호출)
		const checkLoginStatus = async () => {
			try {
				// 서버에 실제 인증 상태 확인
				let isAuthenticated = false;
				try {
					// 로그인 상태 확인 시에도 에러 로깅 스킵
					const userData = await userService.getCurrentUser({ skipErrorLogging: true });
					isAuthenticated = !!userData && !!userData.email;
				} catch (error) {
					// 401 에러는 정상적으로 인증되지 않은 상태임
					if (error.status === 401) {
						console.log('서버 확인: 인증되지 않은 상태');
					} else {
						console.error('인증 상태 확인 중 예상치 못한 오류:', error);
					}
					isAuthenticated = false;
				}

				// 로컬 로그인 상태와 서버 인증 상태가 불일치하는 경우
				const localLoginState = userService.isLoggedIn();

				// 서버 인증은 되어 있는데 로컬 상태가 없는 경우 - 상태 복구
				if (isAuthenticated && !localLoginState) {
					console.log('서버 인증은 유효하나 로컬 상태 누락: 세션 복구');
					loadUserFromServer();
				}
				// 서버 인증은 안 되어 있는데 로컬 상태가 있는 경우 - 로그아웃
				else if (!isAuthenticated && localLoginState) {
					console.log('서버 인증 만료: 로그아웃 처리');
					logout();
				}
			} catch (error) {
				console.error('인증 상태 확인 오류:', error);
				// 오류 발생 시 기존 로직 (로컬 스토리지 기반) 실행
				const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
				const hasUserData = !!sessionStorage.getItem('member_key');

				if (isLoggedIn && !hasUserData) {
					console.log('로그인 상태 불일치 감지: 세션 복구 시도');
					loadUserFromStorage();
				} else if (!isLoggedIn && hasUserData) {
					console.log('로그인 상태 불일치 감지: 세션 정리');
					logout();
				}
			}
		};

		window.addEventListener('storage', handleStorageChange);

		// 30초마다 서버 인증 상태 확인
		const intervalId = setInterval(checkLoginStatus, 30000);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			clearInterval(intervalId);
		};
	}, []);

	/**
	 * 서버에서 사용자 정보 로드 (API 호출)
	 */
	const loadUserFromServer = async () => {
		setIsLoading(true);
		try {
			// 서버에서 현재 사용자 정보 가져오기
			let userData = null;
			try {
				// 에러 로깅 스킵 옵션 추가
				userData = await userService.getCurrentUser({ skipErrorLogging: true });
			} catch (error) {
				// 401 에러는 정상적인 경우이므로 조용히 처리
				if (error.status === 401) {
					console.log('인증 필요: 로그인 상태가 아님');
					setUser(null);
					clearAuthState();
					setIsLoading(false);
					return;
				} else {
					// 다른 오류는 기록
					console.error('사용자 정보 API 호출 오류:', error);
				}
				userData = null;
			}

			if (userData && userData.email) {
				console.log('서버에서 사용자 정보 로드됨:', userData.email);
				setUser(userData);

				// 로컬 상태 업데이트
				localStorage.setItem('is_logged_in', 'true');
				sessionStorage.setItem('member_key', JSON.stringify(userData));
			} else {
				console.log('서버에서 유효한 사용자 정보가 반환되지 않음');
				setUser(null);
				clearAuthState();
			}
		} catch (error) {
			console.error('서버에서 사용자 정보 로드 실패:', error);
			setUser(null);
			clearAuthState();
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * 로컬 스토리지/세션 스토리지에서 사용자 정보 로드
	 * 서버 인증이 실패한 경우 폴백으로 사용
	 */
	const loadUserFromStorage = () => {
		setIsLoading(true);
		try {
			// 로그인 상태 확인
			const isUserLoggedIn = localStorage.getItem('is_logged_in') === 'true';

			// 세션 스토리지에서 사용자 정보 가져오기
			const storedUser = sessionStorage.getItem('member_key');

			if (storedUser && isUserLoggedIn) {
				const parsedUser = JSON.parse(storedUser);
				setUser(parsedUser);
				console.log('스토리지에서 사용자 정보 로드됨:', parsedUser.email);
			} else {
				if (!isUserLoggedIn && storedUser) {
					console.log('로그인 상태는 false인데 사용자 정보가 있음. 세션 정리');
					sessionStorage.removeItem('member_key');
				} else if (isUserLoggedIn && !storedUser) {
					console.log('로그인 상태는 true인데 사용자 정보가 없음. 서버에서 확인 시도');
					loadUserFromServer();
					return;
				} else {
					console.log('스토리지에 사용자 정보 없음');
				}
				setUser(null);
			}
		} catch (error) {
			console.error('사용자 정보 로딩 오류:', error);
			setUser(null);
			clearAuthState();
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * 인증 상태 초기화 헬퍼 함수
	 */
	const clearAuthState = () => {
		localStorage.removeItem('is_logged_in');
		sessionStorage.removeItem('member_key');
	};

	/**
	 * 사용자 로그인 처리
	 * @param {Object} userData - 로그인한 사용자 정보
	 */
	const login = userData => {
		if (!userData) {
			console.error('로그인 오류: 사용자 데이터가 없습니다.');
			return;
		}

		setUser(userData);
		// 로그인 상태 설정
		localStorage.setItem('is_logged_in', 'true');

		// 세션 스토리지에 사용자 정보 저장
		try {
			sessionStorage.setItem('member_key', JSON.stringify(userData));
			console.log('로그인 성공: 사용자 정보 저장됨');
		} catch (error) {
			console.error('사용자 정보 저장 오류:', error);
		}
	};

	/**
	 * 사용자 로그아웃 처리
	 * 서버 로그아웃 API 호출 및 클라이언트 상태 정리
	 */
	const logout = async () => {
		console.log('로그아웃 처리 시작');

		try {
			// 서버에 로그아웃 요청 (API에 구현되어 있다면)
			await userService.logout();
		} catch (error) {
			console.error('서버 로그아웃 처리 오류:', error);
		}

		// 상태 및 로컬 스토리지 정리
		setUser(null);
		clearAuthState();

		console.log('로그아웃 완료');
	};

	/**
	 * 사용자 정보 업데이트
	 * @param {Object} updates - 업데이트할 사용자 정보 필드
	 */
	const updateUser = updates => {
		if (!user) return;

		const updatedUser = { ...user, ...updates };
		setUser(updatedUser);

		// 세션 스토리지 업데이트
		try {
			sessionStorage.setItem('member_key', JSON.stringify(updatedUser));
		} catch (error) {
			console.error('사용자 정보 업데이트 오류:', error);
		}
	};

	// 컨텍스트 값 정의
	const value = {
		user,
		isLoading,
		isAuthenticated: !!user,
		login,
		logout,
		updateUser,
		loadUserFromServer,
		loadUserFromStorage,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * 사용자 컨텍스트 사용 훅
 * @returns {Object} 사용자 컨텍스트 값
 */
export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}

export default UserContext;
