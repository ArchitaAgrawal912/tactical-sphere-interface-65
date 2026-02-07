
# Refactor Dashboard for Safety Monitor Hardware Integration

## Overview
This plan refactors the Guardian Vision dashboard to specifically match your Safety Monitor hardware project (MPU6050 + Fire Sensor + Smoke Sensor), implementing a clean "Dual Mode" architecture that switches between simulation and real hardware data from your Raspberry Pi Pico.

---

## Technical Summary

### Current State Analysis
- **Existing `sensor_readings` table**: Already created with comprehensive schema (temperature, smoke_level, fire_detected, accel_x/y/z, pitch, roll, movement_status, danger_level, etc.)
- **Existing `HardwareSensorPanel`**: Already connects to Supabase Realtime for live sensor data
- **Existing `useSensorData` hook**: Already fetches and subscribes to sensor_readings table
- **Existing Python bridge script**: `scripts/pico_bridge.py` already parses serial output and inserts to Supabase

The foundation is already in place. The main work is **removing unused features** and **creating a cleaner UI focused on your three sensors**.

---

## Implementation Tasks

### Phase 1: Remove Unused Components and Features

**Components to Remove:**
1. `VitalsPanel.tsx` - Contains heartbeat/HR sparkline (no heart sensor)
2. `ResponseProtocolPanel.tsx` - Complex response protocol system
3. `MetricsPanel.tsx` - PPE compliance metrics (not relevant)
4. `HeartRateSparkline.tsx` - No heart rate sensor
5. `WorkerStatusBadge.tsx` - Worker drill-down view

**Dashboard Sections to Remove:**
- Section 2: "Incident Response" (Response Protocol + AI Detection Log)
- Section 3: "Fleet Analytics" (PPE Compliance + Recent Activity Log)
- Worker statistics in header (Workers, Safe, At Risk counts)
- Worker visibility toggle
- Recenter map button
- Worker-focused incident triggers

**Files to Delete:**
```text
src/components/dashboard/VitalsPanel.tsx
src/components/dashboard/ResponseProtocolPanel.tsx
src/components/dashboard/MetricsPanel.tsx
src/components/dashboard/HeartRateSparkline.tsx
src/components/dashboard/WorkerStatusBadge.tsx
```

---

### Phase 2: Create Simplified Dashboard Layout

**New Single-Section Layout:**
```text
+----------------------------------+
|  Safety Monitor Dashboard Header |
|  [Sim] [Hardware] Toggle  | Time |
+----------------------------------+
|                                  |
|   +----------+  +-------------+  |
|   | Fire     |  |             |  |
|   | Status   |  |   Site Map  |  |
|   +----------+  |   HexGrid   |  |
|   | Smoke    |  |  (optional) |  |
|   | Status   |  |             |  |
|   +----------+  +-------------+  |
|   | Motion   |                   |
|   | Status   |  +-------------+  |
|   +----------+  | Critical    |  |
|   | Overall  |  | Events Log  |  |
|   | Danger   |  | (CRITICAL   |  |
|   +----------+  |  only)      |  |
|                 +-------------+  |
+----------------------------------+
```

**Key Changes:**
- Remove worker-based statistics
- Simplify header to show only: Logo, Mode Toggle (Sim/Hardware), Connection Status, Time
- Show sensor status cards prominently (Fire, Smoke, Motion, Overall Danger)
- Replace "AI Detection Log" with a minimal "Critical Events Log" that only logs CRITICAL events

---

### Phase 3: Create New Simplified Sensor Panel

**New Component: `SensorStatusPanel.tsx`**

A clean, focused panel showing your three sensors:

