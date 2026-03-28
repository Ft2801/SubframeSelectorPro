// ****************************************************************************
// SubframeSelectorPro-gui.js - User Interface (Full Features + i18n)
// ****************************************************************************
//
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// Released under the MIT License.
// ****************************************************************************

#define COL_CHECK_W  20
#define COL_LABEL_W  80
#define COL_GAP      16
#define COL_WLABEL_W 90
#define COL_PLABEL_W 90
#define COL_SLABEL_W 90

function SSPDialog( params )
{
   this.__base__ = Dialog;
   this.__base__();
   this.params = params;
   var dlg = this;

   this.windowTitle = TITLE + " v" + VERSION;
   this.minWidth = 720;

   // ── Helpers ──
   function mkL(p,text,w,a){var l=new Label(p);l.text=text;l.textAlignment=(a||TextAlign_Right)|TextAlign_VertCenter;if(w>0)l.setFixedWidth(w);return l;}
   function mkCB(p,ch,tt){var c=new CheckBox(p);c.text="";c.checked=ch;c.setFixedWidth(COL_CHECK_W);if(tt)c.toolTip=tt;return c;}
   function mkSp(p,lb,lw,v,lo,hi,pr,ew,tt){var n=new NumericControl(p);n.label.text=lb;if(lw>0)n.label.setFixedWidth(lw);else n.label.hide();n.setRange(lo,hi);n.setPrecision(pr);n.setValue(v);n.edit.setFixedWidth(ew);if(tt)n.toolTip=tt;return n;}
   function gap(s){s.addSpacing(COL_GAP);}

   // ========================================================================
   // Header
   // ========================================================================
   this.titleLabel = new Label(this);
   this.titleLabel.text = "<b>"+TITLE+" v"+VERSION+"</b>";
   this.titleLabel.textAlignment = TextAlign_Center;

   this.descLabel = new Label(this);
   this.descLabel.text = _T("DESCRIPTION");
   this.descLabel.textAlignment = TextAlign_Center;
   this.descLabel.styleSheet = "QLabel{color:#888;}";

   // ========================================================================
   // Language selector
   // ========================================================================
   this.langLabel = mkL(this, _T("LANGUAGE"), 60, TextAlign_Right);
   this.langCombo = new ComboBox(this);
   for (var i=0; i<__SSP_i18n.languageNames.length; ++i)
      this.langCombo.addItem(__SSP_i18n.languageNames[i]);
   this.langCombo.currentItem = __SSP_i18n.currentLang;
   this.langCombo.toolTip = "Select interface language";
   this.langCombo.onItemSelected = function(idx)
   {
      __SSP_i18n.setLanguage(idx);
      // Notify user that restart is needed for full effect
      Console.writeln("Language changed to: " + __SSP_i18n.languageNames[idx]);
      Console.writeln("Note: Restart the script for full language update.");
      // Update what we can dynamically
      dlg.descLabel.text = _T("DESCRIPTION");
   };

   this.langRow = new HorizontalSizer;
   this.langRow.addStretch();
   this.langRow.add(this.langLabel);
   this.langRow.addSpacing(4);
   this.langRow.add(this.langCombo);

   // ========================================================================
   // Input / Output
   // ========================================================================
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

   // ========================================================================
   // Options
   // ========================================================================
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

   // ========================================================================
   // Plate Scale + PSF Backend
   // ========================================================================
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

   // ========================================================================
   // Rejection Mode
   // ========================================================================
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
   this.modeGB.sizer.add(this.thrR);this.modeGB.sizer.add(this.pctR);this.modeGB.sizer.add(this.sigR);this.modeGB.sizer.addStretch();

   // ========================================================================
   // Threshold GroupBox
   // ========================================================================
   this.thrGB = new GroupBox(this);
   this.thrGB.title = _T("THRESHOLD_TITLE");

   this.cbFwhm = mkCB(this.thrGB,params.useFWHM); this.cbFwhm.onCheck=function(c){params.useFWHM=c;};
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

   // ========================================================================
   // Percentage GroupBox
   // ========================================================================
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

   this.wLabel = new Label(this.pctGB);this.wLabel.text="<b>"+_T("WEIGHTS_TITLE")+"</b>";
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

   // ========================================================================
   // Sigma GroupBox
   // ========================================================================
   this.sigGB = new GroupBox(this);
   this.sigGB.title = _T("SIGMA_TITLE");

   this.spSL = mkSp(this.sigGB,_T("SIGMA_LOW"),COL_SLABEL_W,params.sigmaLow,0.5,10,1,50);this.spSL.onValueUpdated=function(v){params.sigmaLow=v;};
   this.spSH = mkSp(this.sigGB,_T("SIGMA_HIGH"),COL_SLABEL_W,params.sigmaHigh,0.5,10,1,50);this.spSH.onValueUpdated=function(v){params.sigmaHigh=v;};

   this.ssR = new HorizontalSizer;this.ssR.spacing=4;this.ssR.add(this.spSL);gap(this.ssR);this.ssR.add(this.spSH);this.ssR.addStretch();

   this.sigML = new Label(this.sigGB);this.sigML.text="<b>"+_T("SIGMA_APPLY_TO")+"</b>";
   this.sCF = new CheckBox(this.sigGB);this.sCF.text="FWHM";this.sCF.checked=params.sigmaUseFWHM;this.sCF.onCheck=function(c){params.sigmaUseFWHM=c;};
   this.sCE = new CheckBox(this.sigGB);this.sCE.text=_T("W_ECC").replace(":","");this.sCE.checked=params.sigmaUseEccentricity;this.sCE.onCheck=function(c){params.sigmaUseEccentricity=c;};
   this.sCS = new CheckBox(this.sigGB);this.sCS.text="SNR";this.sCS.checked=params.sigmaUseSNR;this.sCS.onCheck=function(c){params.sigmaUseSNR=c;};
   this.sCN = new CheckBox(this.sigGB);this.sCN.text=_T("W_NOISE").replace(":","");this.sCN.checked=params.sigmaUseNoise;this.sCN.onCheck=function(c){params.sigmaUseNoise=c;};
   this.sCT = new CheckBox(this.sigGB);this.sCT.text=_T("W_STARS").replace(":","");this.sCT.checked=params.sigmaUseStars;this.sCT.onCheck=function(c){params.sigmaUseStars=c;};

   this.scR = new HorizontalSizer;this.scR.spacing=16;
   this.scR.add(this.sCF);this.scR.add(this.sCE);this.scR.add(this.sCS);this.scR.add(this.sCN);this.scR.add(this.sCT);this.scR.addStretch();

   this.sigGB.sizer = new VerticalSizer;this.sigGB.sizer.margin=8;this.sigGB.sizer.spacing=5;
   this.sigGB.sizer.add(this.ssR);this.sigGB.sizer.addSpacing(4);this.sigGB.sizer.add(this.sigML);this.sigGB.sizer.add(this.scR);

   // ========================================================================
   // PSF GroupBox
   // ========================================================================
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

   // ========================================================================
   // Buttons
   // ========================================================================
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
      var d=params.inputDirectory;if(!d.endsWith("/")&&!d.endsWith("\\"))d+="/";
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
      dlg.ok();
   };

   this.canBtn = new PushButton(this);
   this.canBtn.text = _T("BTN_CANCEL");
   this.canBtn.icon = this.scaledResource(":/icons/cancel.png");
   this.canBtn.onClick = function(){dlg.cancel();};

   // ========================================================================
   // Donation Link
   // ========================================================================
   this.donateRow = new HorizontalSizer;
   this.donateRow.spacing = 4;

   this.donateLabel = new Label(this);
   this.donateLabel.text = _T("SUPPORT_DONATE");
   this.donateLabel.textAlignment = TextAlign_Right | TextAlign_VertCenter;

   this.donateLink = new Edit(this);
   this.donateLink.text = _T("DONATE_LINK");
   this.donateLink.readOnly = true;
   this.donateLink.setFixedWidth(200);
   this.donateLink.toolTip = "Click to open in browser. URL: https://" + _T("DONATE_LINK");

   this.donateLinkBtn = new ToolButton(this);
   this.donateLinkBtn.icon = this.scaledResource(":/icons/link.png");
   this.donateLinkBtn.setScaledFixedSize(20, 20);
   this.donateLinkBtn.toolTip = _T("SUPPORT_DONATE");
   this.donateLinkBtn.onClick = function()
   {
      var url = "https://" + _T("DONATE_LINK");
      var proc = new ExternalProcess;
      if ( proc.isAvailable( "open" ) )
         proc.execute( "open", url );  // macOS
      else if ( proc.isAvailable( "xdg-open" ) )
         proc.execute( "xdg-open", url );  // Linux
      else if ( proc.isAvailable( "cmd.exe" ) )
         proc.execute( "cmd.exe", "/c start " + url );  // Windows
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

   // ========================================================================
   // Main Layout
   // ========================================================================
   this.sizer = new VerticalSizer;
   this.sizer.margin=8;this.sizer.spacing=6;
   this.sizer.add(this.titleLabel);
   this.sizer.add(this.descLabel);
   this.sizer.add(this.langRow);
   this.sizer.addSpacing(2);
   this.sizer.add(this.inputRow);
   this.sizer.add(this.rejRow);
   this.sizer.addSpacing(2);
   this.sizer.add(this.optGB);
   this.sizer.add(this.scaleGB);
   this.sizer.add(this.modeGB);
   this.sizer.add(this.thrGB);
   this.sizer.add(this.pctGB);
   this.sizer.add(this.sigGB);
   this.sizer.add(this.psfGB);
   this.sizer.addSpacing(2);
   this.sizer.add(this.donateRow);
   this.sizer.addSpacing(4);
   this.sizer.add(this.bR);

   // ========================================================================
   // Sync
   // ========================================================================
   this.syncMode = function()
   {
      var m=params.rejectionMode;
      dlg.thrGB.enabled=(m===SSP_MODE_THRESHOLD);
      dlg.pctGB.enabled=(m===SSP_MODE_PERCENTAGE);
      dlg.sigGB.enabled=(m===SSP_MODE_SIGMA);
   };

   this.syncUI = function()
   {
      dlg.inputDirEdit.text=params.inputDirectory;
      dlg.rejEdit.text=params.rejectedDirName;
      dlg.dryRunCB.checked=(params.operationMode===SSP_OP_DRYRUN);
      dlg.filterCB.checked=params.groupByFilter;
      dlg.csvCB.checked=params.exportCSV;
      dlg.cacheCB.checked=params.useCache;
      dlg.spFocal.setValue(params.overrideFocalLength);
      dlg.spPixel.setValue(params.overridePixelSize);
      dlg.nativeCB.checked=params.useNativeSS;
      dlg.thrR.checked=(params.rejectionMode===SSP_MODE_THRESHOLD);
      dlg.pctR.checked=(params.rejectionMode===SSP_MODE_PERCENTAGE);
      dlg.sigR.checked=(params.rejectionMode===SSP_MODE_SIGMA);
      dlg.cbFwhm.checked=params.useFWHM;dlg.spFMin.setValue(params.fwhmMin);dlg.spFMax.setValue(params.fwhmMax);
      dlg.cbEcc.checked=params.useEccentricity;dlg.spEcc.setValue(params.eccentricityMax);
      dlg.cbSnr.checked=params.useSNR;dlg.spSnr.setValue(params.snrMin);
      dlg.cbRes.checked=params.useStarResidual;dlg.spRes.setValue(params.starResidualMax);
      dlg.cbStar.checked=params.useStars;dlg.spStar.setValue(params.starsMin);
      dlg.cbNoise.checked=params.useNoise;dlg.spNoise.setValue(params.noiseMax);
      dlg.cbMed.checked=params.useMedian;dlg.spMedMin.setValue(params.medianMin);dlg.spMedMax.setValue(params.medianMax);
      dlg.keepSlider.setValue(params.keepPercentage);
      dlg.wF.setValue(params.weightFWHM);dlg.wE.setValue(params.weightEccentricity);
      dlg.wS.setValue(params.weightSNR);dlg.wT.setValue(params.weightStars);dlg.wN.setValue(params.weightNoise);
      dlg.spSL.setValue(params.sigmaLow);dlg.spSH.setValue(params.sigmaHigh);
      dlg.sCF.checked=params.sigmaUseFWHM;dlg.sCE.checked=params.sigmaUseEccentricity;
      dlg.sCS.checked=params.sigmaUseSNR;dlg.sCN.checked=params.sigmaUseNoise;dlg.sCT.checked=params.sigmaUseStars;
      dlg.cPsf.currentItem=params.psfType;dlg.spLay.setValue(params.structureLayers);
      dlg.spSen.setValue(params.sensitivity);dlg.spMS.setValue(params.maxStars);
      dlg.syncMode();
   };

   this.syncMode();
   this.adjustToContents();
}

SSPDialog.prototype = new Dialog;