// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.
// import * as pageConfig from "./utils/page";


//Array that stores all the origin link with time usage, last time requested, total time allowed
/**
 * {
 *  origin: uri,
 *  TimeUsed: page time engagement daily,
 *  ExpireOn: Epoch time till which website is unblocked,
 *  DailyLimit: Daily Usage Limit,
 *  allotedTime: Stores the time selected in minutes
 * }
 */
let DB = [];

// Array that stores whitelisted origins
let whiteList = [];

// Create a single overlay instance (outside any function)
let overlay = null;
let shadowRoot = null; // Store the shadow root

// Flag to track if the check is already running
// let isExpirationCheckRunning = false; 

window.onload = async () => {
    // Load DB from localStorage
    DB = getDB();
    whiteList = getWhitelist();

    //check if page is whitelisted
    const isPageWhiteListed = checkPageInWhiteList(window.origin);

    //only work if page is not whitelisted
    if (!isPageWhiteListed) {
        // Get Page Data
        const config = await getPageConfig();
        //console.log({ config });


        // Stop script if page gets whitelisted
        if (checkPageInWhiteList(window.origin)) //console.log("whitelisted");
            if (checkPageInWhiteList(window.origin)) return;

        //get config properties
        const timeUsed = config.timeUsed;
        const dailyLimit = config.dailyLimit;
        const expireOn = config.expireOn;
        const allotedTime = config.allotedTime;

        //time up
        const isLimitReached = checkDailyLimit(dailyLimit, timeUsed);
        if (isLimitReached) return;

        //if cur time is expired
        //console.log({ checkExpirationAndShowExtensionForm });
        await checkExpirationAndShowExtensionForm(expireOn, timeUsed, allotedTime);

        //constantly check if the page has expired
        expirationCheck();
    }
}

//if there is no data on page stored
const getPageConfig = async () => {
    const origin = window.origin;

    //check if config exists for the origin
    const config = findPageConfigByOrigin(origin);

    //if no config against the origin
    if (config == null) {
        //get data for first time
        const formData = await promptToGetData();

        //when data is entered in form
        if (formData !== null) {
            const pageConfig = {
                origin,
                timeUsed: 0,
                expireOn: formData.expireOn,
                dailyLimit: formData.dailyLimit,
                allotedTime: formData.allotedTime
            }

            DB.push(pageConfig);
            setDB(DB);
            return pageConfig;

        } else { //when whitelist button is clicked
            whiteList.push(origin)
            setWhitelist(whiteList);
            return null;
        }
    }
    //if page config is already there then return it
    return config;
}


// Function to disable the webpage and display HTML form to get data
const promptToGetData = async () => {
    document.documentElement.style.overflow = 'hidden';

    //prevent creating of overlay if it already exists
    if (!document.querySelector("#overlay.overlay-shadowRoot_001")) {

        // Get the overlay (this will create it if it doesn't exist)
        const overlay = getOverlay();

        // Load the promptform html into the shadow root as text
        const response = await fetch(chrome.runtime.getURL('utils/promptForm.html'));
        const html = await response.text();
        shadowRoot.innerHTML = html;

        // Inject script into shadow root to avoid JS func conflicts with the original page js
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('utils/prompt.js');
        shadowRoot.appendChild(script);

        // Append the overlay to the body of original page
        document.body.appendChild(overlay);
    }

    return new Promise((resolve, reject) => {
        // Add event listener to handle form submission
        window.addEventListener('message', (event) => {
            if (event.data.type === 'FORM_DATA') {
                const data = event.data.data;
                //console.log("dataOld", data);
                hideOverlay();
                resolve(data);
            }
        });
    })
};

