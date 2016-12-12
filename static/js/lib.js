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
let getUrlParameter = (sParam) => {
    let sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            let sParamTerm = (sParameterName[1] === undefined ? true : sParameterName[1]);
            if (sParamTerm && sParamTerm.slice(-1) === "/") {
              sParamTerm = sParamTerm.slice(0, -1);
            }
            return sParamTerm;
        }
    }
};

/**
 * Get an external Handlebar template.
 * See http://stackoverflow.com/a/31775595.
 *
 * @param {string} name The template name.
 * // TODO(minkezhang): Fix doc.
 * @returns {Handlebars.template}
 */
let getTemplate = (name) => {
    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
        $.ajax({
            url: "static/templates/" + name + ".handlebars",
            success: (data) => {
                if (Handlebars.templates === undefined) {
                    Handlebars.templates = {};
                }
                Handlebars.templates[name] = Handlebars.compile(data);
            },
            async: false
        });
    }
    return Handlebars.templates[name];
};
