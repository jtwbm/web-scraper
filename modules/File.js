const fs = require('fs');
const Path = require('path');

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

    async rmDir(path = false, config = { recursive: true }) {
        if(!path) throw new Error('Incorrected path');

        await rm(path);

        async function rm(path) {
            fs.readdirSync(path).forEach(async file => {
                if(config.recursive === false) throw new Error(`${ path } is not empty`); 
                
                if(Path.extname(file)) {
                    fs.unlinkSync(`${ path }/${ file }`, err => console.log(err));
                } else {
                    await rm(`${ path }/${ file }`);
                }
            });

            if(fs.existsSync(path)) {
                fs.rmdirSync(path, err => console.log(err));
            }
        }
    }
}