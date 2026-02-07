"""
JSON Output Extension for SafetyMonitor

Add this method to your SafetyMonitor class in main.py on your Raspberry Pi Pico.
Then call self.print_json() instead of self.print_readings() for bridge compatibility.

Usage in main.py:
    # In the monitor_continuous method, replace:
    danger_level = self.print_readings()
    
    # With:
    danger_level = self.print_json()
"""

import json

def print_json(self):
    """
    Output sensor data as JSON for the bridge script.
    Add this method to your SafetyMonitor class.
    
    Returns the danger level for alarm handling.
    """
    # Get accelerometer data
    ax, ay, az = self.mpu.get_accel_data()
    magnitude = self.mpu.get_acceleration_magnitude()
    pitch, roll = self.mpu.get_tilt_angles()
    temp = self.mpu.get_temperature()
    
    # Get fire sensor data
    fire_intensity = self.fire_sensor.get_flame_intensity()
    fire_detected = fire_intensity > 20
    fire_level = self.fire_sensor.get_fire_level()
    
    # Get smoke sensor data
    smoke_level = self.smoke_sensor.get_smoke_level()
    smoke_ppm = self.smoke_sensor.get_ppm_estimate()
    smoke_status = self.smoke_sensor.get_smoke_status()
    
    # Get movement and danger level
    movement_status = self.check_movement()
    danger_level = self.get_danger_level()
    
    # Build JSON data structure
    data = {
        "temperature": round(temp, 1),
        "smoke_level": round(smoke_level, 1),
        "smoke_ppm": round(smoke_ppm, 0),
        "smoke_status": smoke_status,
        "fire_detected": fire_detected,
        "fire_intensity": round(fire_intensity, 1),
        "fire_level": fire_level if fire_level != "FIRE DETECTED" else "CRITICAL",
        "accel_x": round(ax, 3),
        "accel_y": round(ay, 3),
        "accel_z": round(az, 3),
        "accel_magnitude": round(magnitude, 3),
        "pitch": round(pitch, 1),
        "roll": round(roll, 1),
        "movement_status": movement_status,
        "danger_level": danger_level
    }
    
    # Output as single JSON line
    print(json.dumps(data))
    
    return danger_level


# ============================================
# UPDATED MONITOR LOOP WITH JSON OUTPUT
# ============================================

def monitor_continuous_json(self, interval=2):
    """
    Continuously monitor all sensors with JSON output.
    Replace the original monitor_continuous method with this one.
    """
    print('{"status": "started", "message": "Safety Monitor JSON output started"}')
    
    try:
        while True:
            danger_level = self.print_json()
            self.set_alarm(danger_level)
            time.sleep(interval)
    
    except KeyboardInterrupt:
        print('{"status": "stopped", "message": "Monitoring stopped"}')
        self.buzzer.off()
        self.led_red.off()
        self.led_green.off()


# ============================================
# HOW TO INTEGRATE
# ============================================
"""
1. Copy the print_json method into your SafetyMonitor class in main.py

2. Replace the print_readings call with print_json:

   # In SafetyMonitor class:
   def monitor_continuous(self, interval=2):
       print("Starting continuous monitoring...")
       try:
           while True:
               # Change this line:
               # danger_level = self.print_readings()
               # To this:
               danger_level = self.print_json()
               self.set_alarm(danger_level)
               time.sleep(interval)
       except KeyboardInterrupt:
           print("Monitoring stopped")
           self.buzzer.off()
           self.led_red.off()
           self.led_green.off()

3. The bridge script will now receive clean JSON instead of human-readable text.

Example JSON output:
{
  "temperature": 28.5,
  "smoke_level": 12.3,
  "smoke_ppm": 150,
  "smoke_status": "SAFE",
  "fire_detected": false,
  "fire_intensity": 5.2,
  "fire_level": "SAFE",
  "accel_x": 0.021,
  "accel_y": -0.015,
  "accel_z": 0.998,
  "accel_magnitude": 1.001,
  "pitch": 1.2,
  "roll": -0.8,
  "movement_status": "NORMAL",
  "danger_level": "SAFE"
}
"""
