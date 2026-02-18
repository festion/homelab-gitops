#!/usr/bin/env python3
"""
mesh3d environment validation script.
Run this to verify all dependencies are installed and working.
"""

import sys
import os

def check_import(module, feature):
    try:
        __import__(module)
        print(f"  ✓ {module} ({feature})")
        return True
    except ImportError:
        print(f"  ✗ {module} ({feature}) - pip install {module} --break-system-packages")
        return False

def run_tests():
    print("=== mesh3d Environment Check ===\n")
    
    print("Dependencies:")
    ok = True
    ok &= check_import("trimesh", "mesh I/O and creation")
    ok &= check_import("numpy", "array math")
    ok &= check_import("manifold3d", "boolean operations")
    ok &= check_import("scipy", "spatial operations")
    ok &= check_import("lxml", "3MF format support")
    ok &= check_import("shapely", "2D polygon creation")
    
    if not ok:
        print("\n✗ Missing dependencies. Install with:")
        print("  pip install trimesh manifold3d numpy scipy lxml shapely --break-system-packages")
        return False
    
    print("\nFunctional Tests:")
    import trimesh
    import numpy as np
    
    # Primitives
    box = trimesh.creation.box(extents=[10, 10, 5])
    cyl = trimesh.creation.cylinder(radius=3, height=7, sections=32)
    assert box.is_watertight, "Box should be watertight"
    assert cyl.is_watertight, "Cylinder should be watertight"
    print("  ✓ Primitive creation (box, cylinder)")
    
    # Boolean
    result = box.difference(cyl)
    assert result.is_watertight, "Boolean result should be watertight"
    print("  ✓ Boolean operations (manifold3d)")
    
    # STL export/import
    import io
    stl_data = result.export(file_type='stl')
    reloaded = trimesh.load(io.BytesIO(stl_data), file_type='stl')
    assert len(reloaded.faces) > 0, "STL reload should have faces"
    print("  ✓ STL export/import")
    
    # 3MF export/import
    threemf_data = result.export(file_type='3mf')
    reloaded_3mf = trimesh.load(io.BytesIO(threemf_data), file_type='3mf')
    assert len(reloaded_3mf.geometry) > 0, "3MF reload should have geometry"
    print("  ✓ 3MF export/import")
    
    # 2D extrusion
    from shapely.geometry import Polygon as ShapelyPolygon
    poly = ShapelyPolygon([(0,0), (10,0), (10,5), (0,5)])
    extruded = trimesh.creation.extrude_polygon(poly, height=3)
    assert extruded.is_watertight, "Extruded polygon should be watertight"
    print("  ✓ 2D polygon extrusion (shapely)")
    
    # Transforms
    mesh = trimesh.creation.box(extents=[5, 5, 5])
    mesh.apply_translation([10, 0, 0])
    mesh.apply_scale(2.0)
    assert abs(mesh.center_mass[0] - 20.0) < 0.01, "Transform should work"
    print("  ✓ Transformations (translate, scale)")
    
    # Mesh analysis
    info = {
        "volume": box.volume,
        "area": box.area,
        "watertight": box.is_watertight,
        "extents": box.extents.tolist(),
    }
    assert info["volume"] > 0, "Volume should be positive"
    print("  ✓ Mesh analysis (volume, area, bounds)")
    
    print(f"\n=== All tests passed ===")
    print(f"trimesh version: {trimesh.__version__}")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
