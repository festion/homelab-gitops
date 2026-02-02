# OpenSCAD Skill

Create parametric 3D models using OpenSCAD, a script-based solid CAD modeler. Use for 3D printable objects, parametric designs, mechanical parts, CAD models, or .scad files.

## Core Concepts

OpenSCAD scripts describe geometry through:
1. **Primitives** - Basic 2D/3D shapes (cube, sphere, cylinder, circle, square, polygon)
2. **Transformations** - Position/modify objects (translate, rotate, scale, mirror, color)
3. **Boolean Operations** - Combine shapes (union, difference, intersection)
4. **Modules** - Reusable parametric components
5. **Extrusion** - Convert 2D to 3D (linear_extrude, rotate_extrude)

## Quick Reference

### 3D Primitives
```openscad
cube([x, y, z], center=false);
cube(size, center=false);
sphere(r=radius);  // or d=diameter
cylinder(h=height, r=radius, center=false);
cylinder(h=height, r1=bottom_r, r2=top_r);  // cone
polyhedron(points=[[x,y,z],...], faces=[[p0,p1,p2],...]);
```

### 2D Primitives
```openscad
square([x, y], center=false);
circle(r=radius);  // or d=diameter
polygon(points=[[x,y],...]);
text("string", size=10, font="Liberation Sans");
```

### Transformations
```openscad
translate([x, y, z]) object();
rotate([x_deg, y_deg, z_deg]) object();
rotate(a=degrees, v=[x,y,z]) object();  // rotate around axis
scale([x, y, z]) object();
mirror([x, y, z]) object();  // mirror across plane
color("red") object();
color([r, g, b, a]) object();  // 0-1 values
```

### Boolean Operations
```openscad
union() { obj1(); obj2(); }         // combine (implicit if no operator)
difference() { base(); cut1(); }    // subtract from first child
intersection() { obj1(); obj2(); }  // keep only overlap
```

### Extrusion (2D to 3D)
```openscad
linear_extrude(height=h, twist=deg, scale=s, slices=n, center=false)
    2d_shape();
rotate_extrude(angle=360, $fn=n)
    2d_shape();  // shape must be on positive X side
```

### Control Structures
```openscad
// Loops
for (i = [0:10]) translate([i*5, 0, 0]) cube(3);
for (i = [0:2:10]) ...;  // start:step:end
for (pos = [[0,0], [10,5], [5,10]]) translate(pos) sphere(2);

// Conditionals
if (condition) { ... } else { ... }
variable = condition ? value_if_true : value_if_false;
```

### Modules and Functions
```openscad
// Module (creates geometry)
module my_part(size=10, holes=true) {
    difference() {
        cube(size);
        if (holes) cylinder(h=size+1, r=size/4, center=true);
    }
}
my_part(20, holes=false);

// Function (returns value)
function circumference(r) = 2 * PI * r;
```

### Special Variables
```openscad
$fn = 100;  // fragments for full circle (overrides $fa/$fs)
$fa = 12;   // minimum angle per fragment
$fs = 2;    // minimum size per fragment
$preview    // true during F5 preview, false during F6 render
```

## Best Practices

### Parametric Design
```openscad
// Define all dimensions as variables
wall_thickness = 2;
inner_diameter = 20;
height = 30;

// Derive other values
outer_diameter = inner_diameter + 2*wall_thickness;
```

### Avoiding Rendering Issues
```openscad
// Use epsilon to prevent z-fighting in boolean operations
eps = 0.01;
difference() {
    cube([10, 10, 10]);
    translate([2, 2, -eps])
        cylinder(h=10 + 2*eps, r=3);  // slightly taller than parent
}
```

### Manifold Geometry for 3D Printing
- Ensure all geometry is watertight (no gaps)
- Holes must fully penetrate surfaces
- Use `render()` to verify complex geometry
- Check face orientation with F12 (Thrown Together view)

---

## Language Reference

### Data Types

```openscad
// Numbers
x = 42;
y = 3.14159;
z = 2.99e8;
PI  // built-in constant

// Booleans
flag = true;
// Falsy values: false, 0, "", [], undef

// Strings
name = "Hello";
escaped = "Line1\nLine2";
unicode = "\u03C0";  // π

// Vectors
point = [1, 2, 3];
point.x;  // 1 (same as point[0])
len(point);  // 3

// Ranges
r1 = [0:10];      // 0,1,2,...,10
r2 = [0:2:10];    // 0,2,4,6,8,10
```

### More 3D Primitives

#### polyhedron
```openscad
// Define points and faces (clockwise winding from outside)
polyhedron(
    points = [
        [0,0,0], [10,0,0], [10,10,0], [0,10,0],  // bottom
        [0,0,10], [10,0,10], [10,10,10], [0,10,10]  // top
    ],
    faces = [
        [0,1,2,3],    // bottom
        [4,5,1,0],    // front
        [7,6,5,4],    // top
        [5,6,2,1],    // right
        [6,7,3,2],    // back
        [7,4,0,3]     // left
    ]
);
```

