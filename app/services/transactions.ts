import * as fs from 'fs';
import * as rl from 'readline';
import * as path from 'path';
import { promisify } from 'util';
const append = promisify(fs.appendFile);


export function makeCommitRepository(file:string) {
  return {
    create: makeCreateFunction(file),
    retrieve: makeRetrieveFunction(file),
  }
}

function makeCreateFunction(file:string) {
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

function makeRetrieveFunction(file:string) {
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

// Determine whether or not an object matches a description
function matchesDescription(obj:object, descriptors:object) {
  for (const key of Object.keys(descriptors)) {
    if (obj[key] !== descriptors[key]) return false;
  }
  return true;
}

// Export
const historyFile = path.resolve(path.join(__dirname, './history'));
export const transactionRepository = makeTransactionRepository(historyFile);
