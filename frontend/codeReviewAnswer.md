# TypeLegal 프론트엔드 코드 리뷰 결과

지시사항에 따라 TypeLegal 프론트엔드 코드베이스를 분석하여 인상 깊었던 8개의 코드 사례를 선정했습니다. 각 사례는 평가 기준에 부합하는 우수한 코드 패턴을 보여줍니다.

## [좋은 코드 포인트 1]

- **파일명**: frontend/components/dashboard/SelectContract.js
- **코드 스니펫**:

  ```js
  // PropTypes 정의
  SelectContract.propTypes = {
  	// 계약서 템플릿 정보 배열
  	dummies: PropTypes.arrayOf(
  		PropTypes.shape({
  			image: PropTypes.string.isRequired,
  			title: PropTypes.string.isRequired,
  			title2: PropTypes.string,
  			price: PropTypes.string,
  			color: PropTypes.string,
  			ready: PropTypes.bool.isRequired,
  			url: PropTypes.string.isRequired,
  		})
  	).isRequired,
  	// 사용자의 계약서 데이터 배열
  	dashboardData: PropTypes.array,
  };

  // React.memo로 감싸서 불필요한 리렌더링 방지
  export default React.memo(SelectContract);
  ```

- **칭찬 포인트**:

  - **평가 기준 3: 타입 안정성 강화** - PropTypes를 통해 컴포넌트 props의 타입을 명확히 정의하여 런타임 오류를 방지하고 있습니다.
  - **평가 기준 4: UX를 개선하기 위한 퍼포먼스 최적화** - React.memo를 사용하여 props가 변경될 때만 컴포넌트가 리렌더링되도록 최적화되어 있습니다.
  - 주석을 통해 각 prop의 목적을 명확히 설명함으로써 코드 가독성과 유지보수성을 높였습니다.
  - 복잡한 데이터 구조(배열 내 객체)에 대한 타입 체크를 상세하게 구현하여 안정성을 확보했습니다.

- **추가 개선 가능성**:
  - TypeScript를 도입하여 PropTypes 대신 정적 타입 체크를 구현하면 컴파일 시점에 타입 오류를 발견할 수 있어 더 안전한 코드가 될 수 있습니다.

## [좋은 코드 포인트 2]

- **파일명**: frontend/pages/api/services/httpClient.js
- **코드 스니펫**:

  ```js
  export const request = async (endpoint, options = {}) => {
  	console.log('endpoint', endpoint);
  	const url = `${API_BASE_URL}${endpoint}`;

  	// 헤더에 인증 토큰 추가
  	const headers = {
  		...getAuthHeaders(),
  		...options.headers,
  	};

  	try {
  		const response = await fetch(url, {
  			...options,
  			headers,
  		});

  		// 응답이 JSON 형식인지 확인
  		const contentType = response.headers.get('content-type');
  		const isJson = contentType && contentType.includes('application/json');

  		// 응답 데이터 파싱
  		const data = isJson ? await response.json() : await response.text();

  		// 403 오류 (권한 없음/세션 만료)
  		if (response.status === 403) {
  			console.error('[API 오류] 권한 없음 또는 세션 만료 (403)');

  			// 토큰 확인 및 저장된 데이터 로깅
  			const token = getAuthToken();
  			console.log(`[API 오류] 현재 토큰: ${token ? '존재함' : '없음'}`);

  			// 로그인 페이지로 리디렉션
  			setTimeout(() => {
  				redirectToLogin();
  			}, 1000);

  			throw {
  				status: 403,
  				data,
  				message: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  			};
  		}

  		// 기타 오류 응답 처리
  		if (!response.ok) {
  			throw {
  				status: response.status,
  				data,
  				message: isJson && data.message ? data.message : '요청 처리 중 오류가 발생했습니다.',
  			};
  		}

  		return data;
  	} catch (error) {
  		console.error('[API 요청 오류]:', error);
  		throw error;
  	}
  };
  ```

