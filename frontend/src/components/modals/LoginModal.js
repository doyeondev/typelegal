import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import LoginItem from '../LoginItem';

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

	return (
		<Transition appear show={loginModalOpen} as={Fragment}>
			{/* <Dialog as="div" className="fixed inset-0 z-100 overflow-y-auto" open={isOpen} onClose={() => setLoginModalOpen(false)}> */}
			<Dialog as="div" className="fixed inset-0 z-100 overflow-y-auto" onClose={closeModal}>
				<div className="h-fit px-4 text-center">
					<Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
						<Dialog.Overlay className="fixed inset-0 bg-black/50" />
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span className="inline-block h-screen align-middle" aria-hidden="true">
						&#8203;
					</span>
					{/* <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"> */}
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enterTo="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 translate-y-0 sm:scale-100"
						leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					>
						<div className="inline-block w-[480px] transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-sm transition-all">
							<div>
								<div onClick={handleClose} className="cursor-pointer flex flex-row-reverse pt-6 pr-6">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
										<path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<LoginItem onLoginSuccess={handleLoginSuccess} />
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
};

export default LoginModal;
