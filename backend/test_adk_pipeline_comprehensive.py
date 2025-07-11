"""
Comprehensive Test Script for ADK Agent Pipeline
Tests the 3-agent ADK sequential pipeline and stores each agent response in separate JSON files
"""

import asyncio
import os
import sys
import json
from datetime import datetime

# ADK Pipeline imports
sys.path.append('/Users/varunisrani/Desktop/mckays-app-template 3/sd1')
from src.script_ingestion.coordinator import ScriptIngestionCoordinator

# Configuration
BLACK_PANTHER_PDF = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
SAMPLE_SCRIPT_TEXT = """
SAMPLE FILM SCRIPT: "THE HEIST"

FADE IN:
EXT. DOWNTOWN BANK - DAY
A sleek, modern bank building stands prominently on the corner. TRAFFIC flows steadily past.

INT. BANK LOBBY - CONTINUOUS  
ALEX MORGAN (30s), sharply dressed, enters through revolving doors. Multiple SECURITY CAMERAS track the movement.

ALEX
(to TELLER)
I'd like to make a withdrawal.

The TELLER (20s) smiles professionally.

TELLER
Of course, sir. How much would you like to withdraw?

ALEX
(grinning)
Everything.

ALEX produces a small device. All lights flicker and DIE.

FADE TO BLACK.

EXT. BANK PARKING LOT - CONTINUOUS
A black sedan waits with engine running. JAMIE (20s) sits behind the wheel, nervously checking mirrors.

JAMIE
(into earpiece)
Come on, Alex. We need to move.

INT. BANK LOBBY - CONTINUOUS
Emergency lighting kicks in. ALEX moves swiftly toward the vault area.

ALEX
(into earpiece)
Give me thirty seconds.

SECURITY GUARD approaches cautiously.

SECURITY GUARD
Sir, I need you to exit the building immediately.

ALEX smiles and presses another button on the device. The GUARD suddenly looks confused.

ALEX
What building?

The GUARD walks away, dazed.

INT. BANK VAULT - CONTINUOUS
ALEX enters the now-open vault. Stacks of cash line the walls.

ALEX
(to device)
Memory wipe successful. Beginning extraction.

EXT. BANK PARKING LOT - LATER
ALEX emerges carrying two large duffel bags. Gets into the sedan.

JAMIE
How much?

ALEX
Enough to disappear forever.

The sedan drives away as POLICE SIRENS approach in the distance.

FADE OUT.
"""

def save_agent_outputs_individually(result, timestamp):
    """
    Extract and save each ADK agent output to separate JSON files.
    
    Args:
        result: Complete pipeline result
        timestamp: Timestamp string for file naming
    """
    print("\n💾 Saving individual agent outputs...")
    
    # Create agents directory if it doesn't exist
    agents_dir = "data/scripts/agents"
    os.makedirs(agents_dir, exist_ok=True)
    
    agent_outputs = result.get("agent_outputs", {})
    saved_files = []
    
    # Save ADK Eighths Calculator output
    if "adk_eighths_calculator" in agent_outputs:
        filename = f"{agents_dir}/adk_eighths_calculator_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(agent_outputs["adk_eighths_calculator"], f, indent=2)
        saved_files.append(filename)
        print(f"   ✅ Saved: {filename}")
    
    # Save ADK Scene Breakdown Cards output
    if "scene_breakdown_cards" in agent_outputs:
        filename = f"{agents_dir}/adk_scene_breakdown_cards_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(agent_outputs["scene_breakdown_cards"], f, indent=2)
        saved_files.append(filename)
        print(f"   ✅ Saved: {filename}")
    
    # Save ADK Department Coordinator output
    if "department_coordinator" in agent_outputs:
        filename = f"{agents_dir}/adk_department_coordinator_{timestamp}.json"
        with open(filename, 'w') as f:
            json.dump(agent_outputs["department_coordinator"], f, indent=2)
        saved_files.append(filename)
        print(f"   ✅ Saved: {filename}")
    
    return saved_files

