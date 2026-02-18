---
name: mesh3d
description: Create and edit 3D printable mesh files (STL, 3MF, OBJ) programmatically using Python trimesh + manifold3d. Use when the user asks to create 3D objects, modify existing STL/3MF files, add holes/features to meshes, combine or split meshes, repair meshes, convert between formats, analyze mesh geometry, or generate parametric parts for 3D printing. Triggers on "create STL", "make a 3D model", "edit mesh", "add hole", "modify STL", "3MF", "printable", "mesh repair", "boolean", "combine meshes", or any 3D modeling task that doesn't require a GUI CAD tool.
---

# Mesh3D Skill

Create and edit 3D printable mesh files using Python. Uses `trimesh` for geometry and I/O, `manifold3d` for boolean operations, and `shapely` for 2D profiles.

## When to Use This Skill

- Creating simple to moderately complex 3D printable objects from scratch
- Modifying existing STL/3MF files (adding holes, cutting, scaling, combining)
- Converting between mesh formats (STL ↔ 3MF ↔ OBJ ↔ PLY ↔ GLB)
- Analyzing meshes (volume, surface area, watertightness, dimensions)
- Repairing non-manifold meshes
- Parametric parts defined by dimensions (brackets, enclosures, spacers, mounts)

## When NOT to Use This Skill

- Complex organic modeling (use Blender or sculpting tools)
- Full CAD with constraints and parametric history (use FreeCAD/Fusion360)
- Models requiring NURBS surfaces (use STEP-based CAD tools)
- Editing individual vertices by hand in a GUI

## Dependencies

```bash
pip install trimesh manifold3d numpy scipy lxml shapely --break-system-packages
```

All packages install cleanly from PyPI on Linux x86_64.

## Quick Start Pattern

```python
import trimesh
import numpy as np

# Create geometry
box = trimesh.creation.box(extents=[width, depth, height])

# Modify
hole = trimesh.creation.cylinder(radius=r, height=h+1)
hole.apply_translation([x, y, 0])
result = box.difference(hole)

# Validate for printing
assert result.is_watertight, "Mesh must be watertight for printing"

# Export
result.export("part.stl")   # Binary STL (universal)
result.export("part.3mf")   # 3MF (preferred, smaller, metadata)
```

## Primitives (trimesh.creation)

| Function | Use Case | Key Parameters |
|----------|----------|----------------|
| `box(extents=[x,y,z])` | Rectangular solid | `extents`, `transform` |
| `cylinder(radius, height)` | Round post, hole tool | `radius`, `height`, `sections` (smoothness) |
| `cone(radius, height)` | Tapered shape | `radius`, `height`, `sections` |
| `capsule(radius, height)` | Rounded cylinder | `radius`, `height` |
| `uv_sphere(radius)` | Ball, dome (cut in half) | `radius`, `count=[lat,lon]` |
| `annulus(r_min, r_max, height)` | Washer, ring, bushing | `r_min`, `r_max`, `height` |
| `extrude_polygon(polygon, height)` | Custom 2D → 3D shape | Shapely Polygon, `height` |
| `revolve(linestring, sections)` | Vase, funnel, knob | Nx2 array of XZ profile points |
| `sweep_polygon(polygon, path)` | Channel, rail, pipe | Shapely Polygon, Nx3 path points |

### Smoothness Control

Curved primitives use `sections` parameter (default 32). For 3D printing:
- **Draft/fast**: `sections=16`
- **Normal**: `sections=32`
- **Smooth**: `sections=64`
- **Very smooth**: `sections=128`

Spheres use `count=[lat, lon]` - default `[32, 64]`.

## Boolean Operations

Requires `manifold3d`. All inputs MUST be watertight.

```python
# Subtract: Remove material (holes, cutouts, pockets)
result = base.difference(tool)
result = base.difference([tool1, tool2, tool3])  # Multiple at once

# Add: Combine shapes
result = part_a.union(part_b)
result = part_a.union([part_b, part_c])

# Intersect: Keep only overlap
result = shape_a.intersection(shape_b)
```

**Critical rules for booleans:**
1. Both meshes MUST be watertight (`mesh.is_watertight == True`)
2. Tool mesh should extend past the target (add 1mm+ extra height for through-holes)
3. Use `check_volume=False` if you get errors on valid geometry
4. After boolean, verify result: `result.is_watertight`

## Transformations

```python
# Move
mesh.apply_translation([x, y, z])

# Rotate (angle in radians, around axis)
import trimesh.transformations as tf
mesh.apply_transform(tf.rotation_matrix(np.radians(45), [0, 0, 1]))  # 45° around Z

# Scale uniformly
mesh.apply_scale(2.0)

# Scale non-uniformly
mesh.apply_scale([1.0, 1.0, 0.5])  # Squish Z to half

# Mirror across plane (e.g., YZ plane → flip X)
mesh.vertices[:, 0] *= -1
mesh.fix_normals()

# Center on origin
mesh.apply_translation(-mesh.center_mass)

# Place on build plate (Z=0)
mesh.apply_translation([0, 0, -mesh.bounds[0][2]])
```

## 2D Profile → 3D (with Shapely)

