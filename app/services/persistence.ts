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
  action: 'define', 'create'
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
      await append(file, JSON.stringify(mutation) + '\n');
      return mutation.details.id;
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
    return data;
  }
  return data;
  // else if (action == 'update') {
    // const index = data[entity].findIndex(record => record.id == payload.id);
    // if (index === -1) return data;
    // data[entity][index] = payload;
    // return data;
  // }
}
