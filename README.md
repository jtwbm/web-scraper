
# WEB scraper
Веб-скрапер для сбора тестовых данных. Пример сбора данных находится в `index.js`. Там я собираю некоторые данные о товарах из интернет-магазина Ozon.

> За любое использование парсера в незаконных целях вы самостоятельно несете полную юридическую ответсвенность

## Возможности

 - Сбор простых данных с помощью jQuery-подобного синтаксиса (здесь используется `cheerio`)
 - Сбор файлов (я пробовала собрать только картинки, остальные пока не тестила)
 - Рендер json-файлов со списком того, что вы только что спарсили
 - Создание/удаление файлов и папок

## Установка и запуск
```sh
# Клонируем и устанавливаем проект
$ git clone https://github.com/jtwbm/web-scraper.git scraper
$ cd scraper
$ npm install

# С помощью Yarn
$ yarn install

# Запуск тестов
$ yarn run test

# Запуск парсера
$ node index.js
```
### Example
```sh
# импорт класса
$ const Scraper = require('./modules/Scraper.js');

# создание экземпляра класса
$ const scraper = new Scraper();

# пример конфига
$ const scraperConfig = {
	urls: ['url1', 'url2', ...],
	progressBar: true,
	items: [
		{
			key: 'attrName1',
			el: '.myClass1',
			callback: (el, $) => {
				return $(el).text();
			},
		},
		{
			key: 'attrName2',
			el: '.myClass2',
			callback: (el, $, index) => {
				return Number($(el).text()) * index;
			},
		},
	],
	beforeFn: () => {
		console.log('start!');
	},
	afterFn: (data) => {
		/** data:
		 *
		*/
		console.log('finish!');
	},
};

# Запуск скрапера
scraper.init(scraperConfig);
```

## DOCS

### Scraper config
| option | type | description |
|--|--|--|
| `urls` | *Array* <*String*> | Список URL, с которыми будет работать скрапер |
| `progressBar` | *Boolean* | Показывать или нет прогрессбар в консоли. По умолчанию `false`. |
| `items` | *Array* <*Object*> | Список строк для одного `item`, которые попадут в итоговый массив данных. |
| `beforeFn` | *Function* | Функция, которая выполнится перед запуском скрапера. |
| `afterFn(data)` | *Function* | Callback-функция, которая выполнится после окончания сбора данных. `data` - все полученные данные. |

### item

| option | type | description |
|--|--|--|
| `key` | *String* | Название поля. |
| `el` | *String* | jQuery-подобный селектор блока, с которым предстоит работать. |
| `value` | *Any* | Захардкоженное значение поля. Если оно стоит, `el` и `callback` игнорируются. |
| `callback(el, $, index)` | *Function* | Callback-функция. `el` - селектор блока. `$` - см. [cheerio](https://github.com/cheeriojs/cheerio). `index` - индекс текущего `item`. |


### Scraper.init(config) *`async`*
Запуск скрапера, `config` - см. пример выше.

```sh
# index.js
$ const Scraper = require('./modules/Scraper.js');
$ const scraper = new Scraper();
$ const config = {options...};
$ scraper.init(config);
```
### File.renderJSON(data, path, fileName) *`async`*
Генерация json-файла из массива данных.
| argument | description |
|--|--|
| `data` | массив данных |
| `path` | путь до папки, в котором должен лежать файл |
| `fileName` | название файла |

```sh
# index.js
$ const File = require('./modules/File.js');
$ const f = new File();
$ f.renderJSON([item1, item2,..], 'yourFolder', 'myJSON'); // render file by path: 'yourFolder/myJSON.json'
```

### File.addFile(path, data = '') *`async`*
Создание файла.
| argument | description |
|--|--|
| `path` | путь до файла |
| `data` | данные файла, по умолчанию `''` |

```sh
# index.js
$ const File = require('./modules/File.js');
$ const f = new File();
$ f.addFile('folder/subfolder/test.txt', 'hello'); // render file by path: 'folder/subfolder/test.txt' with text 'hello'
```
### File.rmFile(path) 
Удаление файла.
| argument | description |
|--|--|
| `path` | путь до файла |
```sh
# index.js
$ const File = require('./modules/File.js');
$ const f = new File();
$ f.rmFile('folder/subfolder/test.txt'); // remove file by path: 'folder/subfolder/test.txt'
```
### File.mkDir(path)
Создание папки.
| argument | description |
|--|--|
| `path` | путь до папки |

```sh
# index.js
$ const File = require('./modules/File.js');
$ const f = new File();
$ f.mkDir('folder1/folder2'); // add folders 'folder1' && 'folder1/folder2'
```
### File.rmDir(path, { recursive: true }) *`async`*
Удаление папки.
| argument | description |
|--|--|
| `path` | путь до папки |
| `recursive` | если стоит `false`, генерируется ошибка, если папка не пуста. По умолчанию `true` - кроме самой папки удаляет все файлы, лежащие в ней. |

```sh
# index.js
$ const File = require('./modules/File.js');
$ const f = new File();
$ f.rmDir('folder1/folder2'); // remove `folder2` from 'folder1'
```

