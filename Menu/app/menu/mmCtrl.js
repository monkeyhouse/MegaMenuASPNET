var mmLeft = '#mmLeft';
var mmMiddle = '#mmMiddle';
var mmRight = '#mmRight';


function createLinkElement(el) {
    var link = document.createElement("a");
    link.textContent = el.Text;
    link.id = el.Id;
    if (el.Url) {
        link.href = el.Url;
        link.className = "blue item";
    } else {
        link.className = "muted item";
    }
    if (el.ParentId) { link.setAttribute('data-parent-id', el.ParentId); }
    return link;
}


function injectSections(data) {
    /* objectives: inject header and footer into page.
     * is not called after cache is built
    > Parse header, footer data from html
    > Render header, footer onto screen 
    > Store footer in cache   */

    var menuTemplates = $("<div>").html(data);
    $('#PageHeader').html(menuTemplates.find('#PageHeader').html());
    $('#PageFooter').html(menuTemplates.find('#PageFooter').html());

    menuCache.setFooterHTML(menuTemplates.find('#PageFooter').get(0).innerHTML);
}

function buildMenu(data) {
    /*  Objectives:
        > Parse mega menu data from input json
        > Render mega menu data into header
        > Store header in cache
        > Store mega menu data in cache
        */


    var leftFragment = document.createDocumentFragment();
    data.Left.forEach(function(el) {
        var link = createLinkElement(el);
        leftFragment.appendChild(link);
    });
 
    var middleFrag = document.createDocumentFragment();
    data.Middle.forEach(function(el) {
        var link = createLinkElement(el);
        middleFrag.appendChild(link);
    });

    var rightHtmlLookup = {};

    for(var ix in data.Right) {
        var el = data.Right[ix];
        if (el && el.length > 0) {
            var rightFrag = document.createDocumentFragment();
            el.forEach(function (el) {
                var link = createLinkElement(el);
                rightFrag.appendChild(link);
            });
            var div = document.createElement('div');
            div.appendChild(rightFrag);
            rightHtmlLookup[ix] = div.innerHTML;
        }
    }

    //render left, middle mm sections
    $(mmLeft).html(leftFragment);
    $(mmMiddle).html(middleFrag);

    //cache data
    menuCache.setmmLeftHTML($(mmLeft).get(0).innerHTML);
    menuCache.setmmMiddleHTML($(mmMiddle).get(0).innerHTML);
    menuCache.setTierThree(rightHtmlLookup);
}

(function () {

    /* Objectives:
     * Coordinate Menu Lifecyle
     */


    function renderMenuPromise() {
        var deferred = $.Deferred();

        var menuData = menuCache.getData();
        var shouldLoadIntoCache = !menuData || menuData.date !== (new Date()).toISOString().substring(0, 10);
        // if no menu data in cache, then get data

        if (shouldLoadIntoCache) {  

            $.ajax({
                url: 'http://localhost:61702/Menu/MenuData/',
                crossDomain: true,
                cache: false,
                dataType: 'json'
            }).then(function (responseData) {
                buildMenu(responseData);
                deferred.resolve();

            });
            
            bindMenuBar();

        } else {
            injectContentFromCache();
            bindMenuBar();
            deferred.resolve();
        }

        return deferred.promise();
    }

    $.when(renderMenuPromise()).done(function() {

       
        injectContextContent();
        bindActions();

    });

    function bindActions() {
        var $mmLeft = $('#mmLeft');
        var $mmMiddle = $('#mmMiddle');
        var $mmRight = $('#mmRight');


        //Initializatin of semantic ui content
        //TODO: do the components in parallel?
        $('#MegaMenuTrigger')
            .popup({
                on : 'click',
                hoverable: true,
                position: 'bottom left',
                delay: {
                    show: 200,
                    hide: 200
                },
                //onHidden: expandLeftColumn,
                transition: 'fade right',
                preserve: true,
                setFluidWidth: false
            });

        // if hover for more than .2 s, open menu
        var timeout;       
        $('#MegaMenuTrigger').hover(
            function () {
                timeout = setTimeout(function () {
                    if ($('#MegaMenuTrigger').popup('is hidden')) {
                        $('#MegaMenuTrigger').click();
                    }
                }, 200);
            },
            function () {
                clearTimeout(timeout);
                // do stuff when hover off
            }
        );

        // show/hide middle items based on left menu selection
        $mmLeft.menuAim({
            activate: showMiddleColumn,
            rowSelector: "> .item"
        });

        var lSelection = '';
        function showMiddleColumn(el) {
            var prevSelection = lSelection;
            lSelection = el.id;
            if (prevSelection !== lSelection) {
                var $el = $(el);
                $el.addClass('active');

                $mmMiddle.find('.item[data-parent-id!=' + lSelection + ']').addClass('hidden');
                $mmMiddle.find('.item[data-parent-id=' + lSelection + ']').removeClass('hidden');

                $('#' + prevSelection).removeClass('active');

                clearRightColumn();
            }
        }


        // append/remove right item fragments based on middle item selection 
        $mmMiddle.menuAim({
            activate: showRightColumn,
            rowSelector: "> .item"
        });

        var menuData = menuCache.getData();
        var right = menuData.tierThreeLookup;
        var rSelection = '';
        function showRightColumn(el) {
            var prevSelection = rSelection;
            rSelection = el.id;
            if (prevSelection !== rSelection) {
                var $el = $(el);
                $el.addClass('active');
                right[prevSelection] = $mmRight.html();
                $mmRight.html(right[rSelection] || '<label class="item" style="background-color:#fafafa; min-height:100%;"></label>');
                $('#' + prevSelection).removeClass('active');                
            }
        }

        function clearRightColumn() {
            var prevSelection = rSelection;
            rSelection = '';
            right[prevSelection] = $mmRight.html();
            $mmRight.html('<label class="item"></label>');
            $('#' + prevSelection).removeClass('active');                        
        }

      
        function getMarker() {
            return $('<div>').attr('class', 'ui yellow empty circular label small');
        }
        function init() {        //activate left, middle items
            //mark current-page items & activate menus 
            $('#current_page_menu_items input').each(function(ix, el) {
                
                var item = document.querySelector('#' + el.value);
                if (ix === 0) {
                    showMiddleColumn(item);
                }

                if (ix === 1) {
                    showRightColumn(item);
                }

                $(item).add($('#Side_' + el.value)).append(getMarker());
            });
        }

        init();


    }
})();

