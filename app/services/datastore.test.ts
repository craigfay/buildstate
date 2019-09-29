import * as path from 'path';
import { datastore } from './datastore';

const file = path.resolve(path.join(__dirname, './buildfile'))
const store = datastore(file);

// store.define('products');
// const blanketId = store.products.create({ name: 'blanket', price: 5000 });
// const pillowId = store.products.create({ name: 'pillow', price: 2400 });
// store.products.delete(product => product.id = blanketId);

// store.removeStructure('products');
