const fs = require('fs');
const Parser = require('../modules/Parser.js');
const File = require('../modules/File.js');

const listHTML = fs.readFileSync('__tests__/list.html', 'utf8', err => console.log(err));
const cartHTML = fs.readFileSync('__tests__/cart.html', 'utf8', err => console.log(err));
const parser = new Parser();
const f = new File();

it('list of links', async () => {
	const urlList = await parser.getData(listHTML, $ => {
		return $('.widget-search-result-container a').map((index, link) => {
			return 'https://www.ozon.ru' + $(link).attr('href').trim();
		}).get();
	});

	const urlRegex = /^https?:\/\/[\w\d\/\?@:%._\+~#=&]{3,}$/;

	expect(Array.isArray(urlList)).toBeTruthy();
	expect(urlList.length).not.toBe(0);
	expect(urlList.every(url => typeof url === 'string')).toBeTruthy();
	expect(urlList.every(url => urlRegex.test(url))).toBeTruthy();
});

it('cart data', async () => {
	const cartData = await parser.getData(cartHTML, async $ => {
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

	const isOptions = cartData.options.length ? cartData.options.every(option => {
		if(typeof option.title === 'string' && typeof option.value === 'string') {
			return true;
		}
		return false;
	}) : true;

	expect(typeof cartData.title).toBe('string');
	expect(typeof cartData.category).toBe('string');
	expect(typeof cartData.price).toBe('number');
	// expect(cartData.img.length).not.toBe(0);
	expect(Array.isArray(cartData.options)).toBeTruthy();
	expect(isOptions).toBeTruthy();
});

it('load image', async () => {
	const imgUrlAfterParsing = await parser.getImg('https://cdn1.ozone.ru/multimedia/c1200/1026585512.jpeg', 'testMedia', '');
	const imgExists = await fs.existsSync(imgUrlAfterParsing);

	expect(typeof imgUrlAfterParsing).toBe('string');
	expect(imgExists).toBeTruthy();

	await f.rmDir('testMedia', { recursive: true });
});