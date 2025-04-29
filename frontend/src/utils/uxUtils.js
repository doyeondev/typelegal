export function handleScroll(span_id) {
	//   console.log('entered handleScroll', `span_${span_id}`)
	const container = document.getElementById('right2');
	const element = document.getElementById(`span_${span_id}`);

	//   container.scrollTop = 0
	if (element) {
		container.scrollTop = element.offsetTop - 300;
	}
}

export function handleScroll2(div_id) {
	//   console.log('entered handleScroll', `span_${span_id}`)
	const container = document.getElementById('right2');
	const element = document.getElementById(`${div_id}`);
	if (element) {
		// console.log('container', container)
		// console.log('element', element)
		// console.log('element.offsetTop', element.offsetTop)
		// console.log('element.offsetTop - 300', element.offsetTop - 300)
		container.scrollTo({
			top: element.offsetTop - 300,
			behavior: 'smooth',
		});
	}
}
