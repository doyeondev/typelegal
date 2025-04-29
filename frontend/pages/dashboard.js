import { useEffect, useState } from 'react';
import _ from 'lodash';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import DeleteModal from '../src/components/modals/DeleteModal';
import Spinner from '../src/components/ui/Spinner';
import draftService from '../src/services/draftService';
import userService from '../src/services/userService';
import { useRouter } from 'next/router';
import PrivateRoute from '../src/components/auth/PrivateRoute';

// 분리된 대시보드 컴포넌트들 임포트
import Sidebar from '../src/components/dashboard/Sidebar';
import SelectContract from '../src/components/dashboard/SelectContract';
import DashboardWrapper from '../src/components/dashboard/DashboardWrapper';

/**
 * 샘플 계약서 템플릿 데이터
 * @type {Array} 계약서 템플릿 목록
 */
const CONTRACT_TEMPLATES = [
	{ image: 'image/logo_design2.png', title: '로고 디자인', title2: '계약서', price: '$16.00', color: 'bg-[#FDE93A]', ready: true, url: '/draft/logo' },
	{ image: 'image/logo_design2.png', title: '인쇄 · 홍보물', title2: '디자인 계약서', price: '$17.00', color: 'bg-[#01BB73]', ready: true, url: '/draft/printing' },
	{ image: 'image/logo_design2.png', title: '패키지 디자인', title2: '계약서', price: '$18.00', color: 'bg-[#FEDBE8]', ready: true, url: '/draft/package' },
	{ image: 'image/logo_design2.png', title: '브랜드 디자인', title2: '계약서', price: '$18.00', color: 'bg-[#263889]', ready: true, url: '/draft/brand' },
];

/**
 * 대시보드 페이지 컴포넌트
 * 사용자의 계약서 목록과 계약서 작성 옵션을 보여주는 메인 페이지
 */
