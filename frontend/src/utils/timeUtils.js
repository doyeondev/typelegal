export function timestamp() {
	const today = new Date();
	today.setHours(today.getHours() + 9);
	return today.toISOString().replace('T', ' ').substring(0, 19);
}

export function timeDiffSec(start, end) {
	let timeStart = new Date(start);
	let timeEnd = new Date(end);
	// let timeStart = new Date('2022-10-09 12:00')
	// let timeEnd = new Date('2023-10-09 12:00')
	// console.log('timeStart', timeStart)
	// console.log('timeEnd', timeEnd)

	let difference = timeEnd.getTime() - timeStart.getTime(); // This will give difference in milliseconds
	let resultInSeconds = Math.round(difference / 1000);
	return resultInSeconds;
}
export function timeDiffMin(start, end) {
	let timeStart = new Date(start);
	let timeEnd = new Date(end);
	// let timeStart = new Date('2022-10-09 12:00')
	// let timeEnd = new Date('2023-10-09 12:00')
	// console.log('timeStart', timeStart)
	// console.log('timeEnd', timeEnd)

	let difference = timeEnd.getTime() - timeStart.getTime(); // This will give difference in milliseconds
	let resultInMinutes = parseFloat((difference / 1000 / 60).toFixed(2));
	// console.log('resultInMinutes', resultInMinutes)
	return resultInMinutes;
}
