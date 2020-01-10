const fs = require('fs');
const Parser = require('./modules/Parser.js');
const File = require('./modules/File.js');

(async () => {
	const parser = new Parser();
	const listHTML = await parser.page('https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/');

	const arCartUrls = await parser.getData(listHTML, $ => {
		return $('.widget-search-result-container a').map((index, link) => {
			return 'https://www.ozon.ru' + $(link).attr('href').trim();
		}).get();
	});

	main(arCartUrls, data => {
		console.log(data)
	});


	// добавить в консоль прогресс
	function main(urls, callback) {
		let result = [];
		let n = 0;

		const f = new File();
		f.rmDir('media/toys', { recursive: true });

		cartPromise(n);

		function cartPromise(index) {
			return new Promise(resolve => {
				(async () => {
					const html = await parser.page(urls[index]);
					await parser._sleep(1000);
					const data = await parser.getData(html, async $ => {
						const price = Number($('.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child').text().replace(/[ \s₽]/gi, '').trim());

				        const optResult = [];
				        $('#section-characteristics dl').each((index, item) => {
				            const titles = $(item).find('dt span').map((index, item) => {
				                return $(item).text();
				            }).get();
				            const values = $(item).find('dd > div > *').map((index, item) => {
				                return $(item).text();
				            }).get();

				            titles.forEach((item, index) => {
				                optResult.push({
				                    title: item,
				                    value: values[index]
				                })
				            });
				        });

				        const result = {
				            title: $('.detail h1 span').text().trim(),
				            description: $('#section-description > div > div > div > div').text().trim(),
				            category: 'toys',
				            price,
				            options: optResult,
				            img: await parser.getImg($('.magnifier-image img').attr('src'), 'toys', 'media')
				        };

				        return result;
					});
					console.log(data)
					result.push(data);
					resolve(index + 1);
				})()
			}).then(index => {
				if(index < urls.length) {
					cartPromise(index)
				} else {
					callback(result);
				}
			});
		}
	}
})();