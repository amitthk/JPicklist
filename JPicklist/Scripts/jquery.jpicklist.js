(function($) {
    $.fn.JPickList = function(options) {
        var _defaults = {
            currentItems: [],
            onItemsAdded: function (currentitems) {/*to be overridden */ /*console.log(currentitems);*/ },
            onItemsChanged: function (currentitems) {/*to be overridden */ /*console.log(currentitems);*/ },
            onCancel: function (currentitems) {/*to be overridden */ /* console.log(currentitems);*/ },
            clearOnCancel:false,
            JPicklistDivSelector: '#JPickListDiv',
            postUrl: ''};

        //If No currentItems were passed in so lets re-initialize the currentItems
        if (!options.currentItems) {
            options.currentItems = [];
        }

        var settings = $.extend({}, this._defaults, options);

        var $t = $(this);
        settings.JPicklistDivSelector = $t;

        $.fn.JPickList.setupJPickList(settings);
        $.fn.JPickList.buildJPickList(settings, {});
        $.fn.JPickList.setupJPickListButtons(settings);

        //Setting up html is complete. Lets hide the div now
        $(settings.JPicklistDivSelector).hide();
    };

    $.fn.JPickList.setupJPickList = function (settings) {
        //Sets up the HTML of the JPickList DIV
        var jPicklistTemplate = '<div class="jqmAlphabetPanelDiv"></div>';
        jPicklistTemplate += '<div class="JPickListItemsDiv"></div>';
        jPicklistTemplate += '<div class="JPickListButtons">';
        jPicklistTemplate += '<a href="javascript:void(0)" class="cancel"><span>Cancel</span></a>';
        jPicklistTemplate += '<a href="javascript:void(0)" class="addItems"><span>Add Items</span></a>';
        jPicklistTemplate += '</div>';
        jPicklistTemplate += "<input type=\"hidden\" value='' class=\"hdnSelectedItemVals\" />";
        $(settings.JPicklistDivSelector).html(jPicklistTemplate);
    };

    $.fn.JPickList.buildJPickList = function (settings, postdata) {
        //Fetches (AJAX) the Alphabet and Content to render jPicklist
            $.ajax({
                url: settings.postUrl,
                type: "POST",
                data: postdata,
                success: function (data) {
                    // console.log('build contents');
                    // console.log(settings);
                    //Setting up the alphabet links table for the picklist
                    var alphaTmplt = '<ul class="tblJPickListAlphabets">{{#.}}<li><a href="{{.}}" class="JPickListAlphaLink">{{.}}</a></li>{{/.}}</ul>';
                    var templ = Handlebars.compile(alphaTmplt);
                    var alphHtml = templ(data.PagingKeysList);
                    $(settings.JPicklistDivSelector).children('.jqmAlphabetPanelDiv:first').html(alphHtml);
                    $.fn.JPickList.setupJPickListAlphaLinks(settings);


                    //Setting up the Picklist contents now
                    var templHtml = '<ul class="picklistItems">{{#ItemsList}}<li><label class="normaltextblue"><input type="checkbox" class="chkJPickList" {{#IsSelected}}checked{{/IsSelected}} value="{{Key}}"/>&nbsp;{{DisplayText}}</label></li>{{/ItemsList}}</ul>';
                    var template = Handlebars.compile(templHtml);
                    var htmlstr = template(data);

                    $(settings.JPicklistDivSelector).children('.JPickListItemsDiv:first').html(htmlstr);
                    $.fn.JPickList.setupCheckboxesJPickList(settings);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //what to do in error
                    $(settings.JPicklistDivSelector).children('.JPickListItemsDiv:first').html('Something went wrong. Please retry again! Error Details:'+JSON.stringify(xhr));
                },
                timeout: 7000//timeout of the ajax call
            });
        };

    $.fn.JPickList.setupJPickListAlphaLinks = function (settings) {
        //Sets up the click behavior of Alphalinks (top menu)
        $(settings.JPicklistDivSelector).off('click', '.JPickListAlphaLink').on('click', '.JPickListAlphaLink', function (event) {
            event.preventDefault();
            var _letter = $(this);
            //_alphabets.removeClass("active");
            _letter.addClass("active");

            var ur = $(this).attr('href');
            var selItms = eval($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first').val());
            var pdata = { Alphabet: ur, SelectedKeys: JSON.stringify(selItms) };
            $.fn.JPickList.buildJPickList(settings, pdata);
            return false;
        });
    };

    $.fn.JPickList.setupCheckboxesJPickList = function (settings) {
            //Sets up the Checkboxes click behavior in the content Div
            if ($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first').val()) {
                settings.currentItems = JSON.parse($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first').val());
            }

            //fixing the display of checkboxes on load of PickList
            $(settings.JPicklistDivSelector).children('.chkJPickList').each(function () {
                if ((settings.currentItems) && (settings.currentItems.length > 0)) {
                    var _val = $(this).val();
                    for (var tmp = 0; tmp < settings.currentItems.length; tmp++) {
                        if (_val === settings.currentItems[tmp]) {
                            this.setAttribute("checked", "");
                            this.checked = true;
                            //console.log('checked: ['+_val+']');
                        }
                    }
                }
            });

            //attach the click event
            $(settings.JPicklistDivSelector).off('click','.chkJPickList').on('click','.chkJPickList', function (ev) {
                var _val = $(this).val();

                if (this.checked) {

                    if ($.inArray(_val, settings.currentItems) == -1) {
                        settings.currentItems.push(_val);
                    }
                    $($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first')).val(JSON.stringify(settings.currentItems));
                }
                else {
                    var itmidx = $.inArray(_val, settings.currentItems);
                    if ($.inArray(_val, settings.currentItems) > -1) {
                        settings.currentItems.splice(itmidx, 1);
                        $($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first')).val(JSON.stringify(settings.currentItems));
                    }

                }
                if (settings.onItemsChanged) {
                    settings.onItemsChanged(settings.currentItems);
                }
            });
        };

    $.fn.JPickList.setupJPickListButtons = function (settings) {
        //Sets up the buttons "Cancel" and "Add Items" inside the JPickList
        $(settings.JPicklistDivSelector).off('click', ' .JPickListButtons > .addItems').on('click', ' .JPickListButtons > .addItems', function (evt) {
            //fix for IE Bug
            evt = evt || window.event;
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;

            //add selected item to jcrossList
            settings.onItemsAdded(settings.currentItems);
            //$.fn.JPickList.clearValues(settings);
        });
        $(settings.JPicklistDivSelector).off("click", " .JPickListButtons > .cancel").on("click", " .JPickListButtons > .cancel", function (evt) {
            //fix for IE Bug
            evt = evt || window.event;
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;

            //cancel the selections and close the window
            if (settings.clearOnCancel) {
                $.fn.JPickList.clearValues(settings);
            }
            settings.onCancel(settings.currentItems);
        });
    };

    $.fn.JPickList.clearValues = function (settings) {
            //Used to clear values for a JPickList
            $($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first')).val('');
            settings.currentItems = [];
            var $checkboxes = $(settings.JPicklistDivSelector).children('.JPickListItemsDiv:first').children('ul.picklistItems:first').children('li').children('label').children('.chkJPickList');
            $checkboxes.each(function () {
                var attr = $(this).attr('checked');
                // For some browsers, `attr` is undefined; for others,
                // `attr` is false.  Check for both.
                if (typeof attr !== typeof undefined || attr !== false) {
                    $(this).removeAttr('checked');
                }
            });
        };

    $.fn.JPickList.getValues = function (divid) {
            return ($(divid).children('.hdnSelectedItemVals:first').val());
        };

})(jQuery);