```python
from shapely.geometry import Polygon as ShapelyPolygon

# L-bracket from 2D outline
points = [(0,0), (20,0), (20,5), (5,5), (5,20), (0,20)]
profile = ShapelyPolygon(points)
mesh = trimesh.creation.extrude_polygon(profile, height=3)

# Circle with hole (washer) from 2D
from shapely.geometry import Point
outer = Point(0, 0).buffer(12)   # circle r=12
inner = Point(0, 0).buffer(5)    # circle r=5
washer_2d = outer.difference(inner)
washer = trimesh.creation.extrude_polygon(washer_2d, height=2)

# Rounded rectangle
from shapely.geometry import box as shapely_box
rect = shapely_box(-15, -10, 15, 10).buffer(3, resolution=8)  # 3mm corner radius
plate = trimesh.creation.extrude_polygon(rect, height=2)
```

## Mesh Editing (Existing Files)

```python
# Load
mesh = trimesh.load("input.stl")
# For 3MF (returns Scene), extract geometry:
scene = trimesh.load("input.3mf")
mesh = list(scene.geometry.values())[0]  # first body

# Analyze
print(f"Dimensions: {mesh.extents}")        # [x, y, z] size
print(f"Volume: {mesh.volume:.2f} mm³")
print(f"Watertight: {mesh.is_watertight}")
print(f"Bounds: {mesh.bounds}")              # [[min_x,y,z],[max_x,y,z]]

# Add mounting holes
for pos in [(10, 10), (-10, 10), (10, -10), (-10, -10)]:
    hole = trimesh.creation.cylinder(radius=1.6, height=mesh.extents[2]+2)
    hole.apply_translation([pos[0], pos[1], mesh.center_mass[2]])
    mesh = mesh.difference(hole)

# Slice off top (cut at Z=15)
cutter = trimesh.creation.box(extents=[200, 200, 200])
cutter.apply_translation([0, 0, 15 + 100])  # box starts at Z=15
mesh = mesh.difference(cutter)

# Save
mesh.export("output.stl")
mesh.export("output.3mf")
```

## Mesh Analysis & Validation

```python
# Print readiness check
def check_printability(mesh):
    issues = []
    if not mesh.is_watertight:
        issues.append("Not watertight (has holes)")
    if not mesh.is_winding_consistent:
        issues.append("Inconsistent face normals")
    if mesh.volume < 0:
        issues.append("Inverted normals (negative volume)")
        mesh.invert()  # fix it
    if len(mesh.split()) > 1:
        issues.append(f"Multiple disconnected bodies ({len(mesh.split())})")
    # Check for degenerate faces
    degen = trimesh.triangles.area(mesh.triangles) < 1e-8
    if degen.any():
        issues.append(f"{degen.sum()} degenerate (zero-area) faces")
    return issues if issues else ["Ready to print"]

# Mesh info summary
def mesh_info(mesh):
    return {
        "faces": len(mesh.faces),
        "vertices": len(mesh.vertices),
        "volume_mm3": round(mesh.volume, 2),
        "surface_area_mm2": round(mesh.area, 2),
        "dimensions_mm": mesh.extents.round(2).tolist(),
        "bounds_mm": mesh.bounds.round(2).tolist(),
        "watertight": mesh.is_watertight,
        "bodies": len(mesh.split()),
    }
```

## Mesh Repair

```python
# Basic repair pipeline
mesh.merge_vertices()                    # Remove duplicate vertices
mesh.remove_degenerate_faces()           # Remove zero-area faces
mesh.remove_duplicate_faces()            # Remove overlapping faces
mesh.fill_holes()                        # Close small gaps
mesh.fix_normals()                       # Consistent winding

# If still not watertight, try convex hull as last resort
if not mesh.is_watertight:
    # This loses concave detail but guarantees watertight
    mesh_fixed = mesh.convex_hull
```

## Format Conversion

```python
# STL → 3MF (saves ~50-90% space)
mesh = trimesh.load("model.stl")
mesh.export("model.3mf")

# 3MF → STL
scene = trimesh.load("model.3mf")
for name, geom in scene.geometry.items():
    geom.export(f"{name}.stl")

# Any supported format
mesh.export("model.ply")    # With vertex colors
mesh.export("model.obj")    # ASCII, widely compatible
mesh.export("model.glb")    # Binary glTF, modern
```

## Common 3D Printing Patterns

See `references/printing-patterns.md` for detailed examples including:
- Enclosures with lids and screw bosses
- Mounting brackets with tolerances
- Cable management clips
- Spacers, standoffs, and washers
- Grid/honeycomb infill patterns
- Snap-fit joints

## Print Tolerance Reference

When creating parts that fit together or onto hardware:
- **Tight fit (press-fit)**: +0.1mm per side
- **Normal fit (sliding)**: +0.2mm per side
- **Loose fit (clearance)**: +0.3mm per side
- **Screw holes**: Use nominal screw diameter + 0.3mm for radius
  - M3: radius = 1.65mm, M4: radius = 2.15mm, M5: radius = 2.65mm
- **Heat-set insert holes**: Follow manufacturer spec (typically nominal OD - 0.1mm)

## Output Best Practices

1. **Always validate** watertightness before export
2. **Use millimeters** as the unit (standard for 3D printing)
3. **Place on build plate**: translate so Z-min = 0
4. **Center on origin**: translate XY center to [0, 0]
5. **Prefer 3MF** over STL (smaller, preserves units/metadata)
6. **Name files descriptively**: `bracket_30x20x3_m3_holes.stl`

## Detailed References

- `references/printing-patterns.md` - Common parametric part recipes
- `references/api-quick-ref.md` - Trimesh API cheat sheet
