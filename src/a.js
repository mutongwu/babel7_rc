var logFn = (a) => {
	console.log('logFn:', a)
}
export default {
	log: logFn,
	async bb(){

		let k = await Promise.resolve(100);
		console.log('bb', k)
		return k;
	}
}