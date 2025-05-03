import '../src/styles/globals.css';
import Script from 'next/script';
import Head from 'next/head';
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
// import { ThemeProvider } from '@material-tailwind/react'
import { ThemeProvider } from 'next-themes';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProvider } from '../src/context/UserContext';

export default function App({ Component, pageProps }) {
	// React Query 클라이언트는 컴포넌트 마운트마다 재생성
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// 기본 쿼리 설정
						refetchOnWindowFocus: false, // 창 포커스 시 재요청 방지
						staleTime: 1000 * 60 * 5, // 5분간 데이터 fresh 상태 유지
						cacheTime: 1000 * 60 * 30, // 30분간 캐시 유지
						retry: 1, // 실패 시 1번만 재시도
					},
				},
			})
	);

	// 개발 환경에서만 로깅
	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') {
			// 로컬 스토리지와 세션 스토리지의 상태를 확인
			const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('is_logged_in') === 'true' : false;
			const userData = typeof window !== 'undefined' ? sessionStorage.getItem('member_key') : null;

			console.log('앱 초기화: 로그인 상태 =', isLoggedIn);
			console.log('앱 초기화: 사용자 데이터 존재 =', !!userData);

			// URL 경로 로깅
			const path = typeof window !== 'undefined' ? window.location.pathname : '';
			console.log('현재 경로:', path);
		}
	}, []);

	// 서버에서 받은 사용자 정보 (없을 수도 있음)
	// 주의: getServerSideProps에서 반환된 사용자 데이터가 있으면 사용
	const user = pageProps.user;

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
				<title>TypeLegal</title>
			</Head>
			<QueryClientProvider client={queryClient}>
				{/* pageProps.dehydratedState가 있으면 Hydrate 적용 */}
				<Hydrate state={pageProps.dehydratedState}>
					{/* 사용자 정보 Context Provider */}
					<UserProvider initialUserData={user}>
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
					</UserProvider>
					{/* 개발 환경에서만 React Query Devtools 표시 */}
					{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
				</Hydrate>
			</QueryClientProvider>
		</>
	);
}
