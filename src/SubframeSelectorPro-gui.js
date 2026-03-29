// ****************************************************************************
// SubframeSelectorPro-gui.js - User Interface (Full Features + i18n)
// ****************************************************************************
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// Released under the MIT License.
// ****************************************************************************

#define COL_CHECK_W   20
#define COL_LABEL_W   80
#define COL_GAP       16
#define COL_WLABEL_W  90
#define COL_PLABEL_W  90
#define COL_SLABEL_W  90

#define GRAPH_BAR     0
#define GRAPH_SCATTER 1
#define GRAPH_WEIGHT  2

function SSPGraphControl( parent )
{
   this.__base__ = Control;
   this.__base__( parent );

   this.results       = [];
   this.metricKey      = "fwhm";
   this.graphType      = GRAPH_BAR;
   this.highlightIndex = -1;
   this.rejectionLine  = 0;
   this.showRejLine    = false;

   this.setMinSize( 380, 180 );
   this.cursor = new Cursor( StdCursor_Cross );

   this.colAccepted   = 0xFF4CAF50;
   this.colRejected   = 0xFFF44336;
   this.colFailed     = 0xFF9E9E9E;
   this.colHighlight  = 0xFFFFEB3B;
   this.colGrid       = 0xFF424242;
   this.colText       = 0xFFE0E0E0;
   this.colBackground = 0xFF1E1E1E;
   this.colRejLine    = 0xFFFF9800;

   this.marginLeft   = 55;
   this.marginRight  = 15;
   this.marginTop    = 15;
   this.marginBottom = 35;

   this.getMetricValue = function( r )
   {
      if ( !r || !r.analysisOK ) return 0;
      switch ( this.metricKey )
      {
         case "fwhm":         return r.fwhm;
         case "fwhmPx":       return r.fwhmPx;
         case "eccentricity": return r.eccentricity;
         case "snr":          return r.snr;
         case "starCount":    return r.starCount;
         case "noise":        return r.noise;
         case "median":       return r.median;
         case "qualityScore": return r.qualityScore;
         case "starResidual": return r.starResidual;
         default:             return r.fwhm;
      }
   };

   this.getRange = function()
   {
      var mn = Infinity, mx = -Infinity;
      for ( var i = 0; i < this.results.length; ++i )
      {
         var r = this.results[i];
         if ( !r || !r.analysisOK ) continue;
         var v = this.getMetricValue( r );
         if ( v < mn ) mn = v;
         if ( v > mx ) mx = v;
      }
      if ( !isFinite(mn) || !isFinite(mx) || mn === mx )
      { mn = 0; mx = 1; }
      var pad = (mx - mn) * 0.1;
      return { min: mn - pad, max: mx + pad };
   };

   this.formatValue = function( v )
   {
      if ( Math.abs(v) >= 1000 ) return v.toFixed(0);
      if ( Math.abs(v) >= 10 )   return v.toFixed(1);
      if ( Math.abs(v) >= 1 )    return v.toFixed(2);
      if ( Math.abs(v) >= 0.01 ) return v.toFixed(3);
      return v.toFixed(5);
   };

   this.onPaint = function( x0, y0, x1, y1 )
   {
      var g = new Graphics( this );
      try
      {
         var w = this.width;
         var h = this.height;
         g.fillRect( 0, 0, w, h, new Brush( this.colBackground ) );

         var n = this.results.length;
         if ( n === 0 )
         {
            g.pen = new Pen( this.colText );
            g.font = new Font( "Helvetica", 10 );
            g.drawText( w/2 - 80, h/2, "No data — run analysis first" );
            g.end();
            return;
         }

         var plotL = this.marginLeft;
         var plotR = w - this.marginRight;
         var plotT = this.marginTop;
         var plotB = h - this.marginBottom;
         var plotW = plotR - plotL;
         var plotH = plotB - plotT;
         if ( plotW < 10 || plotH < 10 ) { g.end(); return; }

         var range = this.getRange();
         var yMin = range.min;
         var yMax = range.max;
         var ySpan = yMax - yMin;
         if ( ySpan <= 0 ) ySpan = 1;

         var gridPen = new Pen( this.colGrid, 1 );
         var textPen = new Pen( this.colText );
         g.font = new Font( "Helvetica", 8 );

         for ( var gi = 0; gi <= 5; ++gi )
         {
            var yFrac = gi / 5.0;
            var yVal = yMin + yFrac * ySpan;
            var yPx = Math.round( plotB - yFrac * plotH );
            g.pen = gridPen;
            g.drawLine( plotL, yPx, plotR, yPx );
            g.pen = textPen;
            g.drawText( 2, yPx + 3, this.formatValue( yVal ) );
         }

         if ( this.showRejLine && this.rejectionLine > 0 )
         {
            var rejFrac = (this.rejectionLine - yMin) / ySpan;
            if ( rejFrac >= 0 && rejFrac <= 1 )
            {
               var rejY = Math.round( plotB - rejFrac * plotH );
               g.pen = new Pen( this.colRejLine, 2 );
               g.drawLine( plotL, rejY, plotR, rejY );
            }
         }

         var validCount = 0;
         for ( var i = 0; i < n; ++i )
            if ( this.results[i] && this.results[i].analysisOK ) validCount++;
         if ( validCount === 0 ) { g.end(); return; }

         if ( this.graphType === GRAPH_BAR || this.graphType === GRAPH_WEIGHT )
         {
            var barW = Math.max( 2, Math.floor( plotW / validCount ) - 1 );
            var idx = 0;
            for ( var i = 0; i < n; ++i )
            {
               var r = this.results[i];
               if ( !r || !r.analysisOK ) continue;
               var v = this.getMetricValue( r );
               var frac = (v - yMin) / ySpan;
               frac = Math.max( 0, Math.min( 1, frac ) );
               var bx = Math.round( plotL + idx * (plotW / validCount) );
               var by = Math.round( plotB - frac * plotH );
               var col;
               if ( i === this.highlightIndex ) col = this.colHighlight;
               else if ( r.rejected ) col = this.colRejected;
               else col = this.colAccepted;
               g.fillRect( bx, by, bx + barW, plotB, new Brush( col ) );
               if ( validCount <= 40 || idx % Math.ceil(validCount/20) === 0 )
               {
                  g.pen = textPen;
                  g.font = new Font( "Helvetica", 7 );
                  var fn = r.fileName;
                  if ( fn.length > 8 ) fn = fn.substring(0,8);
                  g.drawText( bx, plotB + 12, fn );
               }
               idx++;
            }
         }
         else if ( this.graphType === GRAPH_SCATTER )
         {
            var dotR = Math.max( 3, Math.min( 6, Math.round( plotW / validCount / 2 ) ) );
            var idx = 0;
            for ( var i = 0; i < n; ++i )
            {
               var r = this.results[i];
               if ( !r || !r.analysisOK ) continue;
               var v = this.getMetricValue( r );
               var frac = (v - yMin) / ySpan;
               frac = Math.max( 0, Math.min( 1, frac ) );
               var cx = Math.round( plotL + (idx + 0.5) * plotW / validCount );
               var cy = Math.round( plotB - frac * plotH );
               var col;
               if ( i === this.highlightIndex ) col = this.colHighlight;
               else if ( r.rejected ) col = this.colRejected;
               else col = this.colAccepted;
               g.fillRect( cx - dotR, cy - dotR, cx + dotR, cy + dotR, new Brush( col ) );
               idx++;
            }
         }

         g.pen = textPen;
         g.font = new Font( "Helvetica", 9 );
         g.drawText( plotL + 5, plotT + 12, this.metricKey.toUpperCase() );
         g.pen = new Pen( this.colGrid, 1 );
         g.drawRect( plotL, plotT, plotR, plotB );
      }
      catch ( e ) {}
      g.end();
   };

   this.onMouseMove = function( x, y, buttons, modifiers )
   {
      if ( this.results.length === 0 ) return;
      var plotL = this.marginLeft;
      var plotR = this.width - this.marginRight;
      var plotW = plotR - plotL;
      var validCount = 0;
      for ( var i = 0; i < this.results.length; ++i )
         if ( this.results[i] && this.results[i].analysisOK ) validCount++;
      if ( validCount === 0 ) return;
      var relX = x - plotL;
      if ( relX < 0 || relX > plotW )
      {
         if ( this.highlightIndex >= 0 ) { this.highlightIndex = -1; this.repaint(); }
         return;
      }
      var barIdx = Math.floor( relX / (plotW / validCount) );
      barIdx = Math.max( 0, Math.min( validCount - 1, barIdx ) );
      var cnt = 0;
      var newHi = -1;
      for ( var i = 0; i < this.results.length; ++i )
      {
         if ( !this.results[i] || !this.results[i].analysisOK ) continue;
         if ( cnt === barIdx ) { newHi = i; break; }
         cnt++;
      }
      if ( newHi !== this.highlightIndex )
      {
         this.highlightIndex = newHi;
         this.repaint();
         if ( newHi >= 0 && this.results[newHi] )
         {
            var r = this.results[newHi];
            this.toolTip = r.fileName + "\n" +
               this.metricKey + ": " + this.getMetricValue(r).toFixed(4) +
               "\nStatus: " + (r.rejected ? "REJECTED" : "ACCEPTED");
         }
      }
   };

   this.onMouseLeave = function()
   {
      if ( this.highlightIndex >= 0 )
      { this.highlightIndex = -1; this.repaint(); }
   };

   this.updateData = function( results, metricKey, graphType )
   {
      this.results = results || [];
      if ( metricKey !== undefined ) this.metricKey = metricKey;
      if ( graphType !== undefined ) this.graphType = graphType;
      this.highlightIndex = -1;
      this.repaint();
   };
}

