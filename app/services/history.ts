import * as fs from 'fs';
import { promisify } from 'util';
import { randomBytes } from 'crypto';
import * as Uglify  from 'uglify-js'

const append = promisify(fs.appendFile);
const read = promisify(fs.readFile);
const write = promisify(fs.writeFile);
const dir = promisify(fs.readdir);

export function history(mutationPath): Rebuildable {
  return {
    rebuild: makeRebuild(mutationPath),
    commit: makeCommit(mutationPath),
  }
}

function makeRebuild(mutationPath) {
  return async function rebuild() {
    let data:any = {};
    const id = () => randomBytes(32).toString('hex');
  
    const mutationFiles = await dir(mutationPath);
    for (const file of mutationFiles) {
      const mutater = require(`${mutationPath}/${file}`);
      data = mutater(data, id);
    }
    return data;
  }
}

function makeCommit(mutationPath) {
  return async function commit(fn, state={}) {
    const timestamp = new Date().toISOString();

    // State
    const stateDeclarations = Object.keys(state).reduce((str, key) => {
      return str + `var ${key} = ${JSON.stringify(state[key])}; `;
    }, '')

    // Mutater
    const mutater = `module.exports = ${fn.toString()}`;
    const source = stateDeclarations + mutater;
    const contents = Uglify.minify(source);
    await write(`${mutationPath}/${timestamp}.js`, contents.code);
    return true;
  }
}

type Commitable = (data:any, id:() => string) => any;
export interface Rebuildable {
  rebuild: () => Promise<any>
  commit: (commit:Commitable, state?:any) => Promise<boolean>
}

const productName = 'Soft Rug';

async function seed(mutationPath) {
  const h = history(mutationPath);
  h.commit((data, id) => {data.products = []; return data;});
  h.commit((data, id) => {data.products.push({ id: id(), name: 'Lumbar Pillow', price: 2000 }); return data;});
  h.commit((data, id) => {data.products.push({ id: id(), name: productName, price: 3000 }); return data;}, { productName });
  h.commit((data, id) => {data.products.push({ id: id(), name: 'Comfy Blanket', price: 4000 }); return data;});
  console.log(await h.rebuild())
}


(async function main() {
  if (!process.env.mutationPath) return;
  seed(process.env.mutationPath);
})()
