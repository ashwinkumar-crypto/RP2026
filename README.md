# The Engagement Journey

A scroll-controlled, cinematic 3D engagement invitation (React + Vite + Three.js / React Three Fiber + GSAP ScrollTrigger + Framer Motion + Tailwind).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

## Customise (no animation code to touch)

Edit **`src/config/wedding.js`**: names, date, time, venue, Google Maps link, family names, invitation message,
schedule, captions, couple photo and music. Titles, details and the Maps / Add-to-Calendar
buttons all read from this file.

- Music: drop an mp3 in `public/audio/` and set `music.src: '/audio/wedding.mp3'`. If empty, a generated raga-style ambience plays.
- Couple photo: put it in `public/photos/` and set `photos.couple`.
- Maps: leave `venue.mapsUrl` empty for an automatic search link, or paste your own share link.

## Export the venue as a .glb

Run the site, then open it with `?export` at the end of the URL (e.g. http://localhost:5173/?export) and use the
**Export GLB** button (bottom-left). It downloads `wedding-venue.glb`, the whole palace, hall and stage, for use in Blender or any glTF viewer.

## Realism

The 3D scene uses physically-based materials (procedural veined marble, plaster and woven-carpet normal/roughness maps),
a real HDRI for reflections (`public/hdri/lobby.exr`), soft shadows, ambient occlusion, bloom and film grain.
For true photorealism, drop real models into `public/models/` and set `models.couple` in `src/config/wedding.js`
(a `.glb` of the couple, facing +Z). The same approach works for any scene component: replace it with a `useGLTF` model.

## Two experiences

`experience` in `src/config/wedding.js`:
- `'3d'` (default): the real-time Three.js palace with bloom lighting, reflective floor, chandeliers, fairy-light canopy, rose urns and lantern rows.
- `'cinematic'`: the photoreal frames in `public/scenes/` are flown through on scroll (push-in, crossfade, sparkles, petals).
  To get sharper results, replace the five `.jpg` files with your original full-resolution frames (same filenames, ~16:9 or wider).
  The couple frame (`05-couple.jpg`) has the names baked into the picture, so replace that image if the names change.

## How the 3D film works

- `src/scroll/timeline.js` pins the stage with GSAP ScrollTrigger and exposes one damped playhead (0 → 1); the 3D journey starts at the entrance while preserving the original camera pace.
- `src/scroll/cameraPath.js` is the shot list: camera position and look-at keyed to scroll progress, joined by a smooth spline.
- Every scene (`src/scene/*`) reads the playhead each frame, so scrolling down plays the film and scrolling up reverses it exactly.
- `src/ui/Overlay.jsx` text is driven by the same playhead.

Scenes: grand entrance (starts immediately) → decorated pathway (25–45%) → stage and curtains (45–65%) → couple reveal (65–80%) → details (80–94%) → thank-you, Maps, calendar (94–100%).

## Performance and accessibility

- Quality tiers (`src/lib/device.js`): fewer lights, particles and no shadows on mobile; adaptive pixel ratio.
- 3D code is lazy-loaded; the welcome screen shows loading progress and remains until the guest selects **Enter Celebration** (which also unlocks audio).
- Devices without WebGL, or with `prefers-reduced-motion`, get a lightweight, normally scrolling version of the same content.
- Scenes are procedural (Three.js primitives). To use real models, replace a scene component with a `useGLTF` model.

## Deploy

`npm run build`, then upload `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages). No server required.

## Real venue models & licences

The default hall is a real stone atrium (`public/models/sponza.glb`) with a real velvet chair
(`public/models/chair.glb`), placed and dressed with curtains, carpet, lanterns, roses and a stage by the code in
`src/scene/HallReal.jsx` / `RealModels.jsx`. Set `models.venue: ''` in `src/config/wedding.js` to use the
built-in procedural hall instead.

- **Sponza atrium** – © Crytek / Cryengine Limited License (see `public/models/licenses/`). It restricts
  redistribution: fine for a private invitation, but check the licence before publishing the model commercially.
  Swap in your own venue `.glb` (long axis along X) via `models.venue`.
- **SheenChair** – CC0 (Wayfair / Eric Chadwick, Khronos glTF samples).
- **People** – the bride & groom are stylised stand-ins. For realistic people, drop a `.glb` of the couple
  (standing side by side, facing +Z) into `public/models/` and set `models.couple`.
- Models add ~12 MB to the download and the post-processing needs a reasonably modern GPU
  (the site lowers quality automatically on weaker devices).
- The "Export GLB" button exports the procedural set only (clipping planes are not exported).

## Engagement wording

Occasion text lives in `src/config/wedding.js` (`occasion`, `captions`, `invitationMessage`, `schedule`, `tagline`,
`hashtag`). Change those to reuse the project for a wedding.

## Banquet hall model v3 (current default)

`models.venue` points to the supplied high-detail banquet-hall package (25.2 MB): forecourt with
lamp posts, portico, reception foyer, main hall with chandeliers, pillars, staircases and the engagement stage, all with real
doorways. The scroll journey follows the package's own walkthrough route (`camera/camera_path.json`), re-timed to the scroll
and extended with the couple reveal on the stage. The model's built-in lights are dropped (too many for real-time) and
replaced by a few scroll-driven lights. The model is shifted by `BANQUET_DZ` (src/scene/world.js) so its forecourt sits
in front of the camera's starting view. A file name containing `banquet` selects this layout.
