"""
Raspberry Pi Pico - JSON Output for IoT Safety Monitor

Add this to your main.py on the Pico to output sensor data in JSON format
that the bridge script can parse.

This simplified version outputs only the 3 core sensors:
- Fire intensity (%)
- Smoke level (%)  
- Motion status (NORMAL/IMPACT/FREEFALL)

Example output:
{"fire_val": 12.5, "smoke_val": 8.2, "motion_val": "NORMAL"}
"""

import json

# ============================================
# Add this method to your SafetyMonitor class:
# ============================================

def print_json(self):
    """
    Output sensor data as JSON for the bridge script.
    
    Call this in your main loop instead of print_status():
        monitor.print_json()
    
    Returns the danger level for alarm handling.
    """
    # Get motion status from MPU6050
    ax, ay, az = self.mpu.get_accel_data()
    magnitude = self.mpu.get_acceleration_magnitude()
    pitch, roll = self.mpu.get_tilt_angles()
    
    motion_val = "NORMAL"
    if magnitude > 2.0:
        motion_val = "IMPACT"
    elif magnitude < 0.5:
        motion_val = "FREEFALL"
    
    # Get fire sensor data
    fire_val = self.fire_sensor.get_flame_intensity()
    
    # Get smoke sensor data
    smoke_val = self.smoke_sensor.get_smoke_level()
    
    # Build JSON payload with 3 core sensors + motion details
    data = {
        # Core 3 sensor values
        "fire_val": round(fire_val, 1),
        "smoke_val": round(smoke_val, 1),
        "motion_val": motion_val,
        
        # Additional motion details (optional, for dashboard display)
        "accel_x": round(ax, 3),
        "accel_y": round(ay, 3),
        "accel_z": round(az, 3),
        "accel_magnitude": round(magnitude, 3),
        "pitch": round(pitch, 1),
        "roll": round(roll, 1),
    }
    
    # Print as single-line JSON (required for bridge parsing)
    print(json.dumps(data))
    
    # Return danger level for alarm handling
    return self.get_danger_level()


# ============================================
# UPDATED MONITOR LOOP WITH JSON OUTPUT
# ============================================

def monitor_continuous_json(self, interval=1):
    """
    Continuously monitor all sensors with JSON output.
    Replace the original monitor_continuous method with this one.
    """
    print('{"status": "started", "message": "IoT Safety Monitor started"}')
    
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
# COMPLETE MINIMAL main.py EXAMPLE
# ============================================

MINIMAL_MAIN_PY = '''
# main.py - Minimal version for IoT Safety Monitor
# Only outputs: Fire, Smoke, Motion (3 sensors)

import json
import time
from machine import Pin, ADC, I2C

class SimpleSafetyMonitor:
    def __init__(self):
        # Fire sensor (analog on GP26)
        self.fire_adc = ADC(26)
        
        # Smoke sensor (analog on GP27)  
        self.smoke_adc = ADC(27)
        self.smoke_baseline = 0
        
        # MPU6050 on I2C (SCL=GP5, SDA=GP4)
        self.i2c = I2C(0, scl=Pin(5), sda=Pin(4), freq=400000)
        self.mpu_addr = 0x68
        
        # Wake up MPU6050
        self.i2c.writeto_mem(self.mpu_addr, 0x6B, bytes([0]))
    
    def calibrate_smoke(self, samples=50):
        """Calibrate smoke sensor baseline"""
        total = 0
        for _ in range(samples):
            total += self.smoke_adc.read_u16()
            time.sleep(0.02)
        self.smoke_baseline = total / samples
        print(f"Smoke baseline: {self.smoke_baseline}")
    
    def get_fire_intensity(self):
        """Get fire intensity as percentage (0-100)"""
        raw = self.fire_adc.read_u16()
        # Invert: low value = fire, high value = no fire
        return max(0, min(100, (65535 - raw) / 655.35))
    
    def get_smoke_level(self):
        """Get smoke level as percentage above baseline (0-100)"""
        raw = self.smoke_adc.read_u16()
        if self.smoke_baseline == 0:
            return 0
        diff = max(0, raw - self.smoke_baseline)
        return min(100, (diff / self.smoke_baseline) * 100)
    
    def get_accel(self):
        """Get accelerometer data from MPU6050"""
        data = self.i2c.readfrom_mem(self.mpu_addr, 0x3B, 6)
        ax = int.from_bytes(data[0:2], "big", True) / 16384.0
        ay = int.from_bytes(data[2:4], "big", True) / 16384.0
        az = int.from_bytes(data[4:6], "big", True) / 16384.0
        return ax, ay, az
    
    def print_json(self):
        """Output sensor data as JSON"""
        ax, ay, az = self.get_accel()
        magnitude = (ax**2 + ay**2 + az**2) ** 0.5
        
        motion_val = "NORMAL"
        if magnitude > 2.0:
            motion_val = "IMPACT"
        elif magnitude < 0.5:
            motion_val = "FREEFALL"
        
        data = {
            "fire_val": round(self.get_fire_intensity(), 1),
            "smoke_val": round(self.get_smoke_level(), 1),
            "motion_val": motion_val,
            "accel_x": round(ax, 3),
            "accel_y": round(ay, 3),
            "accel_z": round(az, 3),
            "accel_magnitude": round(magnitude, 3),
        }
        
        print(json.dumps(data))


# ============================================
# MAIN LOOP
# ============================================

monitor = SimpleSafetyMonitor()
print("Calibrating smoke sensor...")
monitor.calibrate_smoke()
print("Starting IoT Safety Monitor...")

while True:
    monitor.print_json()
    time.sleep(1)  # Send data every 1 second
'''

if __name__ == "__main__":
    print("=" * 50)
    print("IoT Safety Monitor - Pico JSON Output")
    print("=" * 50)
    print()
    print("This file contains code snippets for your Raspberry Pi Pico.")
    print("Copy the relevant functions to your main.py")
    print()
    print("Minimal main.py example:")
    print(MINIMAL_MAIN_PY)
