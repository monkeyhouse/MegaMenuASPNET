var menuCache = (function () {

    var api = {};

    api.getData = getMenuData;
    api.setTierOne = setTierOne;
    api.setTierTwoDictionary = setTierTwo;
    api.setTierThreeDictionary = setTierThree;

    api.save = saveCache;

    var cacheKey = 'MobileMenuData';
    var items = {};

    //load cache from sessionStorage
    function init() {
        var jsonItems = sessionStorage.getItem(cacheKey);
        if (jsonItems) {
            items = JSON.parse(jsonItems);
        }
    }

    function updateCache(itemName, data) {
        items[itemName] = data;
    }

    function saveCache() {
        items["last_modified"] = new Date();
        items["date"] = (new Date().toISOString()).substring(0, 10);
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
    }

    function getMenuData() {
        return items;
    }

    function setTierOne(data) { updateCache("tierOne", data); }
    function setTierTwo(data) { updateCache("tierTwoDictionary", data); }
    function setTierThree(data) { updateCache("tierThreeDictionary", data); }
  

    init();
    return api;
})();
