// ****************************************************************************
// SubframeSelectorPro.js - Main Entry Point
// ****************************************************************************
//
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// https://github.com/Ft2801
// Released under the MIT License.
// ****************************************************************************

#feature-id    Utilities > SubframeSelectorPro
#feature-info  \
   SubframeSelectorPro v1.0.0\n\n\
   Automated subframe quality analysis and rejection.\n\n\
   Three rejection modes: Absolute Threshold, Best Percentage, Sigma Clipping.\n\
   Native SubframeSelector PSF backend with batch processing.\n\
   Analysis caching, filter grouping, CSV export, undo/restore.\n\
   Localized: English, Italiano, Español, Deutsch, Français.\n\n\
   Copyright (c) 2026 Fabio Tempera — MIT License.

#feature-icon  SubframeSelectorPro.svg

#include "SubframeSelectorPro-i18n.js"
#include "SubframeSelectorPro-params.js"
#include "SubframeSelectorPro-engine.js"
#include "SubframeSelectorPro-gui.js"

#define TITLE    "SubframeSelectorPro"
#define VERSION  "1.0.0"
#define AUTHOR   "Fabio Tempera"
#define YEAR     "2026"

function main()
{
   Console.show();
   Console.writeln( "<b>" + TITLE + " v" + VERSION + "</b>" );
   Console.writeln( "Copyright (c) " + YEAR + " " + AUTHOR );
   Console.writeln( "================================================================" );
   Console.flush();

   var params = new SSPParameters();
   params.load();

   var dialog = new SSPDialog( params );
   var retVal = dialog.execute();

   if ( retVal )
   {
      params.save();
      var engine = new SSPEngine( params );
      engine.run();
   }

   Console.writeln( "" );
   Console.writeln( "================================================================" );
   Console.writeln( retVal ? TITLE + " completed." : TITLE + " cancelled." );
   Console.flush();
}

main();