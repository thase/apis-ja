var BCLS = ( function (window, document) {
  var progressiveRenditions = [
    'default/progressive450',
    'default/progressive700',
    'default/progressive900',
    'default/progressive1200',
    'default/progressive1700',
    'default/progressive2000',
    'default/progressive2500',
    'default/progressive3500',
    'default/progressive4000'
  ],
  renditions_list = document.getElementById('renditions_list'),
  li,
  code,
  frag = document.createDocumentFragment(),
  i = 0,
  iMax = progressiveRenditions.length;

  for (i; i < iMax; i++) {
    li = document.createElement('li');
    code = document.createElement('code');
    code.textContent = progressiveRenditions[i];
    li.appendChild(code);
    frag.appendChild(li);
  }
  renditions_list.appendChild(frag);
})(window, document);
