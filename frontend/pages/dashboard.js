import { useEffect, useState } from 'react';
import _ from 'lodash';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import DeleteModal from '../components/modals/DeleteModal';
import Spinner from '../components/ui/Spinner';
import draftingApi from './api/services/draftingApi';

// 분리된 대시보드 컴포넌트들 임포트
import Sidebar from '../components/dashboard/Sidebar';
import SelectContract from '../components/dashboard/SelectContract';
import DashboardWrapper from '../components/dashboard/DashboardWrapper';

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
export default function Dashboard() {
	// 상태 관리 변수들
	const [dashboardData, setDashboardData] = useState([]); // 전체 데이터
	const [dashboardGroup, setDashboardGroup] = useState([]); // 페이지네이션을 위한 그룹화된 데이터
	const [currentIndex, setCurrentIndex] = useState(0); // 현재 페이지 인덱스
	const [maxIndex, setMaxIndex] = useState(0); // 최대 페이지 인덱스
	const [loaded, isLoaded] = useState(false); // 로딩 상태
	const [currentMember, setCurrentMember] = useState(''); // 현재 로그인한 사용자 정보
	const [saveToastState, setSaveToastState] = useState(false); // 저장 알림 상태

	// 컴포넌트 마운트 시 데이터 로드
	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';

			// 로그인 여부 확인
			if (!sessionStorage.getItem('member_key')) {
				console.log('세션에 사용자 정보가 없습니다 - 로그인 페이지로 리디렉션');
				// 현재 페이지를 세션 스토리지에 저장하여 로그인 후 리디렉션 가능하게 함
				sessionStorage.setItem('redirectAfterLogin', '/dashboard');
				window.location.href = '/login';
				return;
			}

			let member_value = JSON.parse(sessionStorage.getItem('member_key'));
			setCurrentMember(member_value);
			let query = member_value.email;

			try {
				// Supabase의 drafting_data 테이블에서 사용자 드래프트 조회
				const data = await draftingApi.getMemberDrafts(query);
				console.log('드래프트 데이터 조회 성공:', data);

				// 필요한 경우에만 데이터 형식 조정
				const formattedData = data;

				// 데이터를 5개씩 그룹화하여 페이지네이션 구성
				const groupedData = _.chunk(formattedData, 5);
				setCurrentIndex(0);
				setDashboardData(formattedData);
				setMaxIndex(groupedData.length - 1);
				setDashboardGroup(groupedData);
				isLoaded(true);
			} catch (error) {
				console.error('드래프트 데이터 조회 실패:', error);
				isLoaded(true); // 에러가 발생해도 로딩 상태 종료
			}

			if (sessionStorage.getItem('item_key')) sessionStorage.removeItem('item_key'); // remove contract key session
		}
		getPageData();
	}, []);

	// 데이터 로드 상태 확인용 훅
	useEffect(() => {
		if (loaded === true) {
			if (dashboardData) {
				console.log('[MAIN HOOK] setDashboardData rendered', dashboardData);
			} else {
				console.log('no data');
			}
		}
	}, [dashboardData, loaded]);

	// 데이터 그룹화 확인용 훅
	useEffect(() => {
		if (loaded === true) {
			console.log('dashboardGroup', dashboardGroup);
		}
	}, [loaded, dashboardGroup]);

	/**
	 * 계약서 삭제 처리 함수
	 * @param {string} id - 삭제할 계약서 ID
	 */
	const deleteItemHandler = id => {
		deleteContractData(id);
		// 삭제된 항목 필터링하여 UI 업데이트
		let newState = [...dashboardData].map(obj => {
			if (obj._id === id) {
				return { ...obj, ...{ is_deleted: true } }; // 논리적 삭제 처리
			}
			return obj;
		});
		newState = newState.filter(x => !x.is_deleted === true);

		// 삭제 후 UI 업데이트 및 페이지네이션 조정
		if (dashboardGroup[currentIndex] && dashboardGroup[currentIndex].length === 1) {
			setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : 0);
			setMaxIndex(dashboardGroup.length - 2 >= 0 ? dashboardGroup.length - 2 : 0);
		}
		setDashboardData(newState);
		setDashboardGroup(_.chunk(newState, 5));
	};

	/**
	 * 계약서 삭제 API 호출 함수
	 * @param {string} _id - 삭제할 계약서 ID
	 * @returns {Promise} - API 응답 Promise
	 */
	async function deleteContractData(_id) {
		console.log('드래프트 삭제 시작:', _id);
		try {
			// Supabase drafting_data 테이블에서 논리적 삭제 처리
			const response = await draftingApi.deleteDraft(_id);
			console.log('드래프트 삭제 성공:', response);
			setSaveToastState(true);
			return response;
		} catch (error) {
			console.error(`드래프트 삭제 실패:`, error);
		}
	}

	/**
	 * 페이지네이션 클릭 이벤트 핸들러
	 * @param {Event} e - 클릭 이벤트
	 */
	const onClickHandler = e => {
		console.log('clicked - onClickHandler');
		const btnId = e.target.id;
		const type = e.target.name;
		console.log('btnId : ', e.target.id);
		console.log('currentIndex', currentIndex);
		console.log('maxIndex', maxIndex);

		// 이전/다음 페이지 버튼 처리
		if (btnId && type === 'paginationBtn') {
			if (btnId === 'btnNext' && currentIndex < maxIndex) {
				console.log('entered case 1');
				setCurrentIndex(currentIndex + 1);
			} else if (btnId === 'btnPrevious' && currentIndex > 0) {
				console.log('entered case 2');
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
						<div className="grid grid-cols-[1fr] h-screen">
							<div className={`flex flex-col h-full place-content-center space-y-8 2xl:space-y-[10vh] py-8 px-8 2xl:px-[6vw] mx-auto ${dashboardData && 'mx-0'}`}>
								{/* 계약서 작성 카드 섹션 */}
								<SelectContract dummies={CONTRACT_TEMPLATES} dashboardData={dashboardData} key={`select-contract-${dashboardData.length}`} />

								{/* 계약서 목록 섹션 - 페이지네이션에 따라 표시 */}
								{dashboardGroup.map((elem, index) => {
									if (currentIndex === index) {
										return <DashboardWrapper dataList={elem} currentIndex={currentIndex} maxIndex={maxIndex} onClickHandler={onClickHandler} deleteItemHandler={deleteItemHandler} key={`dashboard-group-${index}`} />;
									}
									return null;
								})}
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
