# Prusa Mini+ with E3D Revo Micro & ObXidian Nozzles

Print settings, optimization, and G-code reference for Prusa Mini+ with E3D Revo Micro hotend and ObXidian nozzles.

## Printer Configuration

- **Printer**: Prusa Mini+ (Buddy firmware)
- **Hotend**: E3D Revo Micro (max 300°C)
- **Extruder**: Bowden tube setup
- **Nozzles**: ObXidian (hardened steel, wear-resistant)
  - 0.25mm - Fine detail
  - 0.4mm - General purpose (default)
  - 0.6mm - Faster prints, good detail
  - 0.8mm - Fast prints, functional parts

## Nozzle Selection Guide

| Nozzle | Layer Height | Best For | Trade-offs |
|--------|--------------|----------|------------|
| 0.25mm | 0.05-0.15mm | Miniatures, fine text, intricate details | Slow, prone to clogs |
| 0.4mm | 0.10-0.25mm | General purpose, balanced quality/speed | Standard choice |
| 0.6mm | 0.15-0.40mm | Larger prints, functional parts | Less fine detail |
| 0.8mm | 0.20-0.50mm | Fast prototypes, large functional parts | Visible layers |

**Layer height rule**: Min ~25% of nozzle diameter, max ~80%

## ObXidian Nozzle Considerations

ObXidian nozzles are hardened steel with excellent wear resistance for abrasive filaments. However:

- **Lower thermal conductivity** than brass - may need:
  - 5-10°C higher temperatures
  - Slightly slower speeds for fine details
- **Excellent for**: Carbon fiber, glass fiber, wood-fill, glow-in-dark, metal-fill
- **Works fine with**: PLA, PETG, ASA, ABS (just adjust temps)

## Temperature Settings by Material

### PLA (with ObXidian)
```
Nozzle: 215-220°C (5-10°C higher than brass)
Bed: 60°C first layer, 55°C after
Fan: 100% after first layer
```

### PETG (with ObXidian)
```
Nozzle: 240-250°C
Bed: 85°C first layer, 80°C after
Fan: 30-50% (reduce stringing)
```

### ASA (with ObXidian)
```
Nozzle: 255-265°C
Bed: 100-110°C
Fan: 0-30% (warping sensitive)
Enclosure: Recommended
```

### ABS (with ObXidian)
```
Nozzle: 250-260°C
Bed: 100-110°C
Fan: 0-20%
Enclosure: Required
```

### TPU/Flexible (with ObXidian)
```
Nozzle: 225-235°C
Bed: 50-60°C
Fan: 50-100%
Speed: 20-30mm/s max (bowden limitation)
Retraction: Minimal (2-3mm, 25mm/s)
```

## Print Speed Guidelines

### Speed by Nozzle Size
| Nozzle | Perimeters | Infill | Travel |
|--------|------------|--------|--------|
| 0.25mm | 25-40mm/s | 40-60mm/s | 150mm/s |
| 0.4mm | 40-60mm/s | 60-100mm/s | 180mm/s |
| 0.6mm | 40-70mm/s | 80-120mm/s | 180mm/s |
| 0.8mm | 40-60mm/s | 80-150mm/s | 180mm/s |

## Retraction Settings

| Material | Distance | Speed |
|----------|----------|-------|
| PLA | 3.2mm | 45mm/s |
| PETG | 4.0mm | 40mm/s |
| ASA/ABS | 3.5mm | 40mm/s |
| TPU | 2.0-3.0mm | 25mm/s |

**Nozzle adjustment**: Larger nozzles may need +0.5mm distance

## First Layer Settings
```
Speed: 20mm/s
Flow: 100-105%
Line width: 120% of nozzle diameter
Temperature: +5°C from normal
```

## Common Issues & Solutions

### Stringing
- Increase retraction distance (+0.5mm increments)
- Lower temperature (-5°C)
- Enable "Wipe while retracting"
- Dry filament if hygroscopic

