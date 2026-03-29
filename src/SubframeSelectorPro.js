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
   SubframeSelectorPro v1.0.0<br><br>\
   Automated subframe quality analysis and rejection.<br><br>\
   Three rejection modes: Absolute Threshold, Best Percentage, Sigma Clipping.<br>\
   Native SubframeSelector PSF backend with batch processing.<br>\
   Analysis caching, filter grouping, CSV export, undo/restore.<br>\
   Localized: English, Italiano, Espanol, Deutsch, Francais.<br><br>\
   Copyright (c) 2026 Fabio Tempera - MIT License.

#feature-icon  SubframeSelectorPro.svg

// FIX: Only include pjsr headers that exist as separate .jsh files in a
// standard PixInsight installation.  Settings, File, Console, MessageBox,
// GetDirectoryDialog and many widget constants are built-in globals that do
// NOT need (and do NOT have) a dedicated .jsh file.
#include <pjsr/DataType.jsh>
#include <pjsr/Sizer.jsh>
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/StdCursor.jsh>
#include <pjsr/TextAlign.jsh>
#include <pjsr/FrameStyle.jsh>
#include <pjsr/NumericControl.jsh>
#include <pjsr/FileMode.jsh>
#include <pjsr/StarDetector.jsh>

#define TITLE    "SubframeSelectorPro"
#define VERSION  "1.0.0"
#define AUTHOR   "Fabio Tempera"
#define YEAR     "2026"

#include "SubframeSelectorPro-i18n.js"
#include "SubframeSelectorPro-params.js"
#include "SubframeSelectorPro-engine.js"
#include "SubframeSelectorPro-gui.js"

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

      try
      {
         engine.run();

         // Update dialog panels if results available (for post-run review)
         // Note: dialog.execute() has already returned, so panels 
         // will be visible only in "Analyze" mode (preview).
         // The console report serves as the primary output for "Run" mode.
      }
      catch ( e )
      {
         if ( e && e.message && e.message.indexOf( "Aborted by user" ) >= 0 )
            Console.warningln( "Execution aborted by user." );
         else
            throw e;
      }
   }

   Console.writeln( "" );
   Console.writeln( "================================================================" );
   Console.writeln( retVal ? TITLE + " completed." : TITLE + " cancelled." );
   Console.flush();
}

main();
