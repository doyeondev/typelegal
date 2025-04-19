import { useState, useEffect } from 'react';
import { EMAIL_REGEX_VALIDATION, PASSWORD_REGEX_VALIDATION, PHONE_REGEX_VALIDATION } from '../lib/lib';
// import React from 'react'
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import memberApi from './api/services/memberApi'; // 경로 수정
import { useRouter } from 'next/router';

// registered : true
// submittedSurvey : true 반영하기

export default function SignUp() {
	// 입력값 상태 관리
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	// 폼 상태 관리
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	// 이메일 중복 체크 상태
	const [isEmailChecked, setIsEmailChecked] = useState(false);
	const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);

	// 필드별 에러 메시지 상태
	const [errors, setErrors] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const router = useRouter();

	// 모든 필드 유효성 검사 함수
	const validateFields = () => {
		let isValid = true;
		const newErrors = {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		};

		// 이름 검증
		if (!name.trim()) {
			newErrors.name = '이름을 입력해주세요.';
			isValid = false;
		}

		// 이메일 검증
		if (!email.trim()) {
			newErrors.email = '이메일을 입력해주세요.';
			isValid = false;
		} else if (!EMAIL_REGEX_VALIDATION.test(email)) {
			newErrors.email = '올바른 이메일 형식이 아닙니다.';
			isValid = false;
		} else if (isEmailDuplicate) {
			newErrors.email = '이미 등록된 이메일입니다.';
			isValid = false;
		}

		// 비밀번호 검증
		if (!password) {
			newErrors.password = '비밀번호를 입력해주세요.';
			isValid = false;
		} else if (!PASSWORD_REGEX_VALIDATION.test(password)) {
			newErrors.password = '영문, 숫자, 특수문자 혼용 8자 이상 입력해주세요.';
			isValid = false;
		}

		// 비밀번호 확인 검증
		if (!confirmPassword) {
			newErrors.confirmPassword = '비밀번호를 확인해주세요.';
			isValid = false;
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
			isValid = false;
		}

		setErrors(newErrors);
		return isValid;
	};

	// 이메일 입력 필드 변경 핸들러
	const handleEmailChange = async e => {
		const value = e.target.value;
		setEmail(value);
		setIsEmailChecked(false); // 이메일이 변경되면 체크 상태 초기화
		setIsEmailDuplicate(false); // 중복 상태 초기화
		setErrorMsg(''); // 글로벌 에러 메시지 초기화

		// 이메일 형식이 올바른 경우에만 유효성 검사 수행
		if (EMAIL_REGEX_VALIDATION.test(value)) {
			const newErrors = { ...errors };
			newErrors.email = '';
			setErrors(newErrors);
		}
	};

	// 입력값 변경 핸들러
	const handleChange = (e, setter) => {
		const { value } = e.target;
		setter(value);
		setErrorMsg(''); // 글로벌 에러 메시지 초기화
	};

	// 이메일 중복 체크 함수
	const checkEmailDuplicate = async () => {
		if (!email || !EMAIL_REGEX_VALIDATION.test(email)) {
			const newErrors = { ...errors };
			newErrors.email = '올바른 이메일 형식을 입력해주세요.';
			setErrors(newErrors);
			return;
		}

		try {
			setLoading(true);
			console.log('이메일 중복 체크 중...');

			// 전용 이메일 중복 확인 API 사용
			await memberApi.checkEmailDuplicate(email);

			// 중복 체크 통과
			setIsEmailChecked(true);
			setIsEmailDuplicate(false);
			const newErrors = { ...errors };
			newErrors.email = '';
			setErrors(newErrors);

			console.log('이메일 사용 가능');
			setErrorMsg('사용 가능한 이메일입니다.');
		} catch (error) {
			console.error('이메일 중복 체크 오류:', error);

			// 이메일 중복 오류 (409)
			if (error.status === 409) {
				setIsEmailDuplicate(true);
				const newErrors = { ...errors };
				newErrors.email = '이미 등록된 이메일입니다.';
				setErrors(newErrors);
				setErrorMsg('이미 등록된 이메일입니다.');
			} else {
				setErrorMsg(error.message || '이메일 중복 확인 중 오류가 발생했습니다.');
			}
		} finally {
			setLoading(false);
		}
	};

	// 회원가입 제출 처리
	const onSubmit = async e => {
		e.preventDefault();

		// 필드 유효성 검사
		if (!validateFields()) {
			return;
		}

		try {
			setLoading(true);
			console.log('회원가입 처리 중...');

			// 회원가입 요청
			const response = await memberApi.register({
				name,
				email,
				password,
			});

			console.log('회원가입 성공:', response);

			// 회원가입 성공 처리
			setSuccess(true);
			setErrorMsg('');

			// 로그인 페이지로 리다이렉트 (3초 후)
			setTimeout(() => {
				router.push('/login');
			}, 3000);
		} catch (error) {
			console.error('회원가입 오류:', error);

			// 이메일 중복 오류
			if (error.status === 409) {
				setIsEmailDuplicate(true);
				const newErrors = { ...errors };
				newErrors.email = '이미 등록된 이메일입니다.';
				setErrors(newErrors);
				setErrorMsg('이미 등록된 이메일입니다.');
			} else {
				setErrorMsg(error.message || '회원가입 처리 중 오류가 발생했습니다.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<Head>
				<title>타입리걸</title>
				<meta name="description" content="계약서 작성의 시작, 타입리걸" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
				<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<Link href="/" className="flex place-content-center items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
							<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="w-[160px] p-2" />
						</Link>
						<h1 className="text-md font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white text-center">타입리걸 계정 만들기</h1>

						{/* 성공 메시지 */}
						{success && (
							<div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
								<span className="font-medium">회원가입이 완료되었습니다!</span> 곧 로그인 페이지로 이동합니다.
							</div>
						)}

						{/* 오류 메시지 */}
						{errorMsg && !errorMsg.includes('사용 가능') && (
							<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
								<span className="font-medium">오류:</span> {errorMsg}
							</div>
						)}

						{/* 성공 메시지 (이메일 체크) */}
						{errorMsg && errorMsg.includes('사용 가능') && (
							<div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
								<span className="font-medium">성공:</span> {errorMsg}
							</div>
						)}

						<form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
							<div>
								<label htmlFor="userName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									이름
								</label>
								<input
									type="text"
									name="userName"
									id="userName"
									placeholder="이름을 입력해주세요"
									value={name}
									onChange={e => handleChange(e, setName)}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
								/>
								{errors.name && <span className="inline-block text-[0.6rem] text-red-500 ml-[0.4rem]">{errors.name}</span>}
							</div>
							<div>
								<label htmlFor="userEmail" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									이메일
								</label>
								<div className="flex">
									<input
										type="email"
										name="userEmail"
										id="userEmail"
										placeholder="name@company.com"
										value={email}
										onChange={handleEmailChange}
										className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
										required=""
									/>
									<button
										type="button"
										onClick={checkEmailDuplicate}
										disabled={loading || !email || !EMAIL_REGEX_VALIDATION.test(email)}
										className="ml-2 text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
									>
										중복확인
									</button>
								</div>
								{errors.email && <span className="inline-block text-[0.6rem] text-red-500 ml-[0.4rem]">{errors.email}</span>}
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
									value={password}
									onChange={e => handleChange(e, setPassword)}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									required=""
								/>
								{errors.password && <span className="inline-block text-[0.6rem] text-red-500 ml-[0.4rem]">{errors.password}</span>}
							</div>
							<div>
								<label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
									비밀번호 확인
								</label>
								<input
									type="password"
									name="confirmPassword"
									id="confirmPassword"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={e => handleChange(e, setConfirmPassword)}
									onBlur={() => {
										// 비밀번호 확인란 블러 이벤트
										const newErrors = { ...errors };
										if (password !== confirmPassword) {
											newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
										} else {
											newErrors.confirmPassword = '';
										}
										setErrors(newErrors);
									}}
									className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-purple-600 focus:border-purple-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-purple-500 dark:focus:border-purple-500"
									required=""
								/>
								{errors.confirmPassword && <span className="inline-block text-[0.6rem] text-red-500 ml-[0.4rem]">{errors.confirmPassword}</span>}
							</div>
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="terms"
										aria-describedby="terms"
										type="checkbox"
										className="cursor-pointer w-4 h-4 border checked:bg-purple-500 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-purple-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-purple-600 dark:ring-offset-gray-800"
										required=""
									/>
								</div>
								<div className="ml-3 text-sm">
									<div for="terms" className="font-medium text-gray-500 dark:text-gray-300">
										<Link href="/policy/terms" target="_blank" className="font-medium text-purple-600 hover:underline dark:text-purple-500">
											서비스 이용약관
										</Link>
										에 동의합니다
									</div>
								</div>
							</div>
							<button
								type="submit"
								disabled={loading || success}
								className={`w-full cursor-pointer text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
									loading || success ? 'opacity-70 cursor-not-allowed' : ''
								}`}
							>
								{loading ? '처리 중...' : '가입하기'}
							</button>
							<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
								이미 계정이 있으신가요?
								<Link href="/login" className="ml-2 font-medium text-purple-600 hover:underline dark:text-purple-500">
									로그인 하기
								</Link>
							</p>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