def generate_comprehensive_report(result, timestamp):
    """
    Generate summary report of all ADK agent outputs.
    
    Args:
        result: Complete pipeline result
        timestamp: Timestamp string for file naming
        
    Returns:
        Path to generated report file
    """
    print("\n📋 Generating comprehensive report...")
    
    # Create reports directory
    reports_dir = "data/scripts/reports"
    os.makedirs(reports_dir, exist_ok=True)
    
    report_path = f"{reports_dir}/comprehensive_report_{timestamp}.txt"
    
    agent_outputs = result.get("agent_outputs", {})
    processing_status = result.get("processing_status", {})
    statistics = result.get("statistics", {})
    
    with open(report_path, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("COMPREHENSIVE ADK AGENT PIPELINE REPORT\n")
        f.write("=" * 80 + "\n")
        f.write(f"Generated: {datetime.now().isoformat()}\n")
        f.write(f"Processing Timestamp: {timestamp}\n\n")
        
        # Processing Status
        f.write("PROCESSING STATUS\n")
        f.write("-" * 40 + "\n")
        completed_stages = processing_status.get("completed_stages", [])
        f.write(f"Total Stages Completed: {len(completed_stages)}/3\n")
        
        for stage in completed_stages:
            f.write(f"✅ {stage['agent']} - {stage['stage']} (Success)\n")
        
        if processing_status.get("errors"):
            f.write("\nErrors:\n")
            for error in processing_status["errors"]:
                f.write(f"❌ {error['agent']}: {error['error']}\n")
        
        f.write("\n")
        
        # Statistics
        if statistics:
            f.write("SCRIPT STATISTICS\n")
            f.write("-" * 40 + "\n")
            f.write(f"Total Scenes: {statistics.get('total_scenes', 0)}\n")
            f.write(f"Total Characters: {statistics.get('total_characters', 0)}\n")
            f.write(f"Total Locations: {statistics.get('total_locations', 0)}\n")
            
            if "eighths_summary" in statistics:
                eighths = statistics["eighths_summary"]
                f.write(f"Total Eighths: {eighths.get('total_eighths', 0)}\n")
                f.write(f"Estimated Shoot Days: {eighths.get('estimated_days', 0)}\n")
            f.write("\n")
        
        # Agent Results Summary
        f.write("AGENT RESULTS SUMMARY\n")
        f.write("-" * 40 + "\n")
        
        # Eighths Calculator
        eighths_data = agent_outputs.get("adk_eighths_calculator", {})
        f.write("ADK Eighths Calculator Agent:\n")
        if eighths_data.get("status") == "success":
            f.write("  ✅ Status: SUCCESS\n")
            f.write(f"  📊 Message: {eighths_data.get('message', 'Completed successfully')}\n")
        else:
            f.write("  ❌ Status: ERROR\n")
            f.write(f"  📊 Error: {eighths_data.get('message', 'Unknown error')}\n")
        f.write("\n")
        
        # Scene Breakdown Cards
        breakdown_data = agent_outputs.get("scene_breakdown_cards", {})
        f.write("ADK Scene Breakdown Cards Agent:\n")
        if breakdown_data.get("status") == "success":
            f.write("  ✅ Status: SUCCESS\n")
            f.write(f"  📊 Message: {breakdown_data.get('message', 'Completed successfully')}\n")
        else:
            f.write("  ❌ Status: ERROR\n")
            f.write(f"  📊 Error: {breakdown_data.get('message', 'Unknown error')}\n")
        f.write("\n")
        
        # Department Coordinator
        dept_data = agent_outputs.get("department_coordinator", {})
        f.write("ADK Department Coordinator Agent:\n")
        if dept_data.get("status") == "success":
            f.write("  ✅ Status: SUCCESS\n")
            f.write(f"  📊 Message: {dept_data.get('message', 'Completed successfully')}\n")
        else:
            f.write("  ❌ Status: ERROR\n")
            f.write(f"  📊 Error: {dept_data.get('message', 'Unknown error')}\n")
        f.write("\n")
        
        # File Locations
        f.write("GENERATED FILES\n")
        f.write("-" * 40 + "\n")
        if "saved_paths" in result:
            for key, path in result["saved_paths"].items():
                f.write(f"{key}: {path}\n")
        
        f.write("\n" + "=" * 80 + "\n")
        f.write("END OF REPORT\n")
        f.write("=" * 80 + "\n")
    
    print(f"   📄 Report saved: {report_path}")
    return report_path

async def test_adk_pipeline_with_pdf():
    """Test PDF processing through 3-agent ADK pipeline."""
    print("=" * 80)
    print("TESTING ADK PIPELINE WITH PDF INPUT")
    print("=" * 80)
    
    if not os.path.exists(BLACK_PANTHER_PDF):
        print(f"❌ PDF file not found: {BLACK_PANTHER_PDF}")
        return None
    
    print(f"📄 Using PDF file: {BLACK_PANTHER_PDF}")
    
    # Initialize coordinator
    print("\n🎬 Initializing ScriptIngestionCoordinator...")
    coordinator = ScriptIngestionCoordinator()
    print("✅ Coordinator initialized with 3 ADK agents")
    
    try:
        print("\n🚀 Starting 3-agent ADK sequential pipeline...")
        
        # Process PDF
        result = await coordinator.process_script(
            script_input=open(BLACK_PANTHER_PDF, 'rb').read(),
            input_type="pdf",
            department_focus=["camera", "lighting"],
            validation_level="lenient"
        )
        
        # Generate timestamp for files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save individual agent outputs
        saved_agent_files = save_agent_outputs_individually(result, f"pdf_{timestamp}")
        
        # Generate comprehensive report
        report_file = generate_comprehensive_report(result, f"pdf_{timestamp}")
        
        print("\n" + "=" * 80)
        print("PDF PROCESSING COMPLETED")
        print("=" * 80)
        print(f"📁 Individual agent files: {len(saved_agent_files)}")
        print(f"📄 Comprehensive report: {report_file}")
        
        return result
        
    except Exception as e:
        print(f"\n❌ PDF processing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

async def test_adk_pipeline_with_text():
    """Test text processing through 3-agent ADK pipeline."""
    print("\n" + "=" * 80)
    print("TESTING ADK PIPELINE WITH TEXT INPUT")
    print("=" * 80)
    
    # Initialize coordinator
    print("\n🎬 Initializing ScriptIngestionCoordinator...")
    coordinator = ScriptIngestionCoordinator()
    print("✅ Coordinator initialized with 3 ADK agents")
    
    try:
        print("\n🚀 Starting 3-agent ADK sequential pipeline...")
        
        # Process text
        result = await coordinator.process_script(
            script_input=SAMPLE_SCRIPT_TEXT,
            input_type="text",
            validation_level="lenient"
        )
        
        # Generate timestamp for files
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save individual agent outputs
        saved_agent_files = save_agent_outputs_individually(result, f"text_{timestamp}")
        
        # Generate comprehensive report
        report_file = generate_comprehensive_report(result, f"text_{timestamp}")
        
        print("\n" + "=" * 80)
        print("TEXT PROCESSING COMPLETED")
        print("=" * 80)
        print(f"📁 Individual agent files: {len(saved_agent_files)}")
        print(f"📄 Comprehensive report: {report_file}")
        
        return result
        
    except Exception as e:
        print(f"\n❌ Text processing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def validate_agent_outputs(result):
    """
    Validate that all 3 ADK agents completed successfully.
    
    Args:
        result: Pipeline result to validate
        
    Returns:
        dict: Validation summary
    """
    print("\n🔍 Validating ADK agent outputs...")
    
    validation = {
        "total_agents": 3,
        "successful_agents": 0,
        "failed_agents": 0,
        "agent_status": {},
        "overall_success": False
    }
    
    agent_outputs = result.get("agent_outputs", {})
    
    # Check each agent
    agents = [
        ("adk_eighths_calculator", "ADK Eighths Calculator"),
        ("scene_breakdown_cards", "ADK Scene Breakdown Cards"),
        ("department_coordinator", "ADK Department Coordinator")
    ]
    
    for agent_key, agent_name in agents:
        if agent_key in agent_outputs:
            agent_data = agent_outputs[agent_key]
            if agent_data.get("status") == "success":
                validation["successful_agents"] += 1
                validation["agent_status"][agent_name] = "SUCCESS"
                print(f"   ✅ {agent_name}: SUCCESS")
            else:
                validation["failed_agents"] += 1
                validation["agent_status"][agent_name] = "FAILED"
                print(f"   ❌ {agent_name}: FAILED - {agent_data.get('message', 'Unknown error')}")
        else:
            validation["failed_agents"] += 1
            validation["agent_status"][agent_name] = "MISSING"
            print(f"   ⚠️  {agent_name}: MISSING OUTPUT")
    
    validation["overall_success"] = validation["successful_agents"] == 3
    
    print(f"\n📊 Validation Summary: {validation['successful_agents']}/{validation['total_agents']} agents successful")
    
    return validation

async def main():
    """Run comprehensive ADK pipeline tests."""
    print("🎯 STARTING COMPREHENSIVE ADK AGENT PIPELINE TESTS")
    print(f"⏰ Start time: {datetime.now()}")
    
    # Test 1: PDF Processing
    print("\n" + "🔵" * 20 + " TEST 1: PDF PROCESSING " + "🔵" * 20)
    pdf_result = await test_adk_pipeline_with_pdf()
    
    if pdf_result:
        pdf_validation = validate_agent_outputs(pdf_result)
        print(f"📈 PDF Test Result: {'SUCCESS' if pdf_validation['overall_success'] else 'PARTIAL/FAILED'}")
    
    # Test 2: Text Processing  
    print("\n" + "🟢" * 20 + " TEST 2: TEXT PROCESSING " + "🟢" * 20)
    text_result = await test_adk_pipeline_with_text()
    
    if text_result:
        text_validation = validate_agent_outputs(text_result)
        print(f"📈 Text Test Result: {'SUCCESS' if text_validation['overall_success'] else 'PARTIAL/FAILED'}")
    
    # Final Summary
    print("\n" + "=" * 80)
    print("COMPREHENSIVE TEST SUMMARY")
    print("=" * 80)
    print(f"⏰ Completion time: {datetime.now()}")
    
    if pdf_result and text_result:
        print("✅ Both PDF and text processing completed")
        
        # Check if all files were created
        agents_dir = "data/scripts/agents"
        if os.path.exists(agents_dir):
            agent_files = [f for f in os.listdir(agents_dir) if f.endswith('.json')]
            print(f"📁 Total agent output files created: {len(agent_files)}")
            
            for file in sorted(agent_files):
                print(f"   📄 {file}")
        
        reports_dir = "data/scripts/reports"
        if os.path.exists(reports_dir):
            report_files = [f for f in os.listdir(reports_dir) if f.startswith('comprehensive_report_')]
            print(f"📋 Total comprehensive reports: {len(report_files)}")
    else:
        print("❌ Some tests failed to complete")
    
    print("\n🎉 COMPREHENSIVE TESTING COMPLETED")

if __name__ == "__main__":
    # Run the comprehensive test suite
    asyncio.run(main())