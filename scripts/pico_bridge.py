#!/usr/bin/env python3
"""
Raspberry Pi Pico to Supabase Bridge Script

This script reads sensor data from the Pico via USB serial and uploads 
it to your Supabase database in real-time.

Requirements:
    pip install pyserial supabase

Usage:
    1. Update SUPABASE_URL and SUPABASE_KEY below with your project credentials
    2. Connect your Raspberry Pi Pico via USB
    3. Run: python pico_bridge.py

The script parses the serial output from the SafetyMonitor and inserts
readings into the sensor_readings table.
"""

import serial
import serial.tools.list_ports
import time
import re
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


class SensorDataParser:
    """Parses the serial output from the Pico SafetyMonitor (supports both JSON and text)"""
    
    def __init__(self):
        self.current_reading = self._empty_reading()
        self.in_reading_block = False
    
    def _empty_reading(self):
        return {
            "temperature": 0.0,
            "smoke_level": 0.0,
            "smoke_ppm": 0.0,
            "smoke_status": "SAFE",
            "fire_detected": False,
            "fire_intensity": 0.0,
            "fire_level": "SAFE",
            "accel_x": 0.0,
            "accel_y": 0.0,
            "accel_z": 0.0,
            "accel_magnitude": 1.0,
            "pitch": 0.0,
            "roll": 0.0,
            "movement_status": "NORMAL",
            "danger_level": "SAFE",
        }
    
    def parse_json_line(self, line: str) -> dict | None:
        """
        Try to parse a line as JSON (new format).
        Returns the reading dict if successful, None otherwise.
        """
        line = line.strip()
        if not line.startswith("{"):
            return None
        
        try:
            data = json.loads(line)
            # Validate required fields exist
            if "temperature" in data and "danger_level" in data:
                return data
            return None
        except json.JSONDecodeError:
            return None
    
    def parse_line(self, line: str) -> dict | None:
        """
        Parse a single line of serial output.
        First tries JSON parsing, then falls back to text parsing.
        Returns a complete reading dict when parsed, or None.
        """
        # First, try JSON parsing (new format)
        json_result = self.parse_json_line(line)
        if json_result:
            return json_result
        
        # Fall back to text parsing (legacy format)
        return self._parse_text_line(line)
    
    def _parse_text_line(self, line: str) -> dict | None:
        """Parse legacy text format output"""
        line = line.strip()
        
        # Start of a new reading block
        if line.startswith("Safety Monitor -") or line.startswith("="*50):
            if self.in_reading_block and self.current_reading["temperature"] > 0:
                # Return the previous reading
                result = self.current_reading.copy()
                self.current_reading = self._empty_reading()
                self.in_reading_block = True
                return result
            self.in_reading_block = True
            return None
        
        if not self.in_reading_block:
            return None
        
        # Parse accelerometer data
        if "X:" in line and "g" in line:
            match = re.search(r"X:\s*([-\d.]+)\s*g", line)
            if match:
                self.current_reading["accel_x"] = float(match.group(1))
        
        if "Y:" in line and "g" in line:
            match = re.search(r"Y:\s*([-\d.]+)\s*g", line)
            if match:
                self.current_reading["accel_y"] = float(match.group(1))
        
        if "Z:" in line and "g" in line:
            match = re.search(r"Z:\s*([-\d.]+)\s*g", line)
            if match:
                self.current_reading["accel_z"] = float(match.group(1))
        
        if "Magnitude:" in line:
            match = re.search(r"Magnitude:\s*([\d.]+)", line)
            if match:
                self.current_reading["accel_magnitude"] = float(match.group(1))
        
        if "Pitch:" in line:
            match = re.search(r"Pitch:\s*([-\d.]+)", line)
            if match:
                self.current_reading["pitch"] = float(match.group(1))
        
        if "Roll:" in line:
            match = re.search(r"Roll:\s*([-\d.]+)", line)
            if match:
                self.current_reading["roll"] = float(match.group(1))
        
        if "Movement:" in line:
            match = re.search(r"Movement:\s*(\w+(?:\s\w+)?)", line)
            if match:
                self.current_reading["movement_status"] = match.group(1)
        
        # Parse temperature
        if "[TEMPERATURE]" in line:
            pass  # Section header
        elif "°C" in line and "AI CORE" not in line and "Temp" not in line:
            match = re.search(r"([\d.]+)\s*°C", line)
            if match:
                self.current_reading["temperature"] = float(match.group(1))
        
        # Parse fire sensor
        if "Intensity:" in line and "flame" not in line.lower():
            match = re.search(r"Intensity:\s*([\d.]+)%", line)
            if match:
                self.current_reading["fire_intensity"] = float(match.group(1))
                self.current_reading["fire_detected"] = float(match.group(1)) > 20
        
        if "Level:" in line and "smoke" not in line.lower():
            match = re.search(r"Level:\s*(\w+)", line)
            if match:
                level = match.group(1)
                if level in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE", "FIRE", "No"]:
                    self.current_reading["fire_level"] = level if level != "No" else "SAFE"
        
        # Parse smoke sensor
        if "Level:" in line and "% above" in line:
            match = re.search(r"Level:\s*([\d.]+)%", line)
            if match:
                self.current_reading["smoke_level"] = float(match.group(1))
        
        if "Estimated:" in line or "PPM" in line:
            match = re.search(r"([\d.]+)\s*PPM", line)
            if match:
                self.current_reading["smoke_ppm"] = float(match.group(1))
        
        if "Status:" in line:
            match = re.search(r"Status:\s*(\w+)", line)
            if match:
                self.current_reading["smoke_status"] = match.group(1)
        
        # Parse overall status
        if "[OVERALL STATUS]:" in line:
            match = re.search(r"\[OVERALL STATUS\]:\s*(\w+)", line)
            if match:
                self.current_reading["danger_level"] = match.group(1)
                # End of reading block - return the data
                result = self.current_reading.copy()
                self.current_reading = self._empty_reading()
                self.in_reading_block = False
                return result
        
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
    print("Raspberry Pi Pico → Supabase Bridge")
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
    
    parser = SensorDataParser()
    readings_sent = 0
    
    print("\n" + "=" * 50)
    print("Listening for sensor data... (Ctrl+C to stop)")
    print("=" * 50 + "\n")
    
    try:
        while True:
            if ser.in_waiting:
                try:
                    line = ser.readline().decode('utf-8', errors='ignore')
                    reading = parser.parse_line(line)
                    
                    if reading:
                        # Insert into Supabase
                        try:
                            result = supabase.table("sensor_readings").insert(reading).execute()
                            readings_sent += 1
                            
                            # Print status
                            timestamp = datetime.now().strftime("%H:%M:%S")
                            danger = reading["danger_level"]
                            temp = reading["temperature"]
                            smoke = reading["smoke_level"]
                            fire = "🔥 FIRE!" if reading["fire_detected"] else "✓"
                            
                            status_color = {
                                "CRITICAL": "\033[91m",  # Red
                                "WARNING": "\033[93m",   # Yellow
                                "CAUTION": "\033[93m",   # Yellow
                                "SAFE": "\033[92m",      # Green
                            }.get(danger, "\033[0m")
                            reset = "\033[0m"
                            
                            print(f"[{timestamp}] #{readings_sent} | "
                                  f"{status_color}{danger:8}{reset} | "
                                  f"Temp: {temp:5.1f}°C | "
                                  f"Smoke: {smoke:5.1f}% | "
                                  f"Fire: {fire}")
                            
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
