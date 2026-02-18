# Common 3D Printing Patterns

Reusable recipes for parts frequently needed in 3D printing workflows.
All dimensions in millimeters. All meshes validated watertight before export.

## Enclosure / Box with Lid

```python
import trimesh
import numpy as np
from shapely.geometry import box as shapely_box

def make_enclosure(inner_w, inner_d, inner_h, wall=2.0, corner_r=2.0,
                   lid_height=5.0, lip=1.5, tolerance=0.2):
    """
    Create a box enclosure with removable lid and friction-fit lip.
    Returns (body, lid) tuple.
    """
    outer_w = inner_w + 2*wall
    outer_d = inner_d + 2*wall

    # Body: outer shell minus inner cavity
    outer_2d = shapely_box(-outer_w/2, -outer_d/2, outer_w/2, outer_d/2)
    if corner_r > 0:
        outer_2d = outer_2d.buffer(corner_r, resolution=8).buffer(-corner_r, resolution=8)
    body_outer = trimesh.creation.extrude_polygon(outer_2d, height=inner_h + wall)

    inner_2d = shapely_box(-inner_w/2, -inner_d/2, inner_w/2, inner_d/2)
    if corner_r > 0:
        inner_2d = inner_2d.buffer(max(corner_r-wall, 0.5), resolution=8).buffer(-max(corner_r-wall, 0.5), resolution=8)
    body_cavity = trimesh.creation.extrude_polygon(inner_2d, height=inner_h)
    body_cavity.apply_translation([0, 0, wall])

    body = body_outer.difference(body_cavity)

    # Lid: flat top + lip that fits inside body
    lid_outer = trimesh.creation.extrude_polygon(outer_2d, height=wall)
    lip_w = inner_w - 2*tolerance
    lip_d = inner_d - 2*tolerance
    lip_2d = shapely_box(-lip_w/2, -lip_d/2, lip_w/2, lip_d/2)
    if corner_r > 0:
        lip_2d = lip_2d.buffer(max(corner_r-wall-tolerance, 0.5), resolution=8).buffer(-max(corner_r-wall-tolerance, 0.5), resolution=8)
    lid_lip = trimesh.creation.extrude_polygon(lip_2d, height=lip)
    lid_lip.apply_translation([0, 0, -lip])
    lid = lid_outer.union(lid_lip)

    # Place body on build plate
    body.apply_translation([0, 0, -body.bounds[0][2]])
    # Flip lid for printing (lip side up for bridging, or down for fit)
    lid.apply_translation([0, 0, -lid.bounds[0][2]])

    return body, lid

# Usage:
# body, lid = make_enclosure(60, 40, 25)
# body.export("enclosure_body.stl")
# lid.export("enclosure_lid.stl")
```

## Mounting Bracket (L-Bracket with Holes)

```python
def make_l_bracket(width, leg_a, leg_b, thickness, hole_d=3.3,
                   hole_inset=6.0, fillet_r=0):
    """
    L-shaped mounting bracket with screw holes in both legs.
    hole_d: clearance hole diameter (3.3mm for M3)
    """
    from shapely.geometry import Polygon as ShapelyPolygon

    # L-profile
    points = [
        (0, 0), (width, 0), (width, thickness),
        (thickness, thickness), (thickness, leg_b),
        (0, leg_b)
    ]
    profile = ShapelyPolygon(points)
    bracket = trimesh.creation.extrude_polygon(profile, height=leg_a)

    # Holes in horizontal leg (through Z)
    for x_off in [hole_inset, width - hole_inset]:
        hole = trimesh.creation.cylinder(radius=hole_d/2, height=thickness+2, sections=32)
        hole.apply_translation([x_off, thickness/2, leg_a/2])
        bracket = bracket.difference(hole)

    # Holes in vertical leg (through Y)
    for x_off in [hole_inset, width - hole_inset]:
        hole = trimesh.creation.cylinder(radius=hole_d/2, height=thickness+2, sections=32)
        rot = trimesh.transformations.rotation_matrix(np.radians(90), [1, 0, 0])
        hole.apply_transform(rot)
        hole.apply_translation([x_off, leg_b - hole_inset, leg_a/2])
        bracket = bracket.difference(hole)

    bracket.apply_translation([0, 0, -bracket.bounds[0][2]])
    return bracket

# Usage:
# bracket = make_l_bracket(width=30, leg_a=20, leg_b=25, thickness=3)
# bracket.export("l_bracket.stl")
```

## Spacer / Standoff

```python
def make_standoff(outer_d, inner_d, height, hex=False):
    """
    Cylindrical or hex standoff with through-hole.
    outer_d: outer diameter
    inner_d: through-hole diameter
    """
    if hex:
        # Hex: create 6-sided polygon
        angles = np.linspace(0, 2*np.pi, 7)[:-1]
        r = outer_d / 2
        points = [(r * np.cos(a), r * np.sin(a)) for a in angles]
        from shapely.geometry import Polygon as ShapelyPolygon
        hex_2d = ShapelyPolygon(points)
        outer = trimesh.creation.extrude_polygon(hex_2d, height=height)
    else:
        outer = trimesh.creation.cylinder(radius=outer_d/2, height=height, sections=64)

    hole = trimesh.creation.cylinder(radius=inner_d/2, height=height+2, sections=32)
    standoff = outer.difference(hole)
    standoff.apply_translation([0, 0, -standoff.bounds[0][2]])
    return standoff

# Usage:
# standoff = make_standoff(outer_d=8, inner_d=3.3, height=10)
# standoff.export("m3_standoff_10mm.stl")
```

