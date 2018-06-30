import idb from 'idb';

idb.open('keyval-store', 1, upgradeDB => {
  var keyValStore = upgradeDB.createObjectStore('keyval');
  keyValStore.put("world", "hello");
});