# mesh3d - 3D Printable Mesh Creation & Editing

Create and edit STL/3MF files programmatically using Python trimesh + manifold3d.

## Setup
```bash
pip install trimesh manifold3d numpy scipy lxml shapely --break-system-packages
```

## Core Pattern
```python
import trimesh
import numpy as np

# Create → Modify → Validate → Export
box = trimesh.creation.box(extents=[width, depth, height])
hole = trimesh.creation.cylinder(radius=r, height=h+1, sections=32)
hole.apply_translation([x, y, 0])
result = box.difference(hole)
assert result.is_watertight
result.apply_translation([0, 0, -result.bounds[0][2]])  # place on build plate
result.export("part.3mf")
```

## Primitives
- `trimesh.creation.box(extents=[x,y,z])` - rectangular solid
- `trimesh.creation.cylinder(radius, height, sections=32)` - round post/hole tool
- `trimesh.creation.cone(radius, height)` - tapered
- `trimesh.creation.uv_sphere(radius)` - ball
- `trimesh.creation.annulus(r_min, r_max, height)` - washer/ring
- `trimesh.creation.capsule(radius, height)` - rounded cylinder
- `trimesh.creation.extrude_polygon(shapely_polygon, height)` - 2D→3D
- `trimesh.creation.revolve(profile_nx2, sections=32)` - lathe/vase

## Booleans (require manifold3d, meshes must be watertight)
```python
result = base.difference(tool)       # subtract (holes, cutouts)
result = a.union(b)                  # combine
result = a.intersection(b)          # keep overlap
result = base.difference([t1, t2])  # multiple at once
```

## Transforms
```python
mesh.apply_translation([x, y, z])
mesh.apply_transform(trimesh.transformations.rotation_matrix(np.radians(45), [0,0,1]))
mesh.apply_scale(2.0)
mesh.apply_translation(-mesh.center_mass)  # center
mesh.apply_translation([0, 0, -mesh.bounds[0][2]])  # place on Z=0
```

## 2D Profiles (shapely)
```python
from shapely.geometry import Polygon as SP, Point, box as sbox
profile = SP([(0,0),(20,0),(20,5),(5,5),(5,20),(0,20)])  # L-shape
mesh = trimesh.creation.extrude_polygon(profile, height=3)
circle = Point(0,0).buffer(10)  # circle r=10
rounded_rect = sbox(-15,-10,15,10).buffer(3, resolution=8)  # corner radius
```

## Loading/Editing Existing Files
```python
mesh = trimesh.load("input.stl")
scene = trimesh.load("input.3mf"); mesh = list(scene.geometry.values())[0]
print(mesh.extents, mesh.volume, mesh.is_watertight)
```

## Tolerances for FDM
- Press-fit: +0.1mm/side | Sliding: +0.2mm/side | Clearance: +0.3mm/side
- M3 clearance hole: r=1.65mm | M4: r=2.15mm | M5: r=2.65mm

## Validation
```python
assert mesh.is_watertight, "Must be watertight for printing"
mesh.fix_normals()  # fix if needed
```

## Export
```python
mesh.export("part.stl")   # universal
mesh.export("part.3mf")   # preferred (smaller, metadata)
```
