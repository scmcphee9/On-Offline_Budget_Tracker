let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log("Sorry!" + e.target.errorCode);
};

function saveRecord(data) {
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  store.add(data);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");

  const getTransactions = store.getTransactions();

  getTransactions.onsuccess = function () {
    if (getTransactions.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getTransactions.result),
        headers: {
          ccept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }).then(response => response.json()).then(()
      =>{
        const transaction = db.transaction(["pending"], "readwrite");

        const store = transaction.objectStore("pending");
      
        store.clear();

      });
    }
  };
}

window.addEventListener("online", checkDatabase);


