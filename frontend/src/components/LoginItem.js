import { useState, useEffect } from 'react';
// import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import userService from '../services/userService';

export default function LoginItem() {
	const [loginError, setLoginError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('이메일 혹은 비밀번호가 일치하지 않습니다');
	const [disabled, setDisabled] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';
		}
		getPageData();
	}, []);

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
	};

	const onSubmit = () => {
		console.log('로그인 시도:', input.userEmail);
		setDisabled(true);
		setLoading(true);
		let loginInfo = { email: input.userEmail, password: input.password };
		loginAccount(loginInfo);
	};

	async function loginAccount(userInfo) {
		try {
			console.log('userService 로그인 API 호출');
			const userData = await userService.login(userInfo);

			console.log('로그인 성공:', userData);

			// 페이지 새로고침
			window.location.href = '/dashboard';
		} catch (error) {
			console.error('로그인 처리 오류:', error);
			setErrorMessage(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
			setLoginError(true);
		} finally {
			setDisabled(false);
			setLoading(false);
		}
	}

	function press(e) {
		if (e.keyCode == 13) {
			onSubmit(); //javascript에서는 13이 enter키를 의미함
		}
	}
	return (
		<>
			<Head>
				<title>타입리걸</title>
				<meta name="description" content="계약서 작성의 시작, 타입리걸" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col h-full items-center justify-center px-6 py-8 mx-auto lg:py-0">
				<div className="w-full bg-white rounded-lg dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="px-6 pb-8 pt-4 space-y-4 md:space-y-6">
						{/* <Link href="/" className="flex place-content-center items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"> */}
						<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="mx-auto w-[160px] p-2" priority />
						{/* </Link> */}
						<h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-lg dark:text-white">로그인이 필요한 서비스입니다 🙂</h1>
						<form className="space-y-8" action="#">
							<div>
								<label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									이메일
								</label>
								<input
									type="email"
									name="userEmail"
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									placeholder="name@company.com"
									value={input.userEmail}
									onChange={function (event) {
										onInputChange(event);
										setLoginError(false);
										setDisabled(false);
									}}
									onKeyDown={press}
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
									onChange={function (event) {
										onInputChange(event);
										setLoginError(false);
										setDisabled(false);
									}}
									onKeyDown={press}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									required=""
								/>
							</div>
							<button
								id="loginBtn"
								type="button"
								onClick={onSubmit}
								disabled={disabled}
								className="disabled:bg-purple-200 disabled:cursor-progress w-full place-content-center cursor-pointer flex text-white bg-purple-500 hover:bg-purple-600 py-2.5 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800"
							>
								{loading ? '로그인 중...' : '로그인'}
							</button>

							{/* <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ​계정이 없다면 바로 가입하세요!
                <Link href="/signup" className="ml-2 font-medium text-purple-600 hover:underline dark:text-purple-500">
                  무료 회원가입 하기
                </Link>
              </p> */}
						</form>
						{loginError && <p className="text-sm text-red-500 text-center">{errorMessage}</p>}
					</div>
				</div>
			</div>
		</>
	);
}
