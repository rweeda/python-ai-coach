import { FC, memo } from "react";

import { useGUI } from "@basthon/gui-react";
import logo from "../../notebook/static/base/images/logo.png";

// css
import "jquery-ui-themes/themes/smoothness/jquery-ui.min.css";
import "jquery-typeahead/dist/jquery.typeahead.min.css";
import "bootstrap-tour/build/css/bootstrap-tour.min.css";
import "codemirror/lib/codemirror.css";
import "../css/style.less";
import "../css/ipython.less";
import "../css/basthon-override.less";

declare global {
  interface Window {
    basthonGUI: any;
    basthonLanguage?: string;
  }
}

// we use memo here to prevent re-render
const Notebook: FC<{}> = memo(() => {
  const gui = useGUI();
  window.basthonGUI = gui;
  window.basthonLanguage = gui.language;

  return (
    <div className="body notebook_app" dir="ltr">
      <div
        id="header"
        role="navigation"
        aria-label="Top Menu"
        style={{ display: "none" }} /* just to prevent FOUC */
      >
        <div id="header-container" className="container">
          <div id="ipython_notebook" className="nav navbar-brand">
            <a href="https://basthon.fr">
              <img src={logo} alt="Jupyter Notebook" />
            </a>
          </div>
          <span id="save_widget" className="save_widget">
            <span id="notebook_name" className="filename"></span>
            <span className="checkpoint_status"></span>
            <span className="autosave_status"></span>
          </span>
          <span id="kernel_logo_widget">
            <img
              className="current_kernel_logo"
              alt="Current Kernel Logo"
              src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            />
          </span>
          <span id="login_widget">
            <button id="logout" className="btn btn-sm navbar-btn hidden">
              Se déconnecter
            </button>
          </span>
        </div>
        <div className="header-bar"></div>
        <div id="menubar-container" className="container">
          <div id="menubar">
            <div id="menus" className="navbar navbar-default" role="navigation">
              <div className="container-fluid">
                <button
                  type="button"
                  className="btn btn-default navbar-btn navbar-toggle"
                  data-toggle="collapse"
                  data-target=".navbar-collapse"
                >
                  <i className="fa fa-bars"></i>
                  <span className="navbar-text">Menu</span>
                </button>
                <p id="kernel_indicator" className="navbar-text indicator_area">
                  <span className="kernel_indicator_name">Noyau</span>
                  <i id="kernel_indicator_icon"></i>
                </p>
                <i
                  id="readonly-indicator"
                  className="navbar-text"
                  title="Ce notebook est en lecture seule"
                >
                  <span className="fa-stack">
                    <i className="fa fa-save fa-stack-1x"></i>
                    <i className="fa fa-ban fa-stack-2x text-danger"></i>
                  </span>
                </i>
                <i id="modal_indicator" className="navbar-text"></i>
                <span id="notification_area"></span>
                <div className="navbar-collapse collapse">
                  <ul className="nav navbar-nav">
                    <li className="dropdown">
                      <a
                        href="#"
                        id="filelink"
                        aria-haspopup="true"
                        aria-controls="file_menu"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Fichier
                      </a>
                      <ul
                        id="file_menu"
                        className="dropdown-menu"
                        role="menu"
                        aria-labelledby="filelink"
                      >
                        <li
                          id="new_notebook"
                          className="dropdown-submenu"
                          role="none"
                        >
                          <a href="#" role="menuitem">
                            Nouveau Notebook
                            <span className="sr-only">Toggle Dropdown</span>
                          </a>
                          <ul
                            className="dropdown-menu"
                            id="menu-new-notebook-submenu"
                          ></ul>
                        </li>
                        <li
                          id="open_notebook"
                          role="none"
                          title="Ouvre un notebook, charge un module ou un fichier"
                        >
                          <a href="#" role="menuitem">
                            Ouvrir...
                          </a>
                        </li>
                        <li className="divider hidden" role="none"></li>
                        <li
                          id="copy_notebook"
                          role="none"
                          title="Ouvrir une copie du contenu de ce notebook et démarrer un nouveau noyau"
                          className="hidden"
                        >
                          <a href="#" role="menuitem">
                            Faire une copie...
                          </a>
                        </li>
                        <li
                          id="save_notebook_as"
                          role="none"
                          title="Enregistrer une copie du notebook"
                        >
                          <a href="#" role="menuitem">
                            Enregistrer sous...
                          </a>
                        </li>
                        <li id="rename_notebook" role="none" className="hidden">
                          <a href="#" role="menuitem">
                            Renommer...
                          </a>
                        </li>
                        <li id="save_checkpoint" role="none" className="hidden">
                          <a href="#" role="menuitem">
                            Créer une nouvelle sauvegarde
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="restore_checkpoint" role="none">
                          <a href="#" role="menuitem">
                            Restaurer une sauvegarde
                          </a>
                        </li>
                        <li className="divider hidden" role="none"></li>
                        <li id="print_preview" role="none" className="hidden">
                          <a href="#" role="menuitem">
                            Imprimer l'aperçu
                          </a>
                        </li>
                        <li className="dropdown-submenu hidden" role="none">
                          <a href="#" role="menuitem">
                            Télécharger au format
                            <span className="sr-only">Toggle Dropdown</span>
                          </a>
                          <ul id="download_menu" className="dropdown-menu">
                            <li id="download_asciidoc">
                              <a href="#">asciidoc (.asciidoc)</a>
                            </li>
                            <li id="download_html">
                              <a href="#">HTML (.html)</a>
                            </li>
                            <li id="download_latex">
                              <a href="#">latex (.tex)</a>
                            </li>
                            <li id="download_markdown">
                              <a href="#">markdown (.md)</a>
                            </li>
                            <li id="download_notebook">
                              <a href="#">notebook (.ipynb)</a>
                            </li>
                            <li id="download_pdf">
                              <a href="#">pdf (.tex)</a>
                            </li>
                            <li id="download_rst">
                              <a href="#">rst (.rst)</a>
                            </li>
                            <li id="download_script">
                              <a href="#">Script (.txt)</a>
                            </li>
                            <li id="download_slides">
                              <a href="#">slides (.slides.html)</a>
                            </li>
                          </ul>
                        </li>
                        <li className="dropdown-submenu hidden" role="none">
                          <a href="#" role="menuitem">
                            Déployer en tant que
                          </a>
                          <ul id="deploy_menu" className="dropdown-menu"></ul>
                        </li>
                        <li className="divider hidden" role="none"></li>
                        <li
                          id="trust_notebook"
                          role="none"
                          title="Faire confiance à la sortie de ce notebook"
                          className="hidden"
                        >
                          <a href="#" role="menuitem">
                            Faire confiance au notebook
                          </a>
                        </li>
                        <li className="divider hidden" role="none"></li>
                        <li
                          id="close_and_halt"
                          role="none"
                          title="Arrêter le noyau de ce notebook et fermer cette fenêtre"
                          className="hidden"
                        >
                          <a href="#" role="menuitem">
                            Fermer et arrêter
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        id="editlink"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-controls="edit_menu"
                      >
                        Édition
                      </a>
                      <ul
                        id="edit_menu"
                        className="dropdown-menu"
                        role="menu"
                        aria-labelledby="editlink"
                      >
                        <li id="cut_cell" role="none">
                          <a href="#" role="menuitem">
                            Couper les cellules
                          </a>
                        </li>
                        <li id="copy_cell" role="none">
                          <a href="#" role="menuitem">
                            Copier les cellules
                          </a>
                        </li>
                        <li
                          id="paste_cell_above"
                          className="disabled"
                          role="none"
                        >
                          <a href="#" role="menuitem" aria-disabled="true">
                            Coller les cellules avant
                          </a>
                        </li>
                        <li
                          id="paste_cell_below"
                          className="disabled"
                          role="none"
                        >
                          <a href="#" role="menuitem" aria-disabled="true">
                            Coller les cellules après
                          </a>
                        </li>
                        <li
                          id="paste_cell_replace"
                          className="disabled"
                          role="none"
                        >
                          <a href="#" role="menuitem" aria-disabled="true">
                            Coller les cellules &amp; remplacer
                          </a>
                        </li>
                        <li id="delete_cell" role="none">
                          <a href="#" role="menuitem">
                            Supprimer les cellules
                          </a>
                        </li>
                        <li id="undelete_cell" className="disabled" role="none">
                          <a href="#" role="menuitem" aria-disabled="true">
                            Annuler la suppression des cellules
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="split_cell" role="none">
                          <a href="#" role="menuitem">
                            Diviser la cellule
                          </a>
                        </li>
                        <li id="merge_cell_above" role="none">
                          <a href="#" role="menuitem">
                            Fusionner avec la cellule précédente
                          </a>
                        </li>
                        <li id="merge_cell_below" role="none">
                          <a href="#" role="menuitem">
                            Fusionner avec la cellule suivante
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="move_cell_up" role="none">
                          <a href="#" role="menuitem">
                            Déplacer la cellule vers le haut
                          </a>
                        </li>
                        <li id="move_cell_down" role="none">
                          <a href="#" role="menuitem">
                            Déplacer la cellule vers le bas
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="edit_nb_metadata" role="none">
                          <a href="#" role="menuitem">
                            Éditer les méta-données du notebook
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="find_and_replace" role="none">
                          <a href="#" role="menuitem">
                            Rechercher et remplacer
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="cut_cell_attachments" role="none">
                          <a href="#" role="menuitem">
                            Couper les pièces-Jointes de la cellule
                          </a>
                        </li>
                        <li id="copy_cell_attachments" role="none">
                          <a href="#" role="menuitem">
                            Copier les pièces-jointes de la cellule
                          </a>
                        </li>
                        <li
                          id="paste_cell_attachments"
                          className="disabled"
                          role="none"
                        >
                          <a href="#" role="menuitem" aria-disabled="true">
                            Coller les pièces-jointes de la cellule
                          </a>
                        </li>
                        <li className="divider" role="none"></li>
                        <li id="insert_image" className="disabled" role="none">
                          <a href="#" role="menuitem" aria-disabled="true">
                            Insérer une image
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        id="viewlink"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-controls="view_menu"
                      >
                        Affichage
                      </a>
                      <ul
                        id="view_menu"
                        className="dropdown-menu"
                        role="menu"
                        aria-labelledby="viewlink"
                      >
                        <li
                          id="toggle_header"
                          role="none"
                          title="Afficher/Masquer le logo et le titre du notebook (au-dessus de la barre de menu)"
                        >
                          <a href="#" role="menuitem">
                            Afficher/Masquer l'en-tête
                          </a>
                        </li>
                        <li
                          id="toggle_toolbar"
                          role="none"
                          title="Afficher/Masquer les icônes d'action (en-dessous de la barre de menu)"
                        >
                          <a href="#" role="menuitem">
                            Afficher/Masquer la barre d'outils
                          </a>
                        </li>
                        <li
                          id="toggle_line_numbers"
                          role="none"
                          title="Afficher/Masquer les numéros de ligne dans les cellules"
                        >
                          <a href="#" role="menuitem">
                            Afficher/Masquer les numéros de ligne
                          </a>
                        </li>
                        <li
                          id="menu-cell-toolbar"
                          className="dropdown-submenu"
                          role="none"
                        >
                          <a href="#" role="menuitem">
                            Barre d'outil de cellule
                          </a>
                          <ul
                            className="dropdown-menu"
                            id="menu-cell-toolbar-submenu"
                          ></ul>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        id="insertlink"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-controls="insert_menu"
                      >
                        Insérer
                      </a>
                      <ul
                        id="insert_menu"
                        className="dropdown-menu"
                        role="menu"
                        aria-labelledby="insertlink"
                      >
                        <li
                          id="insert_cell_above"
                          role="none"
                          title="Insérer une cellule de code vide avant de la cellule active"
                        >
                          <a href="#" role="menuitem">
                            Insérer une cellule avant
                          </a>
                        </li>
                        <li
                          id="insert_cell_below"
                          role="none"
                          title="Insérer une cellule de code vide après la cellule active"
                        >
                          <a href="#" role="menuitem">
                            Insérer une cellule après
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Cellule
                      </a>
                      <ul id="cell_menu" className="dropdown-menu">
                        <li
                          id="run_cell"
                          title="Exécuter cette cellule, et déplacer le curseur à la suivante"
                        >
                          <a href="#">Exécuter les cellules</a>
                        </li>
                        <li
                          id="run_cell_select_below"
                          title="Exécuter cette cellule, sélectionner la suivante"
                        >
                          <a href="#">
                            Exécuter les cellules et sélectionner la suivante
                          </a>
                        </li>
                        <li
                          id="run_cell_insert_below"
                          title="Exécuter la cellule et insérer à la suite"
                        >
                          <a href="#">Exécuter les cellules et insérer après</a>
                        </li>
                        <li
                          id="run_all_cells"
                          title="Exécuter toutes les cellules du notebook"
                        >
                          <a href="#">Exécuter tout</a>
                        </li>
                        <li
                          id="run_all_cells_above"
                          title="Exécuter toutes les cellules avant celle-ci (non incluse)"
                        >
                          <a href="#">Exécuter toutes les précédentes</a>
                        </li>
                        <li
                          id="run_all_cells_below"
                          title="Exécuter cette cellule et toutes les suivantes"
                        >
                          <a href="#">Exécuter toutes les suivantes</a>
                        </li>
                        <li className="divider"></li>
                        <li
                          id="change_cell_type"
                          className="dropdown-submenu"
                          title="Toutes les cellules dans le notebook ont un type de cellule. Par défaut, les nouvelles cellules sont de type 'Code'"
                        >
                          <a href="#">Type de cellule</a>
                          <ul className="dropdown-menu">
                            <li
                              id="to_code"
                              title="Le contenu sera envoyé au noyau pour exécution, et la sortie sera affichée dans le pied de cellule"
                            >
                              <a href="#">Code</a>
                            </li>
                            <li
                              id="to_markdown"
                              title="Le contenu sera rendu en tant que HTML afin de servir de texte explicatif"
                            >
                              <a href="#">Markdown</a>
                            </li>
                            <li
                              id="to_raw"
                              title="Le contenu passera par nbconvert qui ne l'altèrera pas"
                            >
                              <a href="#">Texte Brut</a>
                            </li>
                          </ul>
                        </li>
                        <li className="divider"></li>
                        <li id="current_outputs" className="dropdown-submenu">
                          <a href="#">Sorties actuelles</a>
                          <ul className="dropdown-menu">
                            <li
                              id="toggle_current_output"
                              title="Masquer/Afficher la sortie de la cellule actuelle"
                            >
                              <a href="#">Afficher/Masquer</a>
                            </li>
                            <li
                              id="toggle_current_output_scroll"
                              title="Faire défiler la sortie de la cellule actuelle"
                            >
                              <a href="#">Activer/Désactiver le défilement</a>
                            </li>
                            <li
                              id="clear_current_output"
                              title="Effacer la sortie de la cellule actuelle"
                            >
                              <a href="#">Effacer</a>
                            </li>
                          </ul>
                        </li>
                        <li id="all_outputs" className="dropdown-submenu">
                          <a href="#">Toutes les sorties</a>
                          <ul className="dropdown-menu">
                            <li
                              id="toggle_all_output"
                              title="Afficher/Masquer la sortie de toutes les cellules"
                            >
                              <a href="#">Afficher/Masquer</a>
                            </li>
                            <li
                              id="toggle_all_output_scroll"
                              title="Faire défiler la sortie de toutes les cellules"
                            >
                              <a href="#">Activer/Désactiver le défilement</a>
                            </li>
                            <li
                              id="clear_all_output"
                              title="Effacer la sortie de toutes les cellules"
                            >
                              <a href="#">Effacer</a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                        id="kernellink"
                      >
                        Noyau
                      </a>
                      <ul
                        id="kernel_menu"
                        className="dropdown-menu"
                        aria-labelledby="kernellink"
                      >
                        <li
                          id="int_kernel"
                          title="Envoyer l'interruption clavier (CTRL-C) au noyau"
                        >
                          <a href="#">Interrompre</a>
                        </li>
                        <li id="restart_kernel" title="Redémarrer le noyau">
                          <a href="#">Redémarrer</a>
                        </li>
                        <li
                          id="restart_clear_output"
                          title="Redémarrer le noyau et effacer toutes les sorties"
                        >
                          <a href="#">Redémarrer &amp; effacer les sorties</a>
                        </li>
                        <li
                          id="restart_run_all"
                          title="Redémarrer le noyau et ré-exécuter le notebook"
                        >
                          <a href="#">Redémarrer &amp; tout exécuter</a>
                        </li>
                        <li id="reconnect_kernel" title="Reconnecter au noyau">
                          <a href="#">Reconnecter</a>
                        </li>
                        <li id="shutdown_kernel" title="Shutdown the Kernel">
                          <a href="#">Arrêter</a>
                        </li>
                        <li className="divider"></li>
                        <li
                          id="menu-change-kernel"
                          className="dropdown-submenu"
                        >
                          <a href="#">Changer de noyau</a>
                          <ul
                            className="dropdown-menu"
                            id="menu-change-kernel-submenu"
                          ></ul>
                        </li>
                      </ul>
                    </li>
                    <li className="dropdown">
                      <a
                        href="#"
                        className="dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Aide
                      </a>
                      <ul id="help_menu" className="dropdown-menu">
                        <li
                          id="notebook_tour"
                          title="Une rapide visite de l'interface utilisateur du notebook"
                        >
                          <a href="#">Visite de l'interface utilisateur</a>
                        </li>
                        <li
                          id="keyboard_shortcuts"
                          title="Ouvre une infobulle listant tous les raccourcis clavier"
                        >
                          <a href="#">Raccourcis clavier</a>
                        </li>
                        <li
                          id="edit_keyboard_shortcuts"
                          title="Ouvre une boîte de dialogue permettant de modifier les raccourcis clavier"
                        >
                          <a href="#">Editer les raccourcis clavier</a>
                        </li>
                        <li className="divider"></li>
                        <li>
                          <a
                            rel="noreferrer"
                            href="https://basthon.fr/documentation/"
                            target="_blank"
                            title="S&#39;ouvre dans une nouvelle fenêtre"
                          >
                            <i className="fa fa-external-link menu-icon pull-right"></i>
                            Aide Basthon
                          </a>
                        </li>
                        <li>
                          <a
                            rel="noreferrer"
                            href="http://nbviewer.jupyter.org/github/ipython/ipython/blob/3.x/examples/Notebook/Index.ipynb"
                            target="_blank"
                            title="S&#39;ouvre dans une nouvelle fenêtre"
                          >
                            <i className="fa fa-external-link menu-icon pull-right"></i>
                            Aide notebook
                          </a>
                        </li>
                        <li>
                          <a
                            rel="noreferrer"
                            href="https://help.github.com/articles/markdown-basics/"
                            target="_blank"
                            title="S&#39;ouvre dans une nouvelle fenêtre"
                          >
                            <i className="fa fa-external-link menu-icon pull-right"></i>
                            Markdown
                          </a>
                        </li>
                        <li className="divider"></li>
                        <li title="À propos de Jupyter Notebook">
                          <a id="notebook_about" href="#">
                            À propos
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div id="maintoolbar" className="navbar">
            <div className="toolbar-inner navbar-inner navbar-nobg">
              <div id="maintoolbar-container" className="container"></div>
            </div>
          </div>
        </div>
        <div className="lower-header-bar"></div>
      </div>
      <div id="site" style={{ display: "none" }} /* just to prevent FOUC */>
        <div id="ipython-main-app">
          <div id="notebook_panel">
            <div id="notebook"></div>
            <div
              id="tooltip"
              className="ipython_tooltip"
              style={{ display: "none" }}
            ></div>
          </div>
        </div>
      </div>
      <div id="pager">
        <div id="pager-contents">
          <div id="pager-container" className="container"></div>
        </div>
        <div id="pager-button-area"></div>
      </div>
    </div>
  );
});

export { Notebook };
