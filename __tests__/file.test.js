const fs = require('fs');
const File = require('../modules/File.js');

const f = new File();

it('render json', async () => {
	const data = {
		field1: 1,
		field2: 'srt'
	};

	await f.renderJSON(data, 'testJSON', 'test');

	expect(fs.existsSync('testJSON/test.json')).toBeTruthy();

	const jsonData = JSON.stringify(JSON.parse(fs.readFileSync('testJSON/test.json')));

	expect(jsonData).toBe(JSON.stringify(data));
	await f.rmFile('testJSON/test.json');
	await f.rmDir('testJSON');
});

it('add/remove file', async () => {
	const filePath = 'testFile/file.txt';
	const fileData = 'my test data';

	await f.addFile(filePath, fileData);

	expect(fs.existsSync(filePath)).toBeTruthy();
	expect(fs.readFileSync(filePath, 'utf8')).toBe(fileData);

	await f.rmFile(filePath);
	await f.rmDir('testFile/');
});

it('make, remove dir', async () => {
	const path = 'testFolder/test1/test2/test3';
	await f.mkDir(path);
	expect(fs.existsSync(path)).toBeTruthy();

	await f.rmDir(path);
	expect(!fs.existsSync('testFolder')).toBeTruthy();
});

