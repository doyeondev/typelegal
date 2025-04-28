import React from 'react';

export default function Tooltip({ message, children }) {
	return (
		<div className="ml-2 group flex overflow-visible">
			{children}
			<span className="absolute z-40 top-10 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">{message}</span>
		</div>
	);
}
