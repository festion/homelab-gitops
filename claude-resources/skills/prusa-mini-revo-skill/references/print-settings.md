# PrusaSlicer Print Settings Reference

Adapted for Prusa Mini+ with E3D Revo Micro (40W), Bondtech IFS extruder, and ObXidian nozzles.

---

## Layers and Perimeters

### Layer Height

Primary factor in print time vs. quality. See SKILL.md for nozzle-specific layer height ranges.

| Setting | Recommendation | Notes |
|---------|---------------|-------|
| Layer height | 25-80% of nozzle diameter | Below 0.10mm gives diminishing returns |
| First layer height | 0.20mm (absolute) | Standard across all nozzle sizes for adhesion |

### Perimeters

Model strength comes primarily from perimeters, not infill.

| Use Case | Perimeters | Notes |
|----------|------------|-------|
| Standard prints | 2 | PrusaSlicer default |
| Structural/functional | 3-4 | Better than increasing infill |
| Vase mode | 1 | Spiral vase, no infill, no top layers |
| Thin-walled containers | 2-3 | Consider wall thickness calculation |

### Solid Layers (Top/Bottom)

| Layer Height | Recommended Top Layers | Recommended Bottom Layers |
|-------------|----------------------|-------------------------|
| 0.30mm | 3-4 | 3 |
| 0.20mm | 4-5 | 3-4 |
| 0.10mm | 7-9 | 5-6 |
| 0.06mm | 10-12 | 7-8 |

Rule of thumb: top solid thickness should be at least 0.6-0.8mm total. Bottom needs at least 0.6mm.

### Perimeter Generator

| Generator | Best For | Notes |
|-----------|----------|-------|
| **Arachne** (default) | General use, text, logos, thin walls | Varies extrusion width automatically |
| **Classic** | Functional prints needing concave corner precision | Fixed extrusion width |

**Arachne settings** (Print Settings > Advanced):

| Setting | Default | Notes |
|---------|---------|-------|
| Minimum feature size | 25% nozzle dia | Features below this won't print |
| Minimum perimeter width | 85% nozzle dia | Replaces features above minimum |
| Perimeter transition length | 100% nozzle dia | Space for perimeter count changes |

**Known issue**: Arachne may produce seam artifacts or gaps with 0.6mm nozzles. Switch to Classic if you see these.

### Spiral Vase Mode

Single continuous perimeter with gradually increasing Z. Automatically sets: 1 perimeter, 0% infill, no top layers, no supports.

- Only one object at a time (use sequential printing for multiples)
- Eliminates layer seams entirely
- Great for decorative prints with 0.6mm or 0.8mm nozzles

### Other Layer/Perimeter Settings

| Setting | Recommendation | Notes |
|---------|---------------|-------|
| Ensure vertical shell thickness | **Enabled** | Prevents gaps on sloped surfaces |
| Avoid crossing perimeters | **Enabled** | Reduces stringing — important for Bondtech IFS bowden |
| Detect thin walls | Auto (off with Arachne) | Arachne handles this natively |
| Thick bridges | **Disabled** (new default) | Better appearance; legacy mode for longer bridges |
| External perimeters first | Off | Enable for dimensional accuracy at cost of surface finish |
| Fill gaps | Enabled | Fills spaces between perimeters |

---

## Infill

### Density Guidelines

| Use Case | Density | Notes |
|----------|---------|-------|
| Decorative / display | 5-10% | Minimal material |
| General purpose | 10-15% | PrusaSlicer default range |
| Functional parts | 15-25% | Good strength-to-weight |
| Structural / load-bearing | 25-40% | Diminishing returns above 40% |
| Solid (molds, stamps) | 100% | Forces rectilinear pattern |

**Key insight**: Increasing perimeters improves strength more than increasing infill density.

### Infill Patterns — Bondtech IFS Recommendations

The bowden system benefits from patterns with smooth, continuous extrusion paths and minimal retractions.

| Pattern | Bowden Rating | Strength | Speed | Best For |
|---------|--------------|----------|-------|----------|
| **Gyroid** | Excellent | Equal in all directions | Fast | Default choice — smooth curves, minimal retractions |
| **Cubic** | Good | Good, air pockets | Average | Insulation, lightweight |
| **Adaptive Cubic** | Good | Good near walls | Fast | Large prints, ~25% less material than rectilinear |
| **Support Cubic** | Good | Top support only | Fastest | Minimum material, functional only |
| **Lightning** | Good | Top support only | Fastest | Even less material than support cubic |
| **Rectilinear** | OK | Moderate | Fast | 100% infill, simple parts |
| **Grid** | Avoid | Good adhesion | Average | Material buildup at crossings — nozzle collision risk |
| **Honeycomb** | Avoid | Best mechanical | Slow | ~25% more material, 2x print time |
| **Concentric** | Good | Low | Slow | Transparent/flexible prints |

### Top/Bottom Surface Patterns

