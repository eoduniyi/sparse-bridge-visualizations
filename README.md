# sparse-bridge-visualizations

Interactive visual guides to the math and systems programming behind the
[dgCMatrix → faer FFI bridge](https://github.com/shinigami-777/dgcmatrix-faer-bridge).

## What's here

- `index.html` — the main interface (loads KaTeX and local assets)
- `style.css` — glassmorphic design tokens and dark/light theme logic
- `math-systems.js` — core engine: 8 interactive visualizations + CG solver

## How to run

Serve the folder locally so fonts and icons load correctly:

```bash
# Python
python3 -m http.server

# Node
npx serve .
```

## Sections

1. **Pipeline** — architectural flow: R → FFI → Rust → CG solver
2. **Vectors in Memory** — mathematical notation vs. contiguous `f64` byte layout
3. **Sparse vs Dense** — CSC (Compressed Sparse Column) memory efficiency
4. **Graph → Laplacian** — real-time Laplacian construction from interactive grids
5. **Iterative Solve** — Conjugate Gradient solver with live convergence plotting
6. **FFI Boundary** — safety mapping between R slots and Rust types
7. **Spectral View** — low-pass filter response h(λ) = 1/(1+αλ) with real eigenvalue spikes
8. **Complexity** — O(N³) dense vs. O(N) sparse CG

## Exporting figures for LaTeX

Every visualization renders to an HTML5 Canvas and can be exported as a high-res PNG.
Open the browser console and run:

```js
const c = document.getElementById("ffi-canvas");
const link = document.createElement("a");
link.download = "figure-export.png";
link.href = c.toDataURL("image/png");
link.click();
```

Canvas IDs: `pipeline-canvas`, `vec-canvas`, `sparse-canvas`,
`graph-canvas`, `cg-canvas`, `ffi-canvas`, `eigen-canvas`, `complexity-canvas`

High-res tips:

- Already HiDPI-aware (2x on Retina)
- For 4K/print quality, set `window.devicePixelRatio = 4` then call `drawAll()` before exporting
