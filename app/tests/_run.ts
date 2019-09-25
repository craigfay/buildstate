import { run, testSuite } from './_runner'

run(testSuite(
  require('./mock-entities.test'),
));