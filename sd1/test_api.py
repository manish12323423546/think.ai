#!/usr/bin/env python3
"""
Test script to verify API endpoints work
"""
import requests
import json

def test_api():
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Health check: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Health check failed: {e}")
    
    # Test script text endpoint
    try:
        test_script = "FADE IN:\nINT. KITCHEN - DAY\nA simple scene for testing.\nFADE OUT."
        
        response = requests.post(
            f"{base_url}/api/script/text",
            json={
                "script": test_script,
                "validation_level": "lenient"
            }
        )
        print(f"Script text endpoint: {response.status_code}")
        if response.status_code == 200:
            print("✅ Script processing working!")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"Script text test failed: {e}")

if __name__ == "__main__":
    test_api()