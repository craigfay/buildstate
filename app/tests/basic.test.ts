import { datastore } from '../services/datastore';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);
const write = promisify(fs.writeFile);
const file = path.resolve(path.join(__dirname, './testbuildfile'));


async function createTest() {
  // Make Store
  await write(file, '', 'utf8');
  const store = await datastore(file); 
  
  // Define Table
  await store.define('products');
  
  // Create
  const blanketId = await store.products.create({ name: 'blanket', price: 8000 });
  const sweaterId = await store.products.create({ name: 'sweater', price: 5000 });
  const pillowId = await store.products.create({ name: 'blanket', price: 2500 });

  // Get All
  const allProducts = await store.products.all();
  if (allProducts.length != 3)
  throw new Error('Unexpected amount of products after creation');

}

async function updateTest() {
    // Make Store
    const store = await datastore(file); 

    const affectedId = await store.products.update(
      record => record.name == 'sweater',
      { price: 4500 },
    );


    const updated = (await store.products.all()).find(
      record => record.id == affectedId
    );

    if (updated.price !== 4500) {
      throw new Error('Unexpected update result');
    }
}

async function updateManyTest() {
    // Make Store
    const store = await datastore(file); 
    const affectedIds = await store.products.updateMany(
      record => record.price > 2000,
      { price: 1000 },
    );
    if (affectedIds.length != 3)
    throw new Error('Unexpected product length after updateMany()')
}


async function deleteTest() {
  const store = await datastore(file); 
  const affectedId = await store.products.delete(p => p.name == 'blanket');
  if (!affectedId)
  throw new Error('Unexpected id after delete()')
}

async function deleteManyTest() {
  const store = await datastore(file); 
  const deletedIds = await store.products.deleteMany(product => product.name);
  if (deletedIds.length != 2)
  throw new Error('Unexpected product length after deleteMany()')
}

async function dropTest() {
  const store = await datastore(file);
  if (store.tables().length != 1)
  throw new Error('Unexpected tables length before drop()')
  await store.drop('products');
  if (store.tables().length != 0)
  throw new Error('Unexpected tables length after drop()')
  
  const newStore = await datastore(file);
  if (store.tables().length != 0)
  throw new Error('Unexpected tables length after drop() and rebuild');
}

async function unlinkTest() {
  await unlink(file);
}

export const tests = [
  createTest,
  updateTest,
  updateManyTest,
  deleteTest,
  deleteManyTest,
  dropTest,
  unlinkTest,
];