// Function to get the overlay element (creates it if it doesn't exist)
function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.className = 'overlay-shadowRoot_001';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto; // Add this to enable scrolling within the overlay
        `;
        shadowRoot = overlay.attachShadow({ mode: 'open' }); // Create the shadow root
    }
    return overlay;
}

// Function to hide the overlay by removing element
const hideOverlay = () => {
    const overlay = document.querySelector('#overlay.overlay-shadowRoot_001');
    if (overlay) {
        overlay.remove();
    }
    document.documentElement.style.overflow = ""; // Restore scrolling
};


/**
 * Function to check if the daily limit is reached
 * @param dailyLimit daily usage limit in minutes
 * @param timeUsed time for which website is used minutes
 * @returns return true if daily limit is reached else false
 */
function checkDailyLimit(dailyLimit, timeUsed) {
    //to prevent all button getting disabled
    if (dailyLimit % 2) dailyLimit -= 1;

    if (dailyLimit <= timeUsed) {
        // Fetch the timesup.html content
        fetch(chrome.runtime.getURL('utils/timesup.html'))
            .then(response => response.text())
            .then(html => {
                // Remove all existing HTML content
                document.documentElement.innerHTML = html;
            })
            .catch(error => console.error('Error fetching timesup.html:', error));
        return true;
    }
    return false;
}

// Function to check if the current time is expired and show the time extension form
async function checkExpirationAndShowExtensionForm(expireOn, timeUsed, allotedTime) {
    //console.log("dataNow", Date.now(), "exipreOn:", expireOn, "isGreater", Date.now() > expireOn);

    console.log("true page time expired! Date.now()", Date.now(), "expireOn", expireOn);
    if (Date.now() > expireOn) {
        try {

            document.documentElement.style.overflow = 'hidden';
            //pause any video running in background [p.s. did it for yt]
            const videos = document.querySelectorAll("video");
            if (videos) videos.forEach(vid => vid.pause());

            //as time is expired it is added to timeUsed
            timeUsed = parseInt(timeUsed) + parseInt(allotedTime);
            updateConfigOnDataChange({ timeUsed, allotedTime: 0 });

            // Get the overlay (this will create it if it doesn't exist)
            const overlay = getOverlay();

            // Set the inner HTML of the shadow root to timeExtensionForm.html
            const response = await fetch(chrome.runtime.getURL('utils/timeExtensionForm.html'));
            const html = await response.text();
            shadowRoot.innerHTML = html;

            // Inject script into shadow root to avoid JS func conflicts with the original page js
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL('utils/timeExtension.js');
            shadowRoot.appendChild(script);

            // Append the overlay to the body
            document.body.appendChild(overlay);

            return new Promise((resolve, reject) => {
                // Add event listener to handle form submission
                window.addEventListener('message', (event) => {
                    if (event.data.type === 'FORM_DATA') {
                        const data = event.data.data;
                        //console.log("dataNewEvtListner", data);
                        
                        //sets timeout for the checkExpiration form trigger
                        const timeUntilNextCheck = data.expireOn - Date.now(); 
                        setTimeout(()=>{
                            console.log("timeout triggered data.expireOn",data.expireOn,"data.timeUsed",data.timeUsed,"data.allotedTime",data.allotedTime);
                            checkExpirationAndShowExtensionForm(data.expireOn,data.timeUsed,data.allotedTime);
                        },timeUntilNextCheck)

                        updateConfigOnDataChange(data);
                        hideOverlay();
                        resolve(data);
                    }
                });
            });

        } catch (error) {
            console.log("checkExpirationAndShowExtensionForm Err:", error);
        }
    }
}

//console.log(window.origin);


window.addEventListener("message", (event) => {
    if (event.data.type == "HIDE_OVERLAY") {
        hideOverlay();
    }
})



// /**
//  * This method checks if the time to use is expired for webpage every minute
//  */
// const expirationCheck = () => {
//     const config = findPageConfigByOrigin(window.origin);
//     if (config != null) {
//         const expireOn = config.expireOn;
//         const timeUsed = config.timeUsed;
//         const allotedTime = config.allotedTime;
//         const dailyLimit = config.dailyLimit;

//         setInterval(async () => {
//             const isLimitReached = checkDailyLimit(dailyLimit, timeUsed);
//             if (isLimitReached) return;
//             try {
//                 await checkExpirationAndShowExtensionForm(expireOn, timeUsed, allotedTime)
//             } catch (error) {
//                 console.log("ExpirationCheck Error:", error);
//             }
//         }, 60000) // check every minute
//     }
// }