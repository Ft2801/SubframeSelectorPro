// ****************************************************************************
// SubframeSelectorPro-params.js - Parameters Management
// ****************************************************************************
//
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// Released under the MIT License.
// ****************************************************************************

#define SSP_SETTINGS_KEY  "SubframeSelectorPro"

#define SSP_MODE_THRESHOLD    0
#define SSP_MODE_PERCENTAGE   1
#define SSP_MODE_SIGMA        2

#define SSP_OP_EXECUTE     0
#define SSP_OP_DRYRUN      1

#define DEFAULT_FWHM_MAX           4.5
#define DEFAULT_FWHM_MIN           0.5
#define DEFAULT_ECCENTRICITY_MAX   0.65
#define DEFAULT_SNR_MIN            15.0
#define DEFAULT_STAR_RESIDUAL_MAX  0.08
#define DEFAULT_STARS_MIN          50
#define DEFAULT_NOISE_MAX          0.005
#define DEFAULT_MEDIAN_MIN         0.05
#define DEFAULT_MEDIAN_MAX         0.85

#define DEFAULT_KEEP_PERCENTAGE    90
#define DEFAULT_SIGMA_LOW          2.0
#define DEFAULT_SIGMA_HIGH         2.0

#define DEFAULT_WEIGHT_FWHM          40
#define DEFAULT_WEIGHT_ECCENTRICITY  20
#define DEFAULT_WEIGHT_SNR           25
#define DEFAULT_WEIGHT_STARS         5
#define DEFAULT_WEIGHT_NOISE         10

#define DEFAULT_PSF_TYPE           0
#define DEFAULT_STRUCTURE_LAYERS   5
#define DEFAULT_SENSITIVITY        0.50
#define DEFAULT_UPPER_LIMIT        1.0
#define DEFAULT_MAX_STARS          500

#define DEFAULT_REJECTED_DIR       "rejected"
#define DEFAULT_EXPORT_CSV         true
#define DEFAULT_CSV_FILENAME       "SubframeSelectorPro_report.csv"
#define DEFAULT_GROUP_BY_FILTER    false
#define DEFAULT_USE_NATIVE_SS      true
#define DEFAULT_USE_CACHE          true

#define SSP_RESTORE_LOG   "SubframeSelectorPro_restore.json"
#define SSP_CACHE_FILE    "SubframeSelectorPro_cache.json"

