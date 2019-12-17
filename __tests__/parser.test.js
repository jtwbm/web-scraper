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
	const path = 'testFolder/test1/test2/test3';
	await parser.mkDir(path);
	expect(fs.existsSync(path)).toBeTruthy();

	await parser.rmDir(path);
	expect(!fs.existsSync('testFolder')).toBeTruthy();
});

it('render json', async () => {
	const listOfLinks = await parser.getUrlList(listHTML);
	await parser.renderJSON(listOfLinks, 'testJSON', 'test');

	expect(fs.existsSync('testJSON/test.json')).toBeTruthy();

	const jsonData = JSON.stringify(JSON.parse(fs.readFileSync('testJSON/test.json')));

	expect(jsonData).toBe(JSON.stringify(listOfLinks));
	await parser.rmFile('testJSON/test.json');
	await parser.rmDir('testJSON');
});

it('add/remove file', async () => {
	const filePath = 'testFile/file.txt';
	const fileData = 'my test data';

	await parser.addFile(filePath, fileData);

	expect(fs.existsSync(filePath)).toBeTruthy();
	expect(fs.readFileSync(filePath, 'utf8')).toBe(fileData);

	await parser.rmFile(filePath);
	await parser.rmDir('testFile');
});


// valid json