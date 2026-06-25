const Store = require('electron-store');

const store = new Store({
  defaults: {
    retentionDays: 3,
  },
});

function getAll() {
  return {
    retentionDays: store.get('retentionDays'),
  };
}

function get(key) {
  return store.get(key);
}

function set(key, value) {
  store.set(key, value);
}

module.exports = { getAll, get, set };
