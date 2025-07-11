#!/usr/bin/env python3
"""
Optimized test for Black Panther PDF - processes all 123 pages efficiently
"""

import PyPDF2
import sys
import os
from datetime import datetime

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.agents.adk_eighths_calculator_proper import create_adk_eighths_agent

def extract_black_panther_pdf():
    """Extract text from Black Panther PDF efficiently."""
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    print(f"📄 Extracting text from Black Panther PDF...")
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            print(f"   Total pages: {total_pages}")
            
            # Extract all pages efficiently
            all_text = []
            chars_per_page = []
            
            for page_num in range(total_pages):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                char_count = len(page_text)
                chars_per_page.append(char_count)
                
                if page_text.strip():
                    all_text.append(f"=== PAGE {page_num + 1} ===\n{page_text}\n")
                
                # Show progress every 20 pages
                if (page_num + 1) % 20 == 0:
                    print(f"   Processed {page_num + 1}/{total_pages} pages...")
            
            full_text = '\n'.join(all_text)
            
            print(f"✅ Extraction complete!")
            print(f"   Total characters: {len(full_text):,}")
            print(f"   Pages with content: {len(all_text)}")
            print(f"   Average chars per page: {sum(chars_per_page) / len(chars_per_page):.0f}")
            
            return full_text
            
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return ""

def test_black_panther_full():
    """Test ADK agent with full Black Panther script."""
    print("🎬 BLACK PANTHER - FULL 123-PAGE ANALYSIS")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Step 1: Extract PDF
    script_text = extract_black_panther_pdf()
    
    if not script_text or len(script_text) < 1000:
        print("❌ PDF extraction failed or insufficient content")
        return False
    
    print()
    
    # Step 2: Initialize ADK agent
    print("🔧 Initializing ADK Eighths Calculator...")
    try:
        agent = create_adk_eighths_agent()
        print("✅ Agent initialized")
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        return False
    
    print()
    
    # Step 3: Process full script
    print("🚀 Processing full Black Panther script...")
    print("   This will process all 123 pages with page-by-page analysis")
    print("   Expected processing time: ~10 seconds (optimized)")
    print()
    
    try:
        # Calculate estimated pages from content
        total_words = len(script_text.split())
        estimated_pages = max(123, total_words / 250)  # Use actual page count
        
        # Prepare script data
        script_data = {
            "full_text": script_text,
            "estimated_pages": estimated_pages,
            "source": "black_panther_pdf"
        }
        
        # Process with ADK agent
        start_time = datetime.now()
        result = agent.process_full_script(script_data)
        end_time = datetime.now()
        
        actual_time = (end_time - start_time).total_seconds()
        
        print("📊 PROCESSING RESULTS:")
        print("-" * 60)
        print(f"✅ Status: {result.get('status', 'unknown')}")
        print(f"📝 Message: {result.get('message', 'No message')}")
        print(f"⏱️  Processing time: {actual_time:.1f} seconds (actual)")
        print(f"🎬 Scenes processed: {result.get('scenes_processed', 0)}")
        print(f"📄 Script length: {result.get('script_length', 0):,} characters")
        print(f"📊 Estimated pages: {result.get('estimated_pages', 0):.1f}")
        print()
        
        if result.get('status') == 'success':
            # Show summary statistics
            eighths_data = result.get('eighths_data', {})
            totals = eighths_data.get('totals', {})
            
            print("🎯 BLACK PANTHER EIGHTHS SUMMARY:")
            print("-" * 60)
            print(f"📊 Total scenes found: {totals.get('total_scenes', 0)}")
            print(f"📏 Total script eighths: {totals.get('total_script_eighths', 0):.1f}")
            print(f"⚖️  Total adjusted eighths: {totals.get('total_adjusted_eighths', 0):.1f}")
            print(f"📅 Estimated shoot days: {totals.get('estimated_shoot_days', 0):.1f}")
            print(f"⏰ Total production hours: {totals.get('total_production_hours', 0):.1f}")
            print()
            
            # Show complexity breakdown
            complexity = eighths_data.get('breakdown_by_complexity', {})
            print("🎯 COMPLEXITY BREAKDOWN:")
            print("-" * 60)
            print(f"🟢 Simple scenes: {complexity.get('simple', 0)}")
            print(f"🟡 Moderate scenes: {complexity.get('moderate', 0)}")
            print(f"🔴 Complex scenes: {complexity.get('complex', 0)}")
            print()
            
            # Show first few scenes as examples
            scene_calcs = eighths_data.get('scene_calculations', [])
            if scene_calcs:
                print("🎬 SAMPLE SCENES (first 5):")
                print("-" * 60)
                for i, scene_calc in enumerate(scene_calcs[:5]):
                    scene = scene_calc['scene']
                    print(f"Scene {scene['scene_number']}: {scene.get('adjusted_eighths', 0):.1f} eighths, {scene.get('total_hours', 0):.1f} hours")
                
                if len(scene_calcs) > 5:
                    print(f"... and {len(scene_calcs) - 5} more scenes")
                print()
            
            print("🎉 BLACK PANTHER ANALYSIS COMPLETE!")
            print(f"✅ Successfully processed {totals.get('total_scenes', 0)} scenes from 123 pages")
            
            # Validate results
            scenes_found = totals.get('total_scenes', 0)
            if scenes_found > 50:  # Expect many scenes in a full script
                print("✅ Scene detection looks good - found substantial number of scenes")
            else:
                print("⚠️  Fewer scenes than expected - may need scene detection tuning")
            
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
    success = test_black_panther_full()
    if success:
        print("\n🏆 BLACK PANTHER PDF TEST SUCCESSFUL!")
    else:
        print("\n❌ BLACK PANTHER PDF TEST FAILED!")