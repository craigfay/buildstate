import { datastore } from '../services/datastore';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);
const write = promisify(fs.writeFile);


async function basicTest() {
  // Make Store
  const file = path.resolve(path.join(__dirname, './testbuildfile'));
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

  // Delete
  const deletedId = await store.products.delete(
    product => product.name == 'blanket'
  );
  if (blanketId != deletedId)
  throw new Error('Deletion did not work as expected')
}


async function basicTest2() {
  // Make Store
  const file = path.resolve(path.join(__dirname, './testbuildfile'));
  const store = await datastore(file); 

  // Get All
  const allProductsAfterDeletion = await store.products.all();
  if (allProductsAfterDeletion.length != 2)
  throw new Error('Unexpected amount of products after deletion')

  await unlink(file);
}

export const tests = [
  basicTest,
  basicTest2,
];