### Poor First Layer Adhesion
- Re-run Live-Z calibration
- Clean bed with IPA (90%+)
- Increase first layer temp (+5-10°C)
- Increase first layer flow (105%)

### Warping
- Increase bed temp
- Use enclosure (ASA/ABS)
- Enable brim
- Reduce part cooling fan

### Clogs (especially 0.25mm)
- Increase temperature
- Reduce retraction count
- Check bowden tube seating
- Clean nozzle with cold pull

## Pressure Advance (Linear Advance)

Bowden systems need higher LA values:
- PLA: 0.04-0.08
- PETG: 0.05-0.10
- ABS/ASA: 0.04-0.08

---

# Buddy Firmware G-code Reference

G-code commands for Prusa Mini/Mini+, MK4, MK3.5, and XL printers running Buddy firmware.

## G-codes (Movement & Calibration)

### G0/G1 - Linear Move
```gcode
G1 X100 Y100 Z10 F3000  ; Move to position at 3000mm/min
G1 E10 F300             ; Extrude 10mm at 300mm/min
```

### G4 - Dwell (Pause)
```gcode
G4 P1000  ; Pause for 1000ms
G4 S5     ; Pause for 5 seconds
```

### G28 - Home Axes
```gcode
G28      ; Home all axes
G28 X Y  ; Home X and Y only
G28 Z    ; Home Z only
```

### G29 - Mesh Bed Leveling (MBL)
```gcode
G29  ; Start mesh bed leveling
```

### G80 - Mesh-based Z Probe (MK3 compat)
Performs MBL same as G29.

### G90/G91 - Positioning Mode
```gcode
G90  ; Absolute positioning
G91  ; Relative positioning
```

### G92 - Set Position
```gcode
G92 E0      ; Reset extruder position to 0
G92 X10 Y10 ; Set current position as X10 Y10
```

## M-codes (Settings & Control)

### Temperature Control

#### M104/M109 - Hotend Temperature
```gcode
M104 S200     ; Set hotend to 200°C (don't wait)
M109 S200     ; Heat to 200°C and wait
M109 R180     ; Heat/cool to 180°C and wait
```

#### M140/M190 - Bed Temperature
```gcode
M140 S60      ; Set bed to 60°C (don't wait)
M190 S60      ; Heat bed to 60°C and wait
```

#### M105 - Report Temperatures
```gcode
M105          ; Report current temperatures
```

### Fan Control

```gcode
M106 S255     ; Fan 100%
M106 S127     ; Fan ~50%
M107          ; Fan off
```

### Motion Control

```gcode
M17           ; Enable all steppers
M18           ; Disable all steppers
M84 S30       ; Set stepper timeout to 30 seconds
M82           ; Absolute extruder mode
M83           ; Relative extruder mode
```

#### M220 - Set Speed Factor
```gcode
M220 S100     ; 100% speed
M220 S150     ; 150% speed override
```

#### M221 - Set Flow Rate
```gcode
M221 S95      ; 95% flow rate
```

### Print Control

```gcode
M0            ; Pause and wait for user
M25           ; Pause print
M25 U         ; Pause and unload filament
M24           ; Resume paused print
```

#### M73 - Set Progress
```gcode
M73 P50 R30   ; 50% complete, 30 min remaining
```

#### M400 - Wait for Moves
```gcode
M400          ; Wait for all moves to complete
```

### Filament Operations

#### M600 - Filament Change
```gcode
M600              ; Filament change at current position
M600 E-3 Z10      ; Retract 3mm, raise Z 10mm
M600 X10 Y10      ; Move to X10 Y10 for change
```

#### M701 - Load Filament
```gcode
M701              ; Load filament
M701 S"PLA"       ; Load and set filament type
```

#### M702 - Unload Filament
```gcode
M702              ; Unload filament
```

### Bed Leveling

#### M420 - Bed Leveling Control
```gcode
M420 S1           ; Enable bed leveling
M420 S0           ; Disable bed leveling
M420 Z10          ; Set fade height to 10mm
M420 V            ; Print leveling grid
```

