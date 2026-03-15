# Math + Systems — Interactive Learning Visualization

Interactive visual guide to the math and systems programming behind the
[dgCMatrix → faer FFI bridge](https://github.com/shinigami-777/dgcmatrix-faer-bridge).

## What's here

- `index.html` — the page (loads CSS + JS from CDN and local files)
- `style.css` — layout and design tokens (dark/light theme)
- `math-systems.js` — 7 interactive canvas visualizations + CG solver

## Sections

1. **Pipeline** — R → FFI → Rust → CG → smoothed (wire diagram)
2. **Vectors in Memory** — math view vs byte-level memory layout
3. **Sparse vs Dense** — 4×4 Laplacian as dense grid vs CSC arrays
4. **Graph → Laplacian** — interactive grid (3×3, 4×4, 5×5) with live stats
5. **Iterative Solve** — CG solver with convergence plot, alpha slider
6. **FFI Boundary** — R slots → type conversion → Rust components
7. **Spectral View** — filter response h(λ) = 1/(1+αλ)
8. **Complexity** — O(N³) vs O(N^1.5) vs O(N) curves

## Export figures for LaTeX

Every canvas can be exported as a high-res PNG for papers. Open the
browser console and run:

```js
// Export any canvas by ID — e.g., the FFI boundary diagram
const c = document.getElementById("ffi-canvas");
const link = document.createElement("a");
link.download = "ffi-boundary.png";
link.href = c.toDataURL("image/png");
link.click();
```

Canvas IDs: `pipeline-canvas`, `vec-canvas`, `sparse-canvas`,
`graph-canvas`, `cg-canvas`, `ffi-canvas`, `eigen-canvas`,
`complexity-canvas`

For higher resolution, the canvases already render at devicePixelRatio
(2x on Retina). For even higher, temporarily set
`window.devicePixelRatio = 4` before calling `drawAll()` in the console,
then export.

## dgcmatrix-faer-bridge
https://github.com/shinigami-777/dgcmatrix-faer-bridge

## Live version

https://letters-photon-processor.web.app/math-systems