SSPGraphControl.prototype = new Control;

function SSPDialog( params )
{
   this.__base__ = Dialog;
   this.__base__();
   this.params = params;
   var dlg = this;

   function hasTrailingSlash( s )
   {
      if ( !s || s.length === 0 ) return false;
      var c = s.charAt( s.length - 1 );
      return c === "/" || c === "\\";
   }

   this.windowTitle = TITLE + " v" + VERSION;
   this.minWidth = 1400;

   function mkL(p,text,w,a){var l=new Label(p);l.text=text;l.textAlignment=(a||TextAlign_Right)|TextAlign_VertCenter;if(w>0)l.setFixedWidth(w);return l;}
   function mkCB(p,ch,tt){var c=new CheckBox(p);c.text="";c.checked=ch;c.setFixedWidth(COL_CHECK_W);if(tt)c.toolTip=tt;return c;}
   function mkSp(p,lb,lw,v,lo,hi,pr,ew,tt){var n=new NumericControl(p);n.label.text=lb;if(lw>0)n.label.setFixedWidth(lw);else n.label.hide();n.setRange(lo,hi);n.setPrecision(pr);n.setValue(v);n.edit.setFixedWidth(ew);if(tt)n.toolTip=tt;return n;}
   function gap(s){s.addSpacing(COL_GAP);}

   // ====================================================================
   // LEFT PANEL — Original UI
   // ====================================================================

   this.titleLabel = new Label(this);
   this.titleLabel.text = TITLE + " v" + VERSION;
   this.titleLabel.textAlignment = TextAlign_Center;
   this.titleLabel.styleSheet = "QLabel{font-weight:bold;font-size:13px;}";

   this.descLabel = new Label(this);
   this.descLabel.text = _T("DESCRIPTION");
   this.descLabel.textAlignment = TextAlign_Center;
   this.descLabel.styleSheet = "QLabel{color:#888;}";

   this.langLabel = mkL(this, _T("LANGUAGE"), 60, TextAlign_Right);
   this.langCombo = new ComboBox(this);
   for (var i=0; i<__SSP_i18n.languageNames.length; ++i)
      this.langCombo.addItem(__SSP_i18n.languageNames[i]);
   this.langCombo.currentItem = __SSP_i18n.currentLang;
   this.langCombo.toolTip = "Select interface language";
   this.langCombo.onItemSelected = function(idx)
   {
      __SSP_i18n.setLanguage(idx);
      Console.writeln("Language changed to: " + __SSP_i18n.languageNames[idx]);
      dlg.descLabel.text = _T("DESCRIPTION");
   };
   this.langRow = new HorizontalSizer;
   this.langRow.addStretch();
   this.langRow.add(this.langLabel);
   this.langRow.addSpacing(4);
   this.langRow.add(this.langCombo);

   this.inputDirLabel = mkL(this, _T("INPUT_DIRECTORY"), 110);
   this.inputDirEdit = new Edit(this);
   this.inputDirEdit.text = params.inputDirectory;
   this.inputDirEdit.toolTip = _T("TT_INPUT_DIR");
   this.inputDirEdit.onTextUpdated = function(t){params.inputDirectory=t.trim();};

   this.inputDirBtn = new ToolButton(this);
   this.inputDirBtn.icon = this.scaledResource(":/browser/select-file.png");
   this.inputDirBtn.setScaledFixedSize(24,24);
   this.inputDirBtn.toolTip = _T("SELECT_INPUT_DIR");
   this.inputDirBtn.onClick = function()
   {var g=new GetDirectoryDialog();g.caption=_T("SELECT_INPUT_DIR");g.initialPath=params.inputDirectory;
      if(g.execute()){params.inputDirectory=g.directory;dlg.inputDirEdit.text=g.directory;}};

   this.rejLabel = mkL(this, _T("REJECTED_FOLDER"), 110);
   this.rejEdit = new Edit(this);
   this.rejEdit.text = params.rejectedDirName;
   this.rejEdit.setFixedWidth(160);
   this.rejEdit.toolTip = _T("TT_REJECTED_DIR");
   this.rejEdit.onTextUpdated = function(t){params.rejectedDirName=t.trim();};

   this.inputRow = new HorizontalSizer;
   this.inputRow.spacing=4;
   this.inputRow.add(this.inputDirLabel);this.inputRow.add(this.inputDirEdit,100);this.inputRow.add(this.inputDirBtn);

   this.rejRow = new HorizontalSizer;
   this.rejRow.spacing=4;
   this.rejRow.add(this.rejLabel);this.rejRow.add(this.rejEdit);this.rejRow.addStretch();

   this.optGB = new GroupBox(this);
   this.optGB.title = _T("OPTIONS");

   this.dryRunCB = new CheckBox(this.optGB);
   this.dryRunCB.text = _T("DRY_RUN");
   this.dryRunCB.checked = (params.operationMode===SSP_OP_DRYRUN);
   this.dryRunCB.toolTip = _T("TT_DRY_RUN");
   this.dryRunCB.onCheck = function(c){params.operationMode=c?SSP_OP_DRYRUN:SSP_OP_EXECUTE;};

   this.filterCB = new CheckBox(this.optGB);
   this.filterCB.text = _T("GROUP_BY_FILTER");
   this.filterCB.checked = params.groupByFilter;
   this.filterCB.toolTip = _T("TT_GROUP_FILTER");
   this.filterCB.onCheck = function(c){params.groupByFilter=c;};

   this.csvCB = new CheckBox(this.optGB);
   this.csvCB.text = _T("EXPORT_CSV");
   this.csvCB.checked = params.exportCSV;
   this.csvCB.onCheck = function(c){params.exportCSV=c;};

   this.cacheCB = new CheckBox(this.optGB);
   this.cacheCB.text = _T("USE_CACHE");
   this.cacheCB.checked = params.useCache;
   this.cacheCB.toolTip = _T("TT_USE_CACHE");
   this.cacheCB.onCheck = function(c){params.useCache=c;};

   this.optGB.sizer = new HorizontalSizer;
   this.optGB.sizer.margin=6;this.optGB.sizer.spacing=16;
   this.optGB.sizer.add(this.dryRunCB);this.optGB.sizer.add(this.filterCB);
   this.optGB.sizer.add(this.csvCB);this.optGB.sizer.add(this.cacheCB);
   this.optGB.sizer.addStretch();

   this.scaleGB = new GroupBox(this);
   this.scaleGB.title = _T("PLATE_SCALE_TITLE");
   this.spFocal = mkSp(this.scaleGB,_T("FOCAL_LENGTH"),COL_PLABEL_W,params.overrideFocalLength,0,20000,0,60,"mm (0=auto)");
   this.spFocal.onValueUpdated = function(v){params.overrideFocalLength=v;};
   this.spPixel = mkSp(this.scaleGB,_T("PIXEL_SIZE"),COL_PLABEL_W,params.overridePixelSize,0,50,2,55,"µm (0=auto)");
   this.spPixel.onValueUpdated = function(v){params.overridePixelSize=v;};
   this.nativeCB = new CheckBox(this.scaleGB);
   this.nativeCB.text = _T("USE_NATIVE_SS");
   this.nativeCB.checked = params.useNativeSS;
   this.nativeCB.toolTip = _T("TT_NATIVE_SS");
   this.nativeCB.onCheck = function(c){params.useNativeSS=c;};
   this.scaleGB.sizer = new HorizontalSizer;
   this.scaleGB.sizer.margin=6;this.scaleGB.sizer.spacing=4;
   this.scaleGB.sizer.add(this.spFocal);gap(this.scaleGB.sizer);
   this.scaleGB.sizer.add(this.spPixel);gap(this.scaleGB.sizer);
   this.scaleGB.sizer.add(this.nativeCB);this.scaleGB.sizer.addStretch();

   this.modeGB = new GroupBox(this);
   this.modeGB.title = _T("REJECTION_MODE");
   this.thrR = new RadioButton(this.modeGB);
   this.thrR.text = _T("MODE_THRESHOLD");
   this.thrR.checked = (params.rejectionMode===SSP_MODE_THRESHOLD);
   this.thrR.onCheck = function(c){if(c){params.rejectionMode=SSP_MODE_THRESHOLD;dlg.syncMode();}};
   this.pctR = new RadioButton(this.modeGB);
   this.pctR.text = _T("MODE_PERCENTAGE");
   this.pctR.checked = (params.rejectionMode===SSP_MODE_PERCENTAGE);
   this.pctR.onCheck = function(c){if(c){params.rejectionMode=SSP_MODE_PERCENTAGE;dlg.syncMode();}};
   this.sigR = new RadioButton(this.modeGB);
   this.sigR.text = _T("MODE_SIGMA");
   this.sigR.checked = (params.rejectionMode===SSP_MODE_SIGMA);
   this.sigR.toolTip = _T("TT_MODE_SIGMA");
   this.sigR.onCheck = function(c){if(c){params.rejectionMode=SSP_MODE_SIGMA;dlg.syncMode();}};
   this.modeGB.sizer = new HorizontalSizer;
   this.modeGB.sizer.margin=6;this.modeGB.sizer.spacing=20;
   this.modeGB.sizer.add(this.thrR);this.modeGB.sizer.add(this.pctR);this.modeGB.sizer.add(this.sigR);
   this.modeGB.sizer.addStretch();

   this.thrGB = new GroupBox(this);
   this.thrGB.title = _T("THRESHOLD_TITLE");
   this.cbFwhm = mkCB(this.thrGB,params.useFWHM);this.cbFwhm.onCheck=function(c){params.useFWHM=c;};
   this.lbFwhm = mkL(this.thrGB,_T("FWHM"),COL_LABEL_W);
   this.luMin = mkL(this.thrGB,_T("MIN"),24,TextAlign_Left);this.luMin.styleSheet="QLabel{color:#888;}";
   this.spFMin = mkSp(this.thrGB,"",0,params.fwhmMin,0,10,2,55);this.spFMin.onValueUpdated=function(v){params.fwhmMin=v;};
   this.luMax = mkL(this.thrGB,_T("MAX"),28,TextAlign_Left);this.luMax.styleSheet="QLabel{color:#888;}";
   this.spFMax = mkSp(this.thrGB,"",0,params.fwhmMax,0.1,30,2,55);this.spFMax.onValueUpdated=function(v){params.fwhmMax=v;};
   this.luU = mkL(this.thrGB,_T("ARCSEC"),0,TextAlign_Left);this.luU.styleSheet="QLabel{color:#888;}";
   this.fwR = new HorizontalSizer;this.fwR.spacing=4;
   this.fwR.add(this.cbFwhm);this.fwR.add(this.lbFwhm);this.fwR.add(this.luMin);this.fwR.add(this.spFMin);
   this.fwR.addSpacing(8);this.fwR.add(this.luMax);this.fwR.add(this.spFMax);this.fwR.addSpacing(4);this.fwR.add(this.luU);this.fwR.addStretch();

   this.cbEcc = mkCB(this.thrGB,params.useEccentricity);this.cbEcc.onCheck=function(c){params.useEccentricity=c;};
   this.lbEcc = mkL(this.thrGB,_T("ECC_MAX"),COL_LABEL_W);
   this.spEcc = mkSp(this.thrGB,"",0,params.eccentricityMax,0,1,3,55);this.spEcc.onValueUpdated=function(v){params.eccentricityMax=v;};
   this.cbSnr = mkCB(this.thrGB,params.useSNR);this.cbSnr.onCheck=function(c){params.useSNR=c;};
   this.lbSnr = mkL(this.thrGB,_T("SNR_MIN"),COL_LABEL_W);
   this.spSnr = mkSp(this.thrGB,"",0,params.snrMin,0,1000,1,55);this.spSnr.onValueUpdated=function(v){params.snrMin=v;};
   this.esR = new HorizontalSizer;this.esR.spacing=4;
   this.esR.add(this.cbEcc);this.esR.add(this.lbEcc);this.esR.add(this.spEcc);gap(this.esR);
   this.esR.add(this.cbSnr);this.esR.add(this.lbSnr);this.esR.add(this.spSnr);this.esR.addStretch();

   this.cbRes = mkCB(this.thrGB,params.useStarResidual);this.cbRes.onCheck=function(c){params.useStarResidual=c;};
   this.lbRes = mkL(this.thrGB,_T("RESIDUAL"),COL_LABEL_W);
   this.spRes = mkSp(this.thrGB,"",0,params.starResidualMax,0,1,4,65);this.spRes.onValueUpdated=function(v){params.starResidualMax=v;};
   this.cbStar = mkCB(this.thrGB,params.useStars);this.cbStar.onCheck=function(c){params.useStars=c;};
   this.lbStar = mkL(this.thrGB,_T("MIN_STARS"),COL_LABEL_W);
   this.spStar = mkSp(this.thrGB,"",0,params.starsMin,0,10000,0,55);this.spStar.onValueUpdated=function(v){params.starsMin=Math.round(v);};
   this.rsR = new HorizontalSizer;this.rsR.spacing=4;
   this.rsR.add(this.cbRes);this.rsR.add(this.lbRes);this.rsR.add(this.spRes);gap(this.rsR);
   this.rsR.add(this.cbStar);this.rsR.add(this.lbStar);this.rsR.add(this.spStar);this.rsR.addStretch();

   this.cbNoise = mkCB(this.thrGB,params.useNoise);this.cbNoise.onCheck=function(c){params.useNoise=c;};
   this.lbNoise = mkL(this.thrGB,_T("NOISE_MAX"),COL_LABEL_W);
   this.spNoise = mkSp(this.thrGB,"",0,params.noiseMax,0,1,6,75);this.spNoise.onValueUpdated=function(v){params.noiseMax=v;};
   this.cbMed = mkCB(this.thrGB,params.useMedian);this.cbMed.onCheck=function(c){params.useMedian=c;};
   this.lbMed = mkL(this.thrGB,_T("MEDIAN"),COL_LABEL_W);
   this.spMedMin = mkSp(this.thrGB,"",0,params.medianMin,0,1,4,55);this.spMedMin.onValueUpdated=function(v){params.medianMin=v;};
   this.lbDash = mkL(this.thrGB,"–",10,TextAlign_Center);
   this.spMedMax = mkSp(this.thrGB,"",0,params.medianMax,0,1,4,55);this.spMedMax.onValueUpdated=function(v){params.medianMax=v;};
   this.nmR = new HorizontalSizer;this.nmR.spacing=4;
   this.nmR.add(this.cbNoise);this.nmR.add(this.lbNoise);this.nmR.add(this.spNoise);gap(this.nmR);
   this.nmR.add(this.cbMed);this.nmR.add(this.lbMed);this.nmR.add(this.spMedMin);this.nmR.add(this.lbDash);this.nmR.add(this.spMedMax);this.nmR.addStretch();

   this.thrGB.sizer = new VerticalSizer;this.thrGB.sizer.margin=8;this.thrGB.sizer.spacing=5;
   this.thrGB.sizer.add(this.fwR);this.thrGB.sizer.add(this.esR);this.thrGB.sizer.add(this.rsR);this.thrGB.sizer.add(this.nmR);

   this.pctGB = new GroupBox(this);
   this.pctGB.title = _T("PERCENTAGE_TITLE");
   this.keepSlider = new NumericControl(this.pctGB);
   this.keepSlider.label.text = _T("KEEP_TOP");
   this.keepSlider.label.setFixedWidth(80);
   this.keepSlider.setRange(1,100);this.keepSlider.setPrecision(0);
   this.keepSlider.slider.setRange(1,100);this.keepSlider.slider.minWidth=200;
   this.keepSlider.setValue(params.keepPercentage);
   this.keepSlider.onValueUpdated = function(v){params.keepPercentage=Math.round(v);};
   this.kR = new HorizontalSizer;this.kR.add(this.keepSlider,100);

   this.wLabel = new Label(this.pctGB);this.wLabel.text=_T("WEIGHTS_TITLE");this.wLabel.styleSheet="QLabel{font-weight:bold;}";
   this.wF = mkSp(this.pctGB,_T("W_FWHM"),COL_WLABEL_W,params.weightFWHM,0,100,0,42);this.wF.onValueUpdated=function(v){params.weightFWHM=Math.round(v);};
   this.wE = mkSp(this.pctGB,_T("W_ECC"),COL_WLABEL_W,params.weightEccentricity,0,100,0,42);this.wE.onValueUpdated=function(v){params.weightEccentricity=Math.round(v);};
   this.wS = mkSp(this.pctGB,_T("W_SNR"),COL_WLABEL_W,params.weightSNR,0,100,0,42);this.wS.onValueUpdated=function(v){params.weightSNR=Math.round(v);};
   this.wT = mkSp(this.pctGB,_T("W_STARS"),COL_WLABEL_W,params.weightStars,0,100,0,42);this.wT.onValueUpdated=function(v){params.weightStars=Math.round(v);};
   this.wN = mkSp(this.pctGB,_T("W_NOISE"),COL_WLABEL_W,params.weightNoise,0,100,0,42);this.wN.onValueUpdated=function(v){params.weightNoise=Math.round(v);};
   this.w1 = new HorizontalSizer;this.w1.spacing=4;this.w1.add(this.wF);gap(this.w1);this.w1.add(this.wE);this.w1.addStretch();
   this.w2 = new HorizontalSizer;this.w2.spacing=4;this.w2.add(this.wS);gap(this.w2);this.w2.add(this.wT);this.w2.addStretch();
   this.w3 = new HorizontalSizer;this.w3.spacing=4;this.w3.add(this.wN);this.w3.addStretch();
   this.pctGB.sizer = new VerticalSizer;this.pctGB.sizer.margin=8;this.pctGB.sizer.spacing=5;
   this.pctGB.sizer.add(this.kR);this.pctGB.sizer.addSpacing(4);
   this.pctGB.sizer.add(this.wLabel);this.pctGB.sizer.add(this.w1);this.pctGB.sizer.add(this.w2);this.pctGB.sizer.add(this.w3);

   this.sigGB = new GroupBox(this);
   this.sigGB.title = _T("SIGMA_TITLE");
   this.spSL = mkSp(this.sigGB,_T("SIGMA_LOW"),COL_SLABEL_W,params.sigmaLow,0.5,10,1,50);this.spSL.onValueUpdated=function(v){params.sigmaLow=v;};
   this.spSH = mkSp(this.sigGB,_T("SIGMA_HIGH"),COL_SLABEL_W,params.sigmaHigh,0.5,10,1,50);this.spSH.onValueUpdated=function(v){params.sigmaHigh=v;};
   this.ssR = new HorizontalSizer;this.ssR.spacing=4;this.ssR.add(this.spSL);gap(this.ssR);this.ssR.add(this.spSH);this.ssR.addStretch();
   this.sigML = new Label(this.sigGB);this.sigML.text=_T("SIGMA_APPLY_TO");this.sigML.styleSheet="QLabel{font-weight:bold;}";
   this.sCF = new CheckBox(this.sigGB);this.sCF.text="FWHM";this.sCF.checked=params.sigmaUseFWHM;this.sCF.onCheck=function(c){params.sigmaUseFWHM=c;};
   this.sCE = new CheckBox(this.sigGB);this.sCE.text=_T("W_ECC").replace(":","");this.sCE.checked=params.sigmaUseEccentricity;this.sCE.onCheck=function(c){params.sigmaUseEccentricity=c;};
   this.sCS = new CheckBox(this.sigGB);this.sCS.text="SNR";this.sCS.checked=params.sigmaUseSNR;this.sCS.onCheck=function(c){params.sigmaUseSNR=c;};
   this.sCN = new CheckBox(this.sigGB);this.sCN.text=_T("W_NOISE").replace(":","");this.sCN.checked=params.sigmaUseNoise;this.sCN.onCheck=function(c){params.sigmaUseNoise=c;};
   this.sCT = new CheckBox(this.sigGB);this.sCT.text=_T("W_STARS").replace(":","");this.sCT.checked=params.sigmaUseStars;this.sCT.onCheck=function(c){params.sigmaUseStars=c;};
   this.scR = new HorizontalSizer;this.scR.spacing=16;
   this.scR.add(this.sCF);this.scR.add(this.sCE);this.scR.add(this.sCS);this.scR.add(this.sCN);this.scR.add(this.sCT);this.scR.addStretch();
   this.sigGB.sizer = new VerticalSizer;this.sigGB.sizer.margin=8;this.sigGB.sizer.spacing=5;
   this.sigGB.sizer.add(this.ssR);this.sigGB.sizer.addSpacing(4);this.sigGB.sizer.add(this.sigML);this.sigGB.sizer.add(this.scR);

   this.psfGB = new GroupBox(this);
   this.psfGB.title = _T("PSF_TITLE");
   this.lbPsf = mkL(this.psfGB,_T("PSF_FUNCTION"),COL_PLABEL_W);
   this.cPsf = new ComboBox(this.psfGB);
   this.cPsf.addItem("Gaussian");this.cPsf.addItem("Moffat 4");this.cPsf.addItem("Moffat 6");this.cPsf.addItem("Moffat 8");
   this.cPsf.currentItem = params.psfType;
   this.cPsf.onItemSelected = function(i){params.psfType=i;};
   this.spLay = mkSp(this.psfGB,_T("STRUCT_LAYERS"),COL_PLABEL_W,params.structureLayers,1,8,0,42);this.spLay.onValueUpdated=function(v){params.structureLayers=Math.round(v);};
   this.spSen = mkSp(this.psfGB,_T("SENSITIVITY"),COL_PLABEL_W,params.sensitivity,0.01,1,2,52);this.spSen.onValueUpdated=function(v){params.sensitivity=v;};
   this.spMS = mkSp(this.psfGB,_T("MAX_STARS"),COL_PLABEL_W,params.maxStars,10,5000,0,52);this.spMS.onValueUpdated=function(v){params.maxStars=Math.round(v);};
   this.p1 = new HorizontalSizer;this.p1.spacing=4;this.p1.add(this.lbPsf);this.p1.add(this.cPsf);gap(this.p1);this.p1.add(this.spLay);this.p1.addStretch();
   this.p2 = new HorizontalSizer;this.p2.spacing=4;this.p2.add(this.spSen);gap(this.p2);this.p2.add(this.spMS);this.p2.addStretch();
   this.psfGB.sizer = new VerticalSizer;this.psfGB.sizer.margin=8;this.psfGB.sizer.spacing=5;
   this.psfGB.sizer.add(this.p1);this.psfGB.sizer.add(this.p2);

   // ====================================================================
   // RIGHT PANEL — Results, Graph, Statistics
   // ====================================================================

   this.progressGB = new GroupBox(this);
   this.progressGB.title = _T("PROGRESS_TITLE");
   this.progressLabel = new Label( this.progressGB );
   this.progressLabel.text = _T("PROGRESS_READY");
   this.progressLabel.textAlignment = TextAlign_Left | TextAlign_VertCenter;
   this.progressBar = new Slider( this.progressGB );
   this.progressBar.minValue = 0;
   this.progressBar.maxValue = 100;
   this.progressBar.value = 0;
   this.progressBar.setFixedHeight( 20 );
   this.progressBar.enabled = false;
   this.progressBar.toolTip = _T("TT_PROGRESS");
   this.progressPercent = new Label( this.progressGB );
   this.progressPercent.text = "0%";
   this.progressPercent.setFixedWidth( 40 );
   this.progressPercent.textAlignment = TextAlign_Right | TextAlign_VertCenter;
   this.progressRow = new HorizontalSizer;
   this.progressRow.spacing = 6;
   this.progressRow.add( this.progressLabel, 50 );
   this.progressRow.add( this.progressBar, 100 );
   this.progressRow.add( this.progressPercent );
   this.progressGB.sizer = new VerticalSizer;
   this.progressGB.sizer.margin = 6;
   this.progressGB.sizer.add( this.progressRow );

   this.graphGB = new GroupBox(this);
   this.graphGB.title = _T("GRAPH_TITLE");
   this.graphTypeLabel = mkL( this.graphGB, _T("GRAPH_PLOT"), 30, TextAlign_Right );
   this.graphTypeCombo = new ComboBox( this.graphGB );
   this.graphTypeCombo.addItem( _T("GRAPH_BAR") );
   this.graphTypeCombo.addItem( _T("GRAPH_SCATTER") );
   this.graphTypeCombo.addItem( _T("GRAPH_WEIGHTMAP") );
   this.graphTypeCombo.currentItem = 0;
   this.graphTypeCombo.onItemSelected = function( idx )
   {
      dlg.graphControl.graphType = idx;
      dlg.graphControl.repaint();
   };
   this.graphMetricLabel = mkL( this.graphGB, _T("GRAPH_METRIC"), 42, TextAlign_Right );
   this.graphMetricCombo = new ComboBox( this.graphGB );
   this.graphMetricCombo.addItem( "FWHM (arcsec)" );
   this.graphMetricCombo.addItem( "FWHM (px)" );
   this.graphMetricCombo.addItem( _T("W_ECC").replace(":","") );
   this.graphMetricCombo.addItem( "SNR" );
   this.graphMetricCombo.addItem( _T("W_STARS").replace(":","") );
   this.graphMetricCombo.addItem( _T("W_NOISE").replace(":","") );
   this.graphMetricCombo.addItem( _T("MEDIAN").replace(":","") );
   this.graphMetricCombo.addItem( _T("GRAPH_SCORE") );
   this.graphMetricCombo.addItem( _T("RESIDUAL").replace(":","") );
   this.graphMetricCombo.currentItem = 0;

   var metricKeys = ["fwhm","fwhmPx","eccentricity","snr","starCount","noise","median","qualityScore","starResidual"];
   this.graphMetricCombo.onItemSelected = function( idx )
   {
      if ( idx >= 0 && idx < metricKeys.length )
      {
         dlg.graphControl.metricKey = metricKeys[idx];
         dlg.graphControl.showRejLine = false;
         if ( metricKeys[idx] === "fwhm" && params.useFWHM )
         { dlg.graphControl.rejectionLine = params.fwhmMax; dlg.graphControl.showRejLine = true; }
         else if ( metricKeys[idx] === "eccentricity" && params.useEccentricity )
         { dlg.graphControl.rejectionLine = params.eccentricityMax; dlg.graphControl.showRejLine = true; }
         else if ( metricKeys[idx] === "snr" && params.useSNR )
         { dlg.graphControl.rejectionLine = params.snrMin; dlg.graphControl.showRejLine = true; }
         else if ( metricKeys[idx] === "noise" && params.useNoise )
         { dlg.graphControl.rejectionLine = params.noiseMax; dlg.graphControl.showRejLine = true; }
         dlg.graphControl.repaint();
      }
   };

   this.graphControlRow = new HorizontalSizer;
   this.graphControlRow.spacing = 8;
   this.graphControlRow.add( this.graphTypeLabel );
   this.graphControlRow.add( this.graphTypeCombo );
   this.graphControlRow.addSpacing( 16 );
   this.graphControlRow.add( this.graphMetricLabel );
   this.graphControlRow.add( this.graphMetricCombo );
   this.graphControlRow.addStretch();

   this.graphControl = new SSPGraphControl( this.graphGB );
   this.graphControl.setMinHeight( 220 );

   this.graphGB.sizer = new VerticalSizer;
   this.graphGB.sizer.margin = 6;
   this.graphGB.sizer.spacing = 4;
   this.graphGB.sizer.add( this.graphControlRow );
   this.graphGB.sizer.add( this.graphControl, 100 );

   this.resultsGB = new GroupBox(this);
   this.resultsGB.title = _T("TABLE_TITLE");
   this.resultsTree = new TreeBox( this.resultsGB );
   this.resultsTree.alternateRowColor = true;
   this.resultsTree.headerVisible = true;
   this.resultsTree.numberOfColumns = 11;
   this.resultsTree.setHeaderText( 0, "#" );
   this.resultsTree.setHeaderText( 1, _T("TABLE_FILE") );
   this.resultsTree.setHeaderText( 2, _T("TABLE_FILTER") );
   this.resultsTree.setHeaderText( 3, "FWHM" );
   this.resultsTree.setHeaderText( 4, "Ecc" );
   this.resultsTree.setHeaderText( 5, "SNR" );
   this.resultsTree.setHeaderText( 6, _T("W_STARS").replace(":","") );
   this.resultsTree.setHeaderText( 7, _T("W_NOISE").replace(":","") );
   this.resultsTree.setHeaderText( 8, _T("MEDIAN").replace(":","") );
   this.resultsTree.setHeaderText( 9, _T("GRAPH_SCORE") );
   this.resultsTree.setHeaderText( 10, _T("TABLE_STATUS") );
   this.resultsTree.setColumnWidth( 0, 35 );
   this.resultsTree.setColumnWidth( 1, 160 );
   this.resultsTree.setColumnWidth( 2, 50 );
   this.resultsTree.setColumnWidth( 3, 65 );
   this.resultsTree.setColumnWidth( 4, 55 );
   this.resultsTree.setColumnWidth( 5, 60 );
   this.resultsTree.setColumnWidth( 6, 50 );
   this.resultsTree.setColumnWidth( 7, 70 );
   this.resultsTree.setColumnWidth( 8, 60 );
   this.resultsTree.setColumnWidth( 9, 60 );
   this.resultsTree.setColumnWidth( 10, 70 );
   this.resultsTree.setMinHeight( 140 );
   this.resultsTree.headerSortingEnabled = true;
   this.resultsTree.sort( 0, false );
   this.resultsGB.sizer = new VerticalSizer;
   this.resultsGB.sizer.margin = 6;
   this.resultsGB.sizer.add( this.resultsTree, 100 );

   this.statsGB = new GroupBox(this);
   this.statsGB.title = _T("STATS_TITLE");
   this.statsTextBox = new TextBox( this.statsGB );
   this.statsTextBox.readOnly = true;
   this.statsTextBox.setMinHeight( 100 );
   this.statsTextBox.setMaxHeight( 160 );
   this.statsTextBox.styleSheet = "QTextEdit{font-family:monospace;font-size:10px;background:#1e1e1e;color:#e0e0e0;}";
   this.statsTextBox.text = _T("STATS_EMPTY");
   this.statsGB.sizer = new VerticalSizer;
   this.statsGB.sizer.margin = 6;
   this.statsGB.sizer.add( this.statsTextBox );

   // ====================================================================
   // Buttons
   // ====================================================================
   this.niBtn = new ToolButton(this);
   this.niBtn.icon = this.scaledResource(":/process-interface/new-instance.png");
   this.niBtn.setScaledFixedSize(24,24);
   this.niBtn.toolTip = "New Instance";
   this.niBtn.onMousePress = function(){params.save();this.hasFocus=true;this.pushed=false;this.dialog.newInstance();};

   this.restBtn = new PushButton(this);
   this.restBtn.text = _T("BTN_RESTORE");
   this.restBtn.icon = this.scaledResource(":/icons/undo.png");
   this.restBtn.toolTip = _T("TT_RESTORE");
   this.restBtn.onClick = function()
   {
      if(!params.inputDirectory.length){(new MessageBox(_T("MSG_NO_DIR"),TITLE,StdIcon_Error,StdButton_Ok)).execute();return;}
      var d=params.inputDirectory;if(!hasTrailingSlash(d))d+="/";
      var lp=d+params.rejectedDirName+"/"+SSP_RESTORE_LOG;
      if(!File.exists(lp)){(new MessageBox(_T("MSG_NO_RESTORE_LOG"),TITLE,StdIcon_Warning,StdButton_Ok)).execute();return;}
      if((new MessageBox(_T("MSG_RESTORE_CONFIRM"),TITLE,StdIcon_Question,StdButton_Yes,StdButton_No)).execute()===StdButton_Yes)
      {var e=new SSPEngine(params);var c=e.restoreRejectedFiles();(new MessageBox(_TF("MSG_RESTORED_N",c),TITLE,StdIcon_Information,StdButton_Ok)).execute();}
   };

   this.rstBtn = new PushButton(this);
   this.rstBtn.text = _T("BTN_RESET");
   this.rstBtn.icon = this.scaledResource(":/icons/reload.png");
   this.rstBtn.onClick = function(){params.reset();dlg.syncUI();};

   this.runBtn = new PushButton(this);
   this.runBtn.text = _T("BTN_RUN");
   this.runBtn.icon = this.scaledResource(":/icons/power.png");
   this.runBtn.defaultButton = true;
   this.runBtn.onClick = function()
   {
      if(!params.inputDirectory.length){(new MessageBox(_T("MSG_NO_DIR"),TITLE,StdIcon_Error,StdButton_Ok)).execute();return;}
      if(!File.directoryExists(params.inputDirectory)){(new MessageBox(_T("MSG_DIR_NOT_FOUND")+"\n\n"+params.inputDirectory,TITLE,StdIcon_Error,StdButton_Ok)).execute();return;}

      var isDryRun = (params.operationMode === SSP_OP_DRYRUN);

      if ( isDryRun )
      {
         params.save();
         var engine = new SSPEngine( params );
         engine.progressCallback = function( current, total, fileName )
         {
            var pct = Math.round( current * 100 / total );
            dlg.progressBar.value = pct;
            dlg.progressPercent.text = pct + "%";
            dlg.progressLabel.text = format( "[%d/%d] %s", current, total, fileName );
            processEvents();
         };
         try
         {
            dlg.progressLabel.text = _T("PROGRESS_ANALYZING");
            dlg.progressBar.value = 0;
            dlg.progressPercent.text = "0%";
            processEvents();
            engine.run();
            dlg.updateResultsPanels( params.results );
            dlg.progressLabel.text = format( "%s — %d frames", _T("PROGRESS_DONE"), params.results.length );
            dlg.progressBar.value = 100;
            dlg.progressPercent.text = "100%";
         }
         catch ( e )
         {
            if ( e && e.message && e.message.indexOf("Aborted") >= 0 )
            {
               dlg.progressLabel.text = _T("PROGRESS_ABORTED");
               Console.warningln( "Analysis aborted by user." );
            }
            else
            {
               dlg.progressLabel.text = "Error: " + e.message;
               Console.criticalln( "Error: " + e.message );
            }
         }
      }
      else
      {
         dlg.ok();
      }
   };

   this.canBtn = new PushButton(this);
   this.canBtn.text = _T("BTN_CANCEL");
   this.canBtn.icon = this.scaledResource(":/icons/cancel.png");
   this.canBtn.onClick = function(){dlg.cancel();};

   this.donateRow = new HorizontalSizer;
   this.donateRow.spacing = 4;
   this.donateLabel = new Label(this);
   this.donateLabel.text = _T("SUPPORT_DONATE");
   this.donateLabel.textAlignment = TextAlign_Right | TextAlign_VertCenter;
   this.donateLink = new Edit(this);
   this.donateLink.text = _T("DONATE_LINK");
   this.donateLink.readOnly = true;
   this.donateLink.setFixedWidth(200);
   this.donateLink.toolTip = "URL: https://" + _T("DONATE_LINK");
   this.donateLinkBtn = new ToolButton(this);
   this.donateLinkBtn.icon = this.scaledResource(":/icons/link.png");
   this.donateLinkBtn.setScaledFixedSize(20, 20);
   this.donateLinkBtn.toolTip = _T("SUPPORT_DONATE");
   this.donateLinkBtn.onClick = function()
   {
      var url = "https://" + _T("DONATE_LINK");
      var proc = new ExternalProcess();
      try { proc.start( "open", [url] ); }
      catch (e1) { try { proc.start( "xdg-open", [url] ); }
      catch (e2) { try { proc.start( "cmd.exe", ["/c", "start", "", url] ); }
      catch (e3) { Console.warningln( "Could not open browser. Visit: " + url ); } } }
   };
   this.donateRow.addStretch();
   this.donateRow.add(this.donateLabel);
   this.donateRow.addSpacing(4);
   this.donateRow.add(this.donateLink);
   this.donateRow.add(this.donateLinkBtn);

   this.bR = new HorizontalSizer;this.bR.spacing=6;
   this.bR.add(this.niBtn);this.bR.add(this.restBtn);this.bR.add(this.rstBtn);
   this.bR.addStretch();
   this.bR.add(this.runBtn);this.bR.add(this.canBtn);

   // ====================================================================
   // DUAL-PANEL LAYOUT
   // ====================================================================

   this.leftPanel = new VerticalSizer;
   this.leftPanel.margin = 0;
   this.leftPanel.spacing = 6;
   this.leftPanel.add(this.titleLabel);
   this.leftPanel.add(this.descLabel);
   this.leftPanel.add(this.langRow);
   this.leftPanel.addSpacing(2);
   this.leftPanel.add(this.inputRow);
   this.leftPanel.add(this.rejRow);
   this.leftPanel.addSpacing(2);
   this.leftPanel.add(this.optGB);
   this.leftPanel.add(this.scaleGB);
   this.leftPanel.add(this.modeGB);
   this.leftPanel.add(this.thrGB);
   this.leftPanel.add(this.pctGB);
   this.leftPanel.add(this.sigGB);
   this.leftPanel.add(this.psfGB);
   this.leftPanel.addStretch();

   this.rightPanel = new VerticalSizer;
   this.rightPanel.margin = 0;
   this.rightPanel.spacing = 6;
   this.rightPanel.add(this.progressGB);
   this.rightPanel.add(this.graphGB);
   this.rightPanel.add(this.resultsGB);
   this.rightPanel.add(this.statsGB);
   this.rightPanel.addStretch();

   this.dualPanel = new HorizontalSizer;
   this.dualPanel.spacing = 10;
   this.dualPanel.add( this.leftPanel );
   this.dualPanel.add( this.rightPanel );

   this.sizer = new VerticalSizer;
   this.sizer.margin = 8;
   this.sizer.spacing = 6;
   this.sizer.add( this.dualPanel, 100 );
   this.sizer.addSpacing(2);
   this.sizer.add( this.donateRow );
   this.sizer.addSpacing(4);
   this.sizer.add( this.bR );

   // ====================================================================
   // updateResultsPanels()
   // ====================================================================
   this.updateResultsPanels = function( results )
   {
      if ( !results || results.length === 0 ) return;

      dlg.graphControl.updateData( results );

      dlg.resultsTree.clear();
      for ( var i = 0; i < results.length; ++i )
      {
         var r = results[i];
         if ( !r ) continue;
         var node = new TreeBoxNode( dlg.resultsTree );
         node.setText( 0, (i+1).toString() );
         node.setText( 1, r.fileName );
         node.setText( 2, r.filter || "-" );
         node.setText( 3, r.fwhm.toFixed(2) );
         node.setText( 4, r.eccentricity.toFixed(3) );
         node.setText( 5, r.snr.toFixed(1) );
         node.setText( 6, r.starCount.toString() );
         node.setText( 7, r.noise.toFixed(6) );
         node.setText( 8, r.median.toFixed(4) );
         node.setText( 9, r.qualityScore.toFixed(4) );
         var st;
         if ( !r.analysisOK ) st = "FAILED";
         else if ( r.rejected ) st = "REJECTED";
         else st = "OK";
         node.setText( 10, st );
         if ( !r.analysisOK )
            for ( var c = 0; c < 11; ++c ) node.setTextColor( c, 0xFF9E9E9E );
         else if ( r.rejected )
            for ( var c = 0; c < 11; ++c ) node.setTextColor( c, 0xFFF44336 );
         else
            for ( var c = 0; c < 11; ++c ) node.setTextColor( c, 0xFF4CAF50 );
      }

      var valid = [];
      for ( var i = 0; i < results.length; ++i )
         if ( results[i] && results[i].analysisOK ) valid.push( results[i] );
      if ( valid.length === 0 ) { dlg.statsTextBox.text = _T("STATS_NODATA"); return; }

      var acc = 0, rej = 0, fail = 0;
      for ( var i = 0; i < results.length; ++i )
      {
         if ( !results[i] ) continue;
         if ( !results[i].analysisOK ) fail++;
         else if ( results[i].rejected ) rej++;
         else acc++;
      }

      function calcStats( arr )
      {
         if ( arr.length === 0 ) return { min:0, max:0, mean:0, median:0, stddev:0 };
         var sorted = arr.slice().sort( function(a,b){ return a-b; } );
         var mn = sorted[0], mx = sorted[sorted.length-1];
         var sum = 0;
         for ( var i = 0; i < sorted.length; ++i ) sum += sorted[i];
         var mean = sum / sorted.length;
         var med;
         var mid = Math.floor( sorted.length / 2 );
         if ( sorted.length % 2 === 0 ) med = (sorted[mid-1] + sorted[mid]) / 2;
         else med = sorted[mid];
         var ss = 0;
         for ( var i = 0; i < sorted.length; ++i ) { var d = sorted[i]-mean; ss += d*d; }
         var sd = sorted.length > 1 ? Math.sqrt( ss / (sorted.length-1) ) : 0;
         return { min: mn, max: mx, mean: mean, median: med, stddev: sd };
      }

      var fwArr=[],ecArr=[],snArr=[],stArr=[],noArr=[],mdArr=[],scArr=[];
      for ( var i = 0; i < valid.length; ++i )
      {
         fwArr.push(valid[i].fwhm); ecArr.push(valid[i].eccentricity);
         snArr.push(valid[i].snr); stArr.push(valid[i].starCount);
         noArr.push(valid[i].noise); mdArr.push(valid[i].median);
         scArr.push(valid[i].qualityScore);
      }

      function fmtRow( name, s, prec )
      {
         return format( "%-14s  min=%-10s  max=%-10s  mean=%-10s  med=%-10s  \u03C3=%-10s",
            name, s.min.toFixed(prec), s.max.toFixed(prec),
            s.mean.toFixed(prec), s.median.toFixed(prec), s.stddev.toFixed(prec) );
      }

      var txt = format( "Frames: %d total, %d accepted, %d rejected, %d failed (%.1f%% rejection)\n",
         results.length, acc, rej, fail,
         results.length > 0 ? (rej+fail)*100.0/results.length : 0 );
      txt += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
      txt += fmtRow( "FWHM (\")", calcStats(fwArr), 3 ) + "\n";
      txt += fmtRow( "Eccentricity", calcStats(ecArr), 4 ) + "\n";
      txt += fmtRow( "SNR", calcStats(snArr), 2 ) + "\n";
      txt += fmtRow( "Star Count", calcStats(stArr), 0 ) + "\n";
      txt += fmtRow( "Noise", calcStats(noArr), 6 ) + "\n";
      txt += fmtRow( "Median", calcStats(mdArr), 5 ) + "\n";
      txt += fmtRow( "Score", calcStats(scArr), 4 ) + "\n";
      dlg.statsTextBox.text = txt;
   };

   // ====================================================================
   // Sync helpers
   // ====================================================================
   this.syncMode = function()
   {
      var m = params.rejectionMode;
      dlg.thrGB.enabled = (m === SSP_MODE_THRESHOLD);
      dlg.pctGB.enabled = (m === SSP_MODE_PERCENTAGE);
      dlg.sigGB.enabled = (m === SSP_MODE_SIGMA);
   };

   this.syncUI = function()
   {
      dlg.inputDirEdit.text = params.inputDirectory;
      dlg.rejEdit.text = params.rejectedDirName;
      dlg.dryRunCB.checked = (params.operationMode === SSP_OP_DRYRUN);
      dlg.filterCB.checked = params.groupByFilter;
      dlg.csvCB.checked  = params.exportCSV;
      dlg.cacheCB.checked = params.useCache;
      dlg.spFocal.setValue(params.overrideFocalLength);
      dlg.spPixel.setValue(params.overridePixelSize);
      dlg.nativeCB.checked = params.useNativeSS;
      dlg.thrR.checked = (params.rejectionMode === SSP_MODE_THRESHOLD);
      dlg.pctR.checked = (params.rejectionMode === SSP_MODE_PERCENTAGE);
      dlg.sigR.checked = (params.rejectionMode === SSP_MODE_SIGMA);
      dlg.cbFwhm.checked = params.useFWHM; dlg.spFMin.setValue(params.fwhmMin); dlg.spFMax.setValue(params.fwhmMax);
      dlg.cbEcc.checked  = params.useEccentricity; dlg.spEcc.setValue(params.eccentricityMax);
      dlg.cbSnr.checked  = params.useSNR; dlg.spSnr.setValue(params.snrMin);
      dlg.cbRes.checked  = params.useStarResidual; dlg.spRes.setValue(params.starResidualMax);
      dlg.cbStar.checked = params.useStars; dlg.spStar.setValue(params.starsMin);
      dlg.cbNoise.checked= params.useNoise; dlg.spNoise.setValue(params.noiseMax);
      dlg.cbMed.checked  = params.useMedian; dlg.spMedMin.setValue(params.medianMin); dlg.spMedMax.setValue(params.medianMax);
      dlg.keepSlider.setValue(params.keepPercentage);
      dlg.wF.setValue(params.weightFWHM); dlg.wE.setValue(params.weightEccentricity);
      dlg.wS.setValue(params.weightSNR); dlg.wT.setValue(params.weightStars); dlg.wN.setValue(params.weightNoise);
      dlg.spSL.setValue(params.sigmaLow); dlg.spSH.setValue(params.sigmaHigh);
      dlg.sCF.checked = params.sigmaUseFWHM; dlg.sCE.checked = params.sigmaUseEccentricity;
      dlg.sCS.checked = params.sigmaUseSNR; dlg.sCN.checked = params.sigmaUseNoise; dlg.sCT.checked = params.sigmaUseStars;
      dlg.cPsf.currentItem = params.psfType; dlg.spLay.setValue(params.structureLayers);
      dlg.spSen.setValue(params.sensitivity); dlg.spMS.setValue(params.maxStars);
      dlg.syncMode();
   };

   this.syncMode();
   this.adjustToContents();
}

SSPDialog.prototype = new Dialog;