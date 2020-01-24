const Scraper = require('./modules/Scraper.js');
const File = require('./modules/File.js');

const f = new File();

(async () => {
	const scraper = new Scraper();

	let arCartUrls = [];
	const linksConfig = {
		urls: ['https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/'],
		progressBar: true,
		items: [
			{
				el: '.widget-search-result-container a',
				callback: (el, $) => {
					return $(el).map((index, link) => {
						return 'https://www.ozon.ru' + $(link).attr('href').trim();
					}).get();
				},
			}
		],
		afterFn: (data) => {
			console.log('get list of links complete!');
			arCartUrls = data[0];
		},
	};
	await scraper.init(linksConfig);

	const config = {
		urls: arCartUrls,
		progressBar: true,
		items: [
			{
				key: 'title',
				el: '.detail h1 span',
				callback: $el => {
					return $el.text().trim();
				},
			},
			{
				key: 'description',
				el: '#section-description > div > div > div > div',
				callback: $el => {
					return $el.text().trim();
				},
			},
			{
				key: 'category',
				value: 'toys',
			},
			{
				key: 'price',
				el: '.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child',
				callback: $el => {
					return Number($el.text().replace(/[ \s₽]/gi, '').trim());
				},
			},
			{
				key: 'cover',
				el: '.magnifier-image img',
				callback: async ($el, $, index) => {
					const img = await scraper.getImg($el.attr('src'));
			        const imgPath = img ?  `./media/toys/${ index }.${ img.extension }` : null;

			        if(img) await f.addFile(imgPath, img.data);
			        return imgPath;
				},
			},
			{
				key: 'options',
				el: '#section-characteristics dl',
				callback: ($el, $) => {
					const result = [];
			        $el.each((index, item) => {
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
		beforeFn: async () => {
			await f.rmDir('media/toys');
			f.rmFile('json/toys.json');
		},
		afterFn: async (data) => {
			await f.renderJSON(data, 'json', 'toys');
			console.log('json was created!');
		},
	};

	await scraper.init(config);
	
})();