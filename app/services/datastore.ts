const datastoreHandler = {
  set(target, keyname, value) {
    // Validate input
    if (!Array.isArray(value)) {
      throw new Error('Datastore values must be Arrays of Entities.');
    }
    // Success
    target[keyname] = collection(value);
    return true;
  }
}
function datastore() {
  return new Proxy({}, datastoreHandler);
}

const collectionHandler = {
  set(target, keyname, value) {
    // Only handle keys that are indices
    if (Number.isInteger(+keyname)) {
      // Validate input
      if (!value.id) {
        throw new Error('Collection items must have an id');
      }
    }
    // Success
    target[keyname] = value;
    return true;
  }
}
function collection(list=[]) {
  return new Proxy(list, collectionHandler);
}