function DashboardPage() {
	// 상태 관리 변수들
	const [dashboardData, setDashboardData] = useState([]); // 전체 데이터
	const [dashboardGroup, setDashboardGroup] = useState([]); // 페이지네이션을 위한 그룹화된 데이터
	const [currentIndex, setCurrentIndex] = useState(0); // 현재 페이지 인덱스
	const [maxIndex, setMaxIndex] = useState(0); // 최대 페이지 인덱스
	const [loaded, isLoaded] = useState(false); // 로딩 상태
	const [currentMember, setCurrentMember] = useState(''); // 현재 로그인한 사용자 정보
	const [saveToastState, setSaveToastState] = useState(false); // 저장 알림 상태
	const [error, setError] = useState(null); // 에러 상태 추가
	const router = useRouter();

	// 인증 상태 확인 함수
	const checkAuthStatus = async () => {
		try {
			// 로컬 스토리지 확인
			if (!userService.isLoggedIn()) {
				console.error('로컬 스토리지에 로그인 정보 없음');
				return false;
			}

			// 백엔드 API 호출로 인증 확인
			const response = await userService.checkAuth();
			console.log('인증 상태 확인 성공:', response);
			return true;
		} catch (error) {
			console.error('인증 확인 실패:', error);
			// 클라이언트 측 상태 정리
			if (typeof window !== 'undefined') {
				localStorage.removeItem('is_logged_in');
				sessionStorage.removeItem('member_key');
			}
			return false;
		}
	};

	// 주기적인 인증 상태 확인 (토큰 만료 방지)
	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				const isAuthenticated = await checkAuthStatus();
				if (!isAuthenticated) {
					// 인증 실패 시 로그인 페이지로 리디렉션
					sessionStorage.setItem('redirectAfterLogin', '/dashboard');
					router.push('/login?redirect=/dashboard&expired=true');
				}
			} catch (error) {
				console.error('인증 확인 실패:', error);
				// 인증 실패 시 로그인 페이지로 리디렉션
				sessionStorage.setItem('redirectAfterLogin', '/dashboard');
				router.push('/login?redirect=/dashboard&expired=true');
			}
		};

		// 초기 인증 확인 및 주기적 확인 설정 (5분마다)
		const tokenCheckInterval = setInterval(checkAuthentication, 300000);

		// 컴포넌트 언마운트 시 인터벌 정리
		return () => clearInterval(tokenCheckInterval);
	}, [router]);

	// 컴포넌트 마운트 시 데이터 로드
	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';

			// 에러 상태 초기화
			setError(null);
			isLoaded(false);

			try {
				// 인증 확인 후 사용자 정보 가져오기
				const isAuthenticated = await checkAuthStatus();
				if (!isAuthenticated) {
					// 인증 실패시 에러 설정하고 함수 종료
					setError('인증에 실패했습니다. 다시 로그인해주세요.');
					isLoaded(true);
					return;
				}

				// 저장된 사용자 정보 가져오기
				const member_value = userService.getUserFromStorage();

				// 사용자 정보가 없으면 API로 요청
				if (!member_value) {
					console.warn('세션에 사용자 정보가 없습니다. 사용자 정보 조회를 시도합니다.');
					try {
						// API로 현재 로그인 상태 확인
						const userData = await userService.getCurrentUser();
						setCurrentMember(userData);
					} catch (authError) {
						console.error('사용자 정보 조회 실패:', authError);
						setError('사용자 정보를 가져오는데 실패했습니다.');
						isLoaded(true);
						return;
					}
				} else {
					setCurrentMember(member_value);
				}

				// 사용자의 드래프트 목록 조회
				console.log('드래프트 데이터 요청 중...');
				const data = await draftService.getMemberDrafts();
				console.log('드래프트 데이터 조회 성공:', data);

				// 그룹화하기 전에 데이터 존재 여부 확인
				if (Array.isArray(data)) {
					// 데이터를 5개씩 그룹화하여 페이지네이션 구성
					const groupedData = _.chunk(data, 5);
					setCurrentIndex(0);
					setDashboardData(data);
					setMaxIndex(groupedData.length > 0 ? groupedData.length - 1 : 0);
					setDashboardGroup(groupedData);
				} else {
					console.warn('드래프트 데이터가 배열이 아닙니다:', data);
					setDashboardData([]);
					setDashboardGroup([]);
					setMaxIndex(0);
				}
			} catch (error) {
				console.error('데이터 로드 실패:', error);
				setError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');

				// API 호출 실패 시 빈 배열로 초기화
				setDashboardData([]);
				setDashboardGroup([]);
				setMaxIndex(0);
			} finally {
				isLoaded(true); // 에러가 발생해도 로딩 상태 종료
			}

			if (sessionStorage.getItem('item_key')) sessionStorage.removeItem('item_key'); // remove contract key session
		}
		getPageData();
	}, [router]);

	// 데이터 로드 상태 확인용 훅
	useEffect(() => {
		if (loaded === true) {
			if (dashboardData && dashboardData.length > 0) {
				console.log('[MAIN HOOK] 대시보드 데이터 로드됨:', dashboardData.length, '개 항목');
			} else {
				console.log('대시보드 데이터 없음');
			}
		}
	}, [dashboardData, loaded]);

	/**
	 * 계약서 삭제 처리 함수
	 * @param {string} id - 삭제할 계약서 ID
	 */
	const deleteItemHandler = async id => {
		try {
			await deleteContractData(id);

			// 삭제된 항목 필터링하여 UI 업데이트
			const newState = dashboardData.filter(item => item.id !== id);

			// 삭제 후 UI 업데이트 및 페이지네이션 조정
			const newGroups = _.chunk(newState, 5);

			if (dashboardGroup[currentIndex] && dashboardGroup[currentIndex].length === 1) {
				setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : 0);
			}

			setDashboardData(newState);
			setDashboardGroup(newGroups);
			setMaxIndex(newGroups.length > 0 ? newGroups.length - 1 : 0);

			setSaveToastState(true);
			setTimeout(() => setSaveToastState(false), 3000);
		} catch (error) {
			console.error('계약서 삭제 중 오류 발생:', error);
			setError('계약서 삭제 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
		}
	};

	/**
	 * 계약서 삭제 API 호출 함수
	 * @param {string} id - 삭제할 계약서 ID
	 * @returns {Promise<Object>} - API 응답 Promise
	 */
	async function deleteContractData(id) {
		console.log('드래프트 삭제 시작:', id);
		try {
			// 드래프트 삭제 처리 - draftService 사용
			const response = await draftService.deleteDraft(id);
			console.log('드래프트 삭제 성공:', response);
			return response;
		} catch (error) {
			console.error(`드래프트 삭제 실패:`, error);
			throw error;
		}
	}

	/**
	 * 페이지네이션 클릭 이벤트 핸들러
	 * @param {Event} e - 클릭 이벤트
	 */
	const onClickHandler = e => {
		console.log('페이지네이션 클릭');
		const btnId = e.target.id;
		const type = e.target.name;

		// 이전/다음 페이지 버튼 처리
		if (btnId && type === 'paginationBtn') {
			if (btnId === 'btnNext' && currentIndex < maxIndex) {
				setCurrentIndex(currentIndex + 1);
			} else if (btnId === 'btnPrevious' && currentIndex > 0) {
				setCurrentIndex(currentIndex - 1);
			}
		}

		// 페이지 번호 클릭 처리
		if (btnId && type === 'paginationNum') {
			setCurrentIndex(parseInt(btnId));
		}
	};

	return (
		<>
			<div className="grid grid-cols-[240px_1fr]">
				<Head>
					<title>타입리걸</title>
					<meta name="description" content="계약서 작성의 시작, 타입리걸" />
					<link rel="icon" href="/favicon.ico" />
				</Head>

				{/* 좌측 사이드바 */}
				<Sidebar data={currentMember} />

				{loaded === true ? (
					<div className="flex flex-col w-full">
						{/* 메인 콘텐츠 영역 */}
						<div className="flex flex-col h-screen">
							<div className={`flex flex-col h-full pt-8 px-8 2xl:px-[6vw] mx-auto ${dashboardData && 'mx-0'}`}>
								{/* 에러 메시지 */}
								{error && (
									<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
										<span className="font-medium">오류:</span> {error}
										<button onClick={() => setError(null)} className="float-right text-red-700 hover:text-red-900">
											✕
										</button>
									</div>
								)}

								{/* 계약서 작성 카드 섹션 */}
								<SelectContract dummies={CONTRACT_TEMPLATES} dashboardData={dashboardData} key={`select-contract-${dashboardData.length}`} />

								{/* 계약서 목록 섹션 - 페이지네이션에 따라 표시 */}
								{dashboardGroup.length > 0 ? (
									dashboardGroup.map((elem, index) => {
										if (currentIndex === index) {
											return <DashboardWrapper dataList={elem} currentIndex={currentIndex} maxIndex={maxIndex} onClickHandler={onClickHandler} deleteItemHandler={deleteItemHandler} key={`dashboard-group-${index}`} />;
										}
										return null;
									})
								) : (
									<div className="text-center text-gray-500 p-8">작성 중인 계약서가 없습니다. 새 계약서를 작성해보세요.</div>
								)}

								{/* 저장 알림 */}
								{saveToastState && (
									<div className="fixed bottom-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md" role="alert">
										<p>계약서가 성공적으로 삭제되었습니다.</p>
									</div>
								)}
							</div>
						</div>
					</div>
				) : (
					<Spinner />
				)}
			</div>
		</>
	);
}

/**
 * 대시보드 페이지 컴포넌트 (PrivateRoute로 감싸진)
 * 로그인이 필요한 페이지이므로 PrivateRoute로 보호
 */
export default function Dashboard() {
	return (
		<PrivateRoute>
			<DashboardPage />
		</PrivateRoute>
	);
}
