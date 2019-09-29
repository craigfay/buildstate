const datastoreHandler = {
  set(target, keyname, value) {
    // Do some kind of validation
    if (!Array.isArray(value)) {
      throw new Error('Datastore values must be Arrays of Entities.');
    }
    else {
      // Success
      target[keyname] = value;
      return true;
    }
  }
}
function datastore() {
  return new Proxy({}, datastoreHandler);
}

const collectionHandler = {
  set(target, keyname, value) {
    // Only handle keys that are indices
    if (!Number.isInteger(+keyname)) {
      // Do some kind of validation
      if (!value.id) {
        throw new Error('Collection items must have an id');
      }
      // Success
      target[keyname] = value;
      return true;
    }
  }
}
function collection() {
  return new Proxy([], collectionHandler);
}
