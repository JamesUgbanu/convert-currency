
 var dbPromise = idb.open('currencyConverter', 2, function(upgradeDb) {
   switch(upgradeDb.oldVersion) {
    case 0:
     upgradeDb.createObjectStore('currencies', {
      keyPath: 'id'
    });
   case 1:
   upgradeDb.createObjectStore('rate');
   //exchangeRate.createIndex('from-to', 'query');
       
                              }
  });



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
  

  let url = 'https://free.currencyconverterapi.com/api/v5/convert?q='
            + query + '&compact=ultra&apiKey=';
  
  
  
       dbPromise.then(function(db) {
         
                     var tx = db.transaction('rate');
                     var getCurrency = tx.objectStore('rate');
                      var val = getCurrency.get(query).then(val => {
                         let total = val * fromAmount;
                                let toAmount = Math.round(total * 100) / 100;   
                            if (val) {
                               
                                   $('#toAmount').val(toAmount);

                                }
                        
                        else if(val  === undefined){
                          
                           $.ajax({
                              url: url,
                              type:"GET",
                              success: (data) => {
                                
                               let val = data[query];
                                 dbPromise.then(function(db) {
                               var tx = db.transaction('rate', 'readwrite');
                               var store = tx.objectStore('rate');
                                   store.put(val, query);
                                  
                            store.openCursor(null, "prev").then(function(cursor) {
                                  return cursor.advance(15);
                                }).then(function deleteRest(cursor) {
                                  if (!cursor) return;
                                  cursor.delete();
                                  return cursor.continue().then(deleteRest);
                                });
                                   
                                    if (val) {
                              let total = val * fromAmount;
                              let toAmount = Math.round(total * 100) / 100;
                                 $('#toAmount').val(toAmount);

                              } else {
                                var err = new Error("Value not found for " + query);

                             }
       
                         })
                      },  error: function(xhr,status,error) {
                                 console.log(status)
                                   $('#toAmount').val("");

                                }, dataType: 'jsonp',
                        });  
                        
                                         } else {
                                  var err = new Error("Value not found for " + query);

                              }
                         
                      });

                    });
  
    
      
          dbPromise.then(function(db) {
               var tx = db.transaction('currencies');
               var getCurrency = tx.objectStore('currencies');
                  getCurrency.getAll().then(function(currencies) {
                    //console.log(currencies);
                    if(currencies.length == 0) {
                      
                      $.ajax({
                            url: currenciesUrl,
                            type:"GET",
                            success: (results) => {
                             var result = results.results;

                              dbPromise.then(function(db) {
                             var tx = db.transaction('currencies', 'readwrite');
                             var store = tx.objectStore('currencies');

                                for (const props in result) {

                                    store.put(result[props]);

                              }
                                
                   

                            });

                            //},error: (xhr,status,error) => {console.log(status)
                            }, 
                            dataType: 'jsonp',
                      });  
                      
                    }
                    var sortedCurrencies = currencies.filter(currency => {
                      
                      
                              return  currency.id !== "USD";
                    }).
                    sort(function (a, b) {
                
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
  
  
             
}

