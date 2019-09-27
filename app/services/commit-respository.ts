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
  return async function(descriptors:object) {
    return new Promise((resolve, reject) => {
      let commits = [];
      // Read the file line by line, parsing each as JSON
      const lines = rl.createInterface({ input: fs.createReadStream(file) });
      lines.on('line', line => {
        commits.push(JSON.parse(line));
      })
      lines.on('error', error => reject({ errors: ['An unexpected error occured while retrieving transactions'] }))
      lines.on('close', () => resolve(commits));
    }) 
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
