const fs = require('fs').promises;
const path = require('path');
const pLimit = require('p-limit');
const Events = require('events');

class ExecFinder extends Events {
    constructor(opts) {
        super()
        this.opts = Object.assign({
            recursion: 2
        }, opts || {});
        switch(process.platform) {
            case 'win32':
                this.dirs = [
                    'C:/Program Files',
                    'C:/Program Files (x86)',
                    'C:/Users/'+ process.env.USERNAME +'/AppData/Local'
                ];
                break;
            case 'darwin': // macOS
                this.dirs = [
                    '/Applications',
                    '/usr/bin',
                    '/usr/local/bin',
                    '/opt',
                    path.join('/Users', process.env.USER, 'bin') // User's bin directory
                ];
                break;
            case 'linux':
            default:
                this.dirs = [    
                    '/usr/bin',
                    '/usr/local/bin',
                    '/opt'
                ];
        }
    }
    async scanDir(dir, currentRecursion) {
        const files = await fs.readdir(dir).catch(err => this.emit('error', err));
        const filePaths = [];
        if (Array.isArray(files)) {
            const limit = pLimit(2);
            const tasks = files.map(file => {
                return async () => {
                    const fullPath = path.join(dir, file);
                    try {
                        const stat = await fs.stat(fullPath);
                        if (stat.isFile()) {
                            filePaths.push(fullPath);
                        } else if (stat.isDirectory() && currentRecursion < this.opts.recursion) {
                            const nestedFiles = await this.scanDir(fullPath, currentRecursion + 1);
                            filePaths.push(...nestedFiles);
                        }
                    } catch (error) {
                        this.emit('error', error);
                    }
                }
            }).map(limit);
            await Promise.allSettled(tasks);
        }
        return filePaths;
    }
    async scanDirs(refresh) {
        if(refresh !== true && Array.isArray(this.filesList) && this.filesList.length) return this.filesList;
        this.filesList = [];
        const limit = pLimit(2);
        const tasks = this.dirs.map(dir => async () => {
            this.filesList.push(...(await this.scanDir(dir, 1))); // Começa com nível de recursão 1
        }).map(limit);
        await Promise.allSettled(tasks);
        return this.filesList;
    }
    async find(names, opts={}) {
        await this.scanDirs(opts.refresh);
        const results = {};
        const direct = typeof(names) == 'string';
        if(direct) {
            names = [names];
        }
        for(const name of names) {
            let binName = path.sep + name;
            if(process.platform == 'win32') {
                binName += '.exe';
            }
            results[name] = this.filesList.filter(file => file.endsWith(binName));
            if(opts.first && results[name].length) {
                return results[name].shift()
            }
        }
        return direct ? results[names[0]].sort((a, b) => a.length - b.length).shift() : results;
    }
    async findOne(names) {
        return this.find(names, {
            first: true
        })
    }
}



module.exports = ExecFinder
