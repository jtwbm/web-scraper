const fs = require('fs');
const parser = require('./parser.js');


(async () => {
	const html = await parser.getHTML('https://www.ozon.ru/context/detail/id/150436579/');
	const data = await parser.getCartData(html);
	console.log(data);
})();
	
// (async function() {
// 	try {

// 		html = await parser.getHTML(parser.cartConfig.cartUrl);
// 		fs.writeFile('__tests__/test.html', html, 'utf8', (err) => {});

// 	} catch(err) {
// 		console.log(err);
// 	}
// })();