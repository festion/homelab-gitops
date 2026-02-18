# Trimesh API Quick Reference

## Installation

```bash
pip install trimesh manifold3d numpy scipy lxml shapely --break-system-packages
```

| Package | Purpose |
|---------|---------|
| `trimesh` | Core mesh library (load, create, export, analyze) |
| `manifold3d` | Boolean engine (union, difference, intersection) |
| `numpy` | Array math (vertices, faces, transforms) |
| `scipy` | Spatial operations (convex hull, nearest point) |
| `lxml` | 3MF format support (XML-based) |
| `shapely` | 2D polygon creation for extrusion |

## Imports

```python
import trimesh
import trimesh.transformations as tf
import numpy as np
from shapely.geometry import Polygon as ShapelyPolygon, Point, box as shapely_box
```

## Loading Files

```python
# STL (returns Trimesh)
mesh = trimesh.load("file.stl")

# 3MF (returns Scene containing one or more meshes)
scene = trimesh.load("file.3mf")
mesh = list(scene.geometry.values())[0]           # first body
meshes = {name: geom for name, geom in scene.geometry.items()}  # all bodies

# OBJ, PLY, GLB, OFF
mesh = trimesh.load("file.obj")

# From bytes/buffer
import io
mesh = trimesh.load(io.BytesIO(data), file_type='stl')
```

## Creating Primitives

```python
# All units in mm. All results are watertight Trimesh objects.

# Box (centered at origin)
trimesh.creation.box(extents=[x, y, z])

# Cylinder (centered at origin, along Z)
trimesh.creation.cylinder(radius=r, height=h, sections=32)

# Cone (base at Z=0, apex at Z=h)
trimesh.creation.cone(radius=r, height=h, sections=32)

# Sphere (centered at origin)
trimesh.creation.uv_sphere(radius=r, count=[32, 64])

# Capsule (cylinder + hemispherical caps)
trimesh.creation.capsule(radius=r, height=h)

# Annulus / Ring (centered at origin, along Z)
trimesh.creation.annulus(r_min=ri, r_max=ro, height=h, sections=64)

# From 2D polygon (extrude along Z)
trimesh.creation.extrude_polygon(shapely_polygon, height=h)

# From 2D profile (revolve around Z axis)
# profile is Nx2 array of [x, z] points
trimesh.creation.revolve(linestring=profile, sections=32)

# Sweep 2D polygon along 3D path
trimesh.creation.sweep_polygon(shapely_polygon, path_points)
```

## Transformations

```python
# Translate (in-place, returns None)
mesh.apply_translation([x, y, z])

# Rotate around axis
# axis: [1,0,0]=X, [0,1,0]=Y, [0,0,1]=Z
matrix = tf.rotation_matrix(angle_radians, axis)
mesh.apply_transform(matrix)

# Rotate around axis at specific point
matrix = tf.rotation_matrix(angle_radians, axis, point=[x,y,z])
mesh.apply_transform(matrix)

# Scale
mesh.apply_scale(factor)         # uniform
mesh.apply_scale([sx, sy, sz])   # per-axis

# Arbitrary 4x4 transform
mesh.apply_transform(matrix_4x4)

# Convenience: center on origin
mesh.apply_translation(-mesh.center_mass)

# Place on build plate (Z=0)
mesh.apply_translation([0, 0, -mesh.bounds[0][2]])

# Helper: build rotation from euler angles
matrix = tf.euler_matrix(rx, ry, rz, axes='sxyz')  # radians
```

## Boolean Operations

```python
# Requires manifold3d. All meshes must be watertight.

result = a.difference(b)        # a minus b
result = a.difference([b, c])   # a minus b minus c
result = a.union(b)             # combine
result = a.union([b, c])        # combine multiple
result = a.intersection(b)      # keep overlap only

# If watertight check fails on valid geometry:
result = a.difference(b, check_volume=False)
```

## Mesh Properties

