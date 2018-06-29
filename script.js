
 var dbPromise = idb.open('currencyConverter', 1, function(upgradeDb) {
     upgradeDb.createObjectStore('currencies', {
      keyPath: 'id'
    });
   var exchangeRate = upgradeDb.createObjectStore('rate');
   //exchangeRate.createIndex('from-to', 'query');
  });

        
     

// dbPromise.then(function(db) {
//   var tx = db.transaction('currencies', 'readwrite');
//   var currencyStore = tx.objectStore('currencies');

//   currencyStore.put({
//     id: 'XCD',
//     currencyName: 'East Caribbean Dollar',
//     currencySymbol:  "$"
//   });

//   currencyStore.put({
//     id: 'ALL',
//     currencyName: 'Albanian Lek',
//     currencySymbol:  "Lek"
//   });

//   currencyStore.put({
//      id: 'Euro',
//     country: 'EURO',
//     currencySymbol:  "€"
//   });

//   return tx.complete;
// }).then(function() {
//   console.log('Currencies added');
// });

// dbPromise.then(function(db) {
//   var tx = db.transaction('currencies');
//   var currencyStore = tx.objectStore('currencies');
//   var currencyIndex = currencyStore.index('currencySymbol');

//   return currencyIndex.getAll();
// }).then(function(currency) {
//   console.log('Currency by symbol:', currency);
// });



if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function(registration) {
        var serviceWorker;
        if (registration.installing) {
            serviceWorker = trackInstalling(registration.installing);
        } else if (registration.waiting) {
            serviceWorker = updateReady(registration.waiting);
        } else if (registration.active) {
            serviceWorker = registration.active;
        }

        if (serviceWorker) {
            console.log("ServiceWorker phase:", serviceWorker.state);

            serviceWorker.addEventListener('statechange', function (e) {
                console.log("ServiceWorker phase:", e.target.state);
            });
        }
    
        registration.addEventListener('updatefound', function() {
       registration.installing.addEventListener('statechange', function() {
        if (registration.installing.state == 'installed') {
              updateReady(registration.installing);
        }
        });
        });
    
    
        var refreshing;
          navigator.serviceWorker.addEventListener('controllerchange', function() {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
          });
    
    }).catch(function(err) {
        console.log('Service Worker Error', err);
    });
  
  
}

function trackInstalling(worker) {
  worker.addEventListener('statechange', function() {
    if (worker.state == 'installed') {
      updateReady(worker);
    }
  });
}

function updateReady(worker) {
//  var toast = this._toastsView.show("New version available", {
//     buttons: ['refresh', 'dismiss']
//   });

//   toast.answer.then(function(answer) {
//     if (answer != 'refresh') return;
//     worker.postMessage({action: 'skipWaiting'});
//   });
  if (confirm("New version available")) {
       return worker.postMessage({action: 'skipWaiting'});
    }
}

                                               
function convertCurrency() {
  let fromCurrency = encodeURIComponent($('#from').val());
  let toCurrency = encodeURIComponent($('#to').val());
  let fromAmount = $('#fromAmount').val();
  let query = fromCurrency + '_' + toCurrency;
   //let toAmount =  ;
  /** Looping through currency **/
  let currenciesUrl  = 'https://free.currencyconverterapi.com/api/v5/currencies';
      $.ajax({
              url: currenciesUrl,
              type:"GET",
              success: (results) => {
               var result = results.results;
                // let sorted = result.sort(function (a, b) {
                //       return a["currencyName"] - b["currencyName"];
                //     });
                //console.log(result);
                dbPromise.then(function(db) {
               var tx = db.transaction('currencies', 'readwrite');
               var store = tx.objectStore('currencies');
                  
                  for (const props in result) {
        
                      store.put(result[props]);
                
                // let sorted = result.sort(function (a, b) {
                 //      return a[props]["currencyName"] - b[props]["currencyName"];
                 //    });
                 
                }
                
              });
                
              //},error: (xhr,status,error) => {console.log(status)
              }, 
              dataType: 'jsonp',
        });  
  

  let url = 'https://free.currencyconverterapi.com/api/v5/convert?q='
            + query + '&compact=ultra&apiKey=';
    
   var result = $.ajax({
              url: url,
              type:"GET",
              success: (data) => {
               let val = data[query];
                 dbPromise.then(function(db) {
               var tx = db.transaction('rate', 'readwrite');
               var store = tx.objectStore('rate');
                   store.put("hello", "world");
                console.log(data)
                 })
              //},  error: function(xhr,status,error) {
               
              }, dataType: 'jsonp',
        });  
      
          dbPromise.then(function(db) {
               var tx = db.transaction('currencies');
               var getCurrency = tx.objectStore('currencies');
                  getCurrency.getAll().then(function(currencies) {
                    var sortedCurrencies = currencies.filter(currency => {
                              return  currency.id !== "USD" && currency.id !== "NGN";
                    }).
                    sort(function (a, b) {
                     // console.log(a.currencyName)
                      return a.currencyName.localeCompare(b.currencyName);
                    });
     
                      sortedCurrencies.forEach(currency => {
                        //var selected = currency.id == "USD" ? selected="selected": "";
                      let html = `<option value="${currency.id}">${currency.currencyName}(${currency.id})</option>`;

                    if(fromCurrency === currency.id) {

                      currency.hasOwnProperty("currencySymbol") ? $("#fromSymbol").html(currency.currencySymbol) : $("#fromSymbol").html("");

                        } else if(toCurrency === currency.id) {

                         $("#toSymbol").html(currency.currencySymbol);
                        }

                       $(".currency").append(html); 
                      })
                  }) 
          });
  
  
//               if (val) {
//               let total = val * fromAmount;
//               let toAmount = Math.round(total * 100) / 100;
//                  $('#toAmount').val(toAmount);
                    
//               } else {
//                 var err = new Error("Value not found for " + query);
              
//             }
          
}

