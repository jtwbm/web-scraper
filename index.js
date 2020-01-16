const fs = require('fs');
const Parser = require('./modules/Parser.js');
const File = require('./modules/File.js');

const f = new File();

(async () => {
	const parser = new Parser();
	const listHTML = await parser.page('https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/');

	// переписать с конфигом
	const arCartUrls = await parser.getData(listHTML, $ => {
		return $('.widget-search-result-container a').map((index, link) => {
			return 'https://www.ozon.ru' + $(link).attr('href').trim();
		}).get();
	});
	
	// сделать автоматические тесты на основе конфига
	// сделать возможность непосредственно в инит закидывать конфиг и в new Parser
	// провести рефакторинг

	const config = {
		urls: arCartUrls,
		progressBar: true,
		items: [
			{
				key: 'title',
				el: '.detail h1 span',
				callback: (el, $) => {
					return $(el).text().trim();
				},
			},
			{
				key: 'description',
				el: '#section-description > div > div > div > div',
				callback: (el, $) => {
					return $(el).text().trim();
				},
			},
			{
				key: 'category',
				value: 'toys',
			},
			{
				key: 'price',
				el: '.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child',
				callback: (el, $) => {
					return Number($(el).text().replace(/[ \s₽]/gi, '').trim());
				},
			},
			{
				key: 'cover',
				el: '.magnifier-image img',
				callback: async (el, $, index) => {
					const img = await parser.getImg($(el).attr('src'));
			        const imgPath = img ?  `./media/toys/${ index }.${ img.extension }` : null;

			        if(img) await f.addFile(imgPath, img.data);
			        return imgPath;
				},
			},
			{
				key: 'options',
				el: '#section-characteristics dl',
				callback: (el, $) => {
					const result = [];
			        $(el).each((index, item) => {
			            const titles = $(item).find('dt span').map((index, item) => {
			                return $(item).text();
			            }).get();
			            const values = $(item).find('dd > div > *').map((index, item) => {
			                return $(item).text();
			            }).get();

			            titles.forEach((item, index) => {
			                result.push({
			                    title: item,
			                    value: values[index]
			                })
			            });
			        });
			        return result;
				},
			},
		],
		beforeFn: () => {
			f.rmDir('media/toys');
			f.rmFile('json/toys.json');
		},
		afterFn: async (data) => {
			await f.renderJSON(data, 'json', 'toys');
		},
	};

	parser.init(config);
	
})();