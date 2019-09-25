/**
 * A lightweight test runner
 */

import { performance } from 'perf_hooks';

// Console Colors
const red = '\x1b[31m';
const green = '\x1b[32m'
const reset = '\x1b[0m';

// Return errors instead of throwing
async function withoutThrowing(fn) {
  return new Promise((resolve) => {
    resolve(fn())
  }).catch(error => error)
}

async function runWithTimer(fn) {
  const startTime = performance.now()
  const result = await withoutThrowing(fn);
  const endTime = performance.now();
  const runTime = (endTime - startTime).toFixed(2);

  if (result instanceof Error) {
    console.error(`${fn.name || 'anonymous'}: ${runTime} ms ${red}fail${reset}`);
    console.error('\n', result, '\n');
    process.exit(1);
  }
  else
  console.log(`${fn.name || 'anonymous'}: ${runTime} ms ${green}ok${reset}`);
}

// Extract test functions from a list of modules
export function testSuite(...modules) {
  return modules.reduce((included, m) => {
    return [...included, ...m.tests]
  }, [])
}

// A "test" is any function that throws an error to indicate failure
export async function run(tests) {
  runWithTimer(async function testSuite() {
    for (const test of tests) {
      await runWithTimer(test)
    }
  })
}