"""
Test script for the complete ADK agent pipeline
Demonstrates PDF processing through all 3 agents
"""

import asyncio
import os
import sys
import json
from datetime import datetime

# Add the sd1 directory to the path  
sys.path.append('/Users/varunisrani/Desktop/mckays-app-template 3/sd1')

from src.script_ingestion.coordinator import ScriptIngestionCoordinator

async def test_pipeline_with_pdf():
    """Test the complete 3-agent ADK pipeline with PDF input."""
    print("=" * 80)
    print("TESTING 3-AGENT ADK PIPELINE WITH PDF INPUT")
    print("=" * 80)
    print(f"Start time: {datetime.now()}")
    print()
    
    # Initialize the coordinator
    print("🎬 Initializing ScriptIngestionCoordinator...")
    coordinator = ScriptIngestionCoordinator()
    print("✅ Coordinator initialized with all 3 ADK agents")
    print()
    
    # Path to the Black Panther PDF
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return
    
    print(f"📄 Using PDF file: {pdf_path}")
    print()
    
    try:
        # Process the PDF through the pipeline
        print("🚀 Starting 3-agent sequential pipeline...")
        print("   1. ADK Eighths Calculator Agent")
        print("   2. ADK Scene Breakdown Cards Agent")
        print("   3. ADK Department Coordinator Agent")
        print()
        
        # Process with department focus on camera and lighting
        result = await coordinator.process_pdf_file(
            pdf_path=pdf_path,
            department_focus=["camera", "lighting"],
            validation_level="lenient"
        )
        
        # Display results
        print("\n" + "=" * 80)
        print("PIPELINE RESULTS")
        print("=" * 80)
        
        # Check processing status
        processing_status = result.get("processing_status", {})
        completed_stages = processing_status.get("completed_stages", [])
        
        print("\n📊 Processing Status:")
        print(f"   Total stages completed: {len(completed_stages)}/3")
        
        for stage in completed_stages:
            print(f"   ✅ {stage['agent']} - {stage['stage']}")
        
        # Display statistics
        stats = result.get("statistics", {})
        if stats:
            print("\n📈 Script Statistics:")
            print(f"   Total scenes: {stats.get('total_scenes', 0)}")
            print(f"   Total characters: {stats.get('total_characters', 0)}")
            print(f"   Total locations: {stats.get('total_locations', 0)}")
            
            if "eighths_summary" in stats:
                eighths = stats["eighths_summary"]
                print(f"   Total eighths: {eighths.get('total_eighths', 0)}")
                print(f"   Estimated shoot days: {eighths.get('estimated_days', 0)}")
        
        # Display agent outputs
        agent_outputs = result.get("agent_outputs", {})
        
        # Eighths Calculator Results
        print("\n🎯 ADK Eighths Calculator Results:")
        eighths_data = agent_outputs.get("adk_eighths_calculator", {})
        if eighths_data.get("status") == "success":
            print("   ✅ Eighths calculation completed successfully")
            if "report" in eighths_data:
                print("   📄 Report generated")
        else:
            print(f"   ❌ Error: {eighths_data.get('message', 'Unknown error')}")
        
        # Scene Breakdown Cards Results
        print("\n🎬 ADK Scene Breakdown Cards Results:")
        breakdown_data = agent_outputs.get("scene_breakdown_cards", {})
        if breakdown_data.get("status") == "success":
            print("   ✅ Breakdown cards generated successfully")
            if "report" in breakdown_data:
                print("   📄 Report generated")
        else:
            print(f"   ❌ Error: {breakdown_data.get('message', 'Unknown error')}")
        
        # Department Coordinator Results
        print("\n👥 ADK Department Coordinator Results:")
        dept_data = agent_outputs.get("department_coordinator", {})
        if dept_data.get("status") == "success":
            print("   ✅ Department coordination completed successfully")
            if "report" in dept_data:
                print("   📄 Report generated")
        else:
            print(f"   ❌ Error: {dept_data.get('message', 'Unknown error')}")
        
        # Save results summary
        if "saved_paths" in result:
            print("\n💾 Results saved to:")
            for key, path in result["saved_paths"].items():
                print(f"   {key}: {path}")
        
        # Display sample report (first 500 chars)
        print("\n📋 Sample Report Output:")
        print("-" * 40)
        
        # Try to get the eighths report
        metadata = result.get("metadata", {})
        if "eighths_report" in metadata and metadata["eighths_report"]:
            report_text = metadata["eighths_report"]
            print(report_text[:500] + "..." if len(report_text) > 500 else report_text)
        else:
            print("No eighths report available")
        
        print("\n" + "=" * 80)
        print("PIPELINE COMPLETED SUCCESSFULLY")
        print("=" * 80)
        print(f"End time: {datetime.now()}")
        
    except Exception as e:
        print(f"\n❌ Pipeline failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

async def test_pipeline_with_text():
    """Test the pipeline with direct text input."""
    print("\n" + "=" * 80)
    print("TESTING 3-AGENT ADK PIPELINE WITH TEXT INPUT")
    print("=" * 80)
    
    # Sample script text
    sample_script = """
INT. WAKANDA THRONE ROOM - DAY

T'Challa stands before the throne, wearing traditional robes. The room is filled with tribal leaders and advisors.

T'CHALLA
Today, we open Wakanda to the world.

OKOYE
(concerned)
My king, are you certain this is wise?

EXT. WAKANDA BORDER - NIGHT

A convoy of vehicles approaches the hidden entrance. High-tech defense systems activate.

SHURI
(over comms)
Border tribe, we have visitors.

The scene erupts into action as the vehicles are scanned by advanced Wakandan technology.
    """
    
    # Initialize the coordinator
    coordinator = ScriptIngestionCoordinator()
    
    try:
        # Process the text
        result = await coordinator.process_script(
            script_input=sample_script,
            input_type="text",
            validation_level="lenient"
        )
        
        print("✅ Text processing completed successfully")
        
        # Display basic results
        stats = result.get("statistics", {})
        print(f"\nProcessed {stats.get('total_scenes', 0)} scenes")
        
    except Exception as e:
        print(f"❌ Error processing text: {str(e)}")

async def main():
    """Run all tests."""
    # Test with PDF
    await test_pipeline_with_pdf()
    
    # Test with text
    await test_pipeline_with_text()

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())