### More 2D Primitives

#### polygon
```openscad
// Simple polygon
polygon(points=[[0,0], [10,0], [5,10]]);

// Polygon with holes
polygon(
    points=[[0,0], [20,0], [20,20], [0,20],  // outer (0-3)
            [5,5], [15,5], [10,15]],          // hole (4-6)
    paths=[[0,1,2,3], [4,5,6]]
);
```

#### text
```openscad
text("Hello", size=10);
text("World", size=8, font="Liberation Sans:style=Bold");
text("Centered", halign="center", valign="center");
// halign: "left", "center", "right"
// valign: "top", "center", "baseline", "bottom"
```

### More Transformations

#### resize
```openscad
resize([30, 20, 10]) sphere(1);  // resize to exact dimensions
resize([30, 0, 0], auto=true) cube(10);  // auto-scale proportionally
```

#### multmatrix
```openscad
// 4x4 transformation matrix
multmatrix([
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, tz],
    [0, 0, 0, 1]
]) child();
```

#### offset (2D only)
```openscad
offset(r=5) square(10);      // round corners (outward)
offset(r=-2) square(10);     // round corners (inward)
offset(delta=3) square(10);  // sharp corners
```

#### hull
```openscad
// Convex hull of children
hull() {
    translate([0, 0, 0]) cylinder(r=5, h=1);
    translate([20, 0, 0]) cylinder(r=5, h=1);
}
```

#### minkowski
```openscad
// Minkowski sum - rounds edges
minkowski() {
    cube([10, 10, 2]);
    sphere(r=1);
}
```

### Modules with Children
```openscad
module rounded(r=2) {
    minkowski() {
        children();
        sphere(r);
    }
}
rounded(r=1) cube(10);

module distribute(spacing=10) {
    for (i = [0:$children-1])
        translate([i * spacing, 0, 0])
            children(i);
}
```

### Math Functions
```openscad
// Trigonometry (degrees)
sin(45)   cos(45)   tan(45)
asin(x)   acos(x)   atan(x)   atan2(y, x)

// Rounding
floor(3.7)   ceil(3.2)   round(3.5)

// Other
abs(-5)   sign(-5)   sqrt(16)   pow(2, 8)
exp(1)    ln(10)     log(100)
min(1, 5, 3)   max(1, 5, 3)
norm([3, 4])   cross([1,0,0], [0,1,0])
rands(0, 10, 5)  // 5 random numbers 0-10
```

### List Comprehensions
```openscad
squares = [for (i = [1:5]) i*i];  // [1, 4, 9, 16, 25]
evens = [for (i = [1:10]) if (i % 2 == 0) i];
coords = [for (x = [0:2], y = [0:2]) [x, y]];
flat = [for (row = [[1,2], [3,4]]) each row];  // [1, 2, 3, 4]
```

### Import/Export
```openscad
import("model.stl");
import("drawing.dxf");
import("shape.svg");
surface(file="heightmap.png", center=true);
```

### Debugging
```openscad
*cube(10);   // disable
!sphere(5);  // show only
#cube(10);   // highlight
%cylinder(h=10, r=5);  // transparent
echo("Debug:", variable);
assert(r > 0, "Radius must be positive");
```

### File Organization
```openscad
include <library.scad>  // imports everything
use <library.scad>      // imports only modules and functions
```

---

## Example Patterns

### Rounded Box
```openscad
module rounded_box(size, radius) {
    hull() {
        for (x = [radius, size.x - radius])
            for (y = [radius, size.y - radius])
                translate([x, y, 0])
                    cylinder(r=radius, h=size.z);
    }
}
```

### Hollow Box
```openscad
module hollow_box(outer, wall) {
    difference() {
        cube(outer);
        translate([wall, wall, wall])
            cube([outer.x - 2*wall, outer.y - 2*wall, outer.z]);
    }
}
```

### Screw Hole with Counterbore
```openscad
module counterbore_hole(depth, hole_d, cbore_d, cbore_depth) {
    union() {
        cylinder(h=depth, d=hole_d);
        cylinder(h=cbore_depth, d=cbore_d);
    }
}
```

### Bolt Pattern
```openscad
module bolt_pattern(count, radius) {
    for (i = [0:count-1])
        rotate([0, 0, i * 360/count])
            translate([radius, 0, 0])
                children();
}
```

### Circular Array
```openscad
module circular_array(count, radius) {
    for (i = [0:count-1])
        rotate([0, 0, i * 360/count])
            translate([radius, 0, 0])
                children();
}
```

### Mirror with Original
```openscad
module mirror_copy(v) {
    children();
    mirror(v) children();
}
```

## Output

Save generated code as `.scad` files. Users can open in OpenSCAD for:
- F5: Quick preview
- F6: Full render (required before export)
- Export to STL/AMF/3MF for 3D printing
