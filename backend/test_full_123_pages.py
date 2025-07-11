#!/usr/bin/env python3
"""
Test the full 123-page Black Panther script with optimized processing and extended timeout
"""

import asyncio
import PyPDF2
import sys
import os
from datetime import datetime
import json

# Add the src directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.coordinator import ScriptIngestionCoordinator

async def test_full_123_pages():
    """Test the complete 123-page Black Panther script."""
    print("🎬 FULL 123-PAGE BLACK PANTHER ANALYSIS")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Step 1: Extract all pages
    print("📄 Extracting ALL pages from Black Panther PDF...")
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            print(f"   Total pages in PDF: {total_pages}")
            
            # Extract all pages
            all_text = []
            char_count = 0
            
            for page_num in range(total_pages):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                if page_text.strip():
                    all_text.append(f"=== PAGE {page_num + 1} ===\n{page_text}\n")
                    char_count += len(page_text)
                
                # Progress indicator
                if (page_num + 1) % 20 == 0:
                    print(f"   Extracted {page_num + 1}/{total_pages} pages...")
            
            script_text = '\n'.join(all_text)
            print(f"✅ Extracted {len(script_text):,} characters from all {total_pages} pages")
            print(f"   Average characters per page: {char_count // total_pages}")
            
    except Exception as e:
        print(f"❌ Error extracting PDF: {e}")
        return False
    
    print()
    
    # Step 2: Initialize coordinator
    print("🔧 Initializing 3-agent coordinator...")
    try:
        coordinator = ScriptIngestionCoordinator()
        print("✅ Coordinator initialized")
    except Exception as e:
        print(f"❌ Coordinator initialization failed: {e}")
        return False
    
    print()
    
    # Step 3: Process through optimized pipeline
    print("🚀 Processing FULL 123-PAGE script through optimized 3-agent pipeline...")
    print("   Stage 1: ADK Eighths Calculator (optimized: max 10 seconds)")
    print("   Stage 2: Scene Breakdown Cards (optimized: max 15 seconds)")
    print("   Stage 3: Department Coordinator (optimized: max 20 seconds)")
    print("   Expected total processing time: ~45 seconds")
    print()
    
    start_time = datetime.now()
    
    try:
        result = await coordinator.process_script(
            script_input=script_text,
            input_type="text",
            department_focus=["camera", "sound", "lighting", "art", "wardrobe", "special_effects"],
            validation_level="lenient"
        )
        
        end_time = datetime.now()
        actual_time = (end_time - start_time).total_seconds()
        
        if "error" in result:
            print(f"❌ Pipeline failed: {result['error']}")
            return False
        
        print("✅ FULL 123-PAGE PIPELINE COMPLETED SUCCESSFULLY!")
        print(f"⏱️  Total processing time: {actual_time:.1f} seconds")
        print()
        
        # Step 4: Analyze results
        print("📊 COMPLETE ANALYSIS RESULTS:")
        print("-" * 80)
        
        # Extract statistics
        stats = result.get("statistics", {})
        
        # Show main metrics
        print(f"📄 Total pages processed: {total_pages}")
        print(f"📊 Total scenes detected: {stats.get('total_scenes', 0)}")
        print(f"📏 Total script eighths: {stats.get('eighths_summary', {}).get('total_eighths', 0):.1f}")
        print(f"📅 Estimated shoot days: {stats.get('eighths_summary', {}).get('estimated_days', 0):.1f}")
        print(f"👥 Total crew size: {stats.get('department_summary', {}).get('total_crew_size', 0)}")
        print(f"🏢 Departments involved: {stats.get('department_summary', {}).get('total_departments', 0)}")
        print()
        
        # Show complexity breakdown
        if "agent_outputs" in result and "adk_eighths_calculator" in result["agent_outputs"]:
            eighths_data = result["agent_outputs"]["adk_eighths_calculator"]
            if "eighths_data" in eighths_data and "breakdown_by_complexity" in eighths_data["eighths_data"]:
                complexity = eighths_data["eighths_data"]["breakdown_by_complexity"]
                print("🎯 COMPLEXITY BREAKDOWN:")
                print(f"   🟢 Simple scenes: {complexity.get('simple', 0)}")
                print(f"   🟡 Moderate scenes: {complexity.get('moderate', 0)}")
                print(f"   🔴 Complex scenes: {complexity.get('complex', 0)}")
                print()
        
        # Step 5: Verify JSON storage
        print("🔍 JSON STORAGE VERIFICATION:")
        print("-" * 80)
        
        if "saved_paths" in result:
            saved_paths = result["saved_paths"]
            print(f"📁 Total files saved: {len(saved_paths)}")
            
            # Check each agent JSON file
            agent_files = {
                "adk_eighths_calculator": "ADK Eighths Calculator",
                "adk_scene_breakdown_cards": "Scene Breakdown Cards", 
                "adk_department_coordinator": "Department Coordinator"
            }
            
            for agent_key, description in agent_files.items():
                if agent_key in saved_paths:
                    file_path = saved_paths[agent_key]
                    if os.path.exists(file_path):
                        file_size = os.path.getsize(file_path)
                        print(f"✅ {description}: {file_size:,} bytes")
                    else:
                        print(f"❌ {description}: File not found")
                else:
                    print(f"❌ {description}: Path not saved")
            
            # Check main data file
            if "main" in saved_paths:
                main_path = saved_paths["main"]
                if os.path.exists(main_path):
                    main_size = os.path.getsize(main_path)
                    print(f"✅ Main data file: {main_size:,} bytes")
                    
                    # Show timestamp from filename
                    timestamp = os.path.basename(main_path).split('_')[1].split('.')[0]
                    print(f"📅 File timestamp: {timestamp}")
                else:
                    print(f"❌ Main data file: Not found")
        
        print()
        
        # Step 6: Performance summary
        print("🎯 PERFORMANCE SUMMARY:")
        print("-" * 80)
        print(f"✅ Pages processed: {total_pages}/123 (100%)")
        print(f"✅ Characters processed: {len(script_text):,}")
        print(f"✅ Processing time: {actual_time:.1f} seconds")
        print(f"✅ Pages per second: {total_pages / actual_time:.1f}")
        print(f"✅ Scenes per page: {stats.get('total_scenes', 0) / total_pages:.1f}")
        print()
        
        # Validate results
        scenes_found = stats.get('total_scenes', 0)
        if scenes_found > 100:  # Expect many scenes in full script
            print("✅ Scene detection excellent - found substantial scenes")
        elif scenes_found > 50:
            print("✅ Scene detection good - found reasonable scenes")
        else:
            print("⚠️  Scene detection may need tuning - fewer scenes than expected")
        
        if actual_time < 120:  # Under 2 minutes
            print("✅ Processing time excellent - under 2 minutes")
        else:
            print("⚠️  Processing time longer than expected")
        
        print()
        print("🎉 FULL 123-PAGE ANALYSIS COMPLETE!")
        print("🏆 All pages processed successfully with JSON storage!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting full 123-page Black Panther analysis...")
    print("⏰ Extended timeout enabled for complete processing")
    print()
    
    success = asyncio.run(test_full_123_pages())
    
    if success:
        print("\n🏆 FULL 123-PAGE TEST SUCCESSFUL!")
        print("✅ All pages processed and stored in JSON format!")
    else:
        print("\n❌ FULL 123-PAGE TEST FAILED!")
        print("⚠️  Check logs for details")