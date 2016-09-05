/*The MIT License (MIT)

Copyright (c) 2014 Amit K. Thakur (kth.amit@gmail.com, er.amitthakur@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

JPickList = {
    _defaults: {
        currentItems: [],
        onItemsAdded: function (currentitems) {/*to be overridden */ /*console.log(currentitems);*/ },
        onItemsChanged: function (currentitems) {/*to be overridden */ /*console.log(currentitems);*/ },
        onCancel: function (currentitems) {/*to be overridden */ /* console.log(currentitems);*/ },
        clearOnCancel:false,
        JPicklistDivSelector: '#JPickListDiv',
                postUrl: '/Home/AllCitiList'},
    init: function (options) {
        this.setupJPickList(options);
    },
    setupJPickList: function (options) {

        //No currentItems were passed in so lets re-initialize the currentItems
        if (!options.currentItems) {
            options.currentItems = [];
        }

        var settings = $.extend({}, this._defaults, options);
        //Sets up the HTML of the JPickList DIV
        var jPicklistTemplate = '<div class="jqmAlphabetPanelDiv"></div>';
        jPicklistTemplate += '<div class="JPickListItemsDiv"></div>';
        jPicklistTemplate += '<div class="JPickListButtons">';
        jPicklistTemplate += '<a href="javascript:void(0)" class="cancel"><span>Cancel</span></a>';
        jPicklistTemplate += '<a href="javascript:void(0)" class="addItems"><span>Add Items</span></a>';
        jPicklistTemplate += '</div>';
        jPicklistTemplate += "<input type=\"hidden\" value='' class=\"hdnSelectedItemVals\" />";
        $(settings.JPicklistDivSelector).html(jPicklistTemplate);

            JPickList.buildJPickList(settings, {});
            JPickList.setupJPickListButtons(settings);

        //Setting up html is complete. Lets hide the div now
        $(settings.JPicklistDivSelector).hide();
    },
    buildJPickList: function (settings, postdata) {
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
                JPickList.setupJPickListAlphaLinks(settings);


                //Setting up the Picklist contents now
                var templHtml = '<ul class="picklistItems">{{#ItemsList}}<li><label class="normaltextblue"><input type="checkbox" class="chkJPickList" {{#IsSelected}}checked{{/IsSelected}} value="{{Key}}"/>&nbsp;{{DisplayText}}</label></li>{{/ItemsList}}</ul>';
                var template = Handlebars.compile(templHtml);
                var htmlstr = template(data);

                $(settings.JPicklistDivSelector).children('.JPickListItemsDiv:first').html(htmlstr);
                JPickList.setupCheckboxesJPickList(settings);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //what to do in error
                $(settings.JPicklistDivSelector).children('.JPickListItemsDiv:first').html('Something went wrong. Please retry again! Error Details:'+JSON.stringify(xhr));
            },
            timeout: 7000//timeout of the ajax call
        });
    },
    setupJPickListAlphaLinks: function (settings) {
        //Sets up the click behavior of Alphalinks (top menu)
        $(settings.JPicklistDivSelector).off('click', '.JPickListAlphaLink').on('click', '.JPickListAlphaLink', function (event) {
            event.preventDefault();
            var _letter = $(this);
            //_alphabets.removeClass("active");
            _letter.addClass("active");

            var ur = $(this).attr('href');
            var selItms = eval($(settings.JPicklistDivSelector).children('.hdnSelectedItemVals:first').val());
            var pdata = { Alphabet: ur, SelectedKeys: JSON.stringify(selItms) };
            JPickList.buildJPickList(settings, pdata);
            return false;
        });
    },
    setupCheckboxesJPickList: function (settings) {
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
        $(settings.JPicklistDivSelector).off('click', '.chkJPickList').on('click', '.chkJPickList', function (ev) {
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
            settings.onItemsChanged(settings.currentItems);
        });
    },
    setupJPickListButtons: function (settings) {
        //Sets up the buttons "Cancel" and "Add Items" inside the JPickList
        $(settings.JPicklistDivSelector).off('click', ' .JPickListButtons > .addItems').on('click', ' .JPickListButtons > .addItems', function (evt) {
            //fix for IE Bug
            evt = evt || window.event;
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;

            //add selected item to jcrossList
            settings.onItemsAdded(settings.currentItems);
            //JPickList.clearValues(settings);
        });
        $(settings.JPicklistDivSelector).off("click", " .JPickListButtons > .cancel").on("click", " .JPickListButtons > .cancel", function (evt) {
            //fix for IE Bug
            evt = evt || window.event;
            if (evt.preventDefault)
                evt.preventDefault();
            evt.returnValue = false;

            //cancel the selections and close the window
            if (settings.clearOnCancel) {
                JPickList.clearValues(settings);
            }
            settings.onCancel(settings.currentItems);
        });
    },
    clearValues: function (settings) {
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
    },
    getValues: function (divid) {
        return ($(divid).children('.hdnSelectedItemVals:first').val());
    }
}