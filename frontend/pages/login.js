import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import userService from '../src/services/userService';
import { useRouter } from 'next/router';
import { useUser } from '../src/context/UserContext';
import PublicRoute from '../src/components/auth/PublicRoute';
// import LoginItem from '../components/login-item'

// 로그인 페이지 컴포넌트
function LoginPage() {
	const [loginError, setLoginError] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const router = useRouter();
	const { login } = useUser(); // 전역 사용자 컨텍스트 훅 사용

	useEffect(() => {
		// 테마 설정
		if (typeof window !== 'undefined') {
			localStorage.theme = 'light';
		}

		// URL 파라미터 확인
		const { tokenExpired, unauthorized, expired, error } = router.query;

		// 토큰 만료 또는 인증 오류 메시지 표시
		if (tokenExpired || expired) {
			setLoginError(true);
			setErrorMessage('세션이 만료되었습니다. 다시 로그인해주세요.');
		} else if (unauthorized) {
			setLoginError(true);
			setErrorMessage('로그인이 필요한 페이지입니다.');
		} else if (error === 'api') {
			setLoginError(true);
			setErrorMessage('서버 연결에 문제가 발생했습니다. 다시 시도해주세요.');
		} else if (error === 'unknown') {
			setLoginError(true);
			setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
		}
	}, [router.query]);

	const [input, setInput] = useState({
		userEmail: '',
		password: '',
	});

	const onInputChange = e => {
		const { name, value } = e.target;
		setInput(prev => ({
			...prev,
			[name]: value,
		}));
		setLoginError(false); // 입력 시 오류 상태 초기화
		setErrorMessage('');
	};

	// 엔터키 처리 함수 개선
	const handleKeyDown = e => {
		if (e.key === 'Enter') {
			e.preventDefault(); // 폼 기본 제출 방지
			onSubmit(e);
		}
	};

	const onSubmit = async e => {
		if (e) e.preventDefault();

		// 입력값 유효성 검사
		if (!input.userEmail || !input.password) {
			setLoginError(true);
			setErrorMessage('이메일과 비밀번호를 모두 입력해주세요.');
			return;
		}

		try {
			setDisabled(true);
			await loginAccount(input.userEmail, input.password);
		} catch (error) {
			console.error('로그인 오류:', error);
			setLoginError(true);

			// 에러 메시지 설정
			if (error.status === 401) {
				setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
			} else if (error.status === 403) {
				setErrorMessage(error.message || '서버에서 접근이 거부되었습니다. 관리자에게 문의하세요.');
			} else if (error.status === 429) {
				setErrorMessage('로그인 시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.');
			} else if (error.message) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
			}

			throw error;
		} finally {
			setDisabled(false);
		}
	};

	/**
	 * 로그인 처리 함수
	 * 백엔드 API를 사용하여 인증하고 HTTP-Only 쿠키로 JWT 토큰을 받습니다.
	 */
	async function loginAccount(email, password) {
		try {
			console.log('로그인 시도 중...');
			console.log('입력된 이메일:', email);

			// 직접 fetch로 요청하여 Content-Type 문제 해결
			const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/auth/login`;
			console.log('로그인 API URL:', apiUrl);

			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: email,
					password: password,
				}),
				credentials: 'include', // 쿠키 포함
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('로그인 실패 응답:', response.status, errorData);
				throw {
					status: response.status,
					message: errorData || '로그인에 실패했습니다.',
				};
			}

			const userData = await response.json();
			console.log('로그인 성공:', userData);

			if (!userData) {
				throw new Error('로그인은 성공했으나 사용자 정보를 받지 못했습니다.');
			}

			// 로그인 상태 저장
			localStorage.setItem('is_logged_in', 'true');
			sessionStorage.setItem('member_key', JSON.stringify(userData));

			// UserContext를 통해 전역 상태 업데이트
			login(userData);

			// 리디렉션 처리
			handleRedirectAfterLogin();
		} catch (error) {
			console.error('로그인 처리 오류:', error);
			setLoginError(true);

			// 에러 메시지 설정
			if (error.status === 401) {
				setErrorMessage('이메일 또는 비밀번호가 올바르지 않습니다.');
			} else if (error.status === 403) {
				setErrorMessage(error.message || '서버에서 접근이 거부되었습니다. 관리자에게 문의하세요.');
			} else if (error.status === 429) {
				setErrorMessage('로그인 시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요.');
			} else if (error.message) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
			}

			throw error;
		}
	}

	/**
	 * 로그인 후 리디렉션 처리
	 */
	function handleRedirectAfterLogin() {
		try {
			// URL 쿼리 파라미터에서 리디렉션 경로 확인
			const redirectParam = router.query.redirect;

			// 이전에 시도했던 페이지 또는 URL 쿼리에서 지정된 경로로 이동
			// 우선순위: 1. 쿼리 파라미터의 redirect 2. 세션에 저장된 경로 3. 대시보드
			let redirectPath = redirectParam || sessionStorage.getItem('redirectAfterLogin') || '/dashboard';

			// 유효한 경로인지 확인 (상대 경로여야 함)
			if (redirectPath.startsWith('http') || redirectPath.startsWith('//')) {
				console.warn('외부 URL로 리디렉션 시도 감지. 대시보드로 리디렉션합니다.');
				redirectPath = '/dashboard';
			}

			// 리디렉션 경로 로깅
			if (redirectParam) {
				console.log('쿼리 파라미터에서 리디렉션 경로 사용:', redirectParam);
			} else if (sessionStorage.getItem('redirectAfterLogin')) {
				console.log('세션 스토리지에서 리디렉션 경로 사용:', sessionStorage.getItem('redirectAfterLogin'));
			}

			console.log('로그인 후 리디렉션:', redirectPath);
			sessionStorage.removeItem('redirectAfterLogin'); // 사용 후 삭제

			// 리디렉션 수행
			router.push(redirectPath);
		} catch (error) {
			console.error('리디렉션 처리 중 오류 발생:', error);
			// 오류 발생 시 기본적으로 대시보드로 이동
			router.push('/dashboard');
		}
	}

	return (
		// <section className="bg-white dark:bg-gray-900 h-screen">
		// <LoginItem />
		// </section>
		<section className="bg-white dark:bg-gray-900">
			<Head>
				<title>타입리걸 | 로그인</title>
				<meta name="description" content="계약서 작성의 시작, 타입리걸 로그인하기" />
				<meta property="og:title" content="타입리걸 계정 로그인" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				{/* shadow */}
				<div className="w-full bg-white rounded-lg dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<Link href="/" className="flex place-content-center items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
							<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="w-[160px] p-2" />
						</Link>
						<h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-lg dark:text-white">로그인</h1>

						{/* 오류 메시지 표시 */}
						{loginError && (
							<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
								<span className="font-medium">오류:</span> {errorMessage || '이메일 또는 비밀번호가 일치하지 않습니다.'}
							</div>
						)}

						<form className="space-y-8" action="#">
							<div>
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									이메일
								</label>
								<input
									type="email"
									name="userEmail"
									id="email"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									placeholder="name@company.com"
									value={input.userEmail}
									onChange={onInputChange}
									onKeyDown={handleKeyDown}
									required=""
								/>
							</div>
							<div>
								<label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									비밀번호
								</label>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="••••••••"
									value={input.password}
									onChange={onInputChange}
									onKeyDown={handleKeyDown}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									required=""
								/>
							</div>
							{/* <div className="flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      aria-describedby="remember"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-purple-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-purple-600 dark:ring-offset-gray-800"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label for="remember" className="text-gray-500 dark:text-gray-300">
                      이메일 기억하기
                    </label>
                  </div>
                </div>
                <a href="/findpassword" className="text-sm font-medium text-purple-600 hover:underline dark:text-purple-500">
                  비밀번호를 잊으셨나요?
                </a>
              </div> */}
							<button
								id="loginBtn"
								type="button"
								onClick={onSubmit}
								disabled={disabled}
								className="w-full place-content-center cursor-pointer flex disabled:bg-purple-200 disabled:cursor-progress text-white bg-purple-500 hover:bg-purple-600 py-2.5 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800"
							>
								{disabled ? '로그인 중...' : '로그인'}
							</button>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								계정이 없으신가요?
								<Link href="/signup" className="ml-2 font-medium text-purple-600 hover:underline dark:text-purple-500">
									회원가입 하기
								</Link>
							</p>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}

// PublicRoute로 감싸서 이미 로그인한 사용자는 접근할 수 없도록 함
export default function Login() {
	return (
		<PublicRoute restricted={true} redirectTo="/dashboard">
			<LoginPage />
		</PublicRoute>
	);
}
