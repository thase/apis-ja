var BCLS = (function(window, document) {
  var account_id,
    client_id,
    client_secret,
    // api stuff
    proxyURL = 'https://solutions.brightcove.com/bcls/bcls-proxy/bcls-proxy-v2.php',
    baseURL = 'https://cms.api.brightcove.com/v1/accounts/',
    limit = 25,
    totalVideos = 0,
    totalCalls = 0,
    callNumber = 0,
    videosCompleted = 0,
    videosArray = [],
    summaryData = {},
    csvStr,
    summaryCsvStr,
    customFields = [],
    // elements
    account_id_element = document.getElementById('account_id'),
    client_id_element = document.getElementById('client_id'),
    client_secret_element = document.getElementById('client_secret'),
    tag = document.getElementById('tag'),
    videoCount = document.getElementById('videoCount'),
    makeReport = document.getElementById('makeReport'),
    content,
    logger = document.getElementById('logger'),
    logText = document.getElementById('logText'),
    csvData = document.getElementById('csvData'),
    apiRequest = document.getElementById('apiRequest'),
    allButtons = document.getElementsByName('button'),
    pLogGettingVideos = document.createElement('p'),
    pLogGettingRenditions = document.createElement('p'),
    pLogFinish = document.createElement('p'),
    spanIntro2 = document.createElement('span'),
    spanOf2 = document.createElement('span'),
    spanRenditionsTotal = document.createElement('span'),
    spanRenditionsCount = document.createElement('span'),
    spanRenditionsTotalEl,
    spanRenditionsCountEl;

  /**
   * tests for all the ways a variable might be undefined or not have a value
   * @param {String|Number} x the variable to test
   * @return {Boolean} true if variable is defined and has a value
   */
  function isDefined(x) {
    if (x === '' || x === null || x === undefined) {
      return false;
    }
    return true;
  }

  /*
   * tests to see if a string is json
   * @param {String} str string to test
   * @return {Boolean}
   */
  function isJson(str) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  }

  /**
   * get selected value for single select element
   * @param {htmlElement} e the select element
   */
  function getSelectedValue(e) {
    return e.options[e.selectedIndex].value;
  }

  /**
   * disables all buttons so user can't submit new request until current one finishes
   */
  function disableButtons() {
    var i,
      iMax = allButtons.length;
    for (i = 0; i < iMax; i++) {
      allButtons[i].setAttribute('disabled', 'disabled');
    }
  }

  /**
   * re-enables all buttons
   */
  function enableButtons() {
    var i,
      iMax = allButtons.length;
    for (i = 0; i < iMax; i++) {
      allButtons[i].removeAttribute('disabled');
    }
  }

  /**
   * sort an array of objects based on an object property
   * @param {array} targetArray - array to be sorted
   * @param {string|number} objProperty - object property to sort on
   * @return sorted array
   */
  function sortArray(targetArray, objProperty) {
    targetArray.sort(function(a, b) {
      var propA = a[objProperty],
        propB = b[objProperty];
      // sort ascending; reverse propA and propB to sort descending
      if (propA < propB) {
        return -1;
      } else if (propA > propB) {
        return 1;
      } else {
        return 0;
      }
    });
    return targetArray;
  }

  function processRenditions(renditions, callback) {
    var i,
      iMax = renditions.length,
      hlsRenditions = [],
      mp4Renditions = [],
      flvRenditions = [],
      otherRenditions = [],
      totalSize = 0;
    // separate renditions by type
    for (i = 0; i < iMax; i += 1) {
      if (renditions[i].hasOwnProperty('size')) {
        totalSize += renditions[i].size;
      }
      if (renditions[i].video_container === 'M2TS') {
        hlsRenditions.push(renditions[i]);
      } else if (renditions[i].video_container === 'MP4') {
        mp4Renditions.push(renditions[i]);
      } else if (renditions[i].video_container === 'FLV') {
        flvRenditions.push(renditions[i]);
      } else {
        otherRenditions.push(renditions[i]);
      }
    }
    // sort renditions by encoding rate
    callback(hlsRenditions, mp4Renditions, flvRenditions, otherRenditions, totalSize);
  }

  /**
   * determines whether specified item is in an array
   *
   * @param {array} array to check
   * @param {string} item to check for
   * @return {boolean} true if item is in the array, else false
   */
  function arrayContains(arr, item) {
    var i,
      iMax = arr.length;
    for (i = 0; i < iMax; i++) {
      if (arr[i] === item) {
        return true;
      }
    }
    return false;
  }

  function processCustomFields(fields) {
    var field;
    for (field in fields) {
      if (!arrayContains(customFields, field)) {
        customFields.push(field);
      }
    }
  }


  function startCSVStrings() {
    var i = 0,
      iMax;
    csvStr = '"ID","Name","Reference ID","Description","Date Added","Date Last Modified","State","Filename","Resolution","Duration(sec)","HLS Renditions (bitrate range KBPS)","MP4 Renditions (bitrate range KBPS)","FLV Renditions (bitrate range KBPS)","Total Rendition Size (MB)",\r\n';
  }

  function writeReport() {
    var i,
      iMax,
      j,
      jMax,
      video,
      hlsLowRate,
      hlsHighRate,
      mp4LowRate,
      mp4HighRate,
      flvLowRate,
      flvHighRate,
      resWidth,
      resHeight,
      rendition = {};
    if (videosArray.length > 0) {
      iMax = videosArray.length;
      for (i = 0; i < iMax; i += 1) {
        video = videosArray[i];
        // replace any line breaks in description, as that will break the CSV
        if (video.description) {
          video.description = video.description.replace(/(?:\r\n|\r|\n)/g, ' ');
        }
        // generate the video detail row
        hlsLowRate = (video.hlsRenditions.length > 0) ? video.hlsRenditions[0].encoding_rate / 1000 : 0;
        hlsHighRate = (video.hlsRenditions.length > 0) ? video.hlsRenditions[video.hlsRenditions.length - 1].encoding_rate / 1000 : 0;
        mp4LowRate = (video.mp4Renditions.length > 0) ? video.mp4Renditions[0].encoding_rate / 1000 : 0;
        mp4HighRate = (video.mp4Renditions.length > 0) ? video.mp4Renditions[video.mp4Renditions.length - 1].encoding_rate / 1000 : 0;
        flvLowRate = (video.flvRenditions.length > 0) ? video.flvRenditions[0].encoding_rate / 1000 : 0;
        flvHighRate = (video.flvRenditions.length > 0) ? video.flvRenditions[video.flvRenditions.length - 1].encoding_rate / 1000 : 0;
        if (video.flvRenditions.length > 0) {
          rendition = video.flvRenditions[video.flvRenditions.length - 1];
        } else if (video.mp4Renditions.length > 0) {
          rendition = video.mp4Renditions[video.mp4Renditions.length - 1];
        } else if (video.hlsRenditions.length > 0) {
          rendition = video.hlsRenditions[video.hlsRenditions.length - 1];
        } else {
          rendition.frame_width = "unknown";
          rendition.frame_height = "unknown";
        }
        resWidth = rendition.frame_width;
        resHeight = rendition.frame_height;
        // add csv row
        csvStr += '"' + video.id + '","' + video.name + '","' + video.reference_id + '","' + video.description + '","' + video.created_at + '","' + video.updated_at + '","' + video.state + '","' + video.original_filename + '","' + resWidth + 'x' + resHeight + '","' + video.duration / 1000 + '","' + video.hlsRenditions.length + ' (' + hlsLowRate + '-' + hlsHighRate + ')","' + video.mp4Renditions.length + ' (' + mp4LowRate + '-' + mp4HighRate + ')","' + video.flvRenditions.length + ' (' + flvLowRate + '-' + flvHighRate + ')",' + '"' + (video.totalSize / 1000000) + '",\r\n';
      }
      csvData.textContent += csvStr;
      // content = document.createTextNode('Finished! See the results or get the CSV data below.');
      pLogFinish.textContent = 'Finished! See the results or get the CSV data below.';
      // reportDisplay.innerHTML = summaryReportStr + reportStr;
      enableButtons();
    }
  }

  /**
   * sets up the data for the API request
   * @param {String} id the id of the button that was clicked
   */
  function createRequest(id) {
    var endPoint = '',
      parsedData,
      options = {};
      options.proxyURL = proxyURL;
      options.account_id = account_id;
      if (isDefined(client_id) && isDefined(client_secret)) {
        options.client_id = client_id;
        options.client_secret = client_secret;
      }
    // disable buttons to prevent a new request before current one finishes
    disableButtons();
    switch (id) {
      case 'getCount':
        endPoint = account_id + '/counts/videos?sort=created_at';
        if (isDefined(tag.value)) {
          endPoint += '&q=%2Btags:' + tag.value;
        }
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        makeRequest(options, function(response) {
          parsedData = JSON.parse(response);
          // set total videos
          video_count = parsedData.count;
          if (totalVideos === "All") {
            totalVideos = video_count;
          } else {
            totalVideos = (totalVideos < video_count) ? totalVideos : video_count;
          }
          totalCalls = Math.ceil(totalVideos / limit);
          logText.textContent = totalVideos + ' videos found; getting account custom fields';
          createRequest('getVideos');
        });
        break;
      case 'getVideos':
        var offset = (limit * callNumber);
        endPoint = account_id + '/videos?sort=created_at&limit=' + limit + '&offset=' + offset;
        if (isDefined(tag.value)) {
          endPoint += '&q=%2Btags:' + tag.value;
        }
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        makeRequest(options, function(response) {
          parsedData = JSON.parse(response);
          videosArray = videosArray.concat(parsedData);
          callNumber++;
          if (callNumber < totalCalls) {
            createRequest('getVideos');
          } else {
            callNumber = 0;
            spanRenditionsCountEl.textContent = callNumber + 1;
            spanRenditionsTotalEl.textContent = totalVideos;
            createRequest('getDigitalMaster');
          }
        });
        break;
      case 'getDigitalMaster':
        videosArray[callNumber].totalSize = 0;
        endPoint = account_id + '/videos/' + videosArray[callNumber].id + '/digital_master';
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        makeRequest(options, function(response) {
          if (isDefined(response)){
            responseDecoded = JSON.parse(response);
            if (isDefined(responseDecoded) && !isDefined(responseDecoded.length)) {
              videosArray[callNumber].totalSize += responseDecoded.size;
              createRequest('getVideoRenditions');
            } else {
              createRequest('getVideoRenditions');
            }
          } else {
            createRequest('getVideoRenditions');
          }
        })
        break;
      case 'getVideoRenditions':
        var i,
          iMax = videosArray.length;
        videosArray[callNumber].hlsRenditions = [];
        videosArray[callNumber].mp4Renditions = [];
        videosArray[callNumber].flvRenditions = [];
        videosArray[callNumber].otherRenditions = [];
        endPoint = account_id + '/videos/' + videosArray[callNumber].id + '/assets/renditions';
        options.url = baseURL + endPoint;
        options.requestType = 'GET';
        apiRequest.textContent = options.url;
        spanRenditionsCountEl.textContent = callNumber + 1;
        makeRequest(options, function(response) {
            var renditions = JSON.parse(response);
            if (renditions.length > 0) {
              processRenditions(renditions, function(hlsRenditions, mp4Renditions, flvRenditions, otherRenditions, totalSize) {
                if (hlsRenditions.length > 0) {
                  sortArray(hlsRenditions, 'encoding_rate');
                }

                videosArray[callNumber].hlsRenditions = hlsRenditions;
                if (mp4Renditions.length > 0) {
                  sortArray(mp4Renditions, 'encoding_rate');
                }
                videosArray[callNumber].mp4Renditions = mp4Renditions;
                if (flvRenditions.length > 0) {
                  sortArray(flvRenditions, 'encoding_rate');
                }
                videosArray[callNumber].flvRenditions = flvRenditions;
                // if (otherRenditions.length > 0) {
                //     sortArray(otherRenditions, 'encoding_rate');
                // }
                // videosArray[callNumber].otherRenditions = otherRenditions;
                videosArray[callNumber].totalSize += totalSize;
            });
          } else {
              videosArray[callNumber].hlsRenditions = [];
              videosArray[callNumber].mp4Renditions = [];
              videosArray[callNumber].flvRenditions = [];
            }
          videosCompleted++;
          logText.textContent = totalVideos + ' videos found; videos retrieved: ' + videosCompleted;
          callNumber++;
          if (callNumber < totalVideos) {
            createRequest('getDigitalMaster');
          } else {
            // create csv headings
            startCSVStrings();
            // write the report
            writeReport();
          }
        });
        break;
    }
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
          requestParams,
          dataString,
          proxyURL    = options.proxyURL,
          // response handler
          getResponse = function() {
              try {
                  if (httpRequest.readyState === 4) {
                      if (httpRequest.status >= 200 && httpRequest.status < 300) {
                          response = httpRequest.responseText;
                          // some API requests return '{null}' for empty responses - breaks JSON.parse
                          if (response === '') {
                              response = null;
                          }
                          // return the response
                          callback(response);
                      } else {
                          logger.appendChild(document.createTextNode('There was a problem with the request. Request returned ' + httpRequest.status));
                      }
                  }
              } catch (e) {
                  logger.appendChild(document.createTextNode('Caught Exception: ' + e));
              }
          };
      /**
       * set up request data
       * the proxy used here takes the following request body:
       * JSON.strinify(options)
       */
      // set response handler
      httpRequest.onreadystatechange = getResponse;
      // open the request
      httpRequest.open('POST', proxyURL);
      // open and send request
      httpRequest.send(JSON.stringify(options));
  }


  function init() {
    // event listeners
    csvData.addEventListener('click', function() {
      this.select();
    });
    // set up the log elements
    content = document.createTextNode('Getting renditions for video ');
    spanIntro2.appendChild(content);
    content = document.createTextNode(' of ');
    spanOf2.appendChild(content);
    spanRenditionsCount.setAttribute('id', 'spanRenditionsCount');
    spanRenditionsTotal.setAttribute('id', 'spanRenditionsTotal');
    pLogGettingRenditions.appendChild(spanIntro2);
    pLogGettingRenditions.appendChild(spanRenditionsCount);
    pLogGettingRenditions.appendChild(spanOf2);
    pLogGettingRenditions.appendChild(spanRenditionsTotal);
    logger.appendChild(pLogGettingRenditions);
    spanRenditionsCountEl = document.getElementById('spanRenditionsCount');
    spanRenditionsTotalEl = document.getElementById('spanRenditionsTotal');
    logger.appendChild(pLogFinish);

  }

  // button event handlers
  makeReport.addEventListener('click', function() {
    // in case of re-run, cleal the results
    csvData.textContent = '';
    // get the inputs
    client_id = client_id_element.value;
    client_secret = client_secret_element.value;
    account_id = account_id_element.value
    totalVideos = getSelectedValue(videoCount);
    // only use entered account id if client id and secret are entered also
    if (!isDefined(client_id) || !isDefined(client_secret) || !isDefined(account_id)) {
      logger.appendChild(document.createTextNode('To use your own account, you must specify an account id, and client id, and a client secret - since at least one of these is missing, a sample account will be used'));
        account_id = '1752604059001';
    }
    // disable this button
    makeReport.setAttribute('disabled', 'disabled');
    makeReport.setAttribute('style', 'opacity:.6;cursor:not-allowed;');
    // get video count
    createRequest('getCount');

  });

  init();
})(window, document);