- **칭찬 포인트**:

  - **평가 기준 5: 에러 핸들링 체계화** - 네트워크 오류, 인증 만료, 서버 오류 등 다양한 API 오류 상황을 체계적으로 처리하고 있습니다.
  - **평가 기준 12: API 통신 안정성 확보** - 모든 API 요청에 대해 일관된 오류 처리 로직을 적용하여 안정성을 높였습니다.
  - 세션 만료 시 사용자 경험을 고려하여 로그인 페이지로 리디렉션하는 로직을 구현했습니다.
  - 오류 메시지를 사용자 친화적으로 변환하여 제공하고 있습니다.

- **추가 개선 가능성**:
  - 네트워크 오류나 일시적인 서버 오류에 대한 재시도(retry) 로직을 추가하면 더욱 견고한 API 클라이언트가 될 수 있습니다.

## [좋은 코드 포인트 3]

- **파일명**: frontend/utils/dateUtils.js
- **코드 스니펫**:

  ```js
  /**
   * 주어진 날짜를 지정된 형식의 문자열로 변환합니다.
   * @param {Date|string} d - 변환할 날짜 객체 또는 날짜 문자열
   * @param {string} type - 날짜 형식 ('full', 'short') 또는 사용자 지정 형식
   * @returns {string} 형식화된 날짜 문자열
   */
  export function formatDate(d, type) {
  	// null, undefined 체크
  	if (d === null || d === undefined) return '';

  	// 문자열인 경우 Date 객체로 변환
  	if (typeof d === 'string') {
  		d = new Date(d);
  	}

  	// 유효한 날짜인지 확인
  	if (isNaN(d.getTime())) return '';

  	// 기본 포맷 (YYYY-MM-DD)
  	if (!type) {
  		return `${d.getFullYear()}-${subFormatNum(d.getMonth() + 1, 2)}-${subFormatNum(d.getDate(), 2)}`;
  	}

  	let format;
  	if (type === 'full') format = 'yyyy년 MM월 dd일(E) a/p hh:mm';
  	else if (type === 'short') format = 'yyyy. MM. dd.';
  	else format = type;

  	const weekName = ['일', '월', '화', '수', '목', '금', '토'];
  	const h = d.getHours() % 12;

  	return format.replace(/(yyyy|yy|MM|dd|E|hh|mm|sss|ss|a\/p)/gi, function (ele) {
  		switch (ele) {
  			case 'yyyy':
  				return d.getFullYear();
  			case 'yy':
  				return subFormatNum(d.getFullYear() % 1000, 2);
  			case 'MM':
  				return subFormatNum(d.getMonth() + 1, 2);
  			case 'dd':
  				return subFormatNum(d.getDate(), 2);
  			case 'E':
  				return weekName[d.getDay()];
  			// 나머지 케이스들...
  		}
  	});
  }
  ```

- **칭찬 포인트**:

  - **평가 기준 8: 컴포넌트/유틸리티 재사용성 강화** - 날짜 포맷팅을 위한 범용적이고 유연한 유틸리티 함수를 만들어 코드 중복을 제거했습니다.
  - **평가 기준 1: 선언적 프로그래밍 실천** - 복잡한 날짜 포맷팅 로직을 선언적 방식으로 구현하여 가독성을 높였습니다.
  - JSDoc을 통해 함수의 매개변수와 반환값을 명확히 문서화하여 사용자가 함수 사용법을 쉽게 이해할 수 있습니다.
  - 다양한 예외 상황(null, undefined, 유효하지 않은 날짜 등)을 처리하여 안정적인 함수를 구현했습니다.

- **추가 개선 가능성**:
  - 국제화(i18n) 지원을 추가하여 다양한 언어와 지역에 맞는 날짜 형식을 지원할 수 있습니다.

## [좋은 코드 포인트 4]

- **파일명**: frontend/components/modals/LoginModal.js
- **코드 스니펫**:

  ```js
  // 콘솔로 디버깅 메시지를 추가하여 props 검증
  const LoginModal = ({ loginModalOpen, setLoginModalOpen, setExportBtnState }) => {
    // 클로저 내에서 setLoginModalOpen 함수를 안전하게 호출
    const safeSetLoginModalOpen = value => {
      // 함수가 존재하고 호출 가능한지 확인
      if (typeof setLoginModalOpen === 'function') {
        setLoginModalOpen(value);
      } else {
        console.error('setLoginModalOpen is not a function', setLoginModalOpen);
      }
    };

    function closeModal() {
      // 모달을 닫지 않고 유지
      safeSetLoginModalOpen(true);
    }

    // 로그인 성공 시 모달 닫기
    const handleLoginSuccess = () => {
      safeSetLoginModalOpen(false);
    };

    // 닫기 버튼 핸들러
    const handleClose = () => {
      safeSetLoginModalOpen(false);
      if (typeof window !== 'undefined' && window.location) {
        window.location.assign('/');
      }
    };
  ```

