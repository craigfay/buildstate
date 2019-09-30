import { persistenceHandler } from './persistence';

export async function datastore(file:string) {
  const persistence = persistenceHandler(file);
  const data = await persistence.rebuild();

  const methods:any = {};

  // Method used to define a new table
  methods.define = async function(table:string) {
    if (data[table]) {
      throw new Error(`${table} has already been defined`);
    }
    else {
      await persistence.commit({ action: 'define', details: { table } });
      data[table] = [];
    }
  }

  const dataProxy:any = {};

  // Retrieve a table
  dataProxy.get = function(target, keyname) {
    if (data[keyname]) {
      return {
        // See all records
        records: () => data[keyname],
        // Create a new record in the table
        create: async record => {
          const id = await persistence.commit({ action: 'create', details: { table: keyname, record }});
          data[keyname].push(record);
          return id;
        }
      }
    }
  }

  return new Proxy(methods, dataProxy);
}
