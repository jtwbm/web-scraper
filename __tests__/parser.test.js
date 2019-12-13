const fs = require('fs');
const parser = require('../parser.js');
const djv = require('djv');

let listHTML;
let cartHTML;

beforeAll(async done => {
	if(!fs.existsSync('__tests__/list.html') && !fs.existsSync('__tests__/cart.html')) {
		await parser.renderTestData();
	}

	listHTML = fs.readFileSync('__tests__/list.html', 'utf8', (err, data) => {});
	cartHTML = fs.readFileSync('__tests__/cart.html', 'utf8', (err, data) => {});
		
	done();
});

it('list of links', async () => {
	const urlList = await parser.getUrlList(listHTML);
	const urlRegex = /^https?:\/\/[\w\d\/\?@:%._\+~#=&]{3,}$/;

	expect(Array.isArray(urlList)).toBeTruthy();
	expect(urlList.length).not.toBe(0);
	expect(urlList.every(url => typeof url === 'string')).toBeTruthy();
	expect(urlList.every(url => urlRegex.test(url))).toBeTruthy();
});

it('cart data', async () => {
	const cartData = await parser.getCartData(cartHTML);
	const isOptions = cartData.options.length ? cartData.options.every(option => {
		if(typeof option.title === 'string' && typeof option.value === 'string') {
			return true;
		}
		return false;
	}) : true;

	expect(typeof cartData.title).toBe('string');
	expect(typeof cartData.category).toBe('string');
	expect(typeof cartData.price).toBe('number');
	expect(cartData.img.length).not.toBe(0);
	expect(Array.isArray(cartData.options)).toBeTruthy();
	expect(isOptions).toBeTruthy();
});

it('load image', async () => {
	const imgUrlAfterParsing = await parser.getImg(parser.cartConfig.imgUrl, 'testMedia', '');
	const imgExists = fs.existsSync(imgUrlAfterParsing);

	expect(typeof imgUrlAfterParsing).toBe('string');
	expect(imgExists).toBeTruthy();

	fs.unlinkSync(imgUrlAfterParsing, (err) => {
	  	if (err) throw err;
	  	console.log(`successfully deleted ${ imgExists }`);
	});

	fs.rmdirSync('testMedia');
});

it('make, remove dir', async () => {
	const path = '/testFolder/test1/test2/test3';
	await parser.mkDir(path);

	// console.log(fs.readlink('/testFolder/test1/test2/test3'))

	// expect(fs.existsSync('/testFolder/test1/test2/test3')).toBeTruthy();

	await parser.rmDir(path);
});

// it('render json', async () => {
// 	const cartDataList = await parser.renderJSON(parser.cartConfig.listUrl);
// 	parser.renderJSON(cartDataList, 'testJSON', 'test');


// });