---
name: prusa-mini-revo
description: Print settings and optimization for Prusa Mini+ with E3D Revo Micro hotend, bowden direct drive extruder, and ObXidian nozzles (0.25mm, 0.4mm, 0.6mm, 0.8mm). Use when the user asks about print settings, slicer profiles, troubleshooting prints, material temperatures, flow rates, nozzle selection, or optimizing prints for this specific printer configuration. Triggers on phrases like "print settings", "slicer profile", "layer height", "print speed", "temperature", "first layer", "stringing", "calibration", "which nozzle", or any 3D printing task mentioning Prusa Mini, Revo, or ObXidian.
---

# Prusa Mini+ with E3D Revo Micro & ObXidian Nozzles

Specialized knowledge for printing on a modified Prusa Mini+ with E3D Revo Micro hotend and ObXidian wear-resistant nozzles in 0.25mm, 0.4mm, 0.6mm, and 0.8mm sizes.

## Hardware Specifications

| Component | Specification |
|-----------|---------------|
| Printer | Prusa Mini+ |
| Build Volume | 180 × 180 × 180 mm |
| Hotend | E3D Revo Micro (40W HeaterCore) |
| Thermistor | Semitec 104NT-4-R025H42G |
| Nozzles | ObXidian 0.25mm, 0.4mm, 0.6mm, 0.8mm |
| Max Hotend Temp | 300°C |
| Filament Diameter | 1.75mm |
| Drive System | Bowden with direct drive extruder |

## Nozzle Selection Guide

| Nozzle | Best For | Trade-offs |
|--------|----------|------------|
| **0.25mm** | Fine detail, text, miniatures | Slowest, avoid abrasive filaments |
| **0.4mm** | General purpose, balanced | Standard, most profiles available |
| **0.6mm** | Faster prints, structural parts | Less detail, +25% impact strength |
| **0.8mm** | Rapid prototyping, large objects | Least detail, fastest, best for abrasives |

### When to Use Each Nozzle

**0.25mm** - Miniatures, small text, jewelry, precision parts
- ⚠️ Avoid filled filaments (particles often >0.25mm)
- ASA and ABS work best with small nozzles per E3D

**0.4mm** - Default for most prints, prototypes, mixed detail

**0.6mm** - Structural parts, functional prints, moderate abrasives

**0.8mm** - Large objects, vases, rapid prototypes, heavy abrasives (CF, GF)
- Best choice for filled filaments—lowest clog risk
- May need 60W HeaterCore for high-temp materials at high flow

---

## E3D Official Starter Settings

These are E3D's conservative starter settings for Revo hotends. Track width = extrusion width ≈ nozzle diameter.

### PLA - 200°C

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.25mm | Fine | 0.06mm | 15 mm/s | 30 mm/s |
| 0.25mm | Medium | 0.125mm | 25 mm/s | 50 mm/s |
| 0.25mm | Coarse | 0.18mm | 30 mm/s | 60 mm/s |
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 25 mm/s | 50 mm/s |
| 0.40mm | Coarse | 0.30mm | 30 mm/s | 60 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 25 mm/s | 50 mm/s |
| 0.60mm | Coarse | 0.45mm | 30 mm/s | 60 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 25 mm/s | 50 mm/s |
| 0.80mm | Coarse | 0.60mm | 30 mm/s | 60 mm/s |

**Bed**: 50-60°C | **Cooling**: 100%

### PETG - 240°C

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.25mm | Fine | 0.06mm | 15 mm/s | 30 mm/s |
| 0.25mm | Medium | 0.125mm | 25 mm/s | 50 mm/s |
| 0.25mm | Coarse | 0.18mm | 30 mm/s | 60 mm/s |
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 25 mm/s | 50 mm/s |
| 0.40mm | Coarse | 0.30mm | 30 mm/s | 60 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 25 mm/s | 50 mm/s |
| 0.60mm | Coarse | 0.45mm | 30 mm/s | 60 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 25 mm/s | 50 mm/s |
| 0.80mm | Coarse | 0.60mm | 30 mm/s | 60 mm/s |

**Bed**: 70-85°C | **Cooling**: 30-50%

### ASA - 240°C

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.25mm | Fine | 0.06mm | 15 mm/s | 30 mm/s |
| 0.25mm | Medium | 0.125mm | 25 mm/s | 50 mm/s |
| 0.25mm | Coarse | 0.18mm | 30 mm/s | 60 mm/s |
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 25 mm/s | 50 mm/s |
| 0.40mm | Coarse | 0.30mm | 30 mm/s | 60 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 25 mm/s | 50 mm/s |
| 0.60mm | Coarse | 0.45mm | 30 mm/s | 60 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 25 mm/s | 50 mm/s |
| 0.80mm | Coarse | 0.60mm | 30 mm/s | 60 mm/s |

