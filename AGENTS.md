# Repository Agent Rules

## Pixi-only application rendering

- All user-facing application pages, screens, menus, overlays, dialogs, HUD elements, controls, decorative visuals, and interactive UI must be rendered through PixiJS inside the application's Pixi scene tree.
- The application must maintain a single `Pixi.Application` and a single canvas for the full runtime; page or scene transitions must reuse that application and canvas by switching Pixi containers or scene state.
- `#app` may only act as the bootstrap host for the Pixi canvas and must not contain independently constructed application DOM UI.
- Do not use `document.createElement`, `innerHTML`, framework-rendered HTML, native HTML buttons, or other DOM nodes to implement application pages or controls outside the Pixi canvas.
- DOM access is permitted only for browser/bootstrap concerns that cannot constitute application UI, such as locating `#app`, reading environment capabilities, attaching the Pixi canvas, or using browser APIs.
- CSS must be limited to document, host, and canvas-level browser layout concerns such as viewport sizing, overflow, and fallback background; application visual design belongs in Pixi rendering code.
- Pointer, keyboard, and other page interactions that correspond to visible application controls must be routed to Pixi display objects or the application's input systems rather than external DOM controls.
- Tests must preserve this contract by asserting that `#app` contains exactly one Pixi canvas and no external application UI nodes throughout home, menu, gameplay, and other page states.
- Any implementation that introduces application DOM UI outside the Pixi canvas is an architectural regression and must be rejected or refactored before merge.
