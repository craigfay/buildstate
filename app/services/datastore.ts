export function datastore(target={}) {
  return new Proxy(target, {
    set(target, keyname, value) {
      // Validate input
      if (!Array.isArray(value)) {
        throw new Error('Datastore value must be an Array');
      }
      // Success
      target[keyname] = collection(value);
      return true;
    }
  });
}

function collection(target=[]) {
  return new Proxy(target, {
    set(target, keyname, value) {
      // Only handle keys that are indices
      if (Number.isInteger(Number(keyname))) {
        // Validate input
        if (!value.id) {
          throw new Error('Collection items must have an id');
        }
      }
      // Success
      target[keyname] = value;
      return true;
    }
  });
}
