// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

define(["jquery", "google-caja-sanitizer"], function ($, google_caja) {
  "use strict";

  var noop = function (x) {
    return x;
  };

  var caja;
  if (google_caja) {
    caja = google_caja.html;
    caja.html4 = google_caja.html4;
    caja.sanitizeStylesheet = google_caja.sanitizeStylesheet;
  }

  var sanitizeAttribs = function (
    tagName,
    attribs,
    opt_naiveUriRewriter,
    opt_nmTokenPolicy,
    opt_logger,
  ) {
    /**
     * add trusting data-attributes to the default sanitizeAttribs from caja
     * this function is mostly copied from the caja source
     */
    var ATTRIBS = caja.html4.ATTRIBS;
    for (var i = 0; i < attribs.length; i += 2) {
      var attribName = attribs[i];
      if (attribName.substr(0, 5) == "data-") {
        var attribKey = "*::" + attribName;
        if (!ATTRIBS.hasOwnProperty(attribKey)) {
          ATTRIBS[attribKey] = 0;
        }
      } else if (tagName === "embed") {
        if (attribName === "src" && !attribs[i + 1].endsWith(".pdf"))
          attribs[i + 1] = "";
        if (attribName === "type") attribs[i + 1] = "application/pdf";
      }
    }
    // Caja doesn't allow data uri for img::src, see
    // https://github.com/google/caja/issues/1558
    // This is not a security issue for browser post ie6 though, so we
    // disable the check
    // https://www.owasp.org/index.php/Script_in_IMG_tags
    ATTRIBS["img::src"] = 0;
    // iframes are allowed since we add sandboxing (see below)
    ATTRIBS["iframe::src"] = 0;
    // embed are allowed only for pdf
    ATTRIBS["embed::src"] = 0;
    ATTRIBS["embed::type"] = 0;
    ATTRIBS["embed::width"] = 0;
    ATTRIBS["embed::height"] = 0;

    var res = caja.sanitizeAttribs(
      tagName,
      attribs,
      opt_naiveUriRewriter,
      opt_nmTokenPolicy,
      opt_logger,
    );
    if (tagName === "iframe") {
      res.push("sandbox");
      /* When the embedded document has the same origin as the embedding page,
       * it is strongly discouraged to use both allow-scripts and allow-same-origin,
       * as that lets the embedded document remove the sandbox attribute — making
       * it no more secure than not using the sandbox attribute at all.
       * see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
       */
      try {
        const origin = new URL(window.location.href).origin;
        const src = res[(res.findIndex((e) => e == "src") ?? -2) + 1];
        const sameOrigin = src == null || new URL(src).origin === origin;
        res.push("allow-scripts" + (sameOrigin ? "" : " allow-same-origin"));
      } catch (e) {}
    }
    return res;
  };

  var sanitize_css = function (css, tagPolicy) {
    /**
     * sanitize CSS
     * like sanitize_html, but for CSS
     * called by sanitize_stylesheets
     */
    return caja.sanitizeStylesheet(
      window.location.pathname,
      css,
      {
        containerClass: null,
        idSuffix: "",
        tagPolicy: tagPolicy,
        virtualizeAttrName: noop,
      },
      noop,
    );
  };

  var sanitize_stylesheets = function (html, tagPolicy) {
    /**
     * sanitize just the css in style tags in a block of html
     * called by sanitize_html, if allow_css is true
     */
    var h = $("<div/>").append(html);
    var style_tags = h.find("style");
    if (!style_tags.length) {
      // no style tags to sanitize
      return html;
    }
    style_tags.each(function (i, style) {
      style.innerHTML = sanitize_css(style.innerHTML, tagPolicy);
    });
    return h.html();
  };

  var sanitize_html = function (html, allow_css) {
    /**
     * sanitize HTML
     * if allow_css is true (default: false), CSS is sanitized as well.
     * otherwise, CSS elements and attributes are simply removed.
     */
    var html4 = caja.html4;

    // allow <embed /> tag
    html4.ELEMENTS.embed = 0;

    if (allow_css) {
      // allow sanitization of style tags,
      // not just scrubbing
      html4.ELEMENTS.style &= ~html4.eflags.UNSAFE;
      html4.ATTRIBS.style = html4.atype.STYLE;
    } else {
      // scrub all CSS
      html4.ELEMENTS.style |= html4.eflags.UNSAFE;
      html4.ATTRIBS.style = html4.atype.SCRIPT;
    }

    var record_messages = function (msg, opts) {
      console.log("HTML Sanitizer", msg, opts);
    };

    var policy = function (tagName, attribs) {
      if (!(html4.ELEMENTS[tagName] & html4.eflags.UNSAFE)) {
        return {
          attribs: sanitizeAttribs(
            tagName,
            attribs,
            noop,
            noop,
            record_messages,
          ),
        };
      } else {
        record_messages(tagName + " removed", {
          change: "removed",
          tagName: tagName,
        });
      }
    };

    var sanitized = caja.sanitizeWithPolicy(html, policy);

    if (allow_css) {
      // sanitize style tags as stylesheets
      sanitized = sanitize_stylesheets(sanitized, policy);
    }

    return sanitized;
  };

  var sanitize_html_and_parse = function (html, allow_css) {
    /**
     * Sanitize HTML and parse it safely using jQuery.
     *
     * This disable's jQuery's html 'prefilter', which can make invalid
     * HTML valid after the sanitizer has checked it.
     *
     * Returns an array of DOM nodes.
     */
    var sanitized_html = sanitize_html(html, allow_css);
    var prev_htmlPrefilter = $.htmlPrefilter;
    $.htmlPrefilter = function (html) {
      return html;
    }; // Don't modify HTML
    try {
      return $.parseHTML(sanitized_html);
    } finally {
      $.htmlPrefilter = prev_htmlPrefilter; // Set it back again
    }
  };

  var security = {
    caja: caja,
    sanitize_html_and_parse: sanitize_html_and_parse,
    sanitize_html: sanitize_html,
  };

  return security;
});
