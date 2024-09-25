// This file can be imported inside the service worker,
// which means all of its functions and variables will be accessible
// inside the service worker.
// The importation is done in the file `service-worker.js`.

console.log("External file is also loaded!");

/**
 * This function resets the timeUsed everyDay
 */
const checkAndResetTimeUsed = () => {
    console.log("checkResetTime....");
    
    const storedDate = localStorage.getItem("date");
    const currentDate = new Date().toISOString().split("T")[0];

    if(storedDate){
        console.log("date stored");
        
        const storedDateObj = new Date(storedDate);
        const currentDateObj = new Date(currentDate);

        //if its the next day
        if(storedDateObj < currentDateObj){
            //Reset usedTime in all pageConfig
            let db = getDB();
            db = db.map(config => {
                return {...config,timeUsed:0};
            });

            //stores it back in array
            setDB(db);
        }
    }
    //both if no date prop or if its next day
    localStorage.setItem("date",currentDate);
}