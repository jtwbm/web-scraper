const fs = require('fs');
const Parser = require('./modules/Parser.js');

(async () => {
	const parser = new Parser();
	const listHTML = await parser.page('https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/');


	const listOptions = [
        {
            el: '.widget-search-result-container a',
            callback: (link, $) => {
                return 'https://www.ozon.ru' + $(link).attr('href').trim();
            }
        }
    ];
	const arCartUrls = await parser.getData(listHTML, listOptions);

	const cartOptions = [
		{
			key: 'title',
			el: '.detail h1 span',
			callback: (title, $) => {
				return $(title).text().trim();
			}
		},
		{
			key: 'description',
			el: '#section-description > div > div > div > div',
			callback: (desc, $) => {
				return $(desc).text().trim();
			}
		},
		{
			key: 'category',
			value: 'toys'
		},
		{
			key: 'price',
			el: '.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child',
			callback: (price, $) => {
				return Number($(price).text().replace(/[ \s₽]/gi, '').trim());
			}
		},
		{
			key: 'options',
			el: '#section-characteristics dl',
			callback: (attr, $) => {
				// нужен index
				return '123'
			}
		},
		{
			key: 'img',
			el: '.magnifier-image img',
			callback: async (img, $) => {
				return await parser.getImg($(img).attr('src'), 'toys', 'media');
			}
		}
	];


	main(arCartUrls[0], data => {
		console.log(data)
	});


	// надо удалять медиа файлы перед запуском скрипта
	// добавить в консоль прогресс
	function main(urls, callback) {
		let result = [];
		let n = 0;

		cartPromise(n);

		function cartPromise(index) {
			return new Promise(resolve => {
				(async () => {
					const html = await parser.page(urls[index]);
					await parser._sleep(1000);
					const data = await parser.getCartData(html);
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