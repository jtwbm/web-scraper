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
	await f.rmDir('testJSON');
});

it('add/remove file', async () => {
	const filePath = 'testFile/file.txt';
	const fileData = 'my test data';

	await f.addFile(filePath, fileData);
	await f.addFile('testFile/test.txt', '');
	await f.addFile('testFile/other.txt', '');

	expect(fs.existsSync(filePath)).toBeTruthy();
	expect(fs.readFileSync(filePath, 'utf8')).toBe(fileData);
	await f.rmDir('testFile');
});

it('make, remove dir', async () => {
	const path1 = 'testFolder/test1/test2/test3';
	const path2 = 'testFolder/test1/test4';
	await f.mkDir(path1);
	await f.mkDir(path2);

	expect(fs.existsSync(path1)).toBeTruthy();
	expect(fs.existsSync(path2)).toBeTruthy();

	await f.rmDir('testFolder');
	expect(!fs.existsSync('testFolder')).toBeTruthy();
});