**Bed**: 90-100°C | **Cooling**: 10-30% | **Enclosure recommended**

### ABS - 245°C (Similar to ASA)

Use ASA settings. ABS typically prints 5°C hotter than ASA.

**Bed**: 95-110°C | **Cooling**: 0-20% | **Enclosure required**

### TPU 92A - 230°C

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.25mm | Fine | 0.06mm | 15 mm/s | 30 mm/s |
| 0.25mm | Medium | 0.125mm | 25 mm/s | 50 mm/s |
| 0.25mm | Coarse | 0.18mm | 30 mm/s | 60 mm/s |
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 30 mm/s | 60 mm/s |
| 0.40mm | Coarse | 0.30mm | 40 mm/s | 80 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 25 mm/s | 50 mm/s |
| 0.60mm | Coarse | 0.45mm | 30 mm/s | 60 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 25 mm/s | 50 mm/s |
| 0.80mm | Coarse | 0.60mm | 30 mm/s | 60 mm/s |

**Bed**: 40-60°C | **Cooling**: 50% | **Retraction**: Minimal or disabled

### TPU 85A / 75A - 260°C

Softer TPUs require higher temps. Same layer heights as TPU 92A.

**Bed**: 40-60°C | **Cooling**: 50% | ⚠️ **Bowden systems struggle with soft TPU**

### PETG Carbon Fiber (XT-CF) - 250°C

⚠️ **Use 0.4mm nozzle or larger only**

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 25 mm/s | 50 mm/s |
| 0.40mm | Coarse | 0.30mm | 30 mm/s | 60 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 25 mm/s | 50 mm/s |
| 0.60mm | Coarse | 0.45mm | 30 mm/s | 60 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 25 mm/s | 50 mm/s |
| 0.80mm | Coarse | 0.60mm | 30 mm/s | 60 mm/s |

**Bed**: 75-90°C | **Cooling**: 30-50%

### Nylon Carbon Fiber - 270°C

⚠️ **Use 0.4mm nozzle or larger only** | **Dry filament thoroughly**

| Nozzle | Profile | Layer Height | Wall Speed | Infill Speed |
|--------|---------|--------------|------------|--------------|
| 0.40mm | Fine | 0.10mm | 15 mm/s | 30 mm/s |
| 0.40mm | Medium | 0.20mm | 30 mm/s | 60 mm/s |
| 0.40mm | Coarse | 0.30mm | 40 mm/s | 80 mm/s |
| 0.60mm | Fine | 0.15mm | 15 mm/s | 30 mm/s |
| 0.60mm | Medium | 0.30mm | 30 mm/s | 60 mm/s |
| 0.60mm | Coarse | 0.45mm | 40 mm/s | 80 mm/s |
| 0.80mm | Fine | 0.20mm | 15 mm/s | 30 mm/s |
| 0.80mm | Medium | 0.40mm | 30 mm/s | 60 mm/s |
| 0.80mm | Coarse | 0.60mm | 40 mm/s | 80 mm/s |

**Bed**: 70-90°C | **Cooling**: 20-40% | **Enclosure recommended**

---

## Quick Reference: Temperature Summary

| Material | Hotend | Bed | Cooling | Notes |
|----------|--------|-----|---------|-------|
| PLA | 200°C | 50-60°C | 100% | Easy, universal |
| PETG | 240°C | 70-85°C | 30-50% | Strings easily |
| ASA | 240°C | 90-100°C | 10-30% | UV resistant |
| ABS | 245°C | 95-110°C | 0-20% | Enclosure required |
| TPU 92A | 230°C | 40-60°C | 50% | Flexible |
| TPU 85A/75A | 260°C | 40-60°C | 50% | Very flexible |
| PETG-CF | 250°C | 75-90°C | 30-50% | 0.4mm+ only |
| Nylon-CF | 270°C | 70-90°C | 20-40% | 0.4mm+ only, dry! |

---

## Layer Height Ranges

Formula: Min = 25% nozzle, Max = 75-80% nozzle

| Nozzle | Minimum | Maximum | E3D Fine | E3D Medium | E3D Coarse |
|--------|---------|---------|----------|------------|------------|
| 0.25mm | 0.06mm | 0.20mm | 0.06mm | 0.125mm | 0.18mm |
| 0.40mm | 0.10mm | 0.32mm | 0.10mm | 0.20mm | 0.30mm |
| 0.60mm | 0.15mm | 0.48mm | 0.15mm | 0.30mm | 0.45mm |
| 0.80mm | 0.20mm | 0.64mm | 0.20mm | 0.40mm | 0.60mm |

---

## Volumetric Flow Limits (40W HeaterCore)

