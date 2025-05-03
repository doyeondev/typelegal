/**
 * 드래프트 관련 커스텀 훅
 * 계약서 드래프트 CRUD 작업을 위한 React Query 훅을 제공합니다.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import draftService from '../services/draftService';

/**
 * 사용자 드래프트 목록을 조회하는 훅
 * @returns {Object} 드래프트 목록 조회 결과 (useQuery 반환값)
 */
export const useMemberDrafts = () => {
	return useQuery('memberDrafts', draftService.getMemberDrafts, {
		retry: 1,
		onError: error => {
			console.error('드래프트 목록 조회 오류:', error);
		},
	});
};

/**
 * 특정 드래프트를 조회하는 훅
 * @param {string} id - 드래프트 ID
 * @param {Object} options - useQuery 옵션
 * @returns {Object} 드래프트 조회 결과 (useQuery 반환값)
 */
export const useDraftById = (id, options = {}) => {
	return useQuery(['draft', id], () => draftService.getDraft(id), {
		retry: 1,
		enabled: !!id, // id가 있을 때만 쿼리 실행
		...options,
		onError: error => {
			console.error(`드래프트 조회 오류 (ID: ${id}):`, error);
			if (options.onError) options.onError(error);
		},
	});
};

/**
 * 드래프트를 저장하는 훅
 * @returns {Object} 드래프트 저장 뮤테이션 (useMutation 반환값)
 */
export const useSaveDraft = () => {
	const queryClient = useQueryClient();

	return useMutation(draftData => draftService.saveDraft(draftData), {
		onSuccess: (data, variables) => {
			// 쿼리 캐시 무효화
			queryClient.invalidateQueries('memberDrafts');
			queryClient.invalidateQueries(['draft', variables.id]);
			console.log('드래프트 저장 성공:', data);
		},
		onError: error => {
			console.error('드래프트 저장 오류:', error);
		},
	});
};

/**
 * 드래프트를 삭제하는 훅
 * @returns {Object} 드래프트 삭제 뮤테이션 (useMutation 반환값)
 */
export const useDeleteDraft = () => {
	const queryClient = useQueryClient();

	return useMutation(id => draftService.deleteDraft(id), {
		onSuccess: (data, id) => {
			// 쿼리 캐시 무효화
			queryClient.invalidateQueries('memberDrafts');
			queryClient.invalidateQueries(['draft', id]);
			console.log('드래프트 삭제 성공:', data);
		},
		onError: error => {
			console.error('드래프트 삭제 오류:', error);
		},
	});
};

/**
 * 드래프트 존재 여부를 확인하는 훅
 * @param {string} id - 드래프트 ID
 * @returns {Object} 드래프트 존재 여부 확인 결과 (useQuery 반환값)
 */
export const useDraftExists = id => {
	return useQuery(['draftExists', id], () => draftService.draftExists(id), {
		retry: 1,
		enabled: !!id, // id가 있을 때만 쿼리 실행
		onError: error => {
			console.error(`드래프트 존재 여부 확인 오류 (ID: ${id}):`, error);
		},
	});
};

/**
 * 드래프트 관련 모든 훅을 한번에 제공하는 메인 훅
 * @returns {Object} 모든 드래프트 관련 훅 모음
 */
const useDraftService = () => {
	return {
		useMemberDrafts,
		useDraftById,
		useSaveDraft,
		useDeleteDraft,
		useDraftExists,
	};
};

export default useDraftService;
