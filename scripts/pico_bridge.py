#!/usr/bin/env python3
"""
Raspberry Pi Pico to Supabase Bridge Script

This script reads sensor data from the Pico via USB serial and uploads 
it to your Supabase database in real-time.

Requirements:
    pip install pyserial supabase

Usage:
    1. Connect your Raspberry Pi Pico via USB
    2. Run: python pico_bridge.py

The script parses JSON output from the SafetyMonitor and inserts
readings into the sensor_readings table.
"""

import serial
import serial.tools.list_ports
import time
import sys
import json
from datetime import datetime

# ============================================
# CONFIGURATION - UPDATE THESE VALUES!
# ============================================

# Your Supabase project URL (from Cloud settings)
SUPABASE_URL = "https://dfhupapdywpkrqzvderc.supabase.co"

# Your Supabase anon/public key (safe to use in scripts)
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaHVwYXBkeXdwa3JxenZkZXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzg2MzIsImV4cCI6MjA4NjAxNDYzMn0.BKpFrCgLPP44y17oDMGUtBo-L3AwoO26egpCCkuqf8o"

# Serial port settings
BAUD_RATE = 115200
# Set to None for auto-detection, or specify like "COM3" or "/dev/ttyACM0"
SERIAL_PORT = None

# ============================================

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase package not installed.")
    print("Run: pip install supabase")
    sys.exit(1)


def parse_json_line(line: str) -> dict | None:
    """
    Parse a line as JSON from the Pico.
    Returns the reading dict if successful, None otherwise.
    
    Expected JSON format:
    {
        "fire_val": 0.0,        # Fire intensity percentage (0-100)
        "smoke_val": 0.0,       # Smoke level percentage (0-100)
        "motion_val": "NORMAL"  # Motion status: NORMAL, IMPACT, FREEFALL
    }
    """
    line = line.strip()
    if not line.startswith("{"):
        return None
    
    try:
        data = json.loads(line)
        
        # Validate required fields exist
        if "fire_val" not in data or "smoke_val" not in data or "motion_val" not in data:
            return None
        
        # Map to database schema
        fire_val = float(data.get("fire_val", 0))
        smoke_val = float(data.get("smoke_val", 0))
        motion_val = data.get("motion_val", "NORMAL")
        
        # Derive status values
        fire_detected = fire_val > 20
        fire_level = "CRITICAL" if fire_val > 70 else "HIGH" if fire_val > 50 else "MEDIUM" if fire_val > 30 else "LOW" if fire_val > 10 else "SAFE"
        smoke_status = "CRITICAL" if smoke_val > 80 else "HIGH" if smoke_val > 60 else "MEDIUM" if smoke_val > 40 else "LOW" if smoke_val > 20 else "SAFE"
        
        # Determine overall danger level
        if fire_level == "CRITICAL" or smoke_status == "CRITICAL":
            danger_level = "CRITICAL"
        elif fire_level == "HIGH" or smoke_status == "HIGH" or motion_val == "IMPACT":
            danger_level = "WARNING"
        elif smoke_status in ["MEDIUM", "LOW"]:
            danger_level = "CAUTION"
        else:
            danger_level = "SAFE"
        
        return {
            "smoke_level": smoke_val,
            "smoke_ppm": smoke_val * 10,  # Estimate
            "smoke_status": smoke_status,
            "fire_detected": fire_detected,
            "fire_intensity": fire_val,
            "fire_level": fire_level,
            "accel_x": data.get("accel_x", 0),
            "accel_y": data.get("accel_y", 0),
            "accel_z": data.get("accel_z", 1),
            "accel_magnitude": data.get("accel_magnitude", 1),
            "pitch": data.get("pitch", 0),
            "roll": data.get("roll", 0),
            "movement_status": motion_val,
            "danger_level": danger_level,
            "temperature": 0,  # Not used but required by schema
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        return None


def find_pico_port() -> str | None:
    """Auto-detect the Raspberry Pi Pico serial port"""
    ports = serial.tools.list_ports.comports()
    
    for port in ports:
        # Pico typically shows up with these identifiers
        if "Pico" in port.description or "2E8A" in port.hwid:
            print(f"Found Pico on {port.device}")
            return port.device
        # Also check for generic USB serial
        if "USB" in port.description or "ACM" in port.device:
            print(f"Found potential Pico on {port.device}")
            return port.device
    
    return None


def main():
    print("=" * 50)
    print("IoT Safety Monitor - Pico → Supabase Bridge")
    print("Sensors: Fire, Smoke, Motion (3 sensors only)")
    print("=" * 50)
    
    # Initialize Supabase client
    print("\nConnecting to Supabase...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✓ Supabase connection established")
    except Exception as e:
        print(f"✗ Failed to connect to Supabase: {e}")
        sys.exit(1)
    
    # Find serial port
    port = SERIAL_PORT or find_pico_port()
    if not port:
        print("\n✗ Could not find Raspberry Pi Pico.")
        print("Available ports:")
        for p in serial.tools.list_ports.comports():
            print(f"  - {p.device}: {p.description}")
        print("\nPlease specify the port manually in SERIAL_PORT variable.")
        sys.exit(1)
    
    print(f"\nConnecting to {port} at {BAUD_RATE} baud...")
    
    try:
        ser = serial.Serial(port, BAUD_RATE, timeout=1)
        print(f"✓ Serial connection established")
    except serial.SerialException as e:
        print(f"✗ Failed to open serial port: {e}")
        sys.exit(1)
    
    readings_sent = 0
    
    print("\n" + "=" * 50)
    print("Listening for sensor data... (Ctrl+C to stop)")
    print("Expected JSON format: {\"fire_val\": 0, \"smoke_val\": 0, \"motion_val\": \"NORMAL\"}")
    print("=" * 50 + "\n")
    
    try:
        while True:
            if ser.in_waiting:
                try:
                    line = ser.readline().decode('utf-8', errors='ignore')
                    reading = parse_json_line(line)
                    
                    if reading:
                        # Insert into Supabase
                        try:
                            result = supabase.table("sensor_readings").insert(reading).execute()
                            readings_sent += 1
                            
                            # Print status
                            timestamp = datetime.now().strftime("%H:%M:%S")
                            danger = reading["danger_level"]
                            fire = reading["fire_intensity"]
                            smoke = reading["smoke_level"]
                            motion = reading["movement_status"]
                            
                            status_color = {
                                "CRITICAL": "\033[91m",  # Red
                                "WARNING": "\033[93m",   # Yellow
                                "CAUTION": "\033[93m",   # Yellow
                                "SAFE": "\033[92m",      # Green
                            }.get(danger, "\033[0m")
                            reset = "\033[0m"
                            
                            print(f"[{timestamp}] #{readings_sent} | "
                                  f"{status_color}{danger:8}{reset} | "
                                  f"Fire: {fire:5.1f}% | "
                                  f"Smoke: {smoke:5.1f}% | "
                                  f"Motion: {motion}")
                            
                        except Exception as e:
                            print(f"✗ Failed to insert reading: {e}")
                
                except Exception as e:
                    pass  # Ignore decode errors
            
            time.sleep(0.01)  # Small delay to prevent CPU spinning
    
    except KeyboardInterrupt:
        print(f"\n\nStopped. Total readings sent: {readings_sent}")
    finally:
        ser.close()
        print("Serial connection closed.")


if __name__ == "__main__":
    main()
