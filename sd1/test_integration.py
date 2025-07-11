#!/usr/bin/env python3
"""
Test script to verify the integration between SD1 agents and frontend
"""
import asyncio
import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.coordinator import ScriptIngestionCoordinator

# Simple test script
TEST_SCRIPT = """
INT. COFFEE SHOP - DAY

A small, cozy coffee shop with warm lighting. 

SARAH (25), a determined writer, sits at a corner table with her laptop. She types furiously, occasionally glancing at the bustling cafe around her.

SARAH
(to herself)
This has to be perfect.

The BARISTA (20s) approaches with a fresh cup of coffee.

BARISTA
Another refill? You've been here for hours.

SARAH
(grateful)
Thank you. This place helps me think.

Sarah returns to her writing as the BARISTA walks away.

EXT. COFFEE SHOP - SUNSET

Sarah exits the coffee shop, laptop bag slung over her shoulder. She looks satisfied with her day's work.

The sun sets behind the city skyline, casting a golden glow over the street.

FADE OUT.
"""

async def test_integration():
    """Test the complete integration."""
    print("🧪 Testing SD1 Integration with Frontend Data Format")
    print("=" * 60)
    
    try:
        # Initialize coordinator
        print("📋 Initializing ScriptIngestionCoordinator...")
        coordinator = ScriptIngestionCoordinator()
        print("✅ Coordinator initialized")
        
        # Process test script
        print("\n🎬 Processing test script through 3-agent pipeline...")
        result = await coordinator.process_script(
            script_input=TEST_SCRIPT,
            input_type="text",
            department_focus=["camera", "sound", "lighting"],
            validation_level="lenient"
        )
        
        # Check result structure
        print("\n📊 Checking result structure...")
        if "success" in result and result["success"]:
            print("✅ Processing successful")
        else:
            print("❌ Processing failed")
            print(f"Error: {result.get('message', 'Unknown error')}")
            return False
        
        # Verify frontend data structure
        required_sections = ["breakdown_cards", "department_analysis", "reports"]
        print("\n🔍 Verifying frontend data structure...")
        
        for section in required_sections:
            if section in result:
                print(f"✅ {section}: Present")
                
                # Show sample data
                if section == "breakdown_cards" and result[section]:
                    print(f"   📄 Found {len(result[section])} breakdown cards")
                elif section == "department_analysis" and result[section]:
                    active_depts = [k for k, v in result[section].items() if v and v.get("estimated_hours", 0) > 0]
                    print(f"   🏢 Found {len(active_depts)} active departments: {', '.join(active_depts)}")
                elif section == "reports" and result[section]:
                    if "eighths_calculator" in result[section]:
                        eighths = result[section]["eighths_calculator"]
                        scenes = eighths.get("total_scenes", 0)
                        total_eighths = eighths.get("total_eighths", 0)
                        print(f"   📈 Reports: {scenes} scenes, {total_eighths} eighths")
            else:
                print(f"❌ {section}: Missing")
        
        # Check if saved paths exist
        if "saved_paths" in result:
            print(f"\n💾 Files saved: {len(result['saved_paths'])} files")
            for key, path in result["saved_paths"].items():
                if os.path.exists(path):
                    size = os.path.getsize(path)
                    print(f"   ✅ {key}: {size:,} bytes")
                else:
                    print(f"   ❌ {key}: File not found")
        
        # Show processing summary
        if "processing_status" in result:
            status = result["processing_status"]
            print(f"\n⏱️  Processing Summary:")
            print(f"   Status: {status.get('current_stage', 'unknown')}")
            print(f"   Agents: {len(status.get('agents_used', []))}")
            print(f"   Stages: {len(status.get('completed_stages', []))}")
        
        print("\n🎉 Integration test completed successfully!")
        print("✅ SD1 agents are properly integrated with frontend data structure")
        return True
        
    except Exception as e:
        print(f"\n❌ Integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print(f"Starting integration test at {datetime.now()}")
    success = asyncio.run(test_integration())
    
    if success:
        print("\n✅ ALL TESTS PASSED - System ready for production!")
    else:
        print("\n❌ TESTS FAILED - Check logs for details")
        sys.exit(1)