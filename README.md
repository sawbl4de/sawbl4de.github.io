# Portfolio - Prithu Paresh Das

Static, multi-page site. No build step.

## Pages
- `index.html` - landing + project cards
- `auxetics.html` · `sma.html` · `gearbox.html` · `scara1.html` · `scara2.html` · `sixdof.html`
- `style.css` - the whole theme (tokens in the `:root` block at the top)
- `viewer.js` - the interactive 3D viewer (STL + OBJ)

## Folders (drop your files here)
- `images/`   - photos & screenshots (.jpg / .png)
- `videos/`   - clips (.mp4)
- `models/`   - 3D models (.stl single parts, .obj assemblies)
- `drawings/` - drawing exports (.pdf / .png to show) + source (.dwg)
- `assets/`   - bundled samples (sample-gear.stl, sample-assembly.obj)

## IMPORTANT - preview locally with a server
The 3D viewers will NOT work if you just double-click an HTML file (browsers block
the viewer code over file://). Photos/videos do show, but to test models:
1. open a terminal in this folder
2. run:  `python3 -m http.server 8000`
3. visit http://localhost:8000 - everything works, exactly as when deployed.

## Adding a photo
Put it in `images/` (lowercase, no spaces). In the page, find the placeholder
`<div class="ph">images/aux-sample-1.jpg</div>` and replace with
`<img src="images/aux-sample-1.jpg" alt="describe it">`. Filename + case must match.

## Adding a video
Keep it small (<25 MB; GitHub caps single files at 100 MB). Put in `videos/`, then:
```html
<video controls preload="metadata"><source src="videos/clip.mp4" type="video/mp4"></video>
```
Long video → upload unlisted to YouTube and embed an <iframe> instead.

## Adding a single 3D part (STL)
Fusion: right-click body → Save As Mesh → STL (medium refinement, keep <10 MB).
Save in `models/`, then set the viewer source, e.g.
`<div class="stl-viewer" data-src="models/holder.stl"></div>`.
On the auxetics page the 5 models live in a dropdown - save them as
`models/aux-1.stl … aux-5.stl` (the dropdown values already point there).

## Adding the gearbox ASSEMBLY (OBJ - shows components)
STL flattens an assembly into one mesh, so for the gearbox use OBJ, which keeps the
separate components. In Fusion: Export → **OBJ Files (*.obj)** on the top-level
assembly. Save as `models/gearbox.obj`, then on `gearbox.html` change
`data-src="assets/sample-assembly.obj"` to `data-src="models/gearbox.obj"`.
The viewer auto-colours each component and lists them with on/off checkboxes.
(Tip: name your components clearly in Fusion - those names show in the checklist.)

## Adding drawings (DWG)
Browsers can't render raw .dwg. For each drawing: export a **PDF or PNG**
(AutoCAD: Plot → "DWG To PDF") into `drawings/`, show it on the page (swap the
placeholder for an `<img>` or `<iframe>`), and keep the `.dwg` as the download link.

## Add / remove sections
Each section is wrapped in `<!-- SECTION: ... -->` comments. Delete a whole
`<section>...</section>` to drop it, or copy one to add another.

## Deploy free (GitHub Pages)
1. Create a **public** repo `sawbl4de.github.io`.
2. Upload everything, keeping the folder structure (or use git):
   ```
   git init && git add . && git commit -m "portfolio"
   git branch -M main
   git remote add origin https://github.com/sawbl4de/sawbl4de.github.io.git
   git push -u origin main
   ```
3. Settings → Pages → Source: Deploy from a branch, `main`, `/ (root)`.
4. Live at https://sawbl4de.github.io in ~1 min - that's your CV URL.