```text
+--------------------------------+
| SAFETY MONITOR              ● LIVE |
| Last Update: 14:32:05           |
+--------------------------------+
| ┌────────────────────────────┐ |
| │ 🔥 FIRE SENSOR             │ |
| │ Status: SAFE               │ |
| │ Intensity: 12.3%           │ |
| └────────────────────────────┘ |
| ┌────────────────────────────┐ |
| │ 💨 SMOKE SENSOR            │ |
| │ Status: SAFE               │ |
| │ Level: 8.2% above baseline │ |
| └────────────────────────────┘ |
| ┌────────────────────────────┐ |
| │ 📐 MOTION (MPU6050)        │ |
| │ Status: NORMAL             │ |
| │ X: 0.02g Y: -0.01g Z: 1.00g│ |
| │ Pitch: 2.1° Roll: -0.5°    │ |
| └────────────────────────────┘ |
| ┌────────────────────────────┐ |
| │ ⚠️ OVERALL DANGER LEVEL    │ |
| │          SAFE              │ |
| └────────────────────────────┘ |
+--------------------------------+
```

**Color Coding:**
- SAFE: Primary (teal/green)
- WARNING/CAUTION: Amber
- CRITICAL: Destructive (red) with pulsing animation

---

### Phase 4: Create Critical Events Log Component

**New Component: `CriticalEventsLog.tsx`**

A minimal log that **only populates when CRITICAL events occur**:

```text
+--------------------------------+
| ⚠️ CRITICAL EVENTS            |
| (Only logs dangerous readings) |
+--------------------------------+
| 14:32:05 FIRE CRITICAL        |
| Fire detected! Intensity: 85%  |
|                                |
| 14:31:42 MOTION IMPACT        |
| Heavy impact detected (2.3g)   |
+--------------------------------+
```

**Features:**
- Only logs events when `danger_level === "CRITICAL"` or `fire_detected === true` or `movement_status !== "NORMAL"`
- Stored locally in state (not database) for current session
- Clear button to reset
- Maximum 20 recent events

---

### Phase 5: Implement Dual Mode Data Routing

**Mode A: Simulation Mode**
- Generate random sensor values every 2 seconds
- Use existing simulation logic patterns
- Values drift realistically (no sudden jumps)

**New Hook: `useSimulatedSensors.ts`**
```typescript
interface SimulatedSensorData {
  temperature: number;      // 25-45°C
  smokeLevel: number;       // 0-100%
  smokeStatus: string;      // SAFE, WARNING, CRITICAL
  fireDetected: boolean;
  fireIntensity: number;    // 0-100%
  fireLevel: string;        // SAFE, WARNING, CRITICAL
  movementStatus: string;   // NORMAL, IMPACT, FREEFALL
  accelX: number;
  accelY: number;
  accelZ: number;
  dangerLevel: string;      // SAFE, CAUTION, WARNING, CRITICAL
}
```

**Mode B: Hardware Mode**
- Use existing `useSensorData` hook (already connects to Supabase Realtime)
- Show "LIVE" indicator when data is streaming
- Show "OFFLINE" with last reading time when no data

---

### Phase 6: Update Python Bridge Script (JSON Output)

**Update Pico `main.py` to output JSON:**

Add a new method to `SafetyMonitor` class:
```python
def print_json(self):
    """Output sensor data as JSON for bridge script"""
    import json
    
    ax, ay, az = self.mpu.get_accel_data()
    magnitude = self.mpu.get_acceleration_magnitude()
    pitch, roll = self.mpu.get_tilt_angles()
    temp = self.mpu.get_temperature()
    
    data = {
        "temperature": round(temp, 1),
        "smoke_level": round(self.smoke_sensor.get_smoke_level(), 1),
        "smoke_ppm": round(self.smoke_sensor.get_ppm_estimate(), 0),
        "smoke_status": self.smoke_sensor.get_smoke_status(),
        "fire_detected": self.fire_sensor.get_flame_intensity() > 20,
        "fire_intensity": round(self.fire_sensor.get_flame_intensity(), 1),
        "fire_level": self.fire_sensor.get_fire_level(),
        "accel_x": round(ax, 3),
        "accel_y": round(ay, 3),
        "accel_z": round(az, 3),
        "accel_magnitude": round(magnitude, 3),
        "pitch": round(pitch, 1),
        "roll": round(roll, 1),
        "movement_status": self.check_movement(),
        "danger_level": self.get_danger_level()
    }
    
    print(json.dumps(data))
```

