  var getUrlParam = function(e){var t = new RegExp("[?&]" + e.replace(/[\[\]]/g, "\\$&") + "(=([^&#]*)|&|#|$)"),a = t.exec(window.location.href);return a && a[2] ? decodeURIComponent(a[2].replace(/\+/g, " ")) : ""};
  var lang = '', lang_prefix = '', site_href = window.location.href, site_domain, filter;
  if (site_href.indexOf('//de.') > -1) {
    lang = 'de';
    lang_prefix = 'de.'
  } else if (site_href.indexOf('//es.') > -1) {
    lang = 'es';
    lang_prefix = 'es.'
  } else if (site_href.indexOf('//fr.') > -1) {
    lang = 'fr';
    lang_prefix = 'fr.'
  } else if (site_href.indexOf('//ja.') > -1) {
    lang = 'ja';
    lang_prefix = 'ja.'
  } else if (site_href.indexOf('//ko.') > -1) {
    lang = 'ko';
    lang_prefix = 'ko.'
  } else if (site_href.indexOf('//zh-tw.') > -1) {
    lang = 'zh-tw';
    lang_prefix = 'zh-tw.'
  }
  site_domain = lang_prefix + 'apis.support.brightcove.com';
  filter = "domain='" + site_domain + "'";
  console.log('filter', filter);
  var searchInterface = sajari.init({
      mode: "inline",
      project: "1588255093746585379", // Set this to your project.
      collection: "brightcove-documenation", // Set this to your collection.
      pipeline: "website",     // Set the search pipeline.
      instantPipeline: "autocomplete", // Set the instant pipeline.
      
      attachSearchBox: document.getElementById("results-search-box"), // DOM element to render search box.
      attachSearchResponse: document.getElementById("results-search-response"), // DOM element to render search results.
      inputPlaceholder: "Search", // Placeholder text for the search box.
      inputAutoFocus: false, // Focus the input element on render.
      maxSuggestions: 5, // Maximum number of suggestions to show.
      results: {"showImages": false }, // Configure the results.
      values: {"q.override": true, "resultsPerPage": "10","q": getUrlParam("q")}, // Set default values.
      tabFilters: {defaultTab:"This Site",tabs:[{title:"This Site",filter:"filter"}, {title:"All Brightcove Documentation",filter:""}]}, // User selectable filters
      styling: { theme: { colors: { brand: { primary: "#333" }}}}
  });
