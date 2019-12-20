const fs = require('fs');
const Parser = require('./modules/Parser.js');


(async () => {
	const parser = new Parser();
	const listHTML = await parser.page('https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/');
	const arCartUrls = await parser.getUrlList(listHTML);
	const arCartsData = await arCartUrls.map(async url => {
		const html = await parser.page(url);
		await parser._sleep(1000);
		return await parser.getCartData(html);
	});

	console.log(arCartsData)
	// const cartHTML = await parser.getHTML('https://www.ozon.ru/context/detail/id/150436579/');
	// const cartData = await parser.getCartData(cartHTML);
	// const cartUrls = await parser.getUrlList(listHTML);
})();