**Update bridge script for JSON parsing:**
```python
def parse_json_line(line: str) -> dict | None:
    """Parse JSON output from Pico"""
    try:
        return json.loads(line.strip())
    except json.JSONDecodeError:
        return None
```

---

### Phase 7: Simplify Dashboard.tsx

**Simplified Structure:**
```tsx
<Dashboard>
  {/* Header: Logo, Mode Toggle, Status, Time */}
  <Header>
    <Logo />
    <ModeToggle useHardware={useHardwareData} onChange={setUseHardwareData} />
    <ConnectionStatus isConnected={isConnected} />
    <Clock />
  </Header>

  {/* Main Content */}
  <Main>
    <Grid cols={12}>
      {/* Left: Sensor Status */}
      <Col span={4}>
        {useHardwareData ? (
          <SensorStatusPanel data={hardwareData} />
        ) : (
          <SensorStatusPanel data={simulatedData} />
        )}
      </Col>

      {/* Center: Optional HexGrid (simplified) */}
      <Col span={5}>
        <HexGrid simplified />
      </Col>

      {/* Right: Critical Events Log */}
      <Col span={3}>
        <CriticalEventsLog events={criticalEvents} />
      </Col>
    </Grid>
  </Main>

  {/* Footer */}
  <Footer>
    Safety Monitor v1.0 | Last sync: {time}
  </Footer>
</Dashboard>
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/components/dashboard/SensorStatusPanel.tsx` | Unified sensor display for both modes |
| `src/components/dashboard/CriticalEventsLog.tsx` | CRITICAL-only event log |
| `src/hooks/useSimulatedSensors.ts` | Simulation mode data generator |
| `scripts/pico_json_output.py` | Snippet for JSON output on Pico |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Remove unused sections, simplify layout, add mode toggle |
| `scripts/pico_bridge.py` | Add JSON parsing support |

---

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/dashboard/VitalsPanel.tsx` | No heart rate sensor |
| `src/components/dashboard/ResponseProtocolPanel.tsx` | Response protocols removed |
| `src/components/dashboard/MetricsPanel.tsx` | PPE metrics not needed |
| `src/components/dashboard/HeartRateSparkline.tsx` | No heart rate data |
| `src/components/dashboard/WorkerStatusBadge.tsx` | Worker drill-down removed |
| `src/components/dashboard/CommsPanel.tsx` | Replace with CriticalEventsLog |
| `src/components/dashboard/SystemsNominalPanel.tsx` | Not needed |

---

## Database Notes

The existing `sensor_readings` table schema is **already perfect** for your hardware:

```text
sensor_readings:
├── temperature (float)         ← MPU6050 temp
├── smoke_level (float)         ← MQ-2 percentage
├── smoke_ppm (float)           ← MQ-2 PPM estimate
├── smoke_status (text)         ← SAFE/WARNING/CRITICAL
├── fire_detected (boolean)     ← Digital fire detection
├── fire_intensity (float)      ← Analog fire percentage
├── fire_level (text)           ← SAFE/HIGH/CRITICAL
├── accel_x/y/z (float)         ← MPU6050 accelerometer
├── accel_magnitude (float)     ← Total acceleration
├── pitch/roll (float)          ← Tilt angles
├── movement_status (text)      ← NORMAL/IMPACT/FREEFALL
├── danger_level (text)         ← Overall danger
└── created_at (timestamp)
```

No database changes required.

---

## Expected Outcome

After implementation:

1. **Cleaner UI**: Single-page dashboard focused on your 3 sensors
2. **Dual Mode Toggle**: Switch between Simulation and Hardware with one click
3. **Real-time Updates**: Hardware mode shows live Supabase Realtime data
4. **Critical Events Only**: Log only shows dangerous readings, not routine "SAFE" data
5. **Ready for Demo**: Simulation mode allows showing the UI without hardware connected
