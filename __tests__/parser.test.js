const parser = require('../parser');

it('should give 4', () => {
	expect(parser.add(2,2)).toBe(4);
});