#### M851 - Z Probe Offset
```gcode
M851 Z-1.5        ; Set Z probe offset to -1.5mm
```

### Configuration

```gcode
M500              ; Save settings to EEPROM
M501              ; Load settings from EEPROM
M502              ; Reset to factory defaults
M503              ; Print current settings
```

### Input Shaper

#### M593 - Set Input Shaper
```gcode
M593 F40 D0.1           ; Frequency 40Hz, damping 0.1
M593 X F45              ; X-axis frequency 45Hz
M593 Y F38              ; Y-axis frequency 38Hz
M593 T0                 ; Type: ZV
M593 T1                 ; Type: ZVD
M593 T2                 ; Type: MZV
M593 T3                 ; Type: EI
M593 W                  ; Save to EEPROM
```

### Pressure Advance

#### M572 - Pressure Advance
```gcode
M572 S0.05              ; Set pressure advance to 0.05
M572 D0 S0.04           ; Extruder 0, PA 0.04
```

#### M900 - Linear Advance
```gcode
M900 K0.05              ; Set linear advance K factor
```

### Stepper Drivers

#### M569 - StealthChop Mode
```gcode
M569 S1 X         ; Enable StealthChop on X
M569 S0 E         ; SpreadCycle mode on E
```

#### M906 - Motor Current
```gcode
M906 X800 Y800    ; Set X/Y current to 800mA
M906 E500         ; Set extruder current to 500mA
```

### Display & Communication

```gcode
M117 Printing...  ; Show message on LCD
M118 Debug info   ; Print to host console
M300 S1000 P200   ; 1000Hz beep for 200ms
```

### Printer Checks

```gcode
M862.1 P0.4       ; Verify 0.4mm nozzle
M862.1 Q          ; Query current nozzle
M862.3 P "MINI"   ; Verify printer is MINI
```

### Filament Monitoring

```gcode
M591 S1           ; Enable stuck detection
M591 S0           ; Disable stuck detection
```

### Print Area

```gcode
M555 X50 Y50 W100 H100  ; Set print area for detailed MBL
```

### System

```gcode
M80               ; Turn on power supply
M81               ; Turn off power supply
M115              ; Report firmware version
M119              ; Report endstop states
M997              ; Trigger firmware update
M999              ; Restart printer
M999 R            ; Hard reset MCU
```

### Prusa-Specific

```gcode
M50               ; Run selftest
M50 X             ; X-axis test only
M50 F             ; Fan test only
M509              ; Open language selection
M1600             ; Open filament change dialog
M1600 S"PETG"     ; Change to PETG
M1700             ; Open preheat menu
M1700 S"PLA"      ; Preheat for PLA
M1587             ; Open WiFi setup dialog
```

## T-codes (Tool Selection)

```gcode
T0                ; Select tool 0 / MMU slot 0
T1                ; Select tool 1 / MMU slot 1
T0 S1             ; Select without XY move
```

## MMU3 Commands

```gcode
M704 P0           ; Preload to MMU slot 0
M705 P0           ; Eject from MMU slot 0
M706 P0           ; Cut filament at MMU slot 0
M707 A0x19        ; Read MMU register
M708 A0x19 X7     ; Write to MMU register
M709 X0           ; Soft reset MMU
M709 X2           ; Power cycle MMU
M863 M P0 L1      ; Remap tool 0 to tool 1
M864 J A1 B2      ; Spool join: tool 1 empty → use tool 2
```

## Object Cancellation

```gcode
M486 T5           ; Set object count to 5
M486 S0           ; Start object 0
M486 P0           ; Cancel object 0
M486 U0           ; Un-cancel object 0
M486 C            ; Cancel current object
M486 AMyPart      ; Name current object
```

## Debugging

```gcode
M111 S38          ; Set debug flags
M122              ; Report TMC driver status
M123              ; Report fan speeds
```
