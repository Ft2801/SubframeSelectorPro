// ****************************************************************************
// SubframeSelectorPro-engine.js - Analysis Engine
// ****************************************************************************
//
// Copyright (c) 2026 Fabio Tempera (Ft2801)
// Released under the MIT License.
//
// Features:
//   - Native SubframeSelector process backend for accurate PSF metrics
//   - Fallback to StarDetector when native SS unavailable
//   - Analysis cache (JSON) with file hash invalidation
//   - Progress dialog with cancel support
//   - Batch processing for optimized I/O
//   - All previous features (3 modes, filters, CSV, restore, dry run)
// ****************************************************************************

function SSPEngine( params )
{
   this.params = params;

   // ========================================================================
   // collectFiles()
   // ========================================================================
   this.collectFiles = function()
   {
      var dir = this.params.inputDirectory;
      if ( !dir.length ) throw new Error( _T("MSG_NO_DIR") );
      if ( !File.directoryExists(dir) ) throw new Error( _T("MSG_DIR_NOT_FOUND") + " " + dir );
      if ( !dir.endsWith("/") && !dir.endsWith("\\") ) dir += "/";

      var ext = [".fit",".fits",".fts",".xisf",".tif",".tiff",
                 ".cr2",".cr3",".nef",".arw",".orf",".rw2",".dng",".png"];
      var all = [];
      var sr = searchDirectory( dir+"*", false );
      for ( var i=0; i<sr.length; ++i )
      {
         var e = File.extractExtension(sr[i]).toLowerCase();
         for ( var j=0; j<ext.length; ++j )
            if ( e===ext[j] ) { all.push(sr[i]); break; }
      }
      if ( !all.length ) throw new Error( "No supported image files found in: " + dir );
      all.sort();
      return all;
   };

   // ========================================================================
   // getFileSignature() — For cache invalidation
   // ========================================================================
   this.getFileSignature = function( filePath )
   {
      try
      {
         var info = File.getInfo( filePath );
         // Combine file size + last modified time as signature
         return info.size.toString() + "_" + info.lastModified.getTime().toString();
      }
      catch (e)
      {
         return "unknown";
      }
   };

   // ========================================================================
   // loadCache() — Load cached analysis results
   // ========================================================================
   this.loadCache = function()
   {
      var dir = this.params.inputDirectory;
      if ( !dir.endsWith("/") && !dir.endsWith("\\") ) dir += "/";
      var cachePath = dir + SSP_CACHE_FILE;

      if ( !File.exists(cachePath) ) return null;

      try
      {
         var f = new File();
         f.openForReading( cachePath );
         var content = f.read( DataType_ByteArray, f.size );
         f.close();
         var data = JSON.parse( content.toString() );

         // Validate cache version
         if ( !data.version || data.version !== VERSION )
            return null;

         // Validate PSF settings match (if PSF params changed, cache is invalid)
         if ( data.psfType !== this.params.psfType ||
              data.structureLayers !== this.params.structureLayers ||
              data.sensitivity !== this.params.sensitivity ||
              data.maxStars !== this.params.maxStars ||
              data.useNativeSS !== this.params.useNativeSS )
            return null;

         return data;
      }
      catch (e)
      {
         return null;
      }
   };

   // ========================================================================
   // saveCache() — Persist analysis results
   // ========================================================================
   this.saveCache = function( results )
   {
      var dir = this.params.inputDirectory;
      if ( !dir.endsWith("/") && !dir.endsWith("\\") ) dir += "/";
      var cachePath = dir + SSP_CACHE_FILE;

      var cacheEntries = {};
      for ( var i = 0; i < results.length; ++i )
      {
         var r = results[i];
         if ( !r.analysisOK ) continue;
         cacheEntries[r.filePath] = {
            signature: this.getFileSignature( r.filePath ),
            fwhm: r.fwhm,
            fwhmPx: r.fwhmPx,
            eccentricity: r.eccentricity,
            snr: r.snr,
            starResidual: r.starResidual,
            starCount: r.starCount,
            noise: r.noise,
            median: r.median,
            filter: r.filter,
            dateObs: r.dateObs,
            exposure: r.exposure,
            plateScale: r.plateScale
         };
      }

      var cacheData = {
         version: VERSION,
         timestamp: (new Date()).toISOString(),
         psfType: this.params.psfType,
         structureLayers: this.params.structureLayers,
         sensitivity: this.params.sensitivity,
         maxStars: this.params.maxStars,
         useNativeSS: this.params.useNativeSS,
         entries: cacheEntries
      };

      try
      {
         var jsonStr = JSON.stringify( cacheData, null, 2 );
         var f = new File();
         f.createForWriting( cachePath );
         f.write( ByteArray.stringToUTF8( jsonStr ) );
         f.close();
         Console.writeln( "  Cache saved: " + cachePath );
      }
      catch (e)
      {
         Console.warningln( "  ** Failed to save cache: " + e.message );
      }
   };

   // ========================================================================
   // restoreFromCache() — Check if a frame has valid cached results
   // ========================================================================
   this.restoreFromCache = function( filePath, cacheData )
   {
      if ( !cacheData || !cacheData.entries ) return null;
      var entry = cacheData.entries[filePath];
      if ( !entry ) return null;

      // Validate signature
      var currentSig = this.getFileSignature( filePath );
      if ( currentSig !== entry.signature ) return null;

      // Reconstruct SSPFrameResult from cache
      var r = new SSPFrameResult( filePath );
      r.fwhm = entry.fwhm;
      r.fwhmPx = entry.fwhmPx;
      r.eccentricity = entry.eccentricity;
      r.snr = entry.snr;
      r.starResidual = entry.starResidual;
      r.starCount = entry.starCount;
      r.noise = entry.noise;
      r.median = entry.median;
      r.filter = entry.filter;
      r.dateObs = entry.dateObs;
      r.exposure = entry.exposure;
      r.plateScale = entry.plateScale;
      r.analysisOK = true;

      return r;
   };

   // ========================================================================
   // analyzeFrameNative() — Use SubframeSelector process for PSF analysis
   // ========================================================================
   this.analyzeFrameNative = function( filePath, result )
   {
      try
      {
         // Create a SubframeSelector instance
         var SS = new SubframeSelector();

         // Configure SubframeSelector
         SS.routine = SubframeSelector.prototype.MeasureSubframes;
         SS.nonInteractive = true;

         // Set PSF parameters
         switch ( this.params.psfType )
         {
         case 0: SS.psfType = SubframeSelector.prototype.PSF_Gaussian; break;
         case 1: SS.psfType = SubframeSelector.prototype.PSF_Moffat4; break;
         case 2: SS.psfType = SubframeSelector.prototype.PSF_Moffat6; break;
         case 3: SS.psfType = SubframeSelector.prototype.PSF_Moffat8; break;
         }

         SS.structureLayers = this.params.structureLayers;
         SS.starSensitivity = this.params.sensitivity;
         SS.upperLimit = this.params.upperLimit;
         SS.maxStarDistortion = 0.6;
         SS.maxStars = this.params.maxStars;

         // Set the subframe
         SS.subframes = [[true, filePath]];

         // Execute measurement
         SS.executeGlobal();

         // Extract measurements from the process
         if ( SS.measurements && SS.measurements.length > 0 )
         {
            var m = SS.measurements[0];
            result.fwhmPx       = m.fwhm || 0;
            result.eccentricity = m.eccentricity || 0;
            result.snr          = m.snrWeight || m.snr || 0;
            result.starResidual = m.starResidual || 0;
            result.starCount    = m.stars || 0;
            result.noise        = m.noise || 0;
            result.median       = m.median || 0;
            result.fwhm         = result.fwhmPx;

            // Apply plate scale if available from SS
            if ( m.fwhmMeanDeviation !== undefined && m.fwhm > 0 )
            {
               // SS reports FWHM in arcsec when plate scale is known
               result.fwhm = m.fwhm;
            }

            result.analysisOK = true;
            return true;
         }
      }
      catch ( e )
      {
         // SubframeSelector not available or failed — fall back
         Console.noteln( "  Native SS failed for " + result.fileName +
            ": " + e.message + " — using fallback." );
      }

      return false;
   };

   // ========================================================================
   // analyzeFrameFallback() — StarDetector-based analysis (original method)
   // ========================================================================
   this.analyzeFrameFallback = function( filePath, result )
   {
      var window = null;
      try
      {
         var fileWindow = ImageWindow.open( filePath );
         if ( fileWindow.length === 0 )
            throw new Error( "Failed to open: " + filePath );

         window = fileWindow[0];
         var view = window.mainView;
         var image = view.image;

         // Statistics
         var stats = new ImageStatistics();
         stats.medianEnabled = true;
         stats.noiseEnabled = true;
         view.beginProcess();
         stats.generate( image );
         view.endProcess();

         result.median = stats.median;
         result.noise = stats.noise;
         result.snr = (result.noise > 0) ? result.median / result.noise : 9999;

         // Star detection
         var sd = new StarDetector();
         sd.structureLayers = this.params.structureLayers;
         sd.sensitivity = this.params.sensitivity;
         sd.upperLimit = this.params.upperLimit;

         var stars = sd.stars( image );
         result.starCount = stars.length;

         if ( stars.length > 0 )
         {
            var fS=0,eS=0,rS=0,vP=0;
            var maxS = Math.min(stars.length, this.params.maxStars);
            stars.sort(function(a,b){return b.flux-a.flux;});
            for ( var si=0; si<maxS; ++si )
            {
               var s = stars[si];
               if ( s.size > 0 )
               {
                  fS += s.size;
                  var dx=s.rect.x1-s.rect.x0, dy=s.rect.y1-s.rect.y0;
                  var a=Math.max(dx,dy)/2, b=Math.min(dx,dy)/2;
                  eS += (a>0) ? Math.sqrt(1-(b*b)/(a*a)) : 0;
                  rS += (s.nmax!==undefined) ? s.nmax : 0;
                  vP++;
               }
            }
            if (vP>0) { result.fwhmPx=fS/vP; result.fwhm=result.fwhmPx; result.eccentricity=eS/vP; result.starResidual=rS/vP; }
         }

         // Noise estimation
         try { var n=image.noiseMRS(); if(n&&n.length>=2&&n[0]>0){result.noise=n[0];if(result.median>0)result.snr=result.median/result.noise;} } catch(e){}

         result.analysisOK = true;
         window.forceClose();
      }
      catch ( error )
      {
         try { if (window) window.forceClose(); } catch(e){}
         throw error;
      }
   };

   // ========================================================================
   // analyzeFrame() — Main analysis dispatcher
   // ========================================================================
   this.analyzeFrame = function( filePath )
   {
      var result = new SSPFrameResult( filePath );

      try
      {
         // Extract FITS keywords first (need filter info regardless of method)
         this.extractKeywords( filePath, result );

         // Try native SubframeSelector first if enabled
         var analyzed = false;
         if ( this.params.useNativeSS )
            analyzed = this.analyzeFrameNative( filePath, result );

         // Fallback to StarDetector
         if ( !analyzed )
            this.analyzeFrameFallback( filePath, result );

         // Apply plate scale conversion if not already done
         if ( result.fwhm === result.fwhmPx && result.fwhmPx > 0 )
         {
            var fl = this.params.overrideFocalLength;
            var ps = this.params.overridePixelSize;

            if ( result.plateScale > 0 )
               result.fwhm = result.fwhmPx * result.plateScale;
            else if ( fl > 0 && ps > 0 )
            {
               result.plateScale = 206.265 * ps / fl;
               result.fwhm = result.fwhmPx * result.plateScale;
            }
         }
      }
      catch ( error )
      {
         Console.warningln( "  ** Error: " + result.fileName + ": " + error.message );
         result.rejected = true;
         result.rejectionReasons.push( "Analysis failed: " + error.message );
      }

      return result;
   };

   // ========================================================================
   // extractKeywords() — Read FITS keywords without full image load
   // ========================================================================
   this.extractKeywords = function( filePath, result )
   {
      try
      {
         // Use FileFormatInstance for lightweight keyword reading
         var ext = File.extractExtension(filePath).toLowerCase();
         var fmt;
         if ( ext === ".xisf" )
            fmt = new FileFormat("XISF", true, false);
         else if ( ext === ".fit" || ext === ".fits" || ext === ".fts" )
            fmt = new FileFormat("FITS", true, false);
         else
            return; // Other formats: keywords read during full open

         var ffi = new FileFormatInstance(fmt);
         if ( !ffi.open(filePath, "verbosity 0") )
         {
            ffi.close();
            return;
         }

         var keywords = ffi.keywords;
         var fl = this.params.overrideFocalLength;
         var ps = this.params.overridePixelSize;

         for ( var i = 0; i < keywords.length; ++i )
         {
            var kw = keywords[i];
            var name = kw.name.trim().toUpperCase();
            var val = kw.value.trim().replace(/'/g,"");

            if ( name === "FILTER" )
               result.filter = val;
            else if ( name === "DATE-OBS" )
               result.dateObs = val;
            else if ( name === "EXPTIME" || name === "EXPOSURE" )
               result.exposure = parseFloat(val) || 0;
            else if ( name === "FOCALLEN" && fl <= 0 )
               fl = parseFloat(val) || 0;
            else if ( (name === "XPIXSZ" || name === "PIXSIZE1") && ps <= 0 )
               ps = parseFloat(val) || 0;
            else if ( name === "CDELT1" )
               result.plateScale = Math.abs(parseFloat(val)||0) * 3600;
         }

         // Store plate scale from keywords
         if ( result.plateScale <= 0 && fl > 0 && ps > 0 )
            result.plateScale = 206.265 * ps / fl;

         ffi.close();
      }
      catch (e)
      {
         // Keyword extraction is optional; continue silently
      }
   };

   // ========================================================================
   // Rejection methods (same as before — threshold, percentage, sigma)
   // ========================================================================

   this.applyThresholdRejection = function( rs )
   {
      for ( var i=0; i<rs.length; ++i )
      {
         var r=rs[i]; if(!r.analysisOK) continue;
         if(this.params.useFWHM){
            if(r.fwhm>this.params.fwhmMax){r.rejected=true;r.rejectionReasons.push(format("FWHM %.2f > %.2f",r.fwhm,this.params.fwhmMax));}
            if(r.fwhm<this.params.fwhmMin){r.rejected=true;r.rejectionReasons.push(format("FWHM %.2f < %.2f",r.fwhm,this.params.fwhmMin));}
         }
         if(this.params.useEccentricity&&r.eccentricity>this.params.eccentricityMax)
            {r.rejected=true;r.rejectionReasons.push(format("Ecc %.3f > %.3f",r.eccentricity,this.params.eccentricityMax));}
         if(this.params.useSNR&&r.snr<this.params.snrMin)
            {r.rejected=true;r.rejectionReasons.push(format("SNR %.1f < %.1f",r.snr,this.params.snrMin));}
         if(this.params.useStarResidual&&r.starResidual>this.params.starResidualMax)
            {r.rejected=true;r.rejectionReasons.push(format("Residual %.4f > %.4f",r.starResidual,this.params.starResidualMax));}
         if(this.params.useStars&&r.starCount<this.params.starsMin)
            {r.rejected=true;r.rejectionReasons.push(format("Stars %d < %d",r.starCount,this.params.starsMin));}
         if(this.params.useNoise&&r.noise>this.params.noiseMax)
            {r.rejected=true;r.rejectionReasons.push(format("Noise %.6f > %.6f",r.noise,this.params.noiseMax));}
         if(this.params.useMedian){
            if(r.median<this.params.medianMin){r.rejected=true;r.rejectionReasons.push(format("Median %.4f < %.4f",r.median,this.params.medianMin));}
            if(r.median>this.params.medianMax){r.rejected=true;r.rejectionReasons.push(format("Median %.4f > %.4f",r.median,this.params.medianMax));}
         }
      }
   };

   this.applyPercentageRejection = function( rs )
   {
      var v=[]; for(var i=0;i<rs.length;++i) if(rs[i].analysisOK) v.push(rs[i]);
      if(!v.length) return;
      this._computeQualityScores(v);
      v.sort(function(a,b){return b.qualityScore-a.qualityScore;});
      var keep=Math.max(1,Math.min(v.length,Math.round(v.length*this.params.keepPercentage/100)));
      for(var i=keep;i<v.length;++i)
      {v[i].rejected=true;v[i].rejectionReasons.push(format("Score %.4f — below top %d%% (rank %d/%d)",v[i].qualityScore,this.params.keepPercentage,i+1,v.length));}
   };

   this.applySigmaRejection = function( rs )
   {
      var v=[]; for(var i=0;i<rs.length;++i) if(rs[i].analysisOK) v.push(rs[i]);
      if(v.length<3) return;
      var metrics={};
      if(this.params.sigmaUseFWHM) metrics.fwhm={values:[],hiw:true};
      if(this.params.sigmaUseEccentricity) metrics.eccentricity={values:[],hiw:true};
      if(this.params.sigmaUseSNR) metrics.snr={values:[],hiw:false};
      if(this.params.sigmaUseNoise) metrics.noise={values:[],hiw:true};
      if(this.params.sigmaUseStars) metrics.starCount={values:[],hiw:false};
      for(var i=0;i<v.length;++i) for(var k in metrics) if(metrics.hasOwnProperty(k)) metrics[k].values.push(v[i][k]);
      for(var k in metrics){if(!metrics.hasOwnProperty(k))continue;var m=metrics[k];m.mean=this._mean(m.values);m.stddev=this._stddev(m.values,m.mean);}
      var sL=this.params.sigmaLow, sH=this.params.sigmaHigh;
      for(var i=0;i<v.length;++i){var r=v[i];
         for(var k in metrics){if(!metrics.hasOwnProperty(k))continue;var m=metrics[k];if(m.stddev<=0)continue;
            var z=(r[k]-m.mean)/m.stddev;
            if(m.hiw){if(z>sH){r.rejected=true;r.rejectionReasons.push(format("%s: %.4f is %.1fσ above mean %.4f",k,r[k],z,m.mean));}
               if(z<-sL&&k==="fwhm"){r.rejected=true;r.rejectionReasons.push(format("%s: %.4f is %.1fσ below mean %.4f",k,r[k],Math.abs(z),m.mean));}}
            else{if(z<-sL){r.rejected=true;r.rejectionReasons.push(format("%s: %.4f is %.1fσ below mean %.4f",k,r[k],Math.abs(z),m.mean));}}
         }
      }
      Console.writeln("  Sigma Statistics:");
      for(var k in metrics){if(!metrics.hasOwnProperty(k))continue;var m=metrics[k];
         Console.writeln(format("    %-15s mean=%.4f σ=%.4f",k,m.mean,m.stddev));}
   };

   this.applyRejection = function()
   {
      var results=this.params.results;
      if(this.params.groupByFilter)
      {
         var groups=this.groupResultsByFilter(results);
         for(var key in groups){if(!groups.hasOwnProperty(key))continue;
            var dn=(key==="__NO_FILTER__")?"(no filter)":key;
            Console.writeln(format("\n  ── Filter: %s (%d frames) ──",dn,groups[key].length));
            switch(this.params.rejectionMode){
            case SSP_MODE_THRESHOLD:this.applyThresholdRejection(groups[key]);break;
            case SSP_MODE_PERCENTAGE:this.applyPercentageRejection(groups[key]);break;
            case SSP_MODE_SIGMA:this.applySigmaRejection(groups[key]);break;}
         }
      }
      else
      {
         switch(this.params.rejectionMode){
         case SSP_MODE_THRESHOLD:this.applyThresholdRejection(results);break;
         case SSP_MODE_PERCENTAGE:this.applyPercentageRejection(results);break;
         case SSP_MODE_SIGMA:this.applySigmaRejection(results);break;}
      }
   };

   this.groupResultsByFilter = function(results)
   {
      var g={};
      for(var i=0;i<results.length;++i){var k=results[i].filter.length>0?results[i].filter:"__NO_FILTER__";if(!g.hasOwnProperty(k))g[k]=[];g[k].push(results[i]);}
      return g;
   };

   // ========================================================================
   // moveRejectedFiles() + writeRestoreLog() + restoreRejectedFiles()
   // (Same as previous version — no changes needed)
   // ========================================================================

   this.moveRejectedFiles = function()
   {
      var dir=this.params.inputDirectory;
      if(!dir.endsWith("/")&&!dir.endsWith("\\")) dir+="/";
      var rejDir=dir+this.params.rejectedDirName+"/";
      if(!File.directoryExists(rejDir)){File.createDirectory(rejDir,true);Console.writeln("Created: "+rejDir);}
      var moved=0, restoreMap=[];
      for(var i=0;i<this.params.results.length;++i){
         if(!this.params.results[i].rejected)continue;
         var src=this.params.results[i].filePath, dst=rejDir+this.params.results[i].fileName;
         if(File.exists(dst)){var bn=File.extractName(dst),ex=File.extractExtension(dst),c=1;while(File.exists(dst)){dst=rejDir+bn+"_"+c+ex;c++;}}
         try{File.move(src,dst);restoreMap.push({original:src,moved:dst});moved++;}
         catch(e){try{File.copyFile(dst,src);File.remove(src);restoreMap.push({original:src,moved:dst});moved++;}catch(e2){Console.criticalln("** FAILED: "+e2.message);}}
      }
      if(restoreMap.length>0)this.writeRestoreLog(rejDir,restoreMap);
      return moved;
   };

   this.writeRestoreLog = function(rejDir,restoreMap)
   {
      var logPath=rejDir+SSP_RESTORE_LOG;
      var existing=[];
      if(File.exists(logPath)){try{var f=new File();f.openForReading(logPath);var c=f.read(DataType_ByteArray,f.size);f.close();existing=JSON.parse(c.toString()).entries||[];}catch(e){}}
      var merged=existing.concat(restoreMap);
      var data={scriptName:TITLE,scriptVersion:VERSION,timestamp:(new Date()).toISOString(),entries:merged};
      try{var f=new File();f.createForWriting(logPath);f.write(ByteArray.stringToUTF8(JSON.stringify(data,null,2)));f.close();}catch(e){}
   };

   this.restoreRejectedFiles = function()
   {
      var dir=this.params.inputDirectory;
      if(!dir.endsWith("/")&&!dir.endsWith("\\"))dir+="/";
      var rejDir=dir+this.params.rejectedDirName+"/";
      var logPath=rejDir+SSP_RESTORE_LOG;
      if(!File.exists(logPath)){Console.warningln(_T("MSG_NO_RESTORE_LOG"));return 0;}
      var data;try{var f=new File();f.openForReading(logPath);var c=f.read(DataType_ByteArray,f.size);f.close();data=JSON.parse(c.toString());}catch(e){return 0;}
      var entries=data.entries||[], count=0;
      for(var i=0;i<entries.length;++i){
         if(!File.exists(entries[i].moved))continue;
         try{File.move(entries[i].moved,entries[i].original);count++;}
         catch(e){try{File.copyFile(entries[i].original,entries[i].moved);File.remove(entries[i].moved);count++;}catch(e2){}}
      }
      if(count===entries.length){try{File.remove(logPath);var rem=searchDirectory(rejDir+"*",false);if(!rem.length)File.removeDirectory(rejDir);}catch(e){}}
      return count;
   };

   // ========================================================================
   // exportCSV()
   // ========================================================================
   this.exportCSV = function()
   {
      var dir=this.params.inputDirectory;
      if(!dir.endsWith("/")&&!dir.endsWith("\\"))dir+="/";
      var csvPath=dir+this.params.csvFileName;
      try{
         var lines=[];
         lines.push("File,Filter,DateObs,Exposure,FWHM_px,FWHM_arcsec,Eccentricity,SNR,StarResidual,StarCount,Noise,Median,PlateScale,QualityScore,Status,RejectionReasons");
         for(var i=0;i<this.params.results.length;++i){
            var r=this.params.results[i];
            var st=!r.analysisOK?"FAILED":(r.rejected?"REJECTED":"ACCEPTED");
            var rs=r.rejectionReasons.join("; ").replace(/,/g,";");
            lines.push(['"'+r.fileName+'"','"'+r.filter+'"','"'+r.dateObs+'"',r.exposure.toFixed(1),
               r.fwhmPx.toFixed(3),r.fwhm.toFixed(3),r.eccentricity.toFixed(4),r.snr.toFixed(2),
               r.starResidual.toFixed(5),r.starCount,r.noise.toFixed(7),r.median.toFixed(5),
               r.plateScale.toFixed(4),r.qualityScore.toFixed(5),st,'"'+rs+'"'].join(","));
         }
         var f=new File();f.createForWriting(csvPath);f.write(ByteArray.stringToUTF8(lines.join("\n")+"\n"));f.close();
         Console.writeln("CSV report saved: "+csvPath);
      }catch(e){Console.warningln("** CSV export failed: "+e.message);}
   };

   // ========================================================================
   // printReport()
   // ========================================================================
   this.printReport = function()
   {
      var results=this.params.results;
      var acc=0,rej=0,fail=0;
      Console.writeln("\n================================================================");
      Console.writeln("                    "+_T("RPT_TITLE"));
      Console.writeln("================================================================\n");
      Console.writeln(format("%-36s %6s %7s %5s %7s %5s %8s %6s %7s %s","File","Filter","FWHM","Ecc","SNR","Stars","Noise","Median","Score","Status"));
      Console.writeln(new Array(120).join("-"));
      for(var i=0;i<results.length;++i){
         var r=results[i];var st;
         if(!r.analysisOK){st="FAILED";fail++;}else if(r.rejected){st="REJECTED";rej++;}else{st="OK";acc++;}
         var fn=r.filter.length>0?r.filter.substring(0,6):"-";
         Console.writeln(format("%-36s %6s %7.2f %5.3f %7.1f %5d %8.6f %6.4f %7.4f %s",r.fileName.substring(0,36),fn,r.fwhm,r.eccentricity,r.snr,r.starCount,r.noise,r.median,r.qualityScore,st));
         for(var j=0;j<r.rejectionReasons.length;++j)Console.writeln("    → "+r.rejectionReasons[j]);
      }
      Console.writeln("\n================================================================");
      Console.writeln(format("%s %d",_T("RPT_TOTAL"),results.length));
      Console.writeln(format("%s %d",_T("RPT_ACCEPTED"),acc));
      Console.writeln(format("%s %d",_T("RPT_REJECTED"),rej));
      if(fail>0)Console.writeln(format("%s %d",_T("RPT_FAILED"),fail));
      Console.writeln(format("%s %.1f%%",_T("RPT_REJECTION_RATE"),results.length>0?(rej+fail)*100.0/results.length:0));
      if(this.params.groupByFilter){var g=this.groupResultsByFilter(results);Console.writeln("\n  Per-filter summary:");
         for(var k in g){if(!g.hasOwnProperty(k))continue;var dn=(k==="__NO_FILTER__")?"(no filter)":k;var ga=0,gr=0;
            for(var i=0;i<g[k].length;++i){if(g[k][i].rejected||!g[k][i].analysisOK)gr++;else ga++;}
            Console.writeln(format("    %-12s total=%d accepted=%d rejected=%d",dn,g[k].length,ga,gr));}}
      Console.writeln("================================================================");
   };

   // ========================================================================
   // run() — Main execution with progress dialog and caching
   // ========================================================================
   this.run = function()
   {
      var startTime = new Date();
      var isDryRun = (this.params.operationMode === SSP_OP_DRYRUN);

      Console.writeln("\nInput directory:  " + this.params.inputDirectory);
      Console.writeln("Rejection mode:   " + this._modeName());
      Console.writeln("Operation:        " + (isDryRun ? "DRY RUN" : "Execute"));
      Console.writeln("Group by filter:  " + (this.params.groupByFilter ? "Yes" : "No"));
      Console.writeln("PSF backend:      " + (this.params.useNativeSS ? "Native SubframeSelector" : "StarDetector (fallback)"));
      Console.writeln("Analysis cache:   " + (this.params.useCache ? "Enabled" : "Disabled"));
      Console.writeln("");

      // ── Collect files ──
      Console.writeln("Scanning for image files...");
      var files = this.collectFiles();
      Console.writeln(format("Found %d image files.", files.length));

      // ── Load cache ──
      var cacheData = null;
      var cacheHits = 0;
      if ( this.params.useCache )
      {
         cacheData = this.loadCache();
         if ( cacheData )
            Console.writeln("Cache loaded from previous run.");
      }

      // ── Analyze with progress ──
      this.params.results = [];
      var filesToAnalyze = [];
      var cachedResults = [];

      // First pass: check cache
      for ( var i = 0; i < files.length; ++i )
      {
         var cached = null;
         if ( cacheData )
            cached = this.restoreFromCache( files[i], cacheData );

         if ( cached )
         {
            cachedResults.push( { index: i, result: cached } );
            cacheHits++;
         }
         else
         {
            filesToAnalyze.push( { index: i, path: files[i] } );
         }
      }

      if ( cacheHits > 0 )
         Console.writeln( _TF("PROGRESS_CACHE_HIT", cacheHits) );

      Console.writeln(format("Frames to analyze: %d (cached: %d)", filesToAnalyze.length, cacheHits));
      Console.writeln("────────────────────────────────────────────────────────────────");

      // Initialize results array with placeholders
      for ( var i = 0; i < files.length; ++i )
         this.params.results.push( null );

      // Insert cached results
      for ( var i = 0; i < cachedResults.length; ++i )
      {
         this.params.results[cachedResults[i].index] = cachedResults[i].result;
         Console.writeln( format("[%d/%d] (cached) %s",
            cachedResults[i].index + 1, files.length,
            cachedResults[i].result.fileName) );
      }

      // Analyze remaining frames with progress
      if ( filesToAnalyze.length > 0 )
      {
         // ── Batch processing optimization ──
         // For native SS: we can submit multiple files at once
         if ( this.params.useNativeSS && filesToAnalyze.length > 1 )
         {
            var batchAnalyzed = this.batchAnalyzeNative( filesToAnalyze, files.length );

            // Any files that failed batch: analyze individually
            for ( var i = 0; i < filesToAnalyze.length; ++i )
            {
               var idx = filesToAnalyze[i].index;
               if ( this.params.results[idx] === null )
               {
                  Console.writeln( format("[%d/%d] (individual)", idx+1, files.length) );
                  var r = this.analyzeFrame( filesToAnalyze[i].path );
                  this.params.results[idx] = r;
               }
               processEvents();
               if ( Console.abortRequested ) throw new Error("Aborted by user.");
            }
         }
         else
         {
            // Sequential analysis
            for ( var i = 0; i < filesToAnalyze.length; ++i )
            {
               var idx = filesToAnalyze[i].index;
               Console.writeln( format("[%d/%d] %s",
                  idx + 1, files.length,
                  _TF("PROGRESS_FRAME", File.extractName(filesToAnalyze[i].path))) );

               var r = this.analyzeFrame( filesToAnalyze[i].path );
               this.params.results[idx] = r;

               processEvents();
               if ( Console.abortRequested ) throw new Error("Aborted by user.");
            }
         }
      }

      Console.writeln("────────────────────────────────────────────────────────────────");
      Console.writeln("Analysis complete.");

      // ── Save cache ──
      if ( this.params.useCache )
         this.saveCache( this.params.results );

      // ── Compute quality scores for all ──
      var validAll=[]; for(var i=0;i<this.params.results.length;++i) if(this.params.results[i]&&this.params.results[i].analysisOK)validAll.push(this.params.results[i]);
      if(validAll.length>0) this._computeQualityScores(validAll);

      // ── Apply rejection ──
      Console.writeln("\nApplying rejection criteria...");
      this.applyRejection();

      // ── Report ──
      this.printReport();

      // ── CSV ──
      if(this.params.exportCSV) this.exportCSV();

      // ── Move / Dry Run ──
      var rejCount=0; for(var i=0;i<this.params.results.length;++i) if(this.params.results[i]&&this.params.results[i].rejected) rejCount++;
      if(rejCount>0){
         if(isDryRun){Console.writeln("\n"+_TF("RPT_DRY_RUN_WOULD",rejCount,this.params.rejectedDirName));Console.writeln("No files were modified.");}
         else{Console.writeln(format("\n"+_T("PROGRESS_MOVING")+" %d frame(s)...",rejCount));var mv=this.moveRejectedFiles();Console.writeln(format("Moved %d file(s).",mv));}
      }else{Console.writeln("\n"+_T("RPT_NO_REJECTION"));}

      Console.writeln(format("\nTotal time: %.1f seconds.",(new Date()-startTime)/1000));
   };

   // ========================================================================
   // batchAnalyzeNative() — Submit multiple files to SubframeSelector at once
   // ========================================================================
   this.batchAnalyzeNative = function( filesToAnalyze, totalFiles )
   {
      Console.writeln("  Batch analysis via native SubframeSelector...");

      try
      {
         var SS = new SubframeSelector();
         SS.routine = SubframeSelector.prototype.MeasureSubframes;
         SS.nonInteractive = true;

         switch(this.params.psfType){
         case 0: SS.psfType=SubframeSelector.prototype.PSF_Gaussian;break;
         case 1: SS.psfType=SubframeSelector.prototype.PSF_Moffat4;break;
         case 2: SS.psfType=SubframeSelector.prototype.PSF_Moffat6;break;
         case 3: SS.psfType=SubframeSelector.prototype.PSF_Moffat8;break;
         }

         SS.structureLayers = this.params.structureLayers;
         SS.starSensitivity = this.params.sensitivity;
         SS.upperLimit = this.params.upperLimit;
         SS.maxStars = this.params.maxStars;

         // Build subframes array
         var subframes = [];
         for ( var i = 0; i < filesToAnalyze.length; ++i )
            subframes.push( [true, filesToAnalyze[i].path] );
         SS.subframes = subframes;

         // Execute batch measurement
         SS.executeGlobal();

         // Extract results
         if ( SS.measurements && SS.measurements.length > 0 )
         {
            for ( var i = 0; i < SS.measurements.length && i < filesToAnalyze.length; ++i )
            {
               var m = SS.measurements[i];
               var idx = filesToAnalyze[i].index;
               var r = new SSPFrameResult( filesToAnalyze[i].path );

               // Extract keywords
               this.extractKeywords( filesToAnalyze[i].path, r );

               r.fwhmPx       = m.fwhm || 0;
               r.fwhm         = r.fwhmPx;
               r.eccentricity = m.eccentricity || 0;
               r.snr          = m.snrWeight || m.snr || 0;
               r.starResidual = m.starResidual || 0;
               r.starCount    = m.stars || 0;
               r.noise        = m.noise || 0;
               r.median       = m.median || 0;

               // Plate scale
               if ( r.plateScale > 0 && r.fwhmPx > 0 )
                  r.fwhm = r.fwhmPx * r.plateScale;
               else if ( this.params.overrideFocalLength > 0 && this.params.overridePixelSize > 0 && r.fwhmPx > 0 )
               {
                  r.plateScale = 206.265 * this.params.overridePixelSize / this.params.overrideFocalLength;
                  r.fwhm = r.fwhmPx * r.plateScale;
               }

               r.analysisOK = true;
               this.params.results[idx] = r;

               Console.writeln(format("[%d/%d] (batch) %s", idx+1, totalFiles, r.fileName));
               processEvents();
            }

            Console.writeln(format("  Batch complete: %d frames processed.", SS.measurements.length));
            return true;
         }
      }
      catch ( e )
      {
         Console.warningln("  Batch analysis failed: " + e.message + " — falling back to individual analysis.");
      }

      return false;
   };

   // ========================================================================
   // Utility methods
   // ========================================================================

   this._modeName = function()
   {
      switch(this.params.rejectionMode){
      case SSP_MODE_THRESHOLD:return _T("MODE_THRESHOLD");
      case SSP_MODE_PERCENTAGE:return _T("MODE_PERCENTAGE")+" ("+this.params.keepPercentage+"%)";
      case SSP_MODE_SIGMA:return format(_T("MODE_SIGMA")+" (σL=%.1f σH=%.1f)",this.params.sigmaLow,this.params.sigmaHigh);
      default:return "Unknown";}
   };

   this._computeQualityScores = function(v)
   {
      if(!v.length) return;
      var fa=[],ea=[],sa=[],na=[],ta=[];
      for(var i=0;i<v.length;++i){fa.push(v[i].fwhm);ea.push(v[i].eccentricity);sa.push(v[i].snr);na.push(v[i].noise);ta.push(v[i].starCount);}
      var fr=this._range(fa),er=this._range(ea),sr=this._range(sa),nr=this._range(na),tr=this._range(ta);
      var tw=this.params.weightFWHM+this.params.weightEccentricity+this.params.weightSNR+this.params.weightStars+this.params.weightNoise;
      if(tw<=0)tw=100;
      for(var i=0;i<v.length;++i){var r=v[i];
         r.qualityScore=(
            (1-this._normalize(r.fwhm,fr))*this.params.weightFWHM+
            (1-this._normalize(r.eccentricity,er))*this.params.weightEccentricity+
            this._normalize(r.snr,sr)*this.params.weightSNR+
            this._normalize(r.starCount,tr)*this.params.weightStars+
            (1-this._normalize(r.noise,nr))*this.params.weightNoise)/tw;}
   };

   this._range=function(a){if(!a.length)return{min:0,max:1};var mn=a[0],mx=a[0];for(var i=1;i<a.length;++i){if(a[i]<mn)mn=a[i];if(a[i]>mx)mx=a[i];}return{min:mn,max:mx};};
   this._normalize=function(v,r){var s=r.max-r.min;if(s<=0)return 0.5;return Math.max(0,Math.min(1,(v-r.min)/s));};
   this._mean=function(a){if(!a.length)return 0;var s=0;for(var i=0;i<a.length;++i)s+=a[i];return s/a.length;};
   this._stddev=function(a,m){if(a.length<2)return 0;var s=0;for(var i=0;i<a.length;++i){var d=a[i]-m;s+=d*d;}return Math.sqrt(s/(a.length-1));};
}