| Pattern | Best For | Notes |
|---------|----------|-------|
| **Monotonic** | General use (default) | Left-to-right, no ridges, best surface |
| Rectilinear | Basic | Standard zig-zag |
| Concentric | Cylindrical objects | Follows perimeter shape |
| Aligned rectilinear | Consistent appearance | Same direction across all top surfaces |

### Infill Combining

Speeds up prints by using thicker infill layers while keeping thin perimeters.

| Setting | Value | Notes |
|---------|-------|-------|
| Combine infill every X layers | 2-3 | Limited by ~80% nozzle diameter |
| Max layer height for combining | 80% nozzle dia | Use percentage for flexibility |

Example: 0.10mm layer height + combine every 3 = 0.30mm infill layers (with 0.4mm nozzle).

### Other Infill Settings

| Setting | Recommendation | Notes |
|---------|---------------|-------|
| Fill angle | 45° (default) | Bridges auto-detect optimal angle |
| Infill anchor length | Default | Stabilizes PETG extrusion; 0 to disable |
| Solid infill every X layers | 0 (disabled) | Prefer more perimeters instead |
| Solid infill threshold area | 0 (disabled) | Forces solid infill for tiny regions |

---

## Support Material

### Support Styles

| Style | Removal | Stability | Surface Marks | Bondtech IFS Notes |
|-------|---------|-----------|---------------|-------------------|
| **Organic** (tree) | Easiest | Good | Minimal | Best choice — smooth branching paths, fewer retractions |
| Grid | Hard | Most stable | Significant | Many direction changes — avoid if possible |
| Snug | Moderate | Moderate | Moderate | Follows overhang shape |

### Organic Support Settings

| Setting | Default | Tuning Notes |
|---------|---------|-------------|
| Max branch angle | 40° | Lower = more vertical/stable |
| Preferred branch angle | 25° | Balance vertical vs. fast merging |
| Branch diameter | 3mm | Thicker = sturdier |
| Branch diameter angle | 5° | Gradual widening toward base |
| Tip diameter | 0.8mm | Branch endpoint thickness |
| Branch distance | 1mm | Smaller = better overhangs, harder removal |

### Support Placement

| Option | Use When |
|--------|----------|
| Build plate only | Most prints — prevents internal scarring |
| Everywhere | Complex overhangs with no path to bed |
| Enforcers only | Manual control, disable auto-generation |

### Contact Z Distance

| Setting | Value | Notes |
|---------|-------|-------|
| Top contact Z distance | 50-75% of layer height | Gap between support and object |
| Bottom contact Z distance | Same | Gap at support base on model |

### Key Settings

| Setting | Recommendation | Notes |
|---------|---------------|-------|
| Overhang threshold | 55° (default) | Lower = fewer supports generated |
| Interface layers | 2-3 top, 0-2 bottom | Denser pattern for better surface |
| XY separation | 50-75% external perimeter width | Larger = easier removal |
| Don't support bridges | Enabled | Bridges don't need support |
| Raft layers | 0 (disabled) | Use only for extreme adhesion problems |

### Support Enforcers and Blockers

Available in all modes. Right-click model > Add support enforcer/blocker. Shapes: box, cylinder, sphere, slab.

---

## Seam Position

### Options

| Position | Best For | Trade-off |
|----------|----------|-----------|
| **Nearest** | Models with sharp corners | Hides in concave vertices; fastest |
| **Aligned** | Consistent appearance | Vertical seam line; predictable |
| **Random** | Cylinders, round objects | Rougher surface; strongest |
| **Rear** | Display pieces (front-facing) | Seam always toward back of bed |

### Seam Quality Settings

| Setting | Notes |
|---------|-------|
| Staggered inner seams | Zigzag pattern strengthens prints |
| Scarf joint | Overlaps start/end for smoother seams; increases print time |
| Linear Advance (firmware) | Biggest impact on seam quality |

**Note**: FDM cannot fully eliminate seams. Use vase mode for seamless prints.

---

## Ironing

Smooths flat top surfaces with a second pass of the hot nozzle.

### When to Use

- Nameplates, logos, badges, boxes, lids
- Parts to be glued together (needs flat mating surface)
- **Avoid on**: organic shapes, figures, round objects

### Settings

| Setting | Recommended | Notes |
|---------|-------------|-------|
| Flow rate | 10-15% | Too low = grooves; too high = edge bleeding |
| Spacing | < nozzle diameter | Smaller = smoother, slower |
| Speed | 10-15 mm/s | Slower is better |
| Type | Topmost surface only | All top surfaces for stepped models |

### Material Compatibility

| Material | Result | Risk |
|----------|--------|------|
| PLA | Excellent | Heat creep with Revo Micro — monitor for clogs |
| PETG | Good | Filament may stick to nozzle |
| ASA | Best results | Super smooth surfaces |
| Wood-filled | Poor | Avoid ironing |

### Revo Micro Warning

The 40W HeaterCore handles ironing well but PLA is prone to heat creep during the slow ironing pass. If you get clogs during ironing:
- Increase ironing speed slightly
- Reduce flow rate
- Ensure part cooling fan is running
- Consider skipping ironing on small PLA parts

---

## Fuzzy Skin

Creates a rough, fiber-like texture on outer walls by randomly offsetting perimeter points.

### Use Cases

- Tool handles (grip texture)
- Concealing layer lines
- Decorative/artistic effects
- Planters, vases

### Settings

| Setting | Subtle | Moderate | Heavy |
|---------|--------|----------|-------|
| Thickness | 0.1mm | 0.2mm | 0.3mm |
| Point distance | 0.8mm | 0.6mm | 0.4mm |

### Application Methods

1. **Global**: Print Settings > Layers and perimeters > Fuzzy skin
2. **Per-object**: Right-click > Add settings > Fuzzy skin
3. **Modifiers**: Box/cylinder/sheet for specific regions
4. **Paint-on tool**: Left toolbar, brush onto specific areas

---

## Elephant Foot Compensation

Shrinks the first layer to counteract squish against the heated bed.

| Setting | Value | Notes |
|---------|-------|-------|
| Compensation | 0.2mm (0.4mm nozzle) | Scale proportionally for other nozzle sizes |

### Per Nozzle

| Nozzle | Recommended Compensation |
|--------|------------------------|
| 0.25mm | 0.10-0.15mm |
| 0.40mm | 0.15-0.20mm |
| 0.60mm | 0.20-0.25mm |
| 0.80mm | 0.25-0.30mm |

### Notes

- Enabled by default in Prusa profiles
- Preview may show gaps between brim and model — this is normal, material fills during printing
- If brim detaches during printing, compensation value is too high
- PrusaSlicer auto-detects thin first-layer lines to avoid over-shrinking

---

## Sequential Printing

Completes each object fully before starting the next, rather than layer-by-layer.

### Enable

Print Settings > Output options > Complete individual objects

### Benefits

- Failed prints don't ruin the whole batch
- Less stringing between objects
- Better adhesion per object

### Prusa Mini+ Clearance

| Dimension | Approximate Value | Notes |
|-----------|-------------------|-------|
| Extruder clearance radius | ~35mm | Bondtech IFS + Revo Micro assembly |
| Extruder clearance height | ~40mm | Height before gantry collision |

**Important**: Verify these values for your specific Bondtech IFS + Revo Micro setup. Measure from nozzle tip to lowest non-nozzle component.

### Workflow

1. Enable sequential printing
2. Press **A** to auto-arrange objects with safe spacing
3. Press **E** to visualize print order
4. Drag objects in list to reorder if needed
5. Check for collision warnings before exporting

---

## Pressure Equalizer

Smooths speed transitions between print features (infill → perimeters → external perimeters).

### Why This Matters for Bondtech IFS

The bowden tube creates slack that amplifies pressure fluctuations. Rapid speed changes cause:
- Bulges on external perimeters (pressure buildup from fast infill)
- Under-extrusion when accelerating (pressure drop)

### Settings

Located in Print Settings > Speed.

| Setting | Range | Recommended | Notes |
|---------|-------|-------------|-------|
| Max volumetric slope positive | 2-10 mm³/s² | 3-5 | Controls acceleration (speeding up) |
| Max volumetric slope negative | 2-10 mm³/s² | 3-5 | Controls deceleration (slowing down) |

Lower values = smoother transitions = better surface quality = slightly longer prints.

Setting positive slope to 0 suppresses excessive slowdowns (prevents extreme print time increase).

### Relationship to Linear Advance

| Feature | What It Does | Where |
|---------|-------------|-------|
| Pressure equalizer | Adjusts print **speeds** | Slicer (PrusaSlicer) |
| Linear Advance | Adjusts extrusion **amounts** | Firmware |

Both work together. Tune Linear Advance in firmware first, then fine-tune with pressure equalizer in slicer.

---

## Slicing Mode

Print Settings > Advanced > Slicing mode

| Mode | Use Case |
|------|----------|
| **Regular** (default) | Standard solid models |
| **Even-Odd** | 3DLabPrint airplanes and similar overlapping-body models designed for single-perimeter hollow slicing |
| **Close Holes** | Forces all internal geometry solid — useful for molds |

---

## PrusaSlicer CLI Flags Reference

Common flags for the settings covered above:

```bash
# Layers and perimeters
--layer-height 0.2 --first-layer-height 0.2
--perimeters 2 --top-solid-layers 4 --bottom-solid-layers 3
--external-perimeters-first

# Infill
--fill-density "15%" --fill-pattern=gyroid
--fill-angle 45

# Support (organic)
--support-material --support-material-style=organic
--support-material-buildplate-only
--support-material-threshold 55

# Seam
--seam-position=nearest

# Ironing
--ironing --ironing-type=top --ironing-flowrate "15%"
--ironing-spacing 0.1

# Sequential printing
--complete-objects

# Elephant foot
--elefant-foot-compensation 0.2

# Pressure equalizer
--max-volumetric-slope-positive 4
--max-volumetric-slope-negative 4
```