- **칭찬 포인트**:

  - **평가 기준 1: 선언적 프로그래밍 실천** - 모달 컴포넌트의 상태 변경 로직을 선언적으로 작성하여 코드의 의도를 명확히 했습니다.
  - **평가 기준 5: 에러 핸들링 체계화** - 함수 호출 전 타입 검사를 수행하여 런타임 오류를 예방하는 방어적 프로그래밍을 적용했습니다.
  - `safeSetLoginModalOpen` 래퍼 함수를 통해 prop으로 전달된 함수의 안전한 호출을 보장하는 패턴을 채택했습니다.
  - 서버 사이드 렌더링(SSR) 환경에서 `window` 객체 접근 전 타입 체크를 수행하여 오류를 방지하고 있습니다.

- **추가 개선 가능성**:
  - 컴포넌트 시작 시 props 유효성을 한 번에 검사하는 로직을 추가하거나, React의 Error Boundary를 활용하여 컴포넌트 오류를 더 체계적으로 처리할 수 있습니다.

## [좋은 코드 포인트 5]

- **파일명**: frontend/pages/\_app.js
- **코드 스니펫**:
  ```js
  export default function App({ Component, pageProps }) {
  	return (
  		<>
  			<ThemeProvider attribute="class">
  				{/* Global Site Tag (gtag.js) - Google Analytics */}
  				<Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=G-MS8Z3MX3ZN`} />
  				<Script
  					id="gtag-init"
  					strategy="afterInteractive"
  					dangerouslySetInnerHTML={{
  						__html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MS8Z3MX3ZN', {
                page_path: window.location.pathname,
              });
            `,
  					}}
  				/>
  				<Component {...pageProps} />
  			</ThemeProvider>
  		</>
  	);
  }
  ```
- **칭찬 포인트**:

  - **평가 기준 14: SEO 최적화 고려** - 전역 레이아웃에 구글 애널리틱스 스크립트를 포함시켜 사용자 행동 분석 및 SEO 최적화를 지원합니다.
  - **평가 기준 11: 디자인 시스템 구현 또는 컴포넌트화** - ThemeProvider를 활용하여 일관된 테마 관리를 지원하고 있습니다.
  - Next.js의 Script 컴포넌트를 사용하여 성능에 영향을 최소화하는 방식으로 외부 스크립트를 로드하고 있습니다.
  - `afterInteractive` 전략을 사용하여 페이지가 인터랙티브 상태가 된 후에 분석 스크립트를 로드함으로써 초기 로딩 성능을 최적화하고 있습니다.

- **추가 개선 가능성**:
  - 환경 변수를 사용하여 개발/프로덕션 환경에 따라 다른 애널리틱스 ID를 적용하고, 사용자 동의(GDPR 등)에 따라 조건부로 스크립트를 로드하는 로직을 추가할 수 있습니다.

## [좋은 코드 포인트 6]

