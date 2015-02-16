var JsonParser = (function() {
    var api = {};

    api.createOption = createOptionElement;
    api.createOptionsDictionary = createOptionsDictionary;

    function createOptionElement(el) {
        var option = new Option(el.Text, el.Id);
        if (el.Url) {
            option.setAttribute("data-href", el.Url);
            option.className = "blue item";
        } else {
            option.className = "muted item";
        }
        return option;
    }

    function createOptionsDictionary(jsonDictionary) {
        /* In  { parentId : [MenuNode] , parentId2 : [MenuNode] ... };
         * Out { parentId : HTMLString, parentI2 : HtmlString ... }; 
          Created to : convert MenuNode data structure into options lookup 
                       where the options are packaged into document fragments ready for dom insertion  */

        var lookup = {},
            ix;
        for (ix in jsonDictionary) {
            var nodes = jsonDictionary[ix];
            var optsFrag = document.createDocumentFragment();
            for (var node in nodes) {
                var option = nodes[node];
                var opt = createOptionElement(option);
                optsFrag.appendChild(opt);
            }
            var optsHtmlString = $("<select>").html(optsFrag).html();
            lookup[ix] = optsHtmlString;
        }

        return lookup;
    }


    return api;
})();


function buildCache(data) {
    /*  Objectives:
        > Parse main menu data from input json
        > Store menu data in cache
        */

    var tierOneOptsFrag = document.createDocumentFragment();
    data.TierOne.forEach(function(el) {
        var opt = JsonParser.createOption(el);
        tierOneOptsFrag.appendChild(opt);
    });
    var tierOneHtmlString = $("<select>").html(tierOneOptsFrag).html();

    var tierTwoLookup = JsonParser.createOptionsDictionary(data.TierTwoDictionary),
        tierThreeLookup = JsonParser.createOptionsDictionary(data.TierThreeDictionary);

    //cache data
    menuCache.setTierOne(tierOneHtmlString);
    menuCache.setTierTwoDictionary(tierTwoLookup);
    menuCache.setTierThreeDictionary(tierThreeLookup);
    menuCache.save();
}

(function () {
    
    // Jquery Selectors
    var tierOneSelect = $('#TierOneSelect'),
        tierTwoSelect = $('#TierTwoSelect'),
        tierThreeSelect = $('#TierThreeSelect'),
        goToPage = $('#GoToPage');

    var menuToggle = $('#MainMenuToggle'),
        mainMenu = $("#MainMenu");

    /* Objectives:
     * Coordinate Menu Lifecyle
     */
    function loadDataPromise() {
        var deferred = $.Deferred();

        var menuData = menuCache.getData();
        var shouldLoadIntoCache = !menuData || menuData.date !== (new Date()).toISOString().substring(0, 10);
        // if no menu data in cache, then get data

        if (shouldLoadIntoCache) {

            var getMenuDataUrl = location.protocol + '//' + location.host + '/Menu/MobileMenuData';

            $.ajax({
                url: getMenuDataUrl,
                cache: false,
                dataType: 'json'
            }).then(function (responseData) {
                buildCache(responseData);
                deferred.resolve();

            });
            
        } else {
            deferred.resolve();
        }

        return deferred.promise();
    }

    $.when(loadDataPromise()).done(function () {

        injectContextContent();
        bindActions();
        initMainMenu();
        bindSecondMenu();
    });

    function bindActions() {
        /* Created to: make main menu interactive 
         *             also initializes main menu
         */

        menuToggle.click(function () {
            menuToggle.toggleClass('active');
            mainMenu.toggleClass('hidden');
        });

        tierOneSelect.change(function () {
            //swap second tier options
            var tierTwoData = menuCache.getData().tierTwoDictionary;
            var items = tierTwoData[this.value];
            tierTwoSelect.html(items);
            tierTwoSelect.val('');
            tierTwoSelect.change();
        });

        tierTwoSelect.change(function() {
            //swap third tier options
            var tierThreeData = menuCache.getData().tierThreeDictionary;
            var items = tierThreeData[this.value];
            tierThreeSelect.html(items);
            tierThreeSelect.val('');
            tierThreeSelect.change();
            toggleGo();
        });

        tierThreeSelect.change(function () {
            toggleGo();
        });


        function toggleGo() {

            var tierTwo = tierTwoSelect.find('option:selected'),
                          tierTwoHref = tierTwo.attr('data-href'),
                          tierThree = tierThreeSelect.find('option:selected'),
                          tierThreeHref = tierThree.attr('data-href');

            if (tierThreeHref) {
                enableGo(tierThreeHref, tierThree.text());
            } else if (tierTwoHref) {
                enableGo(tierTwoHref, tierTwo.text());
            } else {
                disableGo();
            }

            function enableGo(href, text) {
                goToPage.removeClass('disabled');
                goToPage.attr('href', href);
                goToPage.text('Go to ' + text);
            }

            function disableGo(href, text) {
                goToPage.addClass('disabled');
                goToPage.text('Go');
                goToPage.attr('href', '#');
            }
        }
    }

    function initMainMenu()
    {
        //var opts = { placeholder: 'select an option' };
        tierOneSelect.select2();
        tierTwoSelect.select2();
        tierThreeSelect.select2();

        //select current page options & populate top tier select        
        $('#current_page_menu_items input').each(function (ix, el) {

            if (ix === 0) {
                //render firstTier
                var menuData = menuCache.getData();
                tierOneSelect.html(menuData.tierOne);
                if (el.value) {
                    tierOneSelect.val(el.value);
                    //tierOneSelect.dropdown('set value', el.value);
                    tierOneSelect.change();
                }
            }

            if (el.value){
                if (ix === 1) {

                    tierTwoSelect.val(el.value);
                    //tierTwoSelect.dropdown('set value', el.value);
                    tierTwoSelect.change();
                }

                if (ix === 2) {
                    tierThreeSelect.val(el.value);
                    //tierThreeSelect.dropdown('set value', el.value);
                    tierThreeSelect.change();
                }
            }
        });

    }

    function injectContextContent() {
        //inject page dependent context contents into menubar header and footer

        //#breadcrumbs_template into     //#Breadcrumbs
        $('#Breadcrumbs').html($('#breadcrumbs_template').html());

        //#swap tierthrees for into #NearbyItems
        var thisTierthrees = $('#tierthree_template').html();
        var thisTierTwo = $('#Tier2NodeId').val();
        if (thisTierthrees.trim() && thisTierTwo) {
            //inject into cache for current page
            var cache = menuCache.getData();
            cache.tierThreeDictionary[thisTierTwo] = thisTierthrees;
        }

        //#helplinkhref_template into
        var helpUrl = $('#helplinkhref_template').attr('data-href');
        $('#HelpLink').attr('href', helpUrl);
    };

})();



function bindSecondMenu() {



    var secondNav = $('#SecondNav');
    var $menus = $("#SecondMenuContent").children();
    var $buttons = secondNav.find('.ui.button');
           
    $buttons.each(function (ix, el) {

            var targetId = el.getAttribute('data-popup');

            $(el).on('click', function () {
                $menus.hide();
                $buttons.removeClass('active');
                $(this).addClass('active');
                var tgt = $('#' + targetId);
                tgt.removeClass('hidden').show();

            });
                
    });
          
    $('#SecondNavToggle').click(function () {
        secondNav.toggleClass('hidden');
    });

    //init
    secondNav.addClass('hidden'); 
    $buttons.first().click();
};
