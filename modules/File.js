const fs = require('fs');

module.exports = class File {
    constructor() {}

    async renderJSON(data, path, fileName) {
        const json = JSON.stringify(data);
        await this.mkDir(path);
        await this.addFile(`${ path }/${ fileName }.json`, json);
    }

    async addFile(path, data = '') {
        const fileName = path.split('/').pop();
        if(!fs.existsSync(path)) {
            this.mkDir(path.replace(fileName, ''));
            fs.writeFileSync(path, data, 'utf8', (err) => console.log(err));
        }
    }

    rmFile(path) {
        if(fs.existsSync(path)) {
            fs.unlinkSync(path, err => console.log(err));
        }
    }

    mkDir(path) {
        if(!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true }, (err) => console.log(err));
        }
    }

    async rmDir(path, config = { recursive: false }) {
        const dirList = path.split('/').filter(str => str.length);
        const dirContent = fs.readdirSync(path);

        if(!dirList.length) {
            throw new Error('Incorrected path');
        }

        if(!dirContent.length && !config.recursive) {
            throw new Error(`${ path } is not empty`);
        }

        if(config.recursive) {
            fs.readdirSync(path).forEach(file => {
                this.rmFile(`${ path }/${ file }`);
            });
        }

        if(fs.existsSync(path)) {
            rm(dirList);
        }

        function rm(arPath) {
            if(arPath.length && !fs.existsSync(arPath)) {
                fs.rmdirSync(arPath.join('/'));
                arPath.splice(arPath.length - 1, 1);
                rm(arPath);
            }
        }
    }
}