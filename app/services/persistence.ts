import * as fs from 'fs';
import * as rl from 'readline';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
const append = promisify(fs.appendFile);

interface Entity {
  id?: string
  [key:string]: string | boolean | number | null
}

interface Datastore {
  [entity:string]: Array<Entity>
}

interface Mutation {
  action: 'define' | 'create' | 'update' | 'delete'
  details: any,
}

// Generate a probabilistically unique id
const id = () => randomBytes(32).toString('hex');

export function persistenceHandler(file:string) {
  return {
    commit: makeCommitFunction(file),
    rebuild: makeRebuildFunction(file),
  }
}
function makeCommitFunction(file:string) {
  return async function(mutation:Mutation): Promise<string | null> {
    try {
      if (mutation.action == 'create') {
        mutation.details.record.id = id();
      }
      await append(file, JSON.stringify(mutation) + '\n');
      return mutation.details.record.id;
    } catch (e) { return null }
  }
}

function makeRebuildFunction(file:string) {
  return async function(): Promise<Datastore> {
    return new Promise((resolve, reject) => {
      let data:Datastore = {};

      // Read the file line by line, parsing each as JSON
      const lines = rl.createInterface({ input: fs.createReadStream(file) });
      lines.on('line', line => {
        data = applyMutation(data, JSON.parse(line));
      })
      lines.on('error', error => reject({ errors: ['An unexpected error occured while retrieving transactions'] }))
      lines.on('close', () => resolve(data));
    }) 
  }
}

// Apply mutation to a datastore and return it: Used for rebuilding
function applyMutation(data:Datastore={}, mutation:Mutation): Datastore {
  const { action, details } = mutation;
  if (action == 'define') {
    data[details.table] = [];
  }
  else if (action == 'create') {
    data[details.table].push(details.record);
  }
  else if (action == 'update') {
    const index = data[details.table].findIndex(record => record.id == details.record.id);
    data[details.table][index] = details.record;
  }
  else if (action == 'delete') {
    data[details.table] = data[details.table].filter(record => record.id != details.record.id);
  }
  return data;
}
