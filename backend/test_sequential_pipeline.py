#!/usr/bin/env python3
"""
Test script for the 3-agent sequential pipeline
Tests: ADK Eighths Calculator → Scene Breakdown Cards → Department Coordinator
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.coordinator import ScriptIngestionCoordinator

# Sample script text for testing
SAMPLE_SCRIPT = """
INT. COFFEE SHOP - DAY

SARAH (20s, energetic) sits at a corner table, typing furiously on her laptop. The coffee shop is bustling with CUSTOMERS.

SARAH
(to herself)
Come on, just one more paragraph...

The door chimes as JAMES (30s, disheveled) enters, looking around nervously.

JAMES
(approaching counter)
Large coffee, black. Make it a double.

BARISTA
(cheerfully)
Sure thing! Having a rough morning?

JAMES
(glancing at Sarah)
Something like that.

Sarah looks up from her laptop, notices James staring.

SARAH
(suspicious)
Can I help you?

JAMES
(walking over)
Actually, yes. I think we need to talk.

SARAH
(closing laptop)
About what?

JAMES
About the missing files from your company's server.

Sarah's face goes pale.

EXT. COFFEE SHOP - CONTINUOUS

Through the window, we see Sarah and James in heated conversation. Other customers start to notice.

SARAH
(standing abruptly)
I don't know what you're talking about.

JAMES
(grabbing her arm)
The security footage says otherwise.

Sarah pulls away and heads for the door.

INT. SARAH'S CAR - MOVING - DAY

Sarah drives frantically, checking her rearview mirror. James follows in his car.

SARAH
(on phone)
Pick up, pick up...

VOICE (V.O.)
(filtered)
This is Detective Martinez.

SARAH
(panicked)
I need help. Someone's following me.

EXT. WAREHOUSE DISTRICT - DAY

Sarah's car pulls into an abandoned warehouse area. James's car follows.

INT. WAREHOUSE - DAY

Sarah enters cautiously. It's dark, filled with old equipment and shadows.

SARAH
(calling out)
Hello? Anyone here?

James appears from behind a stack of crates.

JAMES
(revealing badge)
FBI. Sarah Chen, you're under arrest.

SARAH
(shocked)
FBI? But I thought...

JAMES
The files you downloaded contained classified information. We've been tracking you for weeks.

Sarah drops her laptop bag, realization dawning.

SARAH
(defeated)
I just wanted to expose the corruption...

JAMES
(sympathetic)
That's not how this works. But if you cooperate...

Sarah nods slowly as James approaches with handcuffs.

FADE OUT.
"""

async def test_sequential_pipeline():
    """Test the 3-agent sequential pipeline"""
    print("🎬 Testing 3-Agent Sequential Pipeline")
    print("=" * 60)
    
    try:
        # Initialize coordinator
        print("📋 Initializing coordinator...")
        coordinator = ScriptIngestionCoordinator()
        print("✅ Coordinator initialized successfully")
        
        # Process the sample script
        print("\n📝 Processing sample script...")
        print(f"Script length: {len(SAMPLE_SCRIPT)} characters")
        
        # Run the pipeline
        result = await coordinator.process_script(
            script_text=SAMPLE_SCRIPT,
            department_focus=["camera", "sound", "lighting"],
            validation_level="lenient"
        )
        
        # Check for errors
        if "error" in result:
            print(f"❌ Pipeline failed: {result['error']}")
            return False
        
        # Display results
        print("\n🎉 Pipeline completed successfully!")
        print("=" * 60)
        
        # Agent outputs summary
        agent_outputs = result.get("agent_outputs", {})
        print("\n📊 Agent Outputs Summary:")
        print("-" * 40)
        
        # 1. ADK Eighths Calculator
        eighths_data = agent_outputs.get("adk_eighths_calculator", {})
        if eighths_data:
            print(f"✅ ADK Eighths Calculator: {eighths_data.get('status', 'unknown')}")
            if eighths_data.get("status") == "success":
                print(f"   - Message: {eighths_data.get('message', 'N/A')}")
            else:
                print(f"   - Error: {eighths_data.get('message', 'N/A')}")
        
        # 2. Scene Breakdown Cards
        breakdown_data = agent_outputs.get("scene_breakdown_cards", {})
        if breakdown_data and "error" not in breakdown_data:
            cards = breakdown_data.get("breakdown_cards", [])
            print(f"✅ Scene Breakdown Cards: Generated {len(cards)} cards")
            
            # Show complexity distribution
            summary = breakdown_data.get("summary_statistics", {})
            complexity = summary.get("complexity_distribution", {})
            print(f"   - Complexity: Simple={complexity.get('simple', 0)}, Moderate={complexity.get('moderate', 0)}, Complex={complexity.get('complex', 0)}")
            print(f"   - Estimated crew days: {summary.get('estimated_crew_days', 0):.1f}")
        elif "error" in breakdown_data:
            print(f"❌ Scene Breakdown Cards: {breakdown_data['error']}")
        
        # 3. Department Coordinator
        dept_data = agent_outputs.get("department_coordinator", {})
        if dept_data and "error" not in dept_data:
            dept_analysis = dept_data.get("department_analysis", {})
            print(f"✅ Department Coordinator: Analyzed {len(dept_analysis)} departments")
            
            # Show department involvement
            for dept_name, dept_info in dept_analysis.items():
                scenes_count = len(dept_info.get("scenes_requiring_department", []))
                crew_size = dept_info.get("crew_requirements", {}).get("base_crew_size", 0)
                print(f"   - {dept_name}: {scenes_count} scenes, {crew_size} crew")
        elif "error" in dept_data:
            print(f"❌ Department Coordinator: {dept_data['error']}")
        
        # Processing status
        print("\n📈 Processing Status:")
        print("-" * 40)
        processing_status = result.get("processing_status", {})
        completed_stages = processing_status.get("completed_stages", [])
        errors = processing_status.get("errors", [])
        
        print(f"✅ Completed stages: {len(completed_stages)}")
        for stage in completed_stages:
            print(f"   - {stage['stage']} ({stage['agent']})")
        
        if errors:
            print(f"❌ Errors: {len(errors)}")
            for error in errors:
                print(f"   - {error['stage']}: {error['error']}")
        
        # Statistics
        print("\n📊 Statistics:")
        print("-" * 40)
        stats = result.get("statistics", {})
        agent_summary = stats.get("agent_summary", {})
        print(f"Total agents: {agent_summary.get('total_agents', 0)}")
        print(f"Successful agents: {agent_summary.get('successful_agents', 0)}")
        
        # Scene statistics
        print(f"Total scenes: {stats.get('total_scenes', 0)}")
        print(f"Total characters: {stats.get('total_characters', 0)}")
        print(f"Total locations: {stats.get('total_locations', 0)}")
        
        # Eighths summary
        eighths_summary = stats.get("eighths_summary", {})
        if eighths_summary:
            print(f"Total eighths: {eighths_summary.get('total_eighths', 0)}")
            print(f"Estimated shoot days: {eighths_summary.get('estimated_days', 0)}")
        
        # Saved files
        print("\n💾 Saved Files:")
        print("-" * 40)
        saved_paths = result.get("saved_paths", {})
        for file_type, path in saved_paths.items():
            print(f"✅ {file_type}: {path}")
        
        print("\n🎉 Test completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function"""
    print("🚀 Starting Sequential Pipeline Test")
    print("Time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print()
    
    # Run the test
    success = asyncio.run(test_sequential_pipeline())
    
    if success:
        print("\n✅ All tests passed!")
        exit(0)
    else:
        print("\n❌ Tests failed!")
        exit(1)

if __name__ == "__main__":
    main()