# WEB scraper
Веб-скрапер для сбора тестовых данных. Пример сбора данных находится в `index.js`. Там я собираю некоторые данные о товарах с интернет-магазина Ozon.

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

## API

### class Parser
```sh
# импорт класса
$ const Parser = require('./modules/Parser.js');

# создание экземпляра класса
$ const parser = new Parser();

# пример конфига
$ const parserConfig = {
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
		console.log('finish!');
	},
};
```