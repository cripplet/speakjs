/**
 * Library functions which are not bound to objects.
 */

/**
 * Get the value of a url parameter.
 * See http://stackoverflow.com/a/21903119.
 *
 * @param {string} sParam The queried key.
 * @returns {string} The value of the queried key.
 */
var getUrlParameter = function(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            var sParamTerm = (sParameterName[1] === undefined ? true : sParameterName[1]);
            if (sParamTerm && sParamTerm.slice(-1) === '/') {
              sParamTerm = sParamTerm.slice(0, -1);
            }
            return sParamTerm;
        }
    }
};