function injectContextContent() {
    //inject page dependent context contents into menubar header and footer
    // breadcrubs, nearby-items search, help link href

    //#breadcrumbs_template into     //#Breadcrumbs
    //$('#breadcrumbs_template').children().appendTo('#Breadcrumbs');
    $('#Breadcrumbs').html($('#breadcrumbs_template').html());

    //#nearbyitems_template into #NearbyItems
    //$('#nearbyitems_template').children().appendTo('#NearbyItems');
    var nearby = $('#nearbyitems_template').html();
    if (nearby.trim()) {
        $('#NearbyItems').html(nearby);
    }
    // items, tierthree items into javascript menu

    //#helplinkhref_template into
    var helpUrl = $('#helplinkhref_template').attr('data-href');
    $('#HelpLink').attr('href', helpUrl);
};


function injectContentFromCache() {
    var menuData = menuCache.getData();

    $(mmLeft).html(menuData.mmLeftHTML);
    $(mmMiddle).html(menuData.mmMiddleHTML);
}

function bindMenuBar() {

    //BindMenubarPopovers() {

        $('.hd-secondary-nav .ui.button').popup({
            hoverable: true,
            position: 'bottom right',
            delay: {
                show: 100,
                hide: 500
            }
        });


    // BindMegaMenuResize() {
        $(window).resize(function () {
            resizeMenu();
        });

        function resizeMenu() {
            var height = $(window).height() - 140; 

            $(mmLeft).add($(mmMiddle)).add($(mmRight))
                .height(height);

            $('#MegaMenu').height(height + 30); //account for mega menu header
        }

        resizeMenu();

    $('#NearbyPages').click(function() {
        $('.ui.sidebar').sidebar('toggle');


        $("#SidebarSearch").typeWatch({
            callback: filterItems,
            higlight: true
        });

        function filterItems(value) {
            var filter = value.toUpperCase();
            var isEmpty = filter === "";
            $('#NearbyItems .item').each(function(ix, el) {
                var text = el.textContent.toUpperCase();
                if (isEmpty | text.indexOf(filter) > -1) {
                    el.classList.remove("hidden");
                } else {
                    el.classList.add("hidden");
                }
            });
        };
    });

        //    .dropdown({
        //    onChange: function (value, text, $selectedItem) {
        //        // custom action
        //    }
        //});

    $('.ui.sidebar')
         .sidebar({
             dimPage: false
         })
        .sidebar('setting', 'transition', 'overlay');



};
