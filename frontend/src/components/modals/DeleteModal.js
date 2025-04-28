import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const DeleteModal = ({ isOpen, setIsOpen, deleteItemHandler, id }) => {
	function closeModal() {
		setIsOpen(false);
	}

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
				<div className="min-h-screen px-4 text-center">
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
						<div className="my-8 inline-block w-[480px] transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-sm transition-all">
							<div className="p-8">
								<div className="grid mt-6 space-y-4">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#FF3F55" className="mx-auto w-8 h-8">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
										/>
									</svg>
									<p className="text-md text-center font-normal text-gray-500">정말로 삭제하시겠습니까?</p>
								</div>
							</div>
							<div className="flex space-x-2 px-4 pb-6">
								<button onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center space-x-1 rounded-md border border-gray-400 py-2 text-sm text-gray-600 shadow-xs hover:bg-gray-200">
									<span>다음에 삭제할게요</span>
								</button>
								<button
									onClick={function (event) {
										deleteItemHandler(id);
										setIsOpen(false);
									}}
									className="flex w-full items-center justify-center space-x-1 rounded-md bg-red-500 py-2 text-sm text-white shadow-xs hover:bg-red-600 gap-1"
								>
									<span>네, 삭제할래요</span>
								</button>
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
};

export default DeleteModal;
