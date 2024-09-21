class Page {
    constructor(origin = null, timeUsed = null, ExpireOn = null, dailyLimit = null) {
        this._origin = origin;
        this._timeUsed = timeUsed;
        this._ExpireOn = ExpireOn;
        this._dailyLimit = dailyLimit;
    }

    // Getter and Setter for origin
    get origin() {
        return this._origin;
    }

    set origin(value) {
        this._origin = value;
    }

    // Getter and Setter for timeUsed
    get timeUsed() {
        return this._timeUsed;
    }

    set timeUsed(value) {
        this._timeUsed = value;
    }

    // Getter and Setter for lastTill
    get ExpireOn() {
        return this._ExpireOn;
    }

    set ExpireOn(value) {
        this._ExpireOn = value;
    }

    // Getter and Setter for dailyLimit
    get dailyLimit() {
        return this._dailyLimit;
    }

    set dailyLimit(value) {
        this._dailyLimit = value;
    }
}

// Make Page class available globally
window.Page = Page;