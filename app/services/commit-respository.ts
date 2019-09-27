import * as fs from 'fs';
import * as rl from 'readline';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
const append = promisify(fs.appendFile);

// Generate a probabilistically unique id
const id = () => randomBytes(32).toString('hex');

interface Mutation {
  entity: string
  action: 'create' | 'update' | 'delete'
  payload: Payload
}

interface Payload {
  id?: string
  [key:string]: string | boolean | number | null
}

interface State {
  [entity:string]: Array<Payload>
}

export function makeCommitRepository(file:string) {
  return {
    commit: makeCommitFunction(file),
    rebuild: makeRebuildFunction(file),
  }
}

function makeCommitFunction(file:string) {
  return async function(mutation:Mutation): Promise<string | null> {
    try {
      // @TODO validate mutation
      if (mutation.action == 'create') mutation.payload.id = id();
      await append(file, JSON.stringify(mutation) + '\n');
      return mutation.payload.id;
    } catch (e) { return null }
  }
}


function makeRebuildFunction(file:string) {
  return async function() {
    return new Promise((resolve, reject) => {
      let data:State = {};

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

function applyMutation(data:State, mutation:Mutation): State {
  const { action, entity, payload } = mutation;
  if (action == 'create') {
    if (!data[entity]) data[entity] = [];
    data[entity].push(payload);
    return data;
  }
  else if (action == 'update') {
    const index = data[entity].findIndex(record => record.id == payload.id);
    if (index === -1) return data;
    data[entity][index] = payload;
    return data;
  }
}

// Export
const historyFile = path.resolve(path.join(__dirname, './buildfile'));
export const state = makeCommitRepository(historyFile);

async function seed() {
  state.commit({ entity: 'product', action: 'create', payload: { name: 'soft blanket', price: 5000 }});
  const pillowId = await state.commit({ entity: 'product', action: 'create', payload: { name: 'nice pillow', price: 3500 }});
  state.commit({ entity: 'product', action: 'create', payload: { name: 'cozy sweater', price: 2500 }});
  state.commit({ entity: 'product', action: 'update', payload: { id: pillowId, name: 'nice pillow', price: 1000 }});
}

(async function build() {
  console.log(await state.rebuild());
})()
