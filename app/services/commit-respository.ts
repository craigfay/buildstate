import * as fs from 'fs';
import * as rl from 'readline';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
const append = promisify(fs.appendFile);

// Generate a probabilistically unique id
const id = () => randomBytes(32).toString('hex');

interface Mutation {
  id: string
  action: 'create' | 'update' | 'delete'
  payload: object
}

export function makeCommitRepository(file:string) {
  return {
    commit: makeCommitFunction(file),
    rebuild: makeRebuildFunction(file),
  }
}

function makeCommitFunction(file:string) {
  return async function(t): Promise<Boolean> {
    try {
      // Persist transaction
      await append(file, JSON.stringify(t) + '\n');
      return true;
    } catch (e) {
      return false;
    }
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

(async function() {
  state.commit({success:true})
})()
