const request = require('request-promise');
const fs = require('fs');
const cheerio = require('cheerio');

async function main() {
	const html = await request.get('https://www.ozon.ru/category/chayniki-i-kofeyniki-30814/');

	fs.writeFileSync('./test.html', html);

	const $ = await cheerio.load(html);

	$('.a2u7').each((index, item) => {
		console.log($(item).text())
	});
}

main();