## Cable Clip / Wire Holder

```python
def make_cable_clip(cable_d, wall=1.5, base_w=10, base_h=2,
                    screw_d=3.3, gap_angle=60):
    """
    Snap-in cable clip with screw mounting hole.
    cable_d: cable diameter
    gap_angle: opening angle in degrees
    """
    r_inner = cable_d / 2
    r_outer = r_inner + wall
    clip_h = r_outer + base_h

    # Ring section
    ring = trimesh.creation.annulus(r_min=r_inner, r_max=r_outer, height=base_w, sections=64)

    # Cut opening gap
    gap_box = trimesh.creation.box(extents=[r_outer*3, r_outer*3, base_w+2])
    rot = trimesh.transformations.rotation_matrix(np.radians(90 - gap_angle/2), [0, 0, 1])
    gap_box.apply_transform(rot)
    gap_box.apply_translation([0, r_outer, 0])
    ring = ring.difference(gap_box)

    # Base plate
    base = trimesh.creation.box(extents=[base_w, base_w, base_h])
    base.apply_translation([0, -r_outer - base_h/2 + wall/2, 0])
    clip = ring.union(base)

    # Mounting hole through base
    hole = trimesh.creation.cylinder(radius=screw_d/2, height=base_h+2, sections=32)
    rot90 = trimesh.transformations.rotation_matrix(np.radians(90), [1, 0, 0])
    hole.apply_transform(rot90)
    hole.apply_translation([0, -r_outer - base_h/2 + wall/2, 0])
    clip = clip.difference(hole)

    clip.apply_translation([0, 0, -clip.bounds[0][2]])
    return clip
```

## Grid / Honeycomb Pattern

```python
def make_grid_plate(width, depth, height, hole_size, spacing, margin=3):
    """
    Flat plate with rectangular grid of holes.
    Useful for ventilation, drainage, or lightweight panels.
    """
    plate = trimesh.creation.box(extents=[width, depth, height])

    holes = []
    x_start = -width/2 + margin + hole_size/2
    y_start = -depth/2 + margin + hole_size/2
    x = x_start
    while x + hole_size/2 + margin <= width/2:
        y = y_start
        while y + hole_size/2 + margin <= depth/2:
            hole = trimesh.creation.box(extents=[hole_size, hole_size, height+2])
            hole.apply_translation([x, y, 0])
            holes.append(hole)
            y += spacing
        x += spacing

    if holes:
        plate = plate.difference(holes)
    plate.apply_translation([0, 0, -plate.bounds[0][2]])
    return plate
```

## Screw Boss (for enclosures)

```python
def make_screw_boss(outer_d, inner_d, height, base_fillet=True):
    """
    Cylindrical post for receiving self-tapping screws.
    Place inside enclosures at corners.
    Typical: outer_d=6, inner_d=2.5 for M3 self-tap
    """
    boss = trimesh.creation.cylinder(radius=outer_d/2, height=height, sections=32)

    if base_fillet:
        # Add triangular support ring at base
        fillet = trimesh.creation.cone(radius=outer_d/2 + height*0.3, height=height*0.3, sections=32)
        boss = boss.union(fillet)

    hole = trimesh.creation.cylinder(radius=inner_d/2, height=height+1, sections=32)
    boss = boss.difference(hole)
    boss.apply_translation([0, 0, -boss.bounds[0][2]])
    return boss
```

## Flat Plate with Arbitrary Hole Pattern

```python
def make_plate_with_holes(width, depth, thickness, holes):
    """
    Generic plate with positioned holes.
    holes: list of (x, y, diameter) tuples
    """
    plate = trimesh.creation.box(extents=[width, depth, thickness])

    for x, y, d in holes:
        hole = trimesh.creation.cylinder(radius=d/2, height=thickness+2, sections=32)
        hole.apply_translation([x, y, 0])
        plate = plate.difference(hole)

    plate.apply_translation([0, 0, -plate.bounds[0][2]])
    return plate

# Usage: DIN rail mount plate
# plate = make_plate_with_holes(
#     width=50, depth=30, thickness=3,
#     holes=[(15, 0, 3.3), (-15, 0, 3.3), (0, 10, 4.3)]
# )
```

## Round Enclosure (Puck/Case)

```python
def make_round_enclosure(inner_d, inner_h, wall=2.0, floor=2.0):
    """
    Cylindrical enclosure (like a puck case).
    Returns (body, lid) tuple.
    """
    outer_r = inner_d/2 + wall
    body_h = inner_h + floor

    body = trimesh.creation.cylinder(radius=outer_r, height=body_h, sections=64)
    cavity = trimesh.creation.cylinder(radius=inner_d/2, height=inner_h, sections=64)
    cavity.apply_translation([0, 0, floor])
    body = body.difference(cavity)

    lid = trimesh.creation.cylinder(radius=outer_r, height=wall, sections=64)
    lip = trimesh.creation.cylinder(radius=inner_d/2 - 0.2, height=1.5, sections=64)
    lip.apply_translation([0, 0, -1.5])
    lid = lid.union(lip)

    body.apply_translation([0, 0, -body.bounds[0][2]])
    lid.apply_translation([0, 0, -lid.bounds[0][2]])
    return body, lid
```
