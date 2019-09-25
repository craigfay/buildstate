import * as mock from './_mock-entities'

function mockItemTest() {
  const fiveDollarItem = mock.item({ price: 500 });
  if (fiveDollarItem.price !== 500) {
    throw new Error('Mock item did not have the expected price')
  }
}

function mockLocationTest() {
  const locationInArizona = mock.location({ province: 'AZ' });
  if (locationInArizona.province !== 'AZ') {
    throw new Error('Mock location did not have the expected province')
  }
}

export const tests = [
  mockItemTest,
  mockLocationTest,
]
