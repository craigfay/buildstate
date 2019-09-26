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

type Commitable = (data:any, id:() => string) => any;
export interface Rebuildable {
  rebuild: (buildfile:string) => object
  commit: (commit:Commitable) => boolean
}

async function commit(fn) {
  const timestamp = new Date().toISOString();
  const code = `module.exports = ${fn.toString()}`;
  const contents = Uglify.minify(code).code;
  await write(`${mutationsDir}/${timestamp}.js`, contents);
}

async function rebuild() {
  let data:any = {};
  const id = () => randomBytes(32).toString('hex');

  const mutationFiles = await dir(mutationsDir);
  for (const file of mutationFiles) {
    const mutater = require(`${mutationsDir}/${file}`);
    data = mutater(data, id);
  }
  return data;
}

function seed() {
  commit((data, id) => {data.products = []; return data;});
  commit((data, id) => {data.products.push({ id: id(), name: 'Lumbar Pillow', price: 2000 }); return data;});
  commit((data, id) => {data.products.push({ id: id(), name: 'Soft Rug', price: 3000 }); return data;});
  commit((data, id) => {data.products.push({ id: id(), name: 'Comfy Blanket', price: 4000 }); return data;});
}


(async function main() {
  // const data = await rebuild();
  // console.log(JSON.stringify(data, null, 2));
})()
