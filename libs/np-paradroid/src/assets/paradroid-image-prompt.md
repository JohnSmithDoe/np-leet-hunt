# Paradroid Tileset — Structural Prompt

Reference asset: `paradroid.png` (this folder). This describes only the
**structure** of the 4×4 tile grid — the pipe shape and connections per cell.
The visual design (colors, material, lighting) is left to the image generator.

## Grid

A 4×4 grid of square tiles. Each tile holds one pipe piece. Pipes are a single
continuous channel that connects across tile edges. Connections are given by
compass edge: **N** (top), **E** (right), **S** (bottom), **W** (left). A
**socket** is a circular endpoint node (a round plug/terminal) that caps a pipe.

Rows are numbered 1–4 top→bottom, columns 1–4 left→right.

| Cell | Piece | Connects | Notes |
|------|-------|----------|-------|
| (1,1) | Socket endpoint | S | Round socket at top, pipe runs down |
| (1,2) | Corner | E, S | |
| (1,3) | Tee | W, E, S | |
| (1,4) | Corner | W, S | |
| (2,1) | Straight | N, S | Vertical |
| (2,2) | Corner | N, E | |
| (2,3) | Cross | N, E, S, W | Center junction (the "plus") |
| (2,4) | Straight | N, S | Vertical |
| (3,1) | Socket endpoint | N | Pipe up, round socket at bottom |
| (3,2) | Corner | N, E | |
| (3,3) | Tee | N, W, E | |
| (3,4) | Corner | N, W | |
| (4,1) | Blank | — | No pipe |
| (4,2) | Socket endpoint | E | Round socket at left, pipe runs right |
| (4,3) | Straight | W, E | Horizontal |
| (4,4) | Socket endpoint | W | Pipe from left, round socket at right |

## Readable layout

```
[●─┐] [ ┌┐] [─┼─] [┌─ ]      ● = socket endpoint
[ │ ] [ └┐] [─┼─] [ │ ]      ┼ = cross   ┬┴├┤ = tee
[●─┘] [ └┐] [─┼─] [└─ ]      ┌┐└┘ = corner   │─ = straight
[    ] [●──] [───] [──●]      blank = empty tile
```

## Piece set

Six piece types make up the grid: **socket endpoint** (cap with round node),
**straight**, **corner**, **tee**, **cross**, **blank**. For a modular
spritesheet, render each as a self-contained, edge-aligned tile so pieces snap
together in any arrangement.




Recreated 4x4 Grid+---------------+---------------+---------------+---------------+

|  Terminal S   | Corner Top-L  | T-Junction Dn | Corner Top-R  |
|               |               |               |               |
|     [ ◯ ]     |     ┌═══      |     ══╦══     |      ═══┐     |
|       ║       |     ║         |         ║     |         ║     |
+---------------+---------------+---------------+---------------+

|  Straight V   | T-Junction R  |   Crossroad   | T-Junction L  |
|       ║       |       ║       |         ║     |         ║     |
|       ║       |       ╠═══    |     ═══╬═══   |     ═══╣      |
|       ║       |       ║       |         ║     |         ║     |
+---------------+---------------+---------------+---------------+

|  Terminal N   | Corner Bot-L  | T-Junction Up | Corner Bot-R  |
|       ║       |       ║       |         ║     |         ║     |
|     [ ◯ ]     |       ╚═══    |     ══╩══     |     ═══╝      |
|               |               |               |               |
+---------------+---------------+---------------+---------------+

|  Blank Tile   |  Terminal E   |  Straight H   |  Terminal W   |
|               |               |               |               |
|   (Solid G)   |     [ ◯ ]═══  |   ═════════   |   ═══[ ◯ ]    |
|               |               |               |               |
+---------------+---------------+---------------+---------------+##



Erhalte exakt das gleiche Tilemap-/Kachelmuster und die gleiche Anordnung der Linien wie in der Referenz. Ersetze die türkisen Linien durch leuchtendes kosmisches Rot mit sanftem Glow. Hintergrund: tiefer Weltraum mit Nebeln, Sternenstaub, funkelnden Partikeln, kosmischem Glitzer und dezenten Galaxie-Strukturen. Futuristischer Sci-Fi-Look, sauberer Tile-Set-Stil, scharfe Kanten, hohe Detailtiefe. 4K bis 8K Auflösung, verlustfreie Qualität, transparentes oder dunkles Space-Theme, starke Kontraste, professionelle Game-Asset-Qualität, nahtlos und perfekt ausgerichtet.