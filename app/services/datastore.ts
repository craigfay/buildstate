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
    if (target[keyname]) return target[keyname];
    if (data[keyname]) {
      return {
        // See all records
        all: () => data[keyname],
        // Create a new record in the table
        create: async record => {
          const affectedId = await persistence.commit({ action: 'create', details: { table: keyname, record }});
          data[keyname].push(record);
          return affectedId;
        },
        update: async (predicate, updates) => {
          if (updates.id) throw 'id is immutable';
          const index = data[keyname].findIndex(predicate);
          if (index !== -1) {
            const updated = { ...data[keyname][index], ...updates };
            const affectedId = await persistence.commit({action:'update',details:{table:keyname,record:updated}});
            data[keyname][index] = updated;
            return affectedId;
          }
        },
        // Delete a record given a predicate
        delete: async predicate => {
          const deleteable = data[keyname].find(predicate);
          if (deleteable) {
            const affectedId = await persistence.commit({ action: 'delete', details: { table: keyname, record: deleteable }});
            data[keyname] = data[keyname].filter(record => record.id != deleteable.id);
            return affectedId;
          }
        },
        // Delete many records given a predicate
        deleteMany: async predicate => {
          const deleteables = data[keyname].filter(predicate);
          return Promise.all(deleteables.map(async deleteable => {
            const affectedId = await persistence.commit({ action: 'delete', details: { table: keyname, record: deleteable }});
            data[keyname] = data[keyname].filter(record => record.id != deleteable.id);
            return affectedId;
          }))
        },
      }
    }
  }

  return new Proxy(methods, dataProxy);
}
