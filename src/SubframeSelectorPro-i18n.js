// ****************************************************************************
// SubframeSelectorPro-i18n.js - Internationalization
// ****************************************************************************
//
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// Released under the MIT License.
//
// Supported languages: en, it, es, de, fr
//
// NOTE: Requires DataType from <pjsr/DataType.jsh> to be included
// in the main script BEFORE this file is #include-d.
// ****************************************************************************

#include <pjsr/DataType.jsh>

#define SSP_LANG_EN  0
#define SSP_LANG_IT  1
#define SSP_LANG_ES  2
#define SSP_LANG_DE  3
#define SSP_LANG_FR  4

function SSPi18n()
{
   // Detect system language or use saved preference
   this.currentLang = SSP_LANG_EN;

   var savedLang = Settings.read( "SubframeSelectorPro/language", DataType_Int32 );
   if ( Settings.lastReadOK && savedLang >= SSP_LANG_EN && savedLang <= SSP_LANG_FR )
      this.currentLang = savedLang;

   this.setLanguage = function( langCode )
   {
      this.currentLang = langCode;
      Settings.write( "SubframeSelectorPro/language", DataType_Int32, langCode );
   };

   // ========================================================================
   // Translation dictionary
   // ========================================================================
   this.strings = {

      // ── General ──
      SCRIPT_TITLE: [
         "SubframeSelectorPro",
         "SubframeSelectorPro",
         "SubframeSelectorPro",
         "SubframeSelectorPro",
         "SubframeSelectorPro"
      ],

      DESCRIPTION: [
         "Automated subframe quality analysis and rejection tool.\nAnalyze PSF metrics and move rejected frames to a separate folder.",
         "Analisi automatica della qualità dei subframe.\nAnalizza le metriche PSF e sposta i frame scartati in una sottocartella.",
         "Herramienta automática de análisis de calidad de subframes.\nAnaliza métricas PSF y mueve los frames rechazados a una subcarpeta.",
         "Automatisches Subframe-Qualitätsanalyse- und Aussortierungstool.\nAnalysiert PSF-Metriken und verschiebt abgelehnte Frames in einen Unterordner.",
         "Outil automatique d'analyse de qualité des sous-images.\nAnalyse les métriques PSF et déplace les images rejetées dans un sous-dossier."
      ],

      // ── Input / Output ──
      INPUT_DIRECTORY: [
         "Input Directory:",
         "Cartella di input:",
         "Directorio de entrada:",
         "Eingabeverzeichnis:",
         "Répertoire d'entrée :"
      ],

      SELECT_INPUT_DIR: [
         "Select input directory",
         "Seleziona cartella di input",
         "Seleccionar directorio de entrada",
         "Eingabeverzeichnis auswählen",
         "Sélectionner le répertoire d'entrée"
      ],

      REJECTED_FOLDER: [
         "Rejected Folder:",
         "Cartella scartati:",
         "Carpeta rechazados:",
         "Abgelehnt-Ordner:",
         "Dossier rejetés :"
      ],

      TT_INPUT_DIR: [
         "Directory containing the subframe image files to analyze.",
         "Cartella contenente i file immagine dei subframe da analizzare.",
         "Directorio que contiene los archivos de imagen de subframes a analizar.",
         "Verzeichnis mit den zu analysierenden Subframe-Bilddateien.",
         "Répertoire contenant les fichiers image des sous-images à analyser."
      ],

      TT_REJECTED_DIR: [
         "Name of the subfolder where rejected frames will be moved.",
         "Nome della sottocartella dove verranno spostati i frame scartati.",
         "Nombre de la subcarpeta donde se moverán los frames rechazados.",
         "Name des Unterordners, in den abgelehnte Frames verschoben werden.",
         "Nom du sous-dossier où les images rejetées seront déplacées."
      ],

      // ── Options ──
      OPTIONS: [
         "Options",
         "Opzioni",
         "Opciones",
         "Optionen",
         "Options"
      ],

      DRY_RUN: [
         "Dry Run (analyze only)",
         "Prova (solo analisi)",
         "Simulación (solo analizar)",
         "Testlauf (nur analysieren)",
         "Essai (analyser uniquement)"
      ],

      TT_DRY_RUN: [
         "Analyze and report results without moving any files.",
         "Analizza e mostra i risultati senza spostare alcun file.",
         "Analizar y mostrar resultados sin mover ningún archivo.",
         "Analysieren und Ergebnisse anzeigen, ohne Dateien zu verschieben.",
         "Analyser et afficher les résultats sans déplacer aucun fichier."
      ],

      GROUP_BY_FILTER: [
         "Group by filter",
         "Raggruppa per filtro",
         "Agrupar por filtro",
         "Nach Filter gruppieren",
         "Grouper par filtre"
      ],

      TT_GROUP_FILTER: [
         "Apply rejection criteria separately for each filter (reads FILTER FITS keyword). Essential for LRGB/narrowband.",
         "Applica i criteri di scarto separatamente per ogni filtro (legge la keyword FITS FILTER). Essenziale per LRGB/narrowband.",
         "Aplicar criterios de rechazo por separado para cada filtro (lee la palabra clave FITS FILTER). Esencial para LRGB/banda estrecha.",
         "Ablehnungskriterien separat für jeden Filter anwenden (liest FILTER FITS-Schlüsselwort). Wichtig für LRGB/Schmalband.",
         "Appliquer les critères de rejet séparément pour chaque filtre (lit le mot-clé FITS FILTER). Essentiel pour LRGB/bande étroite."
      ],

      EXPORT_CSV: [
         "Export CSV report",
         "Esporta rapporto CSV",
         "Exportar informe CSV",
         "CSV-Bericht exportieren",
         "Exporter rapport CSV"
      ],

      USE_CACHE: [
         "Use analysis cache",
         "Usa cache analisi",
         "Usar caché de análisis",
         "Analyse-Cache verwenden",
         "Utiliser le cache d'analyse"
      ],

      TT_USE_CACHE: [
         "Cache analysis results. Re-running on the same folder with different rejection settings will skip re-analysis.",
         "Memorizza i risultati dell'analisi. Rieseguire sulla stessa cartella con parametri diversi salterà la ri-analisi.",
         "Cachear resultados del análisis. Volver a ejecutar en la misma carpeta con diferentes ajustes omitirá el reanálisis.",
         "Analyseergebnisse zwischenspeichern. Erneutes Ausführen im selben Ordner mit anderen Einstellungen überspringt die Neuanalyse.",
         "Mettre en cache les résultats d'analyse. Ré-exécuter sur le même dossier avec des paramètres différents sautera la ré-analyse."
      ],

      // ── Plate Scale ──
      PLATE_SCALE_TITLE: [
         "Plate Scale Override (optional — 0 = auto from FITS)",
         "Override scala piatto (opzionale — 0 = auto da FITS)",
         "Escala de placa manual (opcional — 0 = auto desde FITS)",
         "Plattenmaßstab-Überschreibung (optional — 0 = Auto aus FITS)",
         "Échelle de plaque manuelle (optionnel — 0 = auto depuis FITS)"
      ],

      FOCAL_LENGTH: [
         "Focal Length:",
         "Lunghezza focale:",
         "Distancia focal:",
         "Brennweite:",
         "Focale :"
      ],

      PIXEL_SIZE: [
         "Pixel Size:",
         "Dim. pixel:",
         "Tamaño píxel:",
         "Pixelgröße:",
         "Taille pixel :"
      ],

      // ── Rejection Mode ──
      REJECTION_MODE: [
         "Rejection Mode",
         "Modalità di scarto",
         "Modo de rechazo",
         "Ablehnungsmodus",
         "Mode de rejet"
      ],

      MODE_THRESHOLD: [
         "Absolute Threshold",
         "Soglia assoluta",
         "Umbral absoluto",
         "Absoluter Schwellenwert",
         "Seuil absolu"
      ],

      MODE_PERCENTAGE: [
         "Best Percentage",
         "Miglior percentuale",
         "Mejor porcentaje",
         "Beste Prozent",
         "Meilleur pourcentage"
      ],

      MODE_SIGMA: [
         "Sigma Clipping",
         "Sigma Clipping",
         "Sigma Clipping",
         "Sigma-Clipping",
         "Sigma Clipping"
      ],

      TT_MODE_SIGMA: [
         "Reject frames whose metrics deviate more than Nσ from the mean. Self-adapting to your data.",
         "Scarta i frame le cui metriche deviano più di Nσ dalla media. Si adatta automaticamente ai tuoi dati.",
         "Rechazar frames cuyas métricas desvíen más de Nσ de la media. Se adapta automáticamente a tus datos.",
         "Frames ablehnen, deren Metriken mehr als Nσ vom Mittelwert abweichen. Passt sich automatisch an Ihre Daten an.",
         "Rejeter les images dont les métriques dévient de plus de Nσ de la moyenne. S'adapte automatiquement à vos données."
      ],

      // ── Threshold Settings ──
      THRESHOLD_TITLE: [
         "Absolute Threshold Settings",
         "Impostazioni soglia assoluta",
         "Ajustes de umbral absoluto",
         "Absolute Schwellenwert-Einstellungen",
         "Paramètres de seuil absolu"
      ],

      FWHM: ["FWHM:", "FWHM:", "FWHM:", "FWHM:", "FWHM:"],
      MIN: ["Min", "Min", "Mín", "Min", "Min"],
      MAX: ["Max", "Max", "Máx", "Max", "Max"],
      ARCSEC: ["arcsec", "arcsec", "arcseg", "Bogensek.", "arcsec"],

      ECC_MAX: [
         "Ecc Max:", "Ecc Max:", "Ecc Máx:", "Exz Max:", "Ecc Max:"
      ],

      SNR_MIN: [
         "SNR Min:", "SNR Min:", "SNR Mín:", "SNR Min:", "SNR Min:"
      ],

      RESIDUAL: [
         "Residual:", "Residuo:", "Residual:", "Residuum:", "Résidu :"
      ],

      MIN_STARS: [
         "Min Stars:", "Stelle min:", "Estrellas mín:", "Min Sterne:", "Étoiles min :"
      ],

      NOISE_MAX: [
         "Noise Max:", "Rumore max:", "Ruido máx:", "Rauschen max:", "Bruit max :"
      ],

      MEDIAN: [
         "Median:", "Mediana:", "Mediana:", "Median:", "Médiane :"
      ],

      // ── Percentage Settings ──
      PERCENTAGE_TITLE: [
         "Best Percentage Settings",
         "Impostazioni miglior percentuale",
         "Ajustes de mejor porcentaje",
         "Beste-Prozent-Einstellungen",
         "Paramètres du meilleur pourcentage"
      ],

      KEEP_TOP: [
         "Keep Top %:", "Mantieni top %:", "Mantener top %:",
         "Top % behalten:", "Garder top % :"
      ],

      WEIGHTS_TITLE: [
         "Quality Score Weights:",
         "Pesi del punteggio qualità:",
         "Pesos de la puntuación de calidad:",
         "Qualitätsbewertung Gewichte:",
         "Pondérations du score de qualité :"
      ],

      W_FWHM:  ["FWHM:",         "FWHM:",         "FWHM:",          "FWHM:",           "FWHM:"],
      W_ECC:   ["Eccentricity:", "Eccentricità:", "Excentricidad:", "Exzentrizität:",  "Excentricité :"],
      W_SNR:   ["SNR:",          "SNR:",          "SNR:",           "SNR:",            "SNR:"],
      W_STARS: ["Star Count:",   "N° stelle:",    "N° estrellas:",  "Sternanzahl:",    "Nb étoiles :"],
      W_NOISE: ["Noise:",        "Rumore:",       "Ruido:",         "Rauschen:",       "Bruit :"],

      // ── Sigma Settings ──
      SIGMA_TITLE: [
         "Sigma Clipping Settings",
         "Impostazioni Sigma Clipping",
         "Ajustes de Sigma Clipping",
         "Sigma-Clipping-Einstellungen",
         "Paramètres du Sigma Clipping"
      ],

      SIGMA_LOW:  ["σ Low:",  "σ Basso:", "σ Bajo:", "σ Niedrig:", "σ Bas :"],
      SIGMA_HIGH: ["σ High:", "σ Alto:",  "σ Alto:", "σ Hoch:",    "σ Haut :"],

      SIGMA_APPLY_TO: [
         "Apply sigma clipping to:",
         "Applica sigma clipping a:",
         "Aplicar sigma clipping a:",
         "Sigma-Clipping anwenden auf:",
         "Appliquer le sigma clipping à :"
      ],

      // ── PSF Settings ──
      PSF_TITLE: [
         "Star Detection & PSF Settings",
         "Rilevamento stelle e impostazioni PSF",
         "Detección de estrellas y ajustes PSF",
         "Sternerkennung & PSF-Einstellungen",
         "Détection d'étoiles et paramètres PSF"
      ],

      PSF_FUNCTION: [
         "PSF Function:", "Funzione PSF:", "Función PSF:",
         "PSF-Funktion:", "Fonction PSF :"
      ],

      STRUCT_LAYERS: [
         "Struct. Layers:", "Strati strutt.:", "Capas estruct.:",
         "Strukt. Ebenen:", "Couches struct. :"
      ],

      SENSITIVITY: [
         "Sensitivity:", "Sensibilità:", "Sensibilidad:",
         "Empfindlichkeit:", "Sensibilité :"
      ],

      MAX_STARS: [
         "Max Stars:", "Stelle max:", "Estrellas máx:",
         "Max Sterne:", "Étoiles max :"
      ],

      USE_NATIVE_SS: [
         "Use native SubframeSelector",
         "Usa SubframeSelector nativo",
         "Usar SubframeSelector nativo",
         "Nativen SubframeSelector verwenden",
         "Utiliser SubframeSelector natif"
      ],

      TT_NATIVE_SS: [
         "Use PixInsight's built-in SubframeSelector process for PSF analysis. Produces identical metrics to the native tool. Slower but more accurate.",
         "Usa il processo SubframeSelector integrato di PixInsight per l'analisi PSF. Produce metriche identiche allo strumento nativo. Più lento ma più preciso.",
         "Usar el proceso SubframeSelector integrado de PixInsight para el análisis PSF. Produce métricas idénticas a la herramienta nativa. Más lento pero más preciso.",
         "Den integrierten SubframeSelector-Prozess von PixInsight für die PSF-Analyse verwenden. Erzeugt identische Metriken wie das native Tool. Langsamer aber genauer.",
         "Utiliser le processus SubframeSelector intégré de PixInsight pour l'analyse PSF. Produit des métriques identiques à l'outil natif. Plus lent mais plus précis."
      ],

      // ── Buttons ──
      BTN_RESTORE: [
         "Restore", "Ripristina", "Restaurar", "Wiederherstellen", "Restaurer"
      ],

      TT_RESTORE: [
         "Restore previously rejected files back to the original directory.",
         "Ripristina i file precedentemente scartati nella cartella originale.",
         "Restaurar los archivos previamente rechazados al directorio original.",
         "Zuvor abgelehnte Dateien in das ursprüngliche Verzeichnis zurückverschieben.",
         "Restaurer les fichiers précédemment rejetés dans le répertoire d'origine."
      ],

      BTN_RESET:  ["Reset",  "Ripristina", "Restablecer", "Zurücksetzen", "Réinitialiser"],
      BTN_RUN:    ["Run",    "Esegui",     "Ejecutar",    "Ausführen",    "Exécuter"],
      BTN_CANCEL: ["Cancel", "Annulla",    "Cancelar",    "Abbrechen",    "Annuler"],

      // ── Language ──
      LANGUAGE: [
         "Language:", "Lingua:", "Idioma:", "Sprache:", "Langue :"
      ],

      // ── Progress ──
      PROGRESS_ANALYZING: [
         "Analyzing subframes...",
         "Analisi dei subframe...",
         "Analizando subframes...",
         "Subframes werden analysiert...",
         "Analyse des sous-images..."
      ],

      PROGRESS_FRAME: [
         "Analyzing: %1",
         "Analisi: %1",
         "Analizando: %1",
         "Analysiere: %1",
         "Analyse: %1"
      ],

      PROGRESS_MOVING: [
         "Moving rejected frames...",
         "Spostamento frame scartati...",
         "Moviendo frames rechazados...",
         "Abgelehnte Frames werden verschoben...",
         "Déplacement des images rejetées..."
      ],

      PROGRESS_CACHE_HIT: [
         "Using cached results (%1 frames)",
         "Uso risultati in cache (%1 frame)",
         "Usando resultados en caché (%1 frames)",
         "Verwende zwischengespeicherte Ergebnisse (%1 Frames)",
         "Utilisation des résultats en cache (%1 images)"
      ],

      // ── Console messages ──
      MSG_NO_DIR: [
         "Please select an input directory.",
         "Seleziona una cartella di input.",
         "Seleccione un directorio de entrada.",
         "Bitte wählen Sie ein Eingabeverzeichnis.",
         "Veuillez sélectionner un répertoire d'entrée."
      ],

      MSG_DIR_NOT_FOUND: [
         "Directory not found:",
         "Cartella non trovata:",
         "Directorio no encontrado:",
         "Verzeichnis nicht gefunden:",
         "Répertoire non trouvé :"
      ],

      MSG_NO_RESTORE_LOG: [
         "No restore log found. No previous rejection to undo.",
         "Nessun log di ripristino trovato. Nessuno scarto precedente da annullare.",
         "No se encontró registro de restauración. Ningún rechazo anterior para deshacer.",
         "Kein Wiederherstellungsprotokoll gefunden. Keine vorherige Ablehnung zum Rückgängigmachen.",
         "Aucun journal de restauration trouvé. Aucun rejet précédent à annuler."
      ],

      MSG_RESTORE_CONFIRM: [
         "This will move all previously rejected files back to their original location.\n\nContinue?",
         "Questo sposterà tutti i file precedentemente scartati nella posizione originale.\n\nContinuare?",
         "Esto moverá todos los archivos previamente rechazados a su ubicación original.\n\n¿Continuar?",
         "Dies verschiebt alle zuvor abgelehnten Dateien zurück an ihren ursprünglichen Ort.\n\nFortfahren?",
         "Ceci déplacera tous les fichiers précédemment rejetés vers leur emplacement d'origine.\n\nContinuer ?"
      ],

      MSG_RESTORED_N: [
         "Restored %1 file(s).",
         "Ripristinati %1 file.",
         "Restaurados %1 archivo(s).",
         "%1 Datei(en) wiederhergestellt.",
         "%1 fichier(s) restauré(s)."
      ],

      // ── Report headers ──
      RPT_TITLE: [
         "ANALYSIS REPORT",
         "RAPPORTO DI ANALISI",
         "INFORME DE ANÁLISIS",
         "ANALYSEBERICHT",
         "RAPPORT D'ANALYSE"
      ],

      RPT_TOTAL:          ["Total:",          "Totale:",    "Total:",     "Gesamt:",       "Total :"],
      RPT_ACCEPTED:       ["Accepted:",       "Accettati:", "Aceptados:", "Akzeptiert:",   "Acceptés :"],
      RPT_REJECTED:       ["Rejected:",       "Scartati:",  "Rechazados:","Abgelehnt:",    "Rejetés :"],
      RPT_FAILED:         ["Failed:",         "Falliti:",   "Fallidos:",  "Fehlgeschlagen:","Échoués :"],
      RPT_REJECTION_RATE: ["Rejection rate:", "Tasso di scarto:", "Tasa de rechazo:", "Ablehnungsrate:", "Taux de rejet :"],

      RPT_DRY_RUN_WOULD: [
         "DRY RUN: %1 frame(s) would be moved to '%2/'.",
         "PROVA: %1 frame verrebbero spostati in '%2/'.",
         "SIMULACIÓN: %1 frame(s) se moverían a '%2/'.",
         "TESTLAUF: %1 Frame(s) würden nach '%2/' verschoben.",
         "ESSAI : %1 image(s) serai(en)t déplacée(s) vers '%2/'."
      ],

      RPT_NO_REJECTION: [
         "No frames were rejected. All frames passed quality criteria.",
         "Nessun frame è stato scartato. Tutti i frame hanno superato i criteri di qualità.",
         "Ningún frame fue rechazado. Todos los frames pasaron los criterios de calidad.",
         "Keine Frames wurden abgelehnt. Alle Frames haben die Qualitätskriterien bestanden.",
         "Aucune image n'a été rejetée. Toutes les images ont passé les critères de qualité."
      ],

      // ── Support ──
      SUPPORT_DONATE: [
         "Support the developer — Buy me a coffee!",
         "Supporta lo sviluppatore — Offrimi un caffè!",
         "Apoya al desarrollador — ¡Cómprame un café!",
         "Entwickler unterstützen — Kauf mir einen Kaffee!",
         "Soutiens le développeur — Achète-moi un café !"
      ],

      DONATE_LINK: [
         "buymeacoffee.com/fabiot2801z",
         "buymeacoffee.com/fabiot2801z",
         "buymeacoffee.com/fabiot2801z",
         "buymeacoffee.com/fabiot2801z",
         "buymeacoffee.com/fabiot2801z"
      ],

      PROGRESS_TITLE: [
         "Progress","Progresso","Progreso","Fortschritt","Progression"
      ],
      PROGRESS_READY: [
         "Ready","Pronto","Listo","Bereit","Prêt"
      ],
      PROGRESS_DONE: [
         "Analysis complete","Analisi completata","Análisis completo","Analyse abgeschlossen","Analyse terminée"
      ],
      PROGRESS_ABORTED: [
         "Aborted by user","Interrotto dall'utente","Abortado por el usuario","Vom Benutzer abgebrochen","Annulé par l'utilisateur"
      ],
      TT_PROGRESS: [
         "Analysis progress","Progresso analisi","Progreso del análisis","Analysefortschritt","Progression de l'analyse"
      ],
      GRAPH_TITLE: [
         "Measurements Graph","Grafico misurazioni","Gráfico de mediciones","Messdiagramm","Graphique des mesures"
      ],
      GRAPH_PLOT: [
         "Plot:","Grafico:","Gráfico:","Diagramm:","Tracé :"
      ],
      GRAPH_METRIC: [
         "Metric:","Metrica:","Métrica:","Metrik:","Métrique :"
      ],
      GRAPH_BAR: [
         "Bar Chart","Grafico a barre","Gráfico de barras","Balkendiagramm","Diagramme à barres"
      ],
      GRAPH_SCATTER: [
         "Scatter Plot","Grafico a dispersione","Gráfico de dispersión","Streudiagramm","Nuage de points"
      ],
      GRAPH_WEIGHTMAP: [
         "Weight Map","Mappa pesi","Mapa de pesos","Gewichtskarte","Carte de poids"
      ],
      GRAPH_SCORE: [
         "Quality Score","Punteggio qualità","Puntuación calidad","Qualitätswertung","Score qualité"
      ],
      TABLE_TITLE: [
         "Measurements Table","Tabella misurazioni","Tabla de mediciones","Messtabelle","Tableau des mesures"
      ],
      TABLE_FILE: [
         "File","File","Archivo","Datei","Fichier"
      ],
      TABLE_FILTER: [
         "Filter","Filtro","Filtro","Filter","Filtre"
      ],
      TABLE_STATUS: [
         "Status","Stato","Estado","Status","Statut"
      ],
      STATS_TITLE: [
         "Analysis Statistics","Statistiche analisi","Estadísticas de análisis","Analysestatistiken","Statistiques d'analyse"
      ],
      STATS_EMPTY: [
         "Run analysis to see statistics...","Esegui l'analisi per vedere le statistiche...","Ejecute el análisis para ver estadísticas...","Analyse starten um Statistiken zu sehen...","Lancer l'analyse pour voir les statistiques..."
      ],
      STATS_NODATA: [
         "No valid analysis results.","Nessun risultato di analisi valido.","Sin resultados de análisis válidos.","Keine gültigen Analyseergebnisse.","Aucun résultat d'analyse valide."
      ]
   };

   // ========================================================================
   // tr() — Get translated string
   // ========================================================================
   this.tr = function( key )
   {
      if ( !this.strings.hasOwnProperty( key ) )
         return "[?" + key + "?]";

      var arr = this.strings[key];
      var idx = this.currentLang;
      if ( idx < 0 || idx >= arr.length ) idx = 0;
      return arr[idx];
   };

   // ========================================================================
   // trf() — Get translated string with replacements (%1, %2, ...)
   // ========================================================================
   this.trf = function( key )
   {
      var s = this.tr( key );
      for ( var i = 1; i < arguments.length; ++i )
         s = s.replace( "%" + i, arguments[i].toString() );
      return s;
   };

   // ========================================================================
   // Language names for the ComboBox
   // ========================================================================
   this.languageNames = [ "English", "Italiano", "Español", "Deutsch", "Français" ];
}

// Global i18n instance
var __SSP_i18n = new SSPi18n();

function _T( key )  { return __SSP_i18n.tr( key ); }
function _TF( key ) { return __SSP_i18n.trf.apply( __SSP_i18n, arguments ); }
