import React from 'react';

// transition-all ease-out duration-1000 h-full bg-green-500 relative w-0
export default function ProgressBar({ currProgress }) {
	//   console.log('currProgress', currProgress)
	return (
		<>
			<div className="flex w-full rounded-sm bg-gray-300 dark:bg-gray-700">
				<div className="bg-blue-500 text-xs rounded-sm font-medium text-blue-100 text-center p-1.5 leading-none transition-all ease-out duration-1000" style={{ width: currProgress + '%' }}>
					{currProgress}%
				</div>
			</div>
		</>
	);
}
