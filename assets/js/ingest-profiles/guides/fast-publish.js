var BCLS = ( function (window, document, renditions) {
  var renditionList = document.getElementById('renditionList'),
    li,
    txt,
    i,
    iMax,
    fragment = document.createDocumentFragment();

  iMax = renditions.length;
  for (i = 0; i < iMax; i++) {
    li  = document.createElement('li');
    txt = document.createTextNode(renditions[i].id);
    li.appendChild(txt);
    fragment.appendChild(li);
  }
  renditionList.appendChild(fragment);

})(window, document, renditions);
