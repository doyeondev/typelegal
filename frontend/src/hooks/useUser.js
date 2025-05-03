/**
 * 사용자 관련 커스텀 훅
 * 로그인, 회원가입, 사용자 정보 조회 등의 기능을 제공합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/userService';

/**
 * 현재 로그인한 사용자 정보를 조회하는 훅
 * @param {Object} options - useQuery 옵션
 * @returns {Object} 사용자 정보 조회 결과 (useQuery 반환값)
 */
export const useCurrentUser = (options = {}) => {
	return useQuery('currentUser', userService.getCurrentUser, {
		retry: 1,
		...options,
		onError: error => {
			console.error('사용자 정보 조회 오류:', error);
			if (options.onError) options.onError(error);
		},
	});
};

/**
 * 로그인 처리를 위한 훅
 * @returns {Object} 로그인 뮤테이션 (useMutation 반환값)
 */
export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation(credentials => userService.login(credentials), {
		onSuccess: data => {
			// 쿼리 캐시 무효화 및 새로고침
			queryClient.invalidateQueries('currentUser');
			console.log('로그인 성공:', data);
		},
		onError: error => {
			console.error('로그인 오류:', error);
		},
	});
};

/**
 * 회원가입 처리를 위한 훅
 * @returns {Object} 회원가입 뮤테이션 (useMutation 반환값)
 */
export const useRegister = () => {
	return useMutation(userData => userService.register(userData), {
		onSuccess: data => {
			console.log('회원가입 성공:', data);
		},
		onError: error => {
			console.error('회원가입 오류:', error);
		},
	});
};

/**
 * 이메일 중복 확인을 위한 훅
 * @param {string} email - 확인할 이메일
 * @param {Object} options - useQuery 옵션
 * @returns {Object} 이메일 중복 확인 결과 (useQuery 반환값)
 */
export const useCheckEmailDuplicate = (email, options = {}) => {
	return useQuery(['checkEmail', email], () => userService.checkEmailDuplicate(email), {
		enabled: !!email && email.includes('@'), // 유효한 이메일 형식일 때만 실행
		...options,
		onError: error => {
			console.error('이메일 중복 확인 오류:', error);
			if (options.onError) options.onError(error);
		},
	});
};

/**
 * 로그아웃 처리를 위한 훅
 * @returns {Object} 로그아웃 뮤테이션 (useMutation 반환값)
 */
export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation(() => userService.logout(), {
		onSuccess: () => {
			// 캐시 초기화
			queryClient.clear();
			console.log('로그아웃 성공');
		},
		onError: error => {
			console.error('로그아웃 오류:', error);
		},
	});
};

/**
 * 사용자 관련 훅을 모두 제공하는 메인 훅
 * @returns {Object} 모든 사용자 관련 훅 모음
 */
const useUser = () => {
	const isLoggedIn = userService.isLoggedIn();
	const userFromStorage = userService.getUserFromStorage();

	return {
		useCurrentUser,
		useLogin,
		useRegister,
		useCheckEmailDuplicate,
		useLogout,
		isLoggedIn,
		user: userFromStorage,
	};
};

export default useUser;
