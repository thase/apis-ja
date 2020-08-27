var BCLS = (function() {
    var path = window.location.href.split('/'),
        product = 'video-cloud',
        accountType = 'video-cloud-account',
        productOperations = product + '/player/all',
        account_id,
        BC_TOKEN,
        client_id,
        client_secret,
        account_idEl = document.getElementById('account_id'),
        BC_TOKENEl = document.getElementById('BC_TOKEN'),
        client_idEl = document.getElementById('client_id'),
        client_secretEl = document.getElementById('client_secret'),
        getCredentialsCall = document.getElementById('getCredentialsCall'),
        getTokenCall = document.getElementById('getTokenCall'),
        enterAccoutInputs = document.getElementById('enterAccoutInputs'),
        enterCredentialInputs = document.getElementById('enterCredentialInputs'),
        // functions
        buildCredentialsCall,
        buildTokenCall,
        isDefined;

    /**
     * tests for all the ways a variable might be undefined or not have a value
     * @param {string|number} x - the variable to test
     * @return {Boolean} true if variable is defined and has a value
     */
    isDefined = function(x) {
        if (x === '' || x === null || x === undefined) {
            return false;
        }
        return true;
    };

    buildCredentialsCall = function() {
        var str;
        account_id = isDefined(account_idEl.value) ? parseInt(account_idEl.value) : NaN;
        BC_TOKEN = isDefined(BC_TOKENEl.value) ? BC_TOKENEl.value : '';
        console.log('account_id', account_id);
        console.log('bc_token', BC_TOKEN);
        // if we don't have necessary values yet, stop
        if (!isDefined(account_id) || !isDefined(BC_TOKEN)) {
            return;
        }
        str = "curl --include --header 'Authorization: BC_TOKEN " + BC_TOKEN + "' --data 'name=Sample-Client&maximum_scope=[ {\"identity\": { \"type\": \"" + accountType + "\", \"account-id\": " + account_id +
            "}, \"operations\": [ \"" + productOperations + "\" ]}]' https://oauth.brightcove.com/v3/client_credentials";

        getCredentialsCall.textContent = str;
        getCredentialsCall.select();
    };

    buildTokenCall = function() {
        var str;
        client_id = (isDefined(client_idEl.value)) ? client_idEl.value : "";
        client_secret = (isDefined(client_secretEl.value)) ? client_secretEl.value : "";

        str = "curl -s --user '" + client_id + ":" + client_secret + "' --header \"Content-Type: application/x-www-form-urlencoded\" --data \"grant_type=client_credentials\" https://oauth.brightcove.com/v3/access_token";
        getTokenCall.textContent = str;
        getTokenCall.select();
    };
    console.log("path", path);
    console.log("product", product);
    enterAccoutInputs.addEventListener("click", buildCredentialsCall);
    enterCredentialInputs.addEventListener("click", buildTokenCall);
    return {};
})();
