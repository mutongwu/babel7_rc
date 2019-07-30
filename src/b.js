var array = [1,2,3];

Array.from(array).forEach(($item) => {
 console.log($item);
})

var cc = async () => {

		let k = await Promise.resolve(100);
		console.log('cc', k)
		return k;
	}

cc();