function SSPParameters()
{
   this.inputDirectory      = "";
   this.rejectedDirName     = DEFAULT_REJECTED_DIR;
   this.operationMode       = SSP_OP_EXECUTE;
   this.rejectionMode       = SSP_MODE_THRESHOLD;

   this.fwhmMax             = DEFAULT_FWHM_MAX;
   this.fwhmMin             = DEFAULT_FWHM_MIN;
   this.eccentricityMax     = DEFAULT_ECCENTRICITY_MAX;
   this.snrMin              = DEFAULT_SNR_MIN;
   this.starResidualMax     = DEFAULT_STAR_RESIDUAL_MAX;
   this.starsMin            = DEFAULT_STARS_MIN;
   this.noiseMax            = DEFAULT_NOISE_MAX;
   this.medianMin           = DEFAULT_MEDIAN_MIN;
   this.medianMax           = DEFAULT_MEDIAN_MAX;

   this.useFWHM             = true;
   this.useEccentricity     = true;
   this.useSNR              = true;
   this.useStarResidual     = true;
   this.useStars            = true;
   this.useNoise            = true;
   this.useMedian           = true;

   this.keepPercentage      = DEFAULT_KEEP_PERCENTAGE;

   this.sigmaLow            = DEFAULT_SIGMA_LOW;
   this.sigmaHigh           = DEFAULT_SIGMA_HIGH;
   this.sigmaUseFWHM        = true;
   this.sigmaUseEccentricity = true;
   this.sigmaUseSNR         = true;
   this.sigmaUseNoise       = true;
   this.sigmaUseStars       = true;

   this.weightFWHM          = DEFAULT_WEIGHT_FWHM;
   this.weightEccentricity  = DEFAULT_WEIGHT_ECCENTRICITY;
   this.weightSNR           = DEFAULT_WEIGHT_SNR;
   this.weightStars         = DEFAULT_WEIGHT_STARS;
   this.weightNoise         = DEFAULT_WEIGHT_NOISE;

   this.psfType             = DEFAULT_PSF_TYPE;
   this.structureLayers     = DEFAULT_STRUCTURE_LAYERS;
   this.sensitivity         = DEFAULT_SENSITIVITY;
   this.upperLimit          = DEFAULT_UPPER_LIMIT;
   this.maxStars            = DEFAULT_MAX_STARS;

   this.groupByFilter       = DEFAULT_GROUP_BY_FILTER;
   this.exportCSV           = DEFAULT_EXPORT_CSV;
   this.csvFileName         = DEFAULT_CSV_FILENAME;
   this.useNativeSS         = DEFAULT_USE_NATIVE_SS;
   this.useCache            = DEFAULT_USE_CACHE;

   this.overrideFocalLength = 0;
   this.overridePixelSize   = 0;

   this.results             = [];

   // ── save / load / reset — same structure as before, adding new fields ──

   this.save = function()
   {
      var K = SSP_SETTINGS_KEY;
      function ws(k,t,v){Settings.write(K+"/"+k,t,v);}
      ws("inputDirectory",DataType_String,this.inputDirectory);
      ws("rejectedDirName",DataType_String,this.rejectedDirName);
      ws("operationMode",DataType_Int32,this.operationMode);
      ws("rejectionMode",DataType_Int32,this.rejectionMode);
      ws("fwhmMax",DataType_Double,this.fwhmMax);
      ws("fwhmMin",DataType_Double,this.fwhmMin);
      ws("eccentricityMax",DataType_Double,this.eccentricityMax);
      ws("snrMin",DataType_Double,this.snrMin);
      ws("starResidualMax",DataType_Double,this.starResidualMax);
      ws("starsMin",DataType_Int32,this.starsMin);
      ws("noiseMax",DataType_Double,this.noiseMax);
      ws("medianMin",DataType_Double,this.medianMin);
      ws("medianMax",DataType_Double,this.medianMax);
      ws("useFWHM",DataType_Boolean,this.useFWHM);
      ws("useEccentricity",DataType_Boolean,this.useEccentricity);
      ws("useSNR",DataType_Boolean,this.useSNR);
      ws("useStarResidual",DataType_Boolean,this.useStarResidual);
      ws("useStars",DataType_Boolean,this.useStars);
      ws("useNoise",DataType_Boolean,this.useNoise);
      ws("useMedian",DataType_Boolean,this.useMedian);
      ws("keepPercentage",DataType_Int32,this.keepPercentage);
      ws("sigmaLow",DataType_Double,this.sigmaLow);
      ws("sigmaHigh",DataType_Double,this.sigmaHigh);
      ws("sigmaUseFWHM",DataType_Boolean,this.sigmaUseFWHM);
      ws("sigmaUseEccentricity",DataType_Boolean,this.sigmaUseEccentricity);
      ws("sigmaUseSNR",DataType_Boolean,this.sigmaUseSNR);
      ws("sigmaUseNoise",DataType_Boolean,this.sigmaUseNoise);
      ws("sigmaUseStars",DataType_Boolean,this.sigmaUseStars);
      ws("weightFWHM",DataType_Int32,this.weightFWHM);
      ws("weightEccentricity",DataType_Int32,this.weightEccentricity);
      ws("weightSNR",DataType_Int32,this.weightSNR);
      ws("weightStars",DataType_Int32,this.weightStars);
      ws("weightNoise",DataType_Int32,this.weightNoise);
      ws("psfType",DataType_Int32,this.psfType);
      ws("structureLayers",DataType_Int32,this.structureLayers);
      ws("sensitivity",DataType_Double,this.sensitivity);
      ws("upperLimit",DataType_Double,this.upperLimit);
      ws("maxStars",DataType_Int32,this.maxStars);
      ws("groupByFilter",DataType_Boolean,this.groupByFilter);
      ws("exportCSV",DataType_Boolean,this.exportCSV);
      ws("csvFileName",DataType_String,this.csvFileName);
      ws("useNativeSS",DataType_Boolean,this.useNativeSS);
      ws("useCache",DataType_Boolean,this.useCache);
      ws("overrideFocalLength",DataType_Double,this.overrideFocalLength);
      ws("overridePixelSize",DataType_Double,this.overridePixelSize);
   };

   this.load = function()
   {
      var K = SSP_SETTINGS_KEY;
      function rs(k,d){var v=Settings.read(K+"/"+k,DataType_String);return Settings.lastReadOK?v:d;}
      function ri(k,d){var v=Settings.read(K+"/"+k,DataType_Int32);return Settings.lastReadOK?v:d;}
      function rd(k,d){var v=Settings.read(K+"/"+k,DataType_Double);return Settings.lastReadOK?v:d;}
      function rb(k,d){var v=Settings.read(K+"/"+k,DataType_Boolean);return Settings.lastReadOK?v:d;}

      this.inputDirectory=rs("inputDirectory",this.inputDirectory);
      this.rejectedDirName=rs("rejectedDirName",this.rejectedDirName);
      this.operationMode=ri("operationMode",this.operationMode);
      this.rejectionMode=ri("rejectionMode",this.rejectionMode);
      this.fwhmMax=rd("fwhmMax",this.fwhmMax);
      this.fwhmMin=rd("fwhmMin",this.fwhmMin);
      this.eccentricityMax=rd("eccentricityMax",this.eccentricityMax);
      this.snrMin=rd("snrMin",this.snrMin);
      this.starResidualMax=rd("starResidualMax",this.starResidualMax);
      this.starsMin=ri("starsMin",this.starsMin);
      this.noiseMax=rd("noiseMax",this.noiseMax);
      this.medianMin=rd("medianMin",this.medianMin);
      this.medianMax=rd("medianMax",this.medianMax);
      this.useFWHM=rb("useFWHM",this.useFWHM);
      this.useEccentricity=rb("useEccentricity",this.useEccentricity);
      this.useSNR=rb("useSNR",this.useSNR);
      this.useStarResidual=rb("useStarResidual",this.useStarResidual);
      this.useStars=rb("useStars",this.useStars);
      this.useNoise=rb("useNoise",this.useNoise);
      this.useMedian=rb("useMedian",this.useMedian);
      this.keepPercentage=ri("keepPercentage",this.keepPercentage);
      this.sigmaLow=rd("sigmaLow",this.sigmaLow);
      this.sigmaHigh=rd("sigmaHigh",this.sigmaHigh);
      this.sigmaUseFWHM=rb("sigmaUseFWHM",this.sigmaUseFWHM);
      this.sigmaUseEccentricity=rb("sigmaUseEccentricity",this.sigmaUseEccentricity);
      this.sigmaUseSNR=rb("sigmaUseSNR",this.sigmaUseSNR);
      this.sigmaUseNoise=rb("sigmaUseNoise",this.sigmaUseNoise);
      this.sigmaUseStars=rb("sigmaUseStars",this.sigmaUseStars);
      this.weightFWHM=ri("weightFWHM",this.weightFWHM);
      this.weightEccentricity=ri("weightEccentricity",this.weightEccentricity);
      this.weightSNR=ri("weightSNR",this.weightSNR);
      this.weightStars=ri("weightStars",this.weightStars);
      this.weightNoise=ri("weightNoise",this.weightNoise);
      this.psfType=ri("psfType",this.psfType);
      this.structureLayers=ri("structureLayers",this.structureLayers);
      this.sensitivity=rd("sensitivity",this.sensitivity);
      this.upperLimit=rd("upperLimit",this.upperLimit);
      this.maxStars=ri("maxStars",this.maxStars);
      this.groupByFilter=rb("groupByFilter",this.groupByFilter);
      this.exportCSV=rb("exportCSV",this.exportCSV);
      this.csvFileName=rs("csvFileName",this.csvFileName);
      this.useNativeSS=rb("useNativeSS",this.useNativeSS);
      this.useCache=rb("useCache",this.useCache);
      this.overrideFocalLength=rd("overrideFocalLength",this.overrideFocalLength);
      this.overridePixelSize=rd("overridePixelSize",this.overridePixelSize);
   };

   this.reset = function()
   {
      this.rejectedDirName=DEFAULT_REJECTED_DIR;
      this.operationMode=SSP_OP_EXECUTE;
      this.rejectionMode=SSP_MODE_THRESHOLD;
      this.fwhmMax=DEFAULT_FWHM_MAX;this.fwhmMin=DEFAULT_FWHM_MIN;
      this.eccentricityMax=DEFAULT_ECCENTRICITY_MAX;this.snrMin=DEFAULT_SNR_MIN;
      this.starResidualMax=DEFAULT_STAR_RESIDUAL_MAX;this.starsMin=DEFAULT_STARS_MIN;
      this.noiseMax=DEFAULT_NOISE_MAX;this.medianMin=DEFAULT_MEDIAN_MIN;this.medianMax=DEFAULT_MEDIAN_MAX;
      this.useFWHM=true;this.useEccentricity=true;this.useSNR=true;
      this.useStarResidual=true;this.useStars=true;this.useNoise=true;this.useMedian=true;
      this.keepPercentage=DEFAULT_KEEP_PERCENTAGE;
      this.sigmaLow=DEFAULT_SIGMA_LOW;this.sigmaHigh=DEFAULT_SIGMA_HIGH;
      this.sigmaUseFWHM=true;this.sigmaUseEccentricity=true;this.sigmaUseSNR=true;
      this.sigmaUseNoise=true;this.sigmaUseStars=true;
      this.weightFWHM=DEFAULT_WEIGHT_FWHM;this.weightEccentricity=DEFAULT_WEIGHT_ECCENTRICITY;
      this.weightSNR=DEFAULT_WEIGHT_SNR;this.weightStars=DEFAULT_WEIGHT_STARS;this.weightNoise=DEFAULT_WEIGHT_NOISE;
      this.psfType=DEFAULT_PSF_TYPE;this.structureLayers=DEFAULT_STRUCTURE_LAYERS;
      this.sensitivity=DEFAULT_SENSITIVITY;this.upperLimit=DEFAULT_UPPER_LIMIT;this.maxStars=DEFAULT_MAX_STARS;
      this.groupByFilter=DEFAULT_GROUP_BY_FILTER;this.exportCSV=DEFAULT_EXPORT_CSV;
      this.csvFileName=DEFAULT_CSV_FILENAME;this.useNativeSS=DEFAULT_USE_NATIVE_SS;
      this.useCache=DEFAULT_USE_CACHE;
      this.overrideFocalLength=0;this.overridePixelSize=0;
   };
}

function SSPFrameResult( filePath )
{
   this.filePath=filePath;
   this.fileName=File.extractName(filePath)+File.extractExtension(filePath);
   this.fwhm=0;this.fwhmPx=0;this.eccentricity=0;this.snr=0;
   this.starResidual=0;this.starCount=0;this.noise=0;this.median=0;
   this.qualityScore=0;this.rejected=false;this.rejectionReasons=[];
   this.analysisOK=false;this.filter="";this.dateObs="";
   this.exposure=0;this.plateScale=0;
}