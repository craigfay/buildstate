import { persistenceHandler } from './persistence';

export async function datastore(file:string) {
  const persistence = persistenceHandler(file);
  const data = await persistence.rebuild();
  console.log(data);
}
