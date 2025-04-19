import Image from 'next/image';
import Link from 'next/link';

// 사이드바 컴포넌트 (대시보드 좌측에 표시되는 메뉴)
function Sidebar({ data }) {
	return (
		<>
			<aside className="flex flex-col w-[240px] h-screen px-4 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700">
				<Link href="/" className="flex pl-4">
					<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" style={{ width: '150px', height: 'auto' }} />
				</Link>
				<div className="flex flex-col justify-between flex-1 mt-6">
					<nav>
						<Link href="#" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200">
							<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<span className="mx-4 font-medium">내 문서</span>
						</Link>
					</nav>
				</div>
				{/* 측면 하판 */}
				<div className="grid space-y-5 pl-2">
					<div className="font-bold">문제가 발생했나요?</div>
					<div className="w-8 h-1 bg-gray-300"></div>
					<div className="text-sm font-medium text-gray-500 space-y-0.5">
						<div>문의가능 : M-F, 09:00-19:00</div>
						<div>이메일 : team@typelegal.io</div>
					</div>
				</div>
			</aside>
		</>
	);
}

export default Sidebar;
