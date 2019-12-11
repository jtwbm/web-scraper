const fs = require('fs');
const parser = require('../parser.js');

let html;

beforeAll(() => {
	html = fs.readFileSync('__tests__/test.html', 'utf8', (err, data) => {});
});

it('incorrect cart data', async () => {
	const cartData = await parser.getCartData(html);
	expect(cartData).toEqual({
		title: 'Мягкая игрушка "авокадо" 20 см',
	    description: 'Плюшевая игрушка авокадо (темно-зеленое).Средний размер из своего семейства 20см.',
	});
});
