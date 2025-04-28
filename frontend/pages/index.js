import Image from 'next/image';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import LoginModal from '../components/modals/LoginModal';
import Link from 'next/link';
import PublicRoute from '../src/components/auth/PublicRoute';

const inter = Inter({ subsets: ['latin'] });

function Home() {
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
			{/* h-[calc(100vh-68px)] */}
			<main className={`flex flex-col pt-[60px] place-items-center items-center justify-between ${inter.className}`}>
				<div className="w-full h-full pt-24 pb-40 place-content-center grid bg-[#F7F9FD]">
					{/* <Image alt="타입리걸" src="/image/landing.png" layout="fill" objectFit="cover" /> */}
					<div className="flex flex-col text-center space-y-10">
						{/* <div className="text-center space-y-8"> */}
						<div className="space-y-6">
							<span className="text-purple-400 font-medium text-base">프리랜서 디자이너를 위해 만들었어요</span>
							<h1 className="text-3xl font-bold leading-tight">
								계약서를 가장 쉽게 작성하는 방법
								{/* <br /> */}
							</h1>
						</div>
						<div className="text-base font-semibold">
							<p className="text-gray-500">때로는 어렵고, 때로는 귀찮은 계약서 작성</p>
							<p className="text-gray-500">타입리걸은 안전한 계약문화를 지향해요</p>
						</div>
						<Link
							className="mx-auto place-content-center cursor-pointer flex bg-purple-500 hover:bg-purple-700 py-2.5 px-8 focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-base dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800"
							href="/draft"
						>
							<p className="text-white">작성 시작하기</p>
						</Link>
					</div>
				</div>
				<div className="bg-transparent">
					<Image alt="타입리걸 서비스 UI" priority={true} src="/image/landing_ui.png" width={0} height={0} sizes="100vw" className="w-[70vw] h-auto mx-auto mb-24 -mt-24" />
				</div>
				<div className="w-full py-24 bg-[#F7F9FD]">
					<div>
						<h3 className="text-2xl font-bold text-center">계약서 작성이 얼마나 쉬워졌는지 직접 확인해 보세요!</h3>
						<div className="flex place-content-center">
							<div className="flex gap-12 mt-8 items-center">
								<div>
									<Link
										className="mx-auto place-content-center cursor-pointer flex text-white bg-purple-500 hover:bg-purple-700 py-2.5 px-8 focus:ring-4 focus:ring-blue-300 font-medium rounded-sm text-base dark:bg-purple-600 dark:hover:bg-purple-700 focus:outline-none dark:focus:ring-purple-800"
										href="/draft"
									>
										<p className="text-white">계약서 작성하기</p>
									</Link>
								</div>
								<div className="space-y-2 text-base">
									<div className="flex gap-2 items-center">
										<span>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#52009e" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
											</svg>
										</span>
										<p className="text-[#9e9e9e]">
											회원가입 이후 서비스 <span className="text-[#52009e] font-semibold">무료 이용</span>
										</p>
									</div>
									<div className="flex gap-2 items-center">
										<span>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#52009e" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
											</svg>
										</span>
										<p className="text-[#9e9e9e]">
											계정 생성 시 문서 관리 <span className="text-[#52009e] font-semibold">대시보드 제공</span>
										</p>
									</div>
									<div className="flex gap-2 items-center">
										<span>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#52009e" className="w-5 h-5">
												<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
											</svg>
										</span>
										<p className="text-[#9e9e9e]">
											간단한 설문을 통해 원본 <span className="text-[#52009e] font-semibold">파일 다운로드</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* </div> */}
			</main>
		</Layout>
	);
}

export default function HomePage() {
	return (
		<PublicRoute restricted={false}>
			<Home />
		</PublicRoute>
	);
}
