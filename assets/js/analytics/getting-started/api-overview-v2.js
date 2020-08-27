var BCLS = ( function (window, document, aapi_model, Prism) {
    var filterAllowableValues = document.getElementById("filterAllowableValues"),
        paramTable = document.getElementById("paramTable"),
        combination,
        proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy-v2.php',
        dimension,
        selectedDimensions      = [],
        fromDate,
        fieldsToReturn          = [],
        fieldsCheckboxes,
        dimensionCheckboxes,
        accountId,
        clientId,
        clientSecret,
        searchString,
        account_id              = document.getElementById('account_id'),
        returnFields            = document.getElementById('returnFields'),
        fieldsButton            = document.getElementById('fieldsButton'),
        deselectFieldsButton    = document.getElementById('deselectFieldsButton'),
        dimensionsListCol1      = document.getElementById('dimensionsListCol1'),
        dimensionsListCol2      = document.getElementById('dimensionsListCol2'),
        dimensionsCol1          = document.getElementById('dimensionsCol1'),
        dimensionsCol2          = document.getElementById('dimensionsCol2'),
        fieldsCol1              = document.getElementById('fieldsCol1'),
        fieldsCol2              = document.getElementById('fieldsCol2'),
        dateSelect              = document.getElementById('dateSelect'),
        count                   = document.getElementById('count'),
        allButtons              = document.getElementsByClassName('bcls-button'),
        getData                 = document.getElementById('getData'),
        apiRequest              = document.getElementById('apiRequest'),
        fieldsArrayDisplay,
        generatedContent        = document.getElementById('generatedContent'),
        responseData            = document.getElementById('responseData'),
        dimensionsParam,
        fromDisplay             = document.getElementById('fromDisplay'),
        logger                  = document.getElementById('logger'),
        dimensionGuides         = {
            'account': 'dimension-account',
            'browser_type': 'dimension-browsertype',
            'city': 'dimension-city',
            'country': 'dimension-country',
            'date': 'dimension-date',
            'date_hour': 'dimension-datehour',
            'destination_domain': 'dimension-destinationdomain',
            'destination_path': 'dimension-destinationpath',
            'device_os': 'dimension-deviceos',
            'device_manufacturer': 'dimension-devicemanufacturer',
            'device_type': 'dimension-devicetype',
            'live_stream': 'dimension-livestream',
            'player': 'dimension-player',
            'referrer_domain': 'dimension-referrerdomain',
            'region': 'dimension-region',
            'search_terms': 'dimension-searchterms',
            'social_platform': 'dimension-socialplatform',
            'source_type': 'dimension-sourcetype',
            'video': 'dimension-video'
        },
        i,
        iMax;

    /**
     * logging
     */
    function bclslog(context, message) {
        if (window["console"] && console["log"]) {
          console.log(context, message);
        }
    }
    /**
     * builds param summary table
     */
    function buildParamTable() {
        var thisParam,
            str = "",
            param;
            for (param in aapi_model.urlparams) {
                thisParam = aapi_model.urlparams[param];
                str += "<tr><td><code>" + thisParam.name + "</code></td><td>" + thisParam.required + "</td><td>" + thisParam.description + "</td><td>" + thisParam.values + "</td><td>" + thisParam.default + "</td></tr>";
            }
            paramTable.innerHTML = str;
    }
    /**
    * tests for all the ways a variable (string or number) might be undefined or not have a value
    * @param {String|Numbar} x the variable to test
    * @return {Boolean} true if variable is defined and has a value
    **/
    function isDefined(x) {
        if ( x === "" || x === null || x === undefined) {
           return false;
        }
        return true;
    }

    /**
     * get selected value for single select element
     * @param {htmlElement} e the select element
     * @return {Object} object containing the `value` and selected `index`
     */
    function getSelectedValue(e) {
        var val = e.options[e.selectedIndex].value,
            idx = e.selectedIndex;
        return {
            value: val,
            index: idx
        };
    }

    /**
     * determines whether specified item is in an array
     *
     * @param {array} array to check
     * @param {string} item to check for
     * @return {boolean} true if item is in the array, else false
     */
    function isItemInArray(arr, item) {
        var i,
            iMax = arr.length;
        for (i = 0; i < iMax; i++) {
            if (arr[i] === item) {
                return true;
            }
        }
        return false;
    }

    /**
     * find index of an object in array of objects
     * based on some property value
     *
     * @param {array} targetArray array to search
     * @param {string} objProperty object property to search
     * @param {string} value of the property to search for
     * @return {integer} index of first instance if found, otherwise returns -1
    */
    function findObjectInArray(targetArray, objProperty, value) {
        var i, totalItems = targetArray.length, objFound = false;
        for (i = 0; i < totalItems; i++) {
            if (targetArray[i][objProperty] === value) {
                objFound = true;
                return i;
            }
        }
        if (objFound === false) {
            return -1;
        }
    }

    /**
     * dedupe a simple array of strings or numbers
     * @param {array} arr the array to be deduped
     * @return {array} the deduped array
     */
    function dedupe(arr) {
        var i,
            len = arr.length,
            out = [],
            obj = {};

        for (i = 0;i < len; i++) {
            obj[arr[i]] = 0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    }

    /**
     * Determines if two simple arrays contain identical elements
     * @param {Array} arr1 array to compare
     * @param {Array} arr2 array to compare
     * @return {Boolean}
     */
    function arraysEqual(arr1, arr2) {
        bclslog('arr1', arr1.sort().toString());
        bclslog('arr2', arr2.sort().toString());

        if (arr1.sort().toString() === arr2.sort().toString()) {
            return true;
        }
        return false;
    }

    /**
     * getSelectedCheckboxes returns an array of the values
     * of checked checkboxes
     * @param {htmlElementCollection} checkboxCollection a collection of the checkbox elements, usually gotten by document.getElementsByName()
     * @param {Array} targetArray the array to store the values in
     */
    function getSelectedCheckboxes(checkboxCollection, targetArray) {
        var i,
            iMax = checkboxCollection.length;
        for (i = 0; i < iMax; i += 1) {
            if (checkboxCollection[i].checked) {
                targetArray.push(checkboxCollection[i].value);
            }
        }
        return targetArray;
    }

    /**
     * disables all buttons so user can't submit new request until current one finishes
     */
    function disableButtons() {
        var i,
            iMax = allButtons.length;
        for (i = 0; i < iMax; i++) {
            allButtons[i].setAttribute('disabled', 'disabled');
            allButtons[i].setAttribute('style', 'opacity:.5;cursor:not-allowed;');
        }
        return;
    }

    /**
     * re-enables all buttons
     */
    function enableButtons() {
        var i,
            iMax = allButtons.length;
        for (i = 0; i < iMax; i++) {
            allButtons[i].removeAttribute('disabled');
            allButtons[i].removeAttribute('style');
        }
        return;
    }

    /**
     * build list of dimensions with links to the guides
     */
    function buildDimensionsList() {
        var i,
            iMax = aapi_model.dimensionsArray.length,
            half = Math.ceil(iMax / 2),
            ul1 = document.createElement('ul'),
            ul2 = document.createElement('ul'),
            li,
            a,
            code,
            txt,
            thisDimension;
        for (i = 0; i < iMax; i++) {
            thisDimension = aapi_model.dimensionsArray[i];
            li = document.createElement('li');
            a = document.createElement('a');
            code = document.createElement('code');
            a.setAttribute('href', '/analytics/dimension-guides/' + dimensionGuides[thisDimension] + '.html');
            txt = document.createTextNode(thisDimension);
            a.appendChild(code);
            code.appendChild(txt);
            li.appendChild(a);
            if (i < half) {
                ul1.appendChild(li);
            } else {
                ul2.appendChild(li);
            }
        }
        dimensionsListCol1.appendChild(ul1);
        dimensionsListCol2.appendChild(ul2);
    }
    /**
     * built filter values
     */
    function buildFilterValueTable() {
        var thisDimension,
            thisValues,
            j,
            d,
            jMax,
            str = "";
        for (d in aapi_model.dimensions) {
            thisDimension = aapi_model.dimensions[d];
            bclslog('thisDimension', thisDimension);
            thisValues = thisDimension.filter_values;
            str += "<tr><td><code>" + thisDimension.name + "</code></td><td><ul>";
            jMax = thisValues.length;
            for (j = 0; j < jMax; j++) {
                str += "<li>" + thisValues[j] + "</li>";
            }
            str += "</td></tr>";
        }
        filterAllowableValues.innerHTML = str;
    }

    /**
     * updateRequestDisplay - gets the selected checkboxes and update the fields list display
     */
    function updateRequestDisplay() {
        apiRequest.textContent = 'https://analytics.api.brightcove.com/v1/data?accounts=ACCOUNT_ID';
        if (selectedDimensions.length > 0) {
            apiRequest.textContent += '&dimensions=' + selectedDimensions.join(',');
        }
        if (fieldsToReturn.length > 0) {
            apiRequest.textContent += '&fields=' + fieldsToReturn.join(',');
        }
        if (isDefined(fromDate)) {

        }
    }

    /**
     * adds dimension options from the aapi_model
     */
    function addDimensionOptions() {
        var i,
            iMax,
            input,
            text,
            label,
            code,
            d,
            thisDimension,
            count = 0,
            br,
            half,
            frag1 = new DocumentFragment(),
            frag2 = new DocumentFragment();
        // clear existing dimension checkboxes
        dimensionsCol1.innerHTML = '';
        dimensionsCol2.innerHTML = '';
        // add the return field options
        iMax = aapi_model.dimensionsArray.length;
        half = Math.ceil(iMax / 2);
        for (d in aapi_model.dimensions) {
            thisDimension = aapi_model.dimensions[d];
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'dimensionsChk');
            input.setAttribute('id', 'dim' + thisDimension.name);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', thisDimension.name);
            label.setAttribute('for', 'dim' + thisDimension.name);
            text = document.createTextNode('  ' + thisDimension.name);
            br = document.createElement('br');
            code = document.createElement('code');
            label.appendChild(code);
            code.appendChild(text);
            if (count < half) {
                frag1.appendChild(input);
                frag1.appendChild(label);
                frag1.appendChild(br);
            } else {
                frag2.appendChild(input);
                frag2.appendChild(label);
                frag2.appendChild(br);
            }
            count++;
        }
        dimensionsCol1.appendChild(frag1);
        dimensionsCol2.appendChild(frag2);
        // get a reference to the checkbox collection
        dimensionCheckboxes = document.getElementsByName('dimensionsChk');
    }

    /**
     * addFieldOptions generates checkboxes for each field
     * available for the selected dimensions
     */
    function addFieldOptions(selection) {
        var fieldsArray = [],
            dimensionName,
            dimensionIndex,
            thisDimensionFields,
            i,
            iMax,
            j,
            jMax,
            input,
            label,
            code,
            text,
            br,
            half;
        // clear existing field checkboxes
        fieldsCol1.innerHTML = '';
        fieldsCol2.innerHTML = '';
        fieldsArray = selection.fields;
        // add the return field options
        iMax = fieldsArray.length;
        half = Math.ceil(iMax / 2);
        for (i = 0; i < half; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            input.setAttribute('name', 'fieldsChk');
            input.setAttribute('id', 'field' + fieldsArray[i]);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', fieldsArray[i]);
            label.setAttribute('for', 'field' + fieldsArray[i]);
            text = document.createTextNode(' ' + fieldsArray[i]);
            br = document.createElement('br');
            fieldsCol1.appendChild(input);
            fieldsCol1.appendChild(label);
            code = document.createElement('code');
            label.appendChild(code);
            code.appendChild(text);
            fieldsCol1.appendChild(br);
        }
        for (i = half; i < iMax; i += 1) {
            input = document.createElement('input');
            label = document.createElement('label');
            code = document.createElement('code');
            input.setAttribute('name', 'fieldsChk');
            input.setAttribute('id', 'field' + fieldsArray[i]);
            input.setAttribute('type', 'checkbox');
            input.setAttribute('value', fieldsArray[i]);
            label.setAttribute('for', 'field' + fieldsArray[i]);
            text = document.createTextNode(' ' + fieldsArray[i]);
            br = document.createElement('br');
            fieldsCol2.appendChild(input);
            fieldsCol2.appendChild(label);
            label.appendChild(code);
            code.appendChild(text);
            fieldsCol2.appendChild(br);
        }
        // get a reference to the checkbox collection
        fieldsCheckboxes = document.getElementsByName('fieldsChk');
        // set up event listeners
        function setFieldsToReturn() {
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
                updateRequestDisplay();
        }
        iMax = fieldsCheckboxes.length;
        for (i = 0; i < iMax; i += 1) {
            fieldsCheckboxes[i].addEventListener('click', setFieldsToReturn);
        }
    }

    /**
     * sets up the data for the API request
     * @param {String="getCount","getVideos","getData"} id the id for the call type
     */
    function setRequestData(id) {
        var options = {},
        baseURL = 'https://analytics.api.brightcove.com/v1/data';
        options.proxyURL = proxyURL;
        // disable buttons to prevent a new request before current one finishes
        disableButtons();
        endPoint = '?accounts=' + accountId + '&dimensions=' + selectedDimensions.join(',') + '&fields=' + fieldsToReturn.join(',');
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        makeRequest(options, function(response) {
          var parsedData = JSON.parse(response);
          responseData.textContent = JSON.stringify(parsedData, null, '  ');
        });
    }

    /**
     * send API request to the proxy
     * @param  {Object} options for the request
     * @param  {String} options.url the full API request URL
     * @param  {String="GET","POST","PATCH","PUT","DELETE"} requestData [options.requestType="GET"] HTTP type for the request
     * @param  {String} options.proxyURL proxyURL to send the request to
     * @param  {String} options.client_id client id for the account (default is in the proxy)
     * @param  {String} options.client_secret client secret for the account (default is in the proxy)
     * @param  {JSON} [options.requestBody] Data to be sent in the request body in the form of a JSON string
     * @param  {Function} [callback] callback function that will process the response
     */
    function makeRequest(options, callback) {
      var httpRequest = new XMLHttpRequest(),
        response,
        proxyURL = options.proxyURL,
        // response handler
        getResponse = function() {
          try {
            if (httpRequest.readyState === 4) {
              if (httpRequest.status >= 200 && httpRequest.status < 300) {
                response = httpRequest.responseText;
                // some API requests return '{null}' for empty responses - breaks JSON.parse
                if (response === '{null}') {
                  response = null;
                }
                // return the response
                callback(response);
              } else {
                alert('There was a problem with the request. Request returned ' + httpRequest.status);
              }
            }
          } catch (e) {
            alert('Caught Exception: ' + e);
          }
        };
      /**
       * set up request data
       * the proxy used here takes the following request body:
       * JSON.stringify(options)
       */
      // set response handler
      httpRequest.onreadystatechange = getResponse;
      // open the request
      httpRequest.open('POST', proxyURL);
      // set headers if there is a set header line, remove it
      // open and send request
      httpRequest.send(JSON.stringify(options));
    }

    function init() {
        buildParamTable();
        buildFilterValueTable();
        // create dimensions list
        buildDimensionsList();
        // set up dimensions
        addDimensionOptions();
        // initially disable buttons
        disableButtons();
        // set up fields
        // selectedDimensions = ['video'];
        // addFieldOptions();
        // event listeners
        getData.addEventListener('click', function() {
            var i,
                iMax,
                selectedDateObj,
                dimensionObj,
                displayFields = '';
            // make sure arrays are emptied out
            selectedDimensions = [];
            fieldsToReturn = [];
            // get account values
            accountId = account_id.value;
            // get dimension in case it wasn't changed
            selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes, selectedDimensions);
            // get the array of fields from the fieldsCheckboxes
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
            if (isItemInArray(fieldsToReturn,'video.custom_fields.{field_name}')) {
              i = fieldsToReturn.length;
              while (i > 0) {
                i--;
                if (fieldsToReturn[i] === 'video.custom_fields.{field_name}') {
                  fieldsToReturn.splice(i, 1);
                }
              }
              console.log('fieldsToReturn', fieldsToReturn);
            }
            // make the request
            setRequestData('getAnalytics');
        });

        function dimensionSelected() {
            var dateArray = [],
            thisDimension,
            idx,
            combo,
            combination,
            combinationDimensions,
            selectedDimension;
            // empty selected dimensions arrays
            selectedDimensions = [];
            selectedDimensions = getSelectedCheckboxes(dimensionCheckboxes, selectedDimensions);
            bclslog('selectedDimensions', selectedDimensions);
            // check for single selected dimension
            if (selectedDimensions.length === 1) {
                selectedDimension = aapi_model.dimensions[selectedDimensions[0]];
                bclslog('selectedDimension', selectedDimension);
            } else {
                for (combo in aapi_model.combinations) {
                    combinationDimensions = aapi_model.combinations[combo].dimensions;
                    if (selectedDimensions.length === combinationDimensions.length) {
                        if (arraysEqual(selectedDimensions, combinationDimensions)) {
                            // valid combination
                            combination = aapi_model.combinations[combo];
                            // there's only one match, bail out
                            break;
                        }
                    }
                }
            }

            if (isDefined(combination)) {
                addFieldOptions(combination);
                fromDate = combination.from;
                // display earliest data
                fromDisplay.textContent = fromDate;
                enableButtons();
            } else if (isDefined(selectedDimension)) {
                addFieldOptions(selectedDimension);
                fromDate = selectedDimension.from;
                // display earliest data
                fromDisplay.textContent = fromDate;
                enableButtons();
            } else {
                fieldsCol1.innerHTML = '<strong>The dimension combination is not valid</strong>';
                fieldsCol2.innerHTML = '';
                disableButtons();
            }
        }

        // add dimensions checkboxes event listeners
        iMax = dimensionCheckboxes.length;
        for (i = 0; i < iMax; i += 1) {
            dimensionCheckboxes[i].addEventListener('click', dimensionSelected);
        }

        fieldsButton.addEventListener('click', function() {
            var i,
                iMax = fieldsCheckboxes.length;
            for (i = 0; i < iMax; i += 1) {
                fieldsCheckboxes[i].setAttribute('checked', 'checked');
            }
            fieldsToReturn = getSelectedCheckboxes(fieldsCheckboxes, fieldsToReturn);
            // update fields display
            updateRequestDisplay();
        });

        deselectFieldsButton.addEventListener('click', function() {
            var i,
                iMax = fieldsCheckboxes.length;
            for (i = 0; i < iMax; i += 1) {
                fieldsCheckboxes[i].removeAttribute('checked');
            }
            fieldsToReturn = [];
            // update fields display
            updateRequestDisplay();
        });
    }
    init();
})(window, document, aapi_model, Prism);
