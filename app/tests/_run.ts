import { tests } from './basic.test';

(async () => {
  for (const test of tests) {
    await test();
  }
})