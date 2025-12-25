import jQuery from "jquery";
import "jquery-ui-bundle";

declare global {
  interface Window {
    jQuery?: any;
    BASTHON_CACHE_BUSTING_TIMESTAMP?: string;
  }
}

window.jQuery = jQuery;
window.BASTHON_CACHE_BUSTING_TIMESTAMP = Date.now().toString();

// this import starts the notebook
import "../js/notebook/js/main";

// dynamically importing codemirror mode
switch (window.basthonLanguage) {
  case "python3":
    import("codemirror/mode/python/python");
    break;
  case "sql":
    import("codemirror/mode/sql/sql");
    /* can't figure out what sql-hint adds... uncomment to try */
    // import("codemirror/addon/hint/show-hint");
    // import("codemirror/addon/hint/show-hint.css");
    // import("codemirror/addon/hint/sql-hint");
    break;
  case "javascript":
    import("codemirror/mode/javascript/javascript");
    break;
  case "ocaml":
    import("codemirror/mode/mllike/mllike");
    break;
  case "xcas":
    import("../js/codemirror/xcasmode");
    break;
}
