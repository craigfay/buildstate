import * as path from 'path';
import { datastore } from './datastore';


(async () => {
  const file = path.resolve(path.join(__dirname, './buildfile'));
  const store = await datastore(file);
  // const blanketId = await store.products.create({ name: 'blanket', price: 8000 });
  // console.log(await store.products.all());
  // console.log(await store.products.delete(
    // product => product.name == 'blanket'
  // ));

  // console.log(store.products.all().length);
})()
