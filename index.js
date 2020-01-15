const fs = require('fs');
const Parser = require('./modules/Parser.js');
const File = require('./modules/File.js');
const cliProgress = require('cli-progress');

const consoleBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

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

	// в конце создать json
	// сделать отдельный конфиг
	// вынести в Parser метод обработки конфига
	// сделать автоматические тесты на основе конфига

	async function main(urls, callback) {
		let result = [];

		const f = new File();
		f.rmDir('media/toys');

		consoleBar.start(urls.length, 0);

		await cartPromise(0);

		async function cartPromise(index) {
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

		        const img = await parser.getImg($('.magnifier-image img').attr('src'));
		        const imgPath = img ?  `./media/toys/${ index }.${ img.extension }` : null;

		        if(img) {
		        	await f.addFile(imgPath, img.data);
		        }
		        
		        const result = {
		            title: $('.detail h1 span').text().trim(),
		            description: $('#section-description > div > div > div > div').text().trim(),
		            category: 'toys',
		            price,
		            options: optResult,
		            img: imgPath,
		        };

		        return result;
			});

			result.push(data);

			if(index + 1 < urls.length) {
				consoleBar.update(index + 1);
				await cartPromise(index + 1);
			} else {
				consoleBar.stop();
				callback(result);
			}

		}
	}
})();