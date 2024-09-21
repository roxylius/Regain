// This file can be imported inside the service worker,
// which means all of its functions and variables will be accessible
// inside the service worker.
// The importation is done in the file `service-worker.js`.

console.log("External file is also loaded!");

function queryHistory() {
    chrome.history.search({ text: '', maxResults: 10 }, function(data) {
        data.forEach(function(page) {
            const url = new URL(page.url);
            const data = {
                origin: url.origin,
                lastVisitTime: page.lastVisitTime,
            };
            console.log(data);
        });
    });
}