- **파일명**: frontend/pages/hooks/useLeavePageConfirmation.js
- **코드 스니펫**:

  ```js
  export const useLeavePageConfirmation = (shouldPreventLeaving, activityLog, message = '사이트에서 나가시겠습니까?\n변경사항이 저장되지 않을 수 있습니다.', confirmationDialog = defaultConfirmationDialog) => {
  	useEffect(() => {
  		if (!SingletonRouter.router?.change) {
  			return;
  		}

  		const originalChangeFunction = SingletonRouter.router.change;
  		const originalOnBeforeUnloadFunction = window.onbeforeunload;

  		/*
  		 * Modifying the window.onbeforeunload event stops the browser tab/window from
  		 * being closed or refreshed.
  		 */
  		if (shouldPreventLeaving) {
  			window.onbeforeunload = () => '';
  		} else {
  			window.onbeforeunload = originalOnBeforeUnloadFunction;
  		}

  		/*
  		 * Overriding the router.change function blocks Next.js route navigations
  		 * and disables the browser's back and forward buttons. This opens up the
  		 * possibility to use the window.confirm alert instead.
  		 */
  		if (shouldPreventLeaving) {
  			SingletonRouter.router.change = async (...args) => {
  				const [historyMethod, , as] = args;
  				const currentUrl = SingletonRouter.router?.state.asPath.split('?')[0];
  				const changedUrl = as.split('?')[0];
  				const hasNavigatedAwayFromPage = currentUrl !== changedUrl;
  				const wasBackOrForwardBrowserButtonClicked = historyMethod === 'replaceState';
  				let confirmed = false;

  				if (hasNavigatedAwayFromPage) {
  					let saveLog = {
  						...activityLog,
  						...{
  							endTime: timestamp(),
  							duration: timeDiffSec(activityLog.startTime, timestamp()),
  							durationMin: timeDiffMin(activityLog.startTime, timestamp()),
  						},
  					};
  					post_activityLog(saveLog);

  					confirmed = await confirmationDialog(message);
  				}

  				// 내비게이션 처리 로직
  				// ...
  			};
  		}

  		// 컴포넌트 언마운트 시 원래 함수 복원
  		return () => {
  			SingletonRouter.router.change = originalChangeFunction;
  			window.onbeforeunload = originalOnBeforeUnloadFunction;
  		};
  	}, [shouldPreventLeaving, activityLog, message, confirmationDialog]);
  };
  ```

- **칭찬 포인트**:

  - **평가 기준 8: 컴포넌트/유틸리티 재사용성 강화** - 페이지 이탈 확인 기능을 재사용 가능한 커스텀 훅으로 구현하여 코드 중복을 제거했습니다.
  - **평가 기준 4: UX를 개선하기 위한 퍼포먼스 최적화** - 사용자가 페이지를 떠날 때 저장되지 않은 데이터를 보호하는 기능을 제공하여 사용자 경험을 향상시켰습니다.
  - 브라우저의 기본 확인 대화상자(window.confirm)를 활용하면서도 Next.js의 라우터 동작에 맞게 커스터마이징하여 일관된 사용자 경험을 제공합니다.
  - 활동 로그를 자동으로 기록하여 사용자 이탈 시에도 데이터 분석이 가능하도록 구현했습니다.

- **추가 개선 가능성**:
  - 브라우저의 뒤로가기/앞으로가기 버튼 처리에 대한 주석에 언급된 문제를 해결하여 더 견고한 구현을 제공할 수 있습니다.

## [좋은 코드 포인트 7]

- **파일명**: frontend/pages/index.js
- **코드 스니펫**:

  ```js
  export default function Home() {
  	const [loginModalOpen, setLoginModalOpen] = useState(false);

  	useEffect(() => {
  		async function getPageData() {
  			if (sessionStorage.getItem('item_key')) sessionStorage.removeItem('item_key'); // remove contract key session
  		}

  		getPageData();
  	}, []);

  	return (
  		<Layout>
  			<Head>
  				<title>타입리걸 | 홈</title>
  				<meta name="description" content="계약서 작성의 시작, 타입리걸" />
  				<meta property="og:title" content="계약서 작성의 시작, 타입리걸" />
  				<link rel="icon" href="/favicon.ico" />
  			</Head>
  			<main className={`flex flex-col pt-[60px] place-items-center items-center justify-between ${inter.className}`}>
  				{/* 메인 콘텐츠 */}
  				<div className="w-full h-full pt-24 pb-40 place-content-center grid bg-[#F7F9FD]">
  					<div className="flex flex-col text-center space-y-10">
  						<div className="space-y-6">
  							<span className="text-purple-400 font-medium text-base">프리랜서 디자이너를 위해 만들었어요</span>
  							<h1 className="text-3xl font-bold leading-tight">계약서를 가장 쉽게 작성하는 방법</h1>
  						</div>
  						{/* 추가 콘텐츠 */}
  					</div>
  				</div>
  				{/* 이미지 및 부가 섹션 */}
  			</main>
  		</Layout>
  	);
  }
  ```

