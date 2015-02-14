var menuCache = (function () {

    var api = {};

    api.getData = getMenuData;
    api.setTierThree = setTierThree;
    api.setmmLeftHTML = setMegaMenuLeftHtml;
    api.setmmMiddleHTML = setMegaMenuMiddleHtml;

    var cacheKey = 'MenuData';

    function getMenuData() {
        var items = sessionStorage.getItem(cacheKey);
        if (items) { return JSON.parse(items) }
        return null;
    }

    function setMegaMenuLeftHtml(data) { updateCache("mmLeftHTML", data); }
    function setMegaMenuMiddleHtml(data) { updateCache("mmMiddleHTML", data); }
    function setTierThree(data) { updateCache("tierThreeLookup", data); }

    function updateCache(itemName, data) {
        var jsonItems = sessionStorage.getItem(cacheKey);
        var items;
        if (jsonItems) {
            items = JSON.parse(jsonItems);
        } else {
            items = {};
        }
        items[itemName] = data;
        items["last_modified"] = new Date();
        items["date"] = (new Date().toISOString()).substring(0, 10);
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
    }

    return api;
})();
