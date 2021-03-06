﻿var menuCache = (function () {

    var api = {};

    api.getData = getMenuData;
    api.setTierThree = setTierThree;
    api.setmmLeftHTML = setMegaMenuLeftHtml;
    api.setmmMiddleHTML = setMegaMenuMiddleHtml;
    api.save = saveCache;

    var cacheKey = 'DesktopMenuData';
    var items = {};

    //load cache from sessionStorage
    function init() {
        var jsonItems = sessionStorage.getItem(cacheKey);
        if (jsonItems) {items = JSON.parse(jsonItems);}
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

    function setMegaMenuLeftHtml(data) { updateCache("mmLeftHTML", data); }
    function setMegaMenuMiddleHtml(data) { updateCache("mmMiddleHTML", data); }
    function setTierThree(data) { updateCache("tierThreeLookup", data); }
  



    init();
    return api;
})();
