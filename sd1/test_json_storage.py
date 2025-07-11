#!/usr/bin/env python3
"""
Test JSON storage for each agent - focused test
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

async def test_json_storage():
    """Test the full pipeline with JSON storage focus."""
    print("🎬 JSON STORAGE TEST - BLACK PANTHER")
    print("=" * 80)
    print(f"Timestamp: {datetime.now().strftime('%Y%m%d_%H%M%S')}")
    print()
    
    # Step 1: Extract first 20 pages only for speed
    print("📄 Extracting first 20 pages from Black Panther PDF...")
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract first 20 pages only
            pages_to_extract = min(20, len(pdf_reader.pages))
            all_text = []
            
            for page_num in range(pages_to_extract):
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                if page_text.strip():
                    all_text.append(f"=== PAGE {page_num + 1} ===\n{page_text}\n")
            
            script_text = '\n'.join(all_text)
            print(f"✅ Extracted {len(script_text)} characters from {pages_to_extract} pages")
            
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
    
    # Step 3: Process through pipeline
    print("🚀 Processing through 3-agent pipeline...")
    print("   Limited to first 20 pages for faster testing")
    print("   Focus: JSON storage validation")
    print()
    
    try:
        result = await coordinator.process_script(
            script_input=script_text,
            input_type="text",
            department_focus=["camera", "sound", "lighting"],
            validation_level="lenient"
        )
        
        if "error" in result:
            print(f"❌ Pipeline failed: {result['error']}")
            return False
        
        print("✅ Pipeline completed successfully!")
        print()
        
        # Step 4: Verify JSON files were created
        print("🔍 VERIFYING JSON STORAGE:")
        print("-" * 60)
        
        # Check if saved_paths exist
        if "saved_paths" in result:
            saved_paths = result["saved_paths"]
            print(f"📁 Total files saved: {len(saved_paths)}")
            
            # Check each agent JSON file
            agent_files = {
                "adk_eighths_calculator": "ADK Eighths Calculator JSON",
                "adk_scene_breakdown_cards": "Scene Breakdown Cards JSON", 
                "adk_department_coordinator": "Department Coordinator JSON"
            }
            
            for agent_key, description in agent_files.items():
                if agent_key in saved_paths:
                    file_path = saved_paths[agent_key]
                    if os.path.exists(file_path):
                        # Get file size
                        file_size = os.path.getsize(file_path)
                        print(f"✅ {description}: {file_path} ({file_size:,} bytes)")
                        
                        # Preview JSON content
                        try:
                            with open(file_path, 'r') as f:
                                json_data = json.load(f)
                                print(f"   📊 JSON keys: {list(json_data.keys())}")
                                
                                # Show specific metrics
                                if agent_key == "adk_eighths_calculator":
                                    if "scenes_processed" in json_data:
                                        print(f"   🎬 Scenes processed: {json_data['scenes_processed']}")
                                    if "eighths_data" in json_data and "totals" in json_data["eighths_data"]:
                                        totals = json_data["eighths_data"]["totals"]
                                        print(f"   📏 Total eighths: {totals.get('total_adjusted_eighths', 0):.1f}")
                                
                                elif agent_key == "adk_scene_breakdown_cards":
                                    if "breakdown_cards" in json_data:
                                        print(f"   📋 Breakdown cards: {len(json_data['breakdown_cards'])}")
                                
                                elif agent_key == "adk_department_coordinator":
                                    if "department_summary" in json_data:
                                        summary = json_data["department_summary"]
                                        print(f"   👥 Total crew: {summary.get('total_crew_size', 0)}")
                                        print(f"   🏢 Departments: {summary.get('total_departments_involved', 0)}")
                        
                        except Exception as e:
                            print(f"   ⚠️  Could not read JSON content: {e}")
                    else:
                        print(f"❌ {description}: File not found at {file_path}")
                else:
                    print(f"❌ {description}: Path not in saved_paths")
                print()
        else:
            print("❌ No saved_paths found in result")
            return False
        
        # Step 5: Show main data file
        if "main" in saved_paths:
            main_path = saved_paths["main"]
            if os.path.exists(main_path):
                main_size = os.path.getsize(main_path)
                print(f"📋 Main data file: {main_path} ({main_size:,} bytes)")
                
                # Show main data structure
                try:
                    with open(main_path, 'r') as f:
                        main_data = json.load(f)
                        print(f"   📊 Main data keys: {list(main_data.keys())}")
                        
                        if "agent_outputs" in main_data:
                            agent_outputs = main_data["agent_outputs"]
                            print(f"   🤖 Agent outputs: {list(agent_outputs.keys())}")
                        
                        if "statistics" in main_data:
                            stats = main_data["statistics"]
                            print(f"   📈 Statistics available: {list(stats.keys())}")
                
                except Exception as e:
                    print(f"   ⚠️  Could not read main data: {e}")
        
        print()
        print("🎉 JSON STORAGE TEST COMPLETED!")
        
        # Final validation
        required_files = ["adk_eighths_calculator", "adk_scene_breakdown_cards", "adk_department_coordinator"]
        all_files_exist = all(
            agent_key in saved_paths and os.path.exists(saved_paths[agent_key])
            for agent_key in required_files
        )
        
        if all_files_exist:
            print("✅ All agent JSON files created successfully!")
            return True
        else:
            print("❌ Some agent JSON files missing!")
            return False
            
    except Exception as e:
        print(f"❌ Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_json_storage())
    if success:
        print("\n🏆 JSON STORAGE TEST SUCCESSFUL!")
    else:
        print("\n❌ JSON STORAGE TEST FAILED!")