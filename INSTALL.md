\# Installation Guide - SubframeSelectorPro



\## Prerequisites



\- PixInsight 1.8.9-1 or later installed and licensed



\## Installation Steps



\### Step 1: Download the Script



\*\*Option A - Git Clone:\*\*

```bash

git clone https://github.com/Ft2801/SubframeSelectorPro.git

```



\*\*Option B - Direct Download:\*\*

1\. Go to https://github.com/Ft2801/SubframeSelectorPro

2\. Click the green \*\*Code\*\* button

3\. Select \*\*Download ZIP\*\*

4\. Extract the ZIP file



\### Step 2: Install in PixInsight



\#### Recommended Method (Feature Scripts)



1\. Open PixInsight

2\. Go to \*\*SCRIPT > Feature Scripts...\*\*

3\. Click the \*\*Add\*\* button

4\. Navigate to the `src/` folder inside the downloaded repository

5\. Click \*\*Select Folder\*\* (or equivalent on your OS)

6\. Click \*\*Done\*\*



The script will now appear under \*\*SCRIPT > Utilities > SubframeSelectorPro\*\*.



\#### Alternative Method (Direct Copy)



Copy all `.js` files from the `src/` folder to:



| OS | Path |

|----|------|

| Windows | `C:\\Program Files\\PixInsight\\src\\scripts\\SubframeSelectorPro\\` |

| macOS | `/Applications/PixInsight.app/Contents/Resources/src/scripts/SubframeSelectorPro/` |

| Linux | `/opt/PixInsight/src/scripts/SubframeSelectorPro/` |



Then register via SCRIPT > Feature Scripts > Add.



\### Step 3: Verify Installation



1\. Go to \*\*SCRIPT > Utilities\*\*

2\. You should see \*\*SubframeSelectorPro\*\* in the list

3\. Click it to open the dialog

4\. If the dialog opens successfully, installation is complete!



\## Updating



\### Via Git

```bash

cd SubframeSelectorPro

git pull

```

Then restart PixInsight.



\### Via Update Repository

If you added the update repository URL, PixInsight will notify you

of updates automatically via \*\*RESOURCES > Updates > Check for Updates\*\*.



\## Troubleshooting



\*\*Script doesn't appear in menu:\*\*

\- Verify the `.js` files are in the correct directory

\- Try SCRIPT > Feature Scripts > Add again

\- Restart PixInsight



\*\*"Feature script not found" error:\*\*

\- Make sure all four `.js` files are in the same directory

\- Check file permissions (read access required)



\*\*Analysis errors:\*\*

\- Ensure input images are valid FITS/XISF files

\- Try with calibrated (bias/dark/flat corrected) frames

\- Check the Process Console for detailed error messages

---

\## Support the Developer

If you find this script useful, please consider supporting the development:

\*\*[Buy me a coffee](https://buymeacoffee.com/fabiot2801z)\*\*

Your support helps keep the project active, well-maintained, and continuously improved. Thank you!