```python
mesh.vertices        # (n, 3) float array of XYZ positions
mesh.faces           # (m, 3) int array of vertex indices
mesh.face_normals    # (m, 3) unit normals per face
mesh.vertex_normals  # (n, 3) unit normals per vertex

mesh.bounds          # [[min_x, min_y, min_z], [max_x, max_y, max_z]]
mesh.extents         # [size_x, size_y, size_z]
mesh.center_mass     # [x, y, z] volumetric center

mesh.volume          # float, mm³ (only meaningful if watertight)
mesh.area            # float, mm² surface area

mesh.is_watertight   # bool - closed surface, no holes
mesh.is_winding_consistent  # bool - all normals consistent
mesh.euler_number    # int - topological invariant (2 for closed)

mesh.triangles       # (m, 3, 3) actual triangle coordinates
mesh.bounding_box    # OBB as Trimesh
```

## Mesh Operations

```python
# Split disconnected bodies
bodies = mesh.split()  # list of Trimesh

# Merge vertices within tolerance
mesh.merge_vertices()

# Remove degenerate/duplicate faces
mesh.remove_degenerate_faces()
mesh.remove_duplicate_faces()

# Fix normals (consistent winding)
mesh.fix_normals()

# Fill holes
mesh.fill_holes()

# Invert (flip inside-out)
mesh.invert()

# Copy
mesh_copy = mesh.copy()

# Convex hull
hull = mesh.convex_hull

# Slice at plane (returns Path3D cross-section)
section = mesh.section(plane_origin=[0,0,5], plane_normal=[0,0,1])

# Slice to new mesh (keep below plane)
# Use boolean with large box for this
```

## Exporting

```python
# Binary STL (most compatible, no metadata)
mesh.export("output.stl")

# 3MF (compressed, preserves units, recommended)
mesh.export("output.3mf")

# Others
mesh.export("output.ply")
mesh.export("output.obj")
mesh.export("output.glb")
mesh.export("output.off")

# To bytes (for API/network use)
data = mesh.export(file_type='stl')     # returns bytes
data = mesh.export(file_type='3mf')     # returns bytes

# Scene with multiple bodies (for 3MF)
scene = trimesh.Scene()
scene.add_geometry(body, node_name="body")
scene.add_geometry(lid, node_name="lid")
scene.export("assembly.3mf")
```

## Shapely 2D Helpers

```python
from shapely.geometry import Polygon, Point, LineString, MultiPolygon
from shapely.geometry import box as shapely_box
from shapely.ops import unary_union

# Rectangle
rect = shapely_box(x_min, y_min, x_max, y_max)

# Circle
circle = Point(cx, cy).buffer(radius, resolution=32)

# Rounded rectangle
rounded_rect = shapely_box(-w/2, -h/2, w/2, h/2).buffer(corner_r, resolution=8)

# Custom polygon from points
poly = Polygon([(x1,y1), (x2,y2), ...])

# 2D boolean
result = poly_a.difference(poly_b)   # subtract
result = poly_a.union(poly_b)        # combine
result = poly_a.intersection(poly_b) # overlap

# Offset (grow/shrink)
bigger = poly.buffer(distance)     # positive = grow
smaller = poly.buffer(-distance)   # negative = shrink

# Combine many shapes
combined = unary_union([poly1, poly2, poly3])
```

## Common Patterns

```python
# Through-hole: tool must be taller than target
hole = trimesh.creation.cylinder(radius=r, height=target_h + 2, sections=32)

# Counterbore: two-step hole
shaft = trimesh.creation.cylinder(radius=1.65, height=plate_h + 2, sections=32)
head = trimesh.creation.cylinder(radius=3.0, height=3.5, sections=32)
head.apply_translation([0, 0, plate_h - 3.5])
counterbore = shaft.union(head)
plate = plate.difference(counterbore)

# Array of features (holes, bosses, etc.)
features = []
for x, y in positions:
    f = make_feature()
    f.apply_translation([x, y, 0])
    features.append(f)
base = base.difference(features)  # or .union(features)

# Mirror a part
mirrored = mesh.copy()
mirrored.vertices[:, 0] *= -1  # mirror across YZ plane
mirrored.fix_normals()
```
