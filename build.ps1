<#
.SYNOPSIS
    Build script for SubframeSelectorPro PixInsight Script.
.DESCRIPTION
    Zips the src/ directory, generates SHA1 hash, and updates the updates.xri file.
#>

$ErrorActionPreference = "Stop"
$Version = "1.0.0"
$ZipFileName = "SubframeSelectorPro-$Version.zip"

Write-Host "Building SubframeSelectorPro v$Version..."

# Create Zip
if (Test-Path $ZipFileName) {
    Remove-Item $ZipFileName -Force
}

Write-Host "Creating ZIP archive $ZipFileName..."
Compress-Archive -Path "src" -DestinationPath $ZipFileName -Force
Write-Host "Archive created successfully."

# Compute SHA1
Write-Host "Calculating SHA1 hash..."
$HashString = (Get-FileHash -Path $ZipFileName -Algorithm SHA1).Hash.ToLower()
Write-Host "SHA1: $HashString"

# Update XRI
$XriFile = "updates.xri"
Write-Host "Updating $XriFile with new SHA1..."
$xriContent = Get-Content $XriFile -Raw
$xriContent = $xriContent -replace 'sha1="([a-fA-F0-9]*)"', "sha1=`"$HashString`""
Set-Content -Path $XriFile -Value $xriContent -Encoding UTF8

Write-Host "Build complete! Ready for release."
