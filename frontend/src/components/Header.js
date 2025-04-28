import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional for styling

export default function Header() {
	const [currentMember, setCurrentMember] = useState('');

	useEffect(() => {
		async function getPageData() {
			localStorage.theme = 'light';

			if (sessionStorage.getItem('member_key')) {
				let member_value = JSON.parse(sessionStorage.getItem('member_key'));
				setCurrentMember(member_value);
				// console.log('member_value', member_value)
			}
			tippy('#loginBtn', {
				content: '엑세스를 제공 받으신 분만 사용 가능합니다.',
			});
		}
		getPageData();
	}, []);

	function logOutUser() {
		sessionStorage.removeItem('member_key');
		refreshPage();
	}

	function refreshPage() {
		window.location.reload();
	}
	return (
		<>
			<header className="fixed h-[60px] border-b-2 w-full bg-white px-10 py-2 text-gray-600 body-font">
				<div className="mx-auto h-full flex items-center flex-wrap md:flex-row">
					{/* 홈 링크 */}
					<Link href="/" className="flex title-font font-medium text-gray-900">
						<Image alt="타입리걸" src="/icon/typelegal.png" width={0} height={0} sizes="100vw" className="justify-center w-[150px] p-2" />
					</Link>

					{/* 메뉴 바 */}
					<nav className="ml-auto flex flex-wrap items-center text-base justify-center">
						{/* <Link href="/" className="mr-5 hover:text-gray-900">
              홈
            </Link>
            <Link href="/projects" className="mr-5 hover:text-gray-900">
              계약서 작성하기
            </Link> */}
						<div className="flex ml-auto gap-x-5">
							{currentMember ? (
								<button onClick={logOutUser} className="px-4 p-0.5 border rounded-lg btn-plain">
									로그아웃
								</button>
							) : (
								<Link href="/login" className="hover:text-gray-900">
									<button id="loginBtn" className="px-4 py-1 border rounded-lg btn-plain">
										로그인
									</button>
								</Link>
							)}
							{currentMember && (
								<Link href="/dashboard" className="hover:text-gray-900">
									<button id="draftBtn" className="px-4 py-1 border rounded-lg btn-purple">
										계약서 작성하기
									</button>
								</Link>
							)}
						</div>
					</nav>
				</div>
			</header>
		</>
	);
}
