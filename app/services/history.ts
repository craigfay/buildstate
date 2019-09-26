import * as fs from 'fs';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
// import * as Uglify  from 'uglify-js'
const Uglify = require('uglify-js')

const append = promisify(fs.appendFile);
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const dir = promisify(fs.readdir);

const mutationsDir = '/Users/craigfay/Repositories/warehouse/app/mutations';

function history(mutationPath): Rebuildable {
  return {
    async rebuild() {
      let data:any = {};
      const id = () => randomBytes(32).toString('hex');
    
      const mutationFiles = await dir(mutationPath);
      for (const file of mutationFiles) {
        const mutater = require(`${mutationPath}/${file}`);
        data = mutater(data, id);
      }
      return data;
    },

    async commit(fn) {
      const timestamp = new Date().toISOString();
      const code = `module.exports = ${fn.toString()}`;
      const contents = Uglify.minify(code).code;
      await write(`${mutationsDir}/${timestamp}.js`, contents);
      return true;
    }
  }
}

type Commitable = (data:any, id:() => string) => any;
export interface Rebuildable {
  rebuild: () => Promise<any>
  commit: (commit:Commitable) => Promise<boolean>
}

async function seed() {
  const h = history(mutationsDir);
  h.commit((data, id) => {data.products = []; return data;});
  h.commit((data, id) => {data.products.push({ id: id(), name: 'Lumbar Pillow', price: 2000 }); return data;});
  h.commit((data, id) => {data.products.push({ id: id(), name: 'Soft Rug', price: 3000 }); return data;});
  h.commit((data, id) => {data.products.push({ id: id(), name: 'Comfy Blanket', price: 4000 }); return data;});
  console.log(await h.rebuild())
}


(async function main() {
  seed();
})()
