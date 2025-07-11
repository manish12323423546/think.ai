#!/usr/bin/env python3
"""
Test ADK Eighths Calculator with proper 10-page script
This will demonstrate the page-by-page processing working correctly
"""

import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.agents.adk_eighths_calculator_proper import create_adk_eighths_agent

def load_sample_script():
    """Load the 10-page sample script."""
    with open("/Users/varunisrani/Desktop/mckays-app-template 3/sd1/SAMPLE_SCRIPT_10_PAGES.txt", "r") as f:
        return f.read()

def test_adk_with_10_pages():
    """Test ADK with comprehensive 10-page script."""
    print("🎬 ADK EIGHTHS CALCULATOR - 10-PAGE SCRIPT TEST")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Step 1: Load script
    print("📄 Loading 10-page sample script...")
    script_text = load_sample_script()
    
    # Analyze script structure
    pages = script_text.count("=== PAGE")
    scenes_int_ext = script_text.count("INT.") + script_text.count("EXT.")
    total_words = len(script_text.split())
    
    print(f"📊 Script Analysis:")
    print(f"   Marked pages: {pages}")
    print(f"   INT/EXT scenes: {scenes_int_ext}")
    print(f"   Total words: {total_words}")
    print(f"   Total characters: {len(script_text)}")
    print()
    
    # Step 2: Initialize ADK agent
    print("🔧 Initializing ADK Eighths Calculator...")
    try:
        agent = create_adk_eighths_agent()
        print("✅ Agent initialized successfully")
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        return False
    
    print()
    
    # Step 3: Process with page-by-page analysis
    print("🚀 Processing with page-by-page eighths calculation...")
    
    try:
        # Prepare script data
        script_data = {
            "full_text": script_text,
            "estimated_pages": pages,  # Use actual marked pages
            "source": "10_page_test"
        }
        
        # Process with ADK agent
        result = agent.process_full_script(script_data)
        
        print("📊 PROCESSING RESULTS:")
        print("-" * 60)
        print(f"✅ Status: {result.get('status', 'unknown')}")
        print(f"📝 Message: {result.get('message', 'No message')}")
        print(f"⏱️  Processing time: {result.get('processing_time', 0):.1f} seconds")
        print(f"🎬 Scenes processed: {result.get('scenes_processed', 0)}")
        print(f"📄 Script length: {result.get('script_length', 0)} characters")
        print(f"📊 Estimated pages: {result.get('estimated_pages', 0):.1f}")
        print()
        
        # Detailed analysis
        if 'eighths_data' in result and result['status'] == 'success':
            eighths_data = result['eighths_data']
            
            print("🎯 EIGHTHS CALCULATION SUMMARY:")
            print("-" * 60)
            if 'totals' in eighths_data:
                totals = eighths_data['totals']
                print(f"📊 Total scenes: {totals.get('total_scenes', 0)}")
                print(f"📏 Total script eighths: {totals.get('total_script_eighths', 0):.2f}")
                print(f"⚖️  Total adjusted eighths: {totals.get('total_adjusted_eighths', 0):.2f}")
                print(f"📅 Estimated shoot days: {totals.get('estimated_shoot_days', 0):.1f}")
                print(f"⏰ Total production hours: {totals.get('total_production_hours', 0):.1f}")
            
            print()
            print("🎬 SCENE-BY-SCENE BREAKDOWN:")
            print("-" * 60)
            
            if 'scene_calculations' in eighths_data:
                scenes = eighths_data['scene_calculations']
                print(f"Found {len(scenes)} scenes:")
                print()
                
                for i, scene_calc in enumerate(scenes):
                    scene = scene_calc['scene']
                    complexity = scene_calc['complexity']
                    
                    print(f"🎭 Scene {scene['scene_number']}:")
                    print(f"   📍 Location: {scene.get('location', 'Unknown')[:50]}")
                    print(f"   📏 Page count: {scene.get('page_count', 0):.2f}")
                    print(f"   📊 Base eighths: {scene.get('base_eighths', 0):.1f}")
                    print(f"   ⚖️  Adjusted eighths: {scene.get('adjusted_eighths', 0):.1f}")
                    print(f"   ⏰ Total hours: {scene.get('total_hours', 0):.1f}")
                    print(f"   🔧 Complexity: {complexity.get('total_complexity', 1.0):.2f}x")
                    
                    # Show page-specific data if available
                    if 'eighths_on_page' in scene:
                        print(f"   📄 Eighths on page: {scene['eighths_on_page']}")
                    if 'page_number' in scene:
                        print(f"   📄 Page number: {scene['page_number']}")
                    
                    print()
                    
                    # Show only first 10 scenes to avoid clutter
                    if i >= 9:
                        remaining = len(scenes) - 10
                        if remaining > 0:
                            print(f"... and {remaining} more scenes")
                        break
            
            # Show complexity breakdown
            if 'breakdown_by_complexity' in eighths_data:
                complexity_breakdown = eighths_data['breakdown_by_complexity']
                print("🎯 COMPLEXITY DISTRIBUTION:")
                print("-" * 60)
                print(f"🟢 Simple scenes: {complexity_breakdown.get('simple', 0)}")
                print(f"🟡 Moderate scenes: {complexity_breakdown.get('moderate', 0)}")
                print(f"🔴 Complex scenes: {complexity_breakdown.get('complex', 0)}")
                print()
        
        print("🎉 10-page script test completed successfully!")
        
        # Validate the results
        expected_scenes = scenes_int_ext  # Should find INT/EXT scenes
        actual_scenes = result.get('scenes_processed', 0)
        
        print("✅ VALIDATION:")
        print("-" * 60)
        print(f"Expected scenes (INT/EXT): {expected_scenes}")
        print(f"Actual scenes found: {actual_scenes}")
        
        if actual_scenes >= expected_scenes * 0.8:  # 80% tolerance
            print("✅ Scene detection working correctly!")
        else:
            print("⚠️  Fewer scenes detected than expected")
        
        if result.get('status') == 'success':
            print("✅ Page-by-page processing successful!")
            return True
        else:
            print("❌ Processing failed")
            return False
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_adk_with_10_pages()