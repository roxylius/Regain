// Getter for DB from localStorage
function getDB() {
    const dbString = localStorage.getItem('DB');
    return dbString ? JSON.parse(dbString) : [];
}

// Setter for DB to localStorage
function setDB(db) {
    localStorage.setItem('DB', JSON.stringify(db));
}

// Getter for whitelist from localStorage
function getWhitelist() {
    const whitelistString = localStorage.getItem('whitelist');
    return whitelistString ? JSON.parse(whitelistString) : [];
}

// Setter for whitelist to localStorage
function setWhitelist(list) {
    localStorage.setItem('whitelist', JSON.stringify(list));
}

/**
 * This function checks if the page is whitelisted 
 * @param origin origin url
 * @returns true and false
 */
const checkPageInWhiteList = (origin) => {
    const whiteList = getWhitelist();
    // Check whiteList array is not empty
    if (whiteList.length != 0) {
        return whiteList.includes(origin);
    }

    return false;
}

// Function to find a page configuration by its origin in the DB array
function findPageConfigByOrigin(origin) {
    const db = getDB();
    // Check if DB is not empty
    if (db.length != 0) {
        for (const page of db) {
            // Return page if origin matches
            if (page.origin == origin) {
                return page;
            }
        }
    }

    // Return null if no match
    return null;
}

/**
 * append newly added data to page config store
 * @param updateProp receives any object with the updated prop with new value
 */
const updateConfigOnDataChange = (updatedProp) => {
    let db = getDB();

    // Check if DB is not empty
    if (db.length != 0) {
        db = db.map(page => {
            // Overwrite the page with old config with the new prop
            if (page.origin == origin) {
                const newConfig = { ...page, ...updatedProp };
                // //console.log("updateConfigOnDataChange", newConfig);
                return newConfig;
            }
            return page;
        });
    }

    //set update prop
    setDB(db);

    const isUpdate = findPageConfigByOrigin(window.origin);
    // //console.log("updateConfigOnDataChange: [UpdatedDB]",isUpdate);
    
}


// Export functions to global scope
window.getDB = getDB;
window.setDB = setDB;
window.getWhitelist = getWhitelist;
window.setWhitelist = setWhitelist;
window.checkPageInWhiteList = checkPageInWhiteList;
window.findPageConfigByOrigin = findPageConfigByOrigin;
window.updateConfigOnDataChange = updateConfigOnDataChange;


/**
 * to send data between web_accessible_resources and content scripts as they both exist in isolated environment
 * This function send pageConfig data
 */
window.addEventListener('message', (event) => {
    if (event.data.type === 'GET_PAGE_CONFIG') {
        const origin = window.origin;
        const config = findPageConfigByOrigin(origin); // Use your function here
        window.postMessage({ type: 'PAGE_CONFIG_RESPONSE', config: config }, '*');
    }
});

// (()=>{
//     //console.log("locaalStorage Clearrrrr");
//     localStorage.clear();
// })();