| Nozzle | PLA | PETG | ABS/ASA | Notes |
|--------|-----|------|---------|-------|
| 0.25mm | 4-5 | 3-4 | 4-5 | Limited by geometry |
| 0.40mm | 8-11 | 6-8 | 8-10 | Standard |
| 0.60mm | 11-15 | 8-11 | 10-12 | Higher throughput |
| 0.80mm | 15-17 | 10-13 | 12-15 | May benefit from 60W |

---

## Retraction Settings (Bowden)

| Nozzle | Length | Speed | PETG Add |
|--------|--------|-------|----------|
| 0.25mm | 3.0mm | 35 mm/s | +0.5mm |
| 0.40mm | 3.5mm | 35 mm/s | +0.5mm |
| 0.60mm | 4.0mm | 35 mm/s | +0.5-1.0mm |
| 0.80mm | 4.5mm | 35 mm/s | +0.5-1.0mm |

---

## Bondtech IFS Profile Defaults

The Bondtech IFS printer profiles are configured with these defaults:

| Setting | Value | Notes |
|---------|-------|-------|
| `binary_gcode` | `0` (ASCII) | **Required for Input Shaping** - binary gcode triggers firmware warning |
| `retract_length` | `2mm` | Reduced for Bowden stress reduction |
| `retract_speed` | `35 mm/s` | Matched deretract speed |
| `deretract_speed` | `35 mm/s` | Symmetric with retract speed |
| `fill_pattern` | `gyroid` | Bowden-friendly, smooth curves |
| `support_material_style` | `organic` | Tree supports, easy removal |

**Input Shaping**: Always use ASCII gcode (`binary_gcode = 0`) for Prusa Mini+ with Input Shaper firmware. The firmware checks for `M862.6 P"Input shaper"` in the start gcode.

---

## Skirt and Brim

### Skirt

A printed outline around all models that primes the nozzle and lets you verify first-layer adhesion before the actual print begins.

| Setting | Default | Notes |
|---------|---------|-------|
| Loops | 1 | Set to 0 to disable; more loops = more priming |
| Distance from object | 6mm | Gap between skirt and model |
| Skirt height | 3 layers | Prusa default; 1-layer skirts are hard to remove |
| Draft shield | Off | Full-height skirt wall — enable for ABS/ASA to block drafts |
| Min extrusion length | 0 | Forces extra loops if priming is insufficient |

**Best practice**: Always use at least a 1-loop skirt. Catches first-layer issues before they ruin a print.

### Brim

Extra material printed around the first layer perimeter to increase bed adhesion.

| Setting | Recommended | Notes |
|---------|-------------|-------|
| Brim type | Outer only | Options: outer only, inner only, outer+inner |
| Brim width | 3-5mm standard | 5-10mm for large/tall prints |
| Brim separation gap | 0.1mm | Small gap for easier removal |

### When to Use Brim

| Scenario | Brim Width | Notes |
|----------|------------|-------|
| Small base, tall object | 5-10mm | Prevents tipping/warping |
| Large flat print | 5-10mm | Prevents edge lifting |
| Multiple small objects | 3-5mm | Stabilizes each piece |
| Heavy/dense filaments (bronze, metal-fill) | 8-10mm | Extra weight stresses adhesion |
| ABS/ASA without enclosure | 10mm+ | Combine with draft shield |
| Standard PLA print | Skirt only | Brim usually unnecessary |

### Nozzle-Specific Brim Tips

| Nozzle | Brim Separation Gap | Notes |
|--------|---------------------|-------|
| 0.25mm | 0.05-0.1mm | Thin lines — easy to remove |
| 0.40mm | 0.1mm | Standard |
| 0.60mm | 0.1-0.15mm | Wider lines bond harder |
| 0.80mm | 0.15-0.2mm | Increase gap for clean removal |

### PrusaSlicer CLI Flags

```bash
# Skirt (default)
--skirts 1 --skirt-distance 6 --skirt-height 3

# Brim instead of skirt
--skirts 0 --brim-width 5 --brim-separation 0.1

# Draft shield for ABS/ASA
--draft-shield=enabled
```

### Known Limitations

- **Inner brim** does not apply to enclosed cavities within a model in PrusaSlicer (Bambu Studio handles this differently)
- Brim height and separation should scale together — if using a taller brim, increase the separation gap for easier removal

---

## PrusaSlicer CLI Usage

### CLI Syntax Rules

**CRITICAL**: PrusaSlicer CLI has different syntax requirements for different option types:

| Option Type | Syntax | Example |
|-------------|--------|---------|
| Enum options | `--option=value` | `--fill-pattern=gyroid` |
| Numeric options | `--option value` or `--option=value` | `--temperature 215` |
| Boolean options | `--option` | `--support-material` |

### Common Enum Options (require `=` syntax)

```bash
--fill-pattern=gyroid           # rectilinear, grid, triangles, stars, cubic, gyroid, honeycomb, etc.
--support-material-style=organic  # grid, snug, organic
--support-material-pattern=rectilinear  # rectilinear, rectilinear-grid, honeycomb
--gcode-flavor=marlin2          # marlin, marlin2, repetier, etc.
```

### Complete CLI Example

```bash
flatpak run com.prusa3d.PrusaSlicer --export-gcode \
  --load "$HOME/.var/app/com.prusa3d.PrusaSlicer/config/PrusaSlicer/print/PROFILE.ini" \
  --load "$HOME/.var/app/com.prusa3d.PrusaSlicer/config/PrusaSlicer/filament/FILAMENT.ini" \
  --load "$HOME/.var/app/com.prusa3d.PrusaSlicer/config/PrusaSlicer/printer/PRINTER.ini" \
  --fill-pattern=gyroid \
  --support-material-style=organic \
  --temperature 215 \
  --first-layer-temperature 215 \
  --bed-temperature 60 \
  --retract-length 2 \
  --retract-speed 35 \
  --deretract-speed 35 \
  --support-material \
  --output ~/3d-print/output.gcode \
  ~/3d-print/model.stl
```

### Bowden-Friendly Settings

For Bowden systems, use these infill/support options:

| Setting | Best Choice | Why |
|---------|-------------|-----|
| Infill pattern | `gyroid` | Smooth curves, constant extrusion, minimal retractions |
| Support style | `organic` | Tree-like branches, smooth paths, easy removal |
| Avoid | `honeycomb`, `grid` | Many direction changes, high retraction count |

---

## PrusaSlicer Configuration

### Printer Settings (per nozzle)

| Setting | 0.25mm | 0.40mm | 0.60mm | 0.80mm |
|---------|--------|--------|--------|--------|
| Nozzle diameter | 0.25 | 0.4 | 0.6 | 0.8 |
| Min layer height | 0.06 | 0.10 | 0.15 | 0.20 |
| Max layer height | 0.20 | 0.32 | 0.48 | 0.64 |
| Retraction length | 3.0mm | 3.5mm | 4.0mm | 4.5mm |
| Retraction speed | 35 mm/s | 35 mm/s | 35 mm/s | 35 mm/s |
| Lift Z | 0.15mm | 0.2mm | 0.2mm | 0.3mm |

### Built-in Profiles
PrusaSlicer has profiles for multiple nozzle sizes:
1. Configuration → Configuration Wizard
2. Select "Original Prusa MINI+"
3. Check boxes for each nozzle size (0.25, 0.4, 0.6)
4. 0.8mm: Create manually based on 0.6mm profile

---

## Nozzle Swap Procedure

Revo quick-swap (no tools, no hot-tightening):

1. **Cool down** below 50°C
2. **Unscrew** current nozzle by hand
3. **Install** new nozzle, finger-tight only
4. **Update slicer** - select correct nozzle profile
5. **Re-calibrate** - run First Layer Calibration
6. **Verify** - print test square

⚠️ Each nozzle needs its own Live Z calibration!

---

## Speed Calculation

```
Max Speed (mm/s) = Max Flow (mm³/s) / (Layer Height × Line Width)
```

**Examples at E3D Medium profile:**

| Nozzle | Layer | Width | E3D Wall | E3D Infill |
|--------|-------|-------|----------|------------|
| 0.25mm | 0.125mm | 0.25mm | 25 mm/s | 50 mm/s |
| 0.40mm | 0.20mm | 0.40mm | 25 mm/s | 50 mm/s |
| 0.60mm | 0.30mm | 0.60mm | 25 mm/s | 50 mm/s |
| 0.80mm | 0.40mm | 0.80mm | 25 mm/s | 50 mm/s |

Note: E3D settings are conservative. Prusa Mini+ can often handle faster speeds.

---

## ObXidian Nozzle Care

All sizes:
- **E3DLC coating**: Non-stick, reduces buildup
- **Copper alloy body**: Brass-equivalent thermal performance
- **Tool steel tip**: Wear-resistant
- **Max temp**: 300°C
- **Install**: Finger-tight only, no tools

**Size-specific guidance:**
| Nozzle | Abrasive Filaments | Clog Risk |
|--------|-------------------|-----------|
| 0.25mm | ❌ Avoid | High |
| 0.40mm | ⚠️ Light use | Medium |
| 0.60mm | ✅ Good | Low |
| 0.80mm | ✅ Best choice | Very Low |

---

## Detailed References

- For material-specific profiles: See `references/material-profiles.md`
- For common print issues: See `references/troubleshooting.md`
- For PrusaSlicer print settings (layers, perimeters, infill, supports, seam, ironing, fuzzy skin, pressure equalizer, sequential printing): See `references/print-settings.md`
