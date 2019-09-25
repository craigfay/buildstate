import {  Location, Item } from '../entities'

const US_STATES = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function location(options={}):Location {
  return {
   "country": "US",
   "postalCode": randomBetween(10000, 99999),
   "province": US_STATES[randomBetween(0, US_STATES.length - 1)],
   "city": "Waco",
   "address1": "601 Weber",
   "address2": "Address 2",
   "companyName": "Magnolia",
   ...options,
  }
}

export function item(options={}):Item {
  return {
    "id": randomBetween(1000000000000, 9999999999999),
    "name": "Mock Item",
    "grams": randomBetween(1, 453592),
    "price": randomBetween(500, 100000),
    "vendor": "MOCK",
    "labels": {},
    ...options
   }
}

export function items(itemCount, options={}): Item[] {
  let items = [];
  for (let i = 0; i < itemCount; i++) items.push(item(options));
  return items;
}
