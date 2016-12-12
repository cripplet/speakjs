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

/*
 * This decorates Handlebars.js with the ability to load
 * templates from an external source, with light caching.
 * 
 * To render a template, pass a closure that will receive the 
 * template as a function parameter, eg, 
 *   T.render("templateName", function(t) {
 *       $("#somediv").html( t() );
 *   });
 * Source: https://github.com/wycats/handlebars.js/issues/82
 */
var Template = function() {
    this.cached = {};
};
var T = new Template();
$.extend(Template.prototype, {
    render: (name, callback) => {
        if (T.isCached(name)) {
            callback(T.cached[name]);
        } else {
            $.get(T.urlFor(name), function(raw) {
                T.store(name, raw);
                T.render(name, callback);
            });
        }
    },
    renderSync: (name, callback) => {
        if (!T.isCached(name)) {
            T.fetch(name);
        }
        T.render(name, callback);
    },
    prefetch: (name) => {
        $.get(T.urlFor(name), function(raw) { 
            T.store(name, raw);
        });
    },
    fetch: (name) => {
        // synchronous, for those times when you need it.
        if (! T.isCached(name)) {
            var raw = $.ajax({
                "url": T.urlFor(name),
                "async": false,
            }).responseText;
            T.store(name, raw);         
        }
    },
    isCached: (name) => {
        return !!T.cached[name];
    },
    store: (name, raw) => {
        T.cached[name] = Handlebars.compile(raw);
    },
    urlFor: (name) => {
        return "/static/templates/" + name + ".handlebars";
    }
});