- **칭찬 포인트**:

  - **평가 기준 14: SEO 최적화 고려** - 각 페이지마다 Head 컴포넌트를 통해 타이틀, 메타 설명, 오픈 그래프 태그 등을 적절히 설정하여 SEO를 최적화했습니다.
  - **평가 기준 11: 디자인 시스템 구현 또는 컴포넌트화** - 페이지 전체를 Layout 컴포넌트로 감싸 일관된 디자인과 레이아웃을 유지하고 있습니다.
  - 초기 페이지 로드 시 불필요한 세션 데이터를 정리하여 상태 관리를 깔끔하게 유지하고 있습니다.
  - TailwindCSS의 명확한 클래스명을 활용해 레이아웃과 스타일을 선언적으로 구현하여 가독성과 유지보수성을 높였습니다.

- **추가 개선 가능성**:
  - Next.js의 Image 컴포넌트를 더 적극적으로 활용하여 이미지 최적화 및, 웹 성능 향상을 도모할 수 있습니다.

## [좋은 코드 포인트 8]

- **파일명**: frontend/components/draft/DraftSidebar.js
- **코드 스니펫**:

  ```js
  /**
   * 계약서 작성 페이지 사이드바 컴포넌트
   * @param {Object} props - 컴포넌트 속성
   * @param {Array} props.activeClauseKeys - 활성화된 계약 조항 키 배열
   * @param {Array} props.questionData - 질문 데이터 배열
   * @param {Array} props.questionGroupKey - 질문 그룹 키 배열
   * @param {number} props.progress - 현재 진행 상태 퍼센트
   * @param {boolean} props.showSidebar - 사이드바 표시 여부
   * @param {Function} props.setShowSidebar - 사이드바 표시 여부 설정 함수
   */
  const DraftSidebar = ({ activeClauseKeys, questionData, questionGroupKey, progress, showSidebar, setShowSidebar }) => {
  	return (
  		<div className="px-5 pt-10 pb-4 flex flex-col justify-between border-r-2">
  			{/* 측면 상판 */}
  			<div className="space-y-4">
  				<div className="flex justify-between items-center">
  					<p className="text-base font-bold">답변을 완료했어요!</p>
  					<button onClick={() => setShowSidebar(!showSidebar)} className="text-xs font-semibold cursor-pointer px-2 py-1 border border-gray-400 round rounded-md">
  						수정하기
  					</button>
  				</div>
  				<div className="w-8 h-1 bg-gray-300"></div>
  				<ProgressBar currProgress={progress} />
  				<ProgressList activeClauseKeys={activeClauseKeys} questionData={questionData} questionGroupKey={questionGroupKey} />
  			</div>

  			{/* 측면 하판 */}
  			<div className="grid space-y-5">
  				<div className="font-bold">문제가 발생했나요?</div>
  				<div className="w-8 h-1 bg-gray-300"></div>
  				<div className="text-sm font-medium text-gray-500 space-y-0.5">
  					<div>문의가능: M-F, 09:00-19:00</div>
  					<div>이메일: team@typelegal.io</div>
  				</div>
  			</div>
  		</div>
  	);
  };
  ```

- **칭찬 포인트**:

  - **평가 기준 11: 디자인 시스템 구현 또는 컴포넌트화** - 사이드바를 독립된 컴포넌트로 분리하고, 그 안에 ProgressBar와 ProgressList와 같은 서브 컴포넌트를 조합하여 모듈성을 높였습니다.
  - **평가 기준 1: 선언적 프로그래밍 실천** - 컴포넌트의 구조와 스타일을 선언적으로 정의하여 코드의 의도를 명확히 표현했습니다.
  - JSDoc을 통해 컴포넌트의 props를 상세히 문서화하여 다른 개발자들이 컴포넌트를 쉽게 이해하고 사용할 수 있도록 했습니다.
  - 명확한 주석(측면 상판, 측면 하판)을 통해 UI 구조를 논리적으로 구분하여 가독성을 높였습니다.

- **추가 개선 가능성**:
  - 현재 인라인으로 정의된 이벤트 핸들러(`onClick={() => setShowSidebar(!showSidebar)}`)를 컴포넌트 내 별도 함수로 추출하여 가독성과 테스트 용이성을 더 높일 수 있습니다.
