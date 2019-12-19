const fs = require('fs');
const parser = require('./modules/parser.js');


(async () => {
	const listHTML = await parser.getHTML('https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/');
	const cartHTML = await parser.getHTML('https://www.ozon.ru/context/detail/id/150436579/');
	const cartData = await parser.getCartData(cartHTML);
	const cartUrls = await parser.getUrlList(listHTML);
})();