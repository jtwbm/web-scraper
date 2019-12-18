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
        fs.mkdirSync(path, { recursive: true }, (err) => console.log(err));
    }

    async rmDir(path) {
        const dirList = path.split('/').filter(str => str.length);

        rm(dirList);
        
        function rm(arPath) {
            if(arPath.length && !fs.existsSync(arPath)) {
                fs.rmdirSync(arPath.join('/'));
                arPath.splice(arPath.length - 1, 1);
                rm(arPath);
            }
        }
    }
}