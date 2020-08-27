var cookiesArray = document.cookie.split(";"), cookiesObj = {}, i, tmpArray = [];
for (i = 0; i &lt; cookiesArray.length; i++) {
    tmpArray = cookiesArray[i].split("=");
    cookiesObj[tmpArray[0].replace(/s/g, "")] = tmpArray[1];
}
window.prompt("BC_TOKEN:", cookiesObj.BC_TOKEN);
