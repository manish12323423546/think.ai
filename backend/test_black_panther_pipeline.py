#!/usr/bin/env python3
"""
Black Panther Script Analysis - 3-Agent Sequential Pipeline Test
Tests the complete pipeline with BLACK_PANTHER.pdf and generates detailed reports
"""

import asyncio
import sys
import os
import json
from datetime import datetime
import PyPDF2
import io

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from script_ingestion.coordinator import ScriptIngestionCoordinator

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            print(f"📄 PDF has {len(pdf_reader.pages)} pages")
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    text += page_text + "\n"
                    if page_num < 5:  # Show progress for first 5 pages
                        print(f"   Page {page_num + 1}: {len(page_text)} characters")
                except Exception as e:
                    print(f"   Warning: Could not extract text from page {page_num + 1}: {e}")
            
            print(f"📝 Total extracted text: {len(text)} characters")
            return text
            
    except Exception as e:
        print(f"❌ Error reading PDF: {e}")
        return ""

def create_agent_report(agent_name: str, agent_data: dict, timestamp: str) -> str:
    """Create a detailed markdown report for an agent"""
    report_lines = []
    
    # Header
    report_lines.append(f"# {agent_name} - Black Panther Script Analysis Report")
    report_lines.append(f"**Generated:** {timestamp}")
    report_lines.append(f"**Script:** BLACK_PANTHER.pdf")
    report_lines.append("")
    
    # Status
    if "status" in agent_data:
        status = agent_data["status"]
        status_emoji = "✅" if status == "success" else "❌"
        report_lines.append(f"## Status: {status_emoji} {status.upper()}")
    else:
        status_emoji = "✅" if "error" not in agent_data else "❌"
        report_lines.append(f"## Status: {status_emoji} {'SUCCESS' if 'error' not in agent_data else 'ERROR'}")
    
    report_lines.append("")
    
    # Agent-specific analysis
    if agent_name == "ADK Eighths Calculator":
        report_lines.extend(create_eighths_report(agent_data))
    elif agent_name == "Scene Breakdown Cards":
        report_lines.extend(create_breakdown_cards_report(agent_data))
    elif agent_name == "Department Coordinator":
        report_lines.extend(create_department_coordinator_report(agent_data))
    
    # Raw data section
    report_lines.append("## Raw Agent Output")
    report_lines.append("```json")
    report_lines.append(json.dumps(agent_data, indent=2))
    report_lines.append("```")
    
    return "\n".join(report_lines)

def create_eighths_report(agent_data: dict) -> list:
    """Create eighths calculator specific report"""
    lines = []
    
    if agent_data.get("status") == "success":
        lines.append("## Eighths Calculation Results")
        lines.append("")
        
        # Message
        if "message" in agent_data:
            lines.append(f"**Message:** {agent_data['message']}")
            lines.append("")
        
        # Report
        if "report" in agent_data:
            lines.append("### Industry Standard Report")
            lines.append("```")
            lines.append(agent_data["report"])
            lines.append("```")
            lines.append("")
        
        # Eighths data
        if "eighths_data" in agent_data:
            lines.append("### Calculation Data")
            lines.append("```json")
            lines.append(json.dumps(agent_data["eighths_data"], indent=2))
            lines.append("```")
            lines.append("")
    
    else:
        lines.append("## Error Details")
        lines.append("")
        if "message" in agent_data:
            lines.append(f"**Error:** {agent_data['message']}")
        lines.append("")
        lines.append("### Troubleshooting")
        lines.append("- Check if Google ADK is properly configured")
        lines.append("- Verify API keys and authentication")
        lines.append("- Ensure all dependencies are installed")
        lines.append("")
    
    return lines

def create_breakdown_cards_report(agent_data: dict) -> list:
    """Create breakdown cards specific report"""
    lines = []
    
    if "error" not in agent_data:
        lines.append("## Scene Breakdown Cards Analysis")
        lines.append("")
        
        # Summary statistics
        if "summary_statistics" in agent_data:
            summary = agent_data["summary_statistics"]
            lines.append("### Summary Statistics")
            lines.append(f"- **Total Cards Generated:** {summary.get('total_cards', 0)}")
            lines.append(f"- **Estimated Crew Days:** {summary.get('estimated_crew_days', 0):.1f}")
            lines.append("")
            
            # Complexity distribution
            if "complexity_distribution" in summary:
                complexity = summary["complexity_distribution"]
                lines.append("### Complexity Distribution")
                lines.append(f"- **Simple Scenes:** {complexity.get('simple', 0)}")
                lines.append(f"- **Moderate Scenes:** {complexity.get('moderate', 0)}")
                lines.append(f"- **Complex Scenes:** {complexity.get('complex', 0)}")
                lines.append("")
        
        # Breakdown cards
        if "breakdown_cards" in agent_data:
            cards = agent_data["breakdown_cards"]
            lines.append(f"### Individual Scene Breakdown Cards ({len(cards)} scenes)")
            lines.append("")
            
            for i, card in enumerate(cards[:10]):  # Show first 10 cards
                lines.append(f"#### Scene {card.get('scene_number', 'Unknown')}")
                lines.append(f"- **Location:** {card.get('location', 'Unknown')}")
                lines.append(f"- **Time:** {card.get('time_of_day', 'Unknown')}")
                lines.append(f"- **Complexity:** {card.get('complexity_level', 'Unknown')}")
                lines.append(f"- **Estimated Hours:** {card.get('estimated_hours', 0):.1f}")
                lines.append(f"- **Crew Size:** {card.get('crew_estimate', {}).get('total_crew', 0)}")
                
                if card.get('props_needed'):
                    lines.append(f"- **Props Needed:** {', '.join(card['props_needed'])}")
                
                if card.get('special_requirements'):
                    lines.append(f"- **Special Requirements:** {', '.join(card['special_requirements'])}")
                
                lines.append("")
            
            if len(cards) > 10:
                lines.append(f"... and {len(cards) - 10} more scenes")
                lines.append("")
        
        # Scheduling analysis
        if "scheduling_analysis" in agent_data:
            scheduling = agent_data["scheduling_analysis"]
            lines.append("### Scheduling Analysis")
            
            for key, value in scheduling.items():
                if isinstance(value, list) and value:
                    lines.append(f"- **{key.replace('_', ' ').title()}:** {', '.join(map(str, value))}")
                elif isinstance(value, (int, float)):
                    lines.append(f"- **{key.replace('_', ' ').title()}:** {value}")
            
            lines.append("")
        
        # Production notes
        if "production_notes" in agent_data:
            notes = agent_data["production_notes"]
            lines.append("### Production Notes")
            for note in notes:
                lines.append(f"- {note}")
            lines.append("")
    
    else:
        lines.append("## Error Details")
        lines.append("")
        lines.append(f"**Error:** {agent_data.get('error', 'Unknown error')}")
        lines.append("")
    
    return lines

def create_department_coordinator_report(agent_data: dict) -> list:
    """Create department coordinator specific report"""
    lines = []
    
    if "error" not in agent_data:
        lines.append("## Department Coordination Analysis")
        lines.append("")
        
        # Department summary
        if "department_summary" in agent_data:
            summary = agent_data["department_summary"]
            lines.append("### Department Summary")
            lines.append(f"- **Total Departments Involved:** {summary.get('total_departments_involved', 0)}")
            lines.append(f"- **Total Crew Size:** {summary.get('total_crew_size', 0)}")
            lines.append(f"- **Total Estimated Hours:** {summary.get('total_estimated_hours', 0):.1f}")
            lines.append(f"- **Most Involved Department:** {summary.get('most_involved_department', 'N/A')}")
            lines.append("")
        
        # Department analysis
        if "department_analysis" in agent_data:
            dept_analysis = agent_data["department_analysis"]
            lines.append("### Department-by-Department Analysis")
            lines.append("")
            
            for dept_name, dept_data in dept_analysis.items():
                lines.append(f"#### {dept_name.title()} Department")
                lines.append(f"- **Scenes Requiring Department:** {len(dept_data.get('scenes_requiring_department', []))}")
                lines.append(f"- **Estimated Hours:** {dept_data.get('estimated_hours', 0):.1f}")
                
                # Crew requirements
                crew_req = dept_data.get('crew_requirements', {})
                lines.append(f"- **Crew Size:** {crew_req.get('base_crew_size', 0)}")
                lines.append(f"- **Complexity Factor:** {crew_req.get('complexity_factor', 0):.2f}")
                
                # Equipment needed
                equipment = dept_data.get('equipment_needed', [])
                if equipment:
                    lines.append(f"- **Equipment Needed:** {', '.join(equipment)}")
                
                # Special needs
                special = dept_data.get('special_needs', [])
                if special:
                    lines.append(f"- **Special Needs:** {', '.join(special)}")
                
                lines.append("")
        
        # Resource allocation
        if "resource_allocation" in agent_data:
            allocation = agent_data["resource_allocation"]
            lines.append("### Resource Allocation")
            lines.append(f"- **Total Crew Needed:** {allocation.get('total_crew_needed', 0)}")
            
            peak_scenes = allocation.get('peak_crew_scenes', [])
            if peak_scenes:
                lines.append(f"- **Peak Crew Scenes:** {len(peak_scenes)}")
                for scene in peak_scenes[:5]:  # Show first 5
                    lines.append(f"  - Scene {scene.get('scene_number', 'Unknown')}: {scene.get('crew_size', 0)} crew")
            
            lines.append("")
        
        # Coordination recommendations
        if "coordination_recommendations" in agent_data:
            recommendations = agent_data["coordination_recommendations"]
            lines.append("### Coordination Recommendations")
            for rec in recommendations:
                lines.append(f"- {rec}")
            lines.append("")
    
    else:
        lines.append("## Error Details")
        lines.append("")
        lines.append(f"**Error:** {agent_data.get('error', 'Unknown error')}")
        lines.append("")
    
    return lines

async def test_black_panther_pipeline():
    """Test the 3-agent sequential pipeline with Black Panther script"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    print("🎬 BLACK PANTHER SCRIPT ANALYSIS")
    print("=" * 80)
    print(f"Timestamp: {timestamp}")
    print()
    
    # Step 1: Extract text from PDF
    pdf_path = "/Users/varunisrani/Desktop/mckays-app-template 3/BLACK_PANTHER.pdf"
    print("📄 Extracting text from BLACK_PANTHER.pdf...")
    
    script_text = extract_text_from_pdf(pdf_path)
    
    if not script_text:
        print("❌ Failed to extract text from PDF")
        return False
    
    print(f"✅ Successfully extracted {len(script_text)} characters")
    print()
    
    # Step 2: Initialize coordinator
    print("📋 Initializing 3-agent coordinator...")
    coordinator = ScriptIngestionCoordinator()
    print("✅ Coordinator initialized")
    print()
    
    # Step 3: Process the script
    print("🚀 Processing Black Panther script through 3-agent pipeline...")
    print("   Stage 1: ADK Eighths Calculator")
    print("   Stage 2: Scene Breakdown Cards")
    print("   Stage 3: Department Coordinator")
    print()
    
    result = await coordinator.process_script(
        script_input=script_text,
        input_type="text",
        department_focus=["camera", "sound", "lighting", "art", "wardrobe"],
        validation_level="lenient"
    )
    
    # Step 4: Check results
    if "error" in result:
        print(f"❌ Pipeline failed: {result['error']}")
        return False
    
    print("✅ Pipeline completed successfully!")
    print()
    
    # Step 5: Generate detailed reports
    print("📊 Generating detailed agent reports...")
    
    agent_outputs = result.get("agent_outputs", {})
    reports_created = []
    
    # ADK Eighths Calculator Report
    if "adk_eighths_calculator" in agent_outputs:
        print("   Creating ADK Eighths Calculator report...")
        eighths_report = create_agent_report(
            "ADK Eighths Calculator",
            agent_outputs["adk_eighths_calculator"],
            timestamp
        )
        
        report_path = f"black_panther_adk_eighths_report_{timestamp}.md"
        with open(report_path, "w") as f:
            f.write(eighths_report)
        
        # Raw output
        raw_path = f"black_panther_adk_eighths_raw_{timestamp}.txt"
        with open(raw_path, "w") as f:
            f.write(json.dumps(agent_outputs["adk_eighths_calculator"], indent=2))
        
        reports_created.extend([report_path, raw_path])
    
    # Scene Breakdown Cards Report
    if "scene_breakdown_cards" in agent_outputs:
        print("   Creating Scene Breakdown Cards report...")
        breakdown_report = create_agent_report(
            "Scene Breakdown Cards",
            agent_outputs["scene_breakdown_cards"],
            timestamp
        )
        
        report_path = f"black_panther_breakdown_cards_report_{timestamp}.md"
        with open(report_path, "w") as f:
            f.write(breakdown_report)
        
        # Raw output
        raw_path = f"black_panther_breakdown_cards_raw_{timestamp}.txt"
        with open(raw_path, "w") as f:
            f.write(json.dumps(agent_outputs["scene_breakdown_cards"], indent=2))
        
        reports_created.extend([report_path, raw_path])
    
    # Department Coordinator Report
    if "department_coordinator" in agent_outputs:
        print("   Creating Department Coordinator report...")
        dept_report = create_agent_report(
            "Department Coordinator",
            agent_outputs["department_coordinator"],
            timestamp
        )
        
        report_path = f"black_panther_department_coordinator_report_{timestamp}.md"
        with open(report_path, "w") as f:
            f.write(dept_report)
        
        # Raw output
        raw_path = f"black_panther_department_coordinator_raw_{timestamp}.txt"
        with open(raw_path, "w") as f:
            f.write(json.dumps(agent_outputs["department_coordinator"], indent=2))
        
        reports_created.extend([report_path, raw_path])
    
    # Step 6: Create comprehensive summary report
    print("   Creating comprehensive summary report...")
    
    summary_report = create_comprehensive_summary(result, timestamp)
    summary_path = f"black_panther_comprehensive_analysis_{timestamp}.md"
    with open(summary_path, "w") as f:
        f.write(summary_report)
    
    reports_created.append(summary_path)
    
    # Step 7: Display results
    print()
    print("📈 ANALYSIS COMPLETE")
    print("=" * 80)
    
    # Processing status
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
    
    print()
    
    # Statistics
    stats = result.get("statistics", {})
    print("📊 Script Statistics:")
    print(f"   - Total scenes: {stats.get('total_scenes', 0)}")
    print(f"   - Total characters: {stats.get('total_characters', 0)}")
    print(f"   - Total locations: {stats.get('total_locations', 0)}")
    
    # Agent-specific stats
    if "breakdown_summary" in stats:
        breakdown = stats["breakdown_summary"]
        print(f"   - Breakdown cards: {breakdown.get('total_cards', 0)}")
        print(f"   - Estimated crew days: {breakdown.get('estimated_crew_days', 0):.1f}")
    
    if "department_summary" in stats:
        dept = stats["department_summary"]
        print(f"   - Total departments: {dept.get('total_departments', 0)}")
        print(f"   - Total crew size: {dept.get('total_crew_size', 0)}")
    
    print()
    
    # Files created
    print("📁 Reports Generated:")
    for report in reports_created:
        print(f"   ✅ {report}")
    
    print()
    print("🎉 Black Panther analysis complete!")
    
    return True

def create_comprehensive_summary(result: dict, timestamp: str) -> str:
    """Create a comprehensive summary report"""
    lines = []
    
    # Header
    lines.append("# Black Panther Script - Comprehensive Analysis Report")
    lines.append(f"**Generated:** {timestamp}")
    lines.append(f"**Script:** BLACK_PANTHER.pdf")
    lines.append(f"**Analysis System:** 3-Agent Sequential Pipeline")
    lines.append("")
    
    # Executive Summary
    lines.append("## Executive Summary")
    lines.append("")
    
    processing_status = result.get("processing_status", {})
    completed_stages = processing_status.get("completed_stages", [])
    errors = processing_status.get("errors", [])
    
    lines.append(f"The Black Panther script was processed through a 3-agent sequential pipeline.")
    lines.append(f"**Pipeline Status:** {len(completed_stages)}/3 agents completed successfully")
    
    if errors:
        lines.append(f"**Errors Encountered:** {len(errors)}")
    
    lines.append("")
    
    # Agent Pipeline Results
    lines.append("## Agent Pipeline Results")
    lines.append("")
    
    agent_outputs = result.get("agent_outputs", {})
    
    # ADK Eighths Calculator
    lines.append("### 1. ADK Eighths Calculator")
    eighths_data = agent_outputs.get("adk_eighths_calculator", {})
    if eighths_data.get("status") == "success":
        lines.append("✅ **Status:** Success")
        lines.append(f"- Generated industry-standard eighths breakdown")
        lines.append(f"- Calculated scene timing and complexity")
    else:
        lines.append("❌ **Status:** Failed")
        lines.append(f"- Error: {eighths_data.get('message', 'Unknown error')}")
    lines.append("")
    
    # Scene Breakdown Cards
    lines.append("### 2. Scene Breakdown Cards")
    breakdown_data = agent_outputs.get("scene_breakdown_cards", {})
    if "error" not in breakdown_data:
        lines.append("✅ **Status:** Success")
        cards = breakdown_data.get("breakdown_cards", [])
        summary = breakdown_data.get("summary_statistics", {})
        lines.append(f"- Generated {len(cards)} scene breakdown cards")
        lines.append(f"- Estimated crew days: {summary.get('estimated_crew_days', 0):.1f}")
        
        complexity = summary.get("complexity_distribution", {})
        lines.append(f"- Scene complexity: {complexity.get('simple', 0)} simple, {complexity.get('moderate', 0)} moderate, {complexity.get('complex', 0)} complex")
    else:
        lines.append("❌ **Status:** Failed")
        lines.append(f"- Error: {breakdown_data.get('error', 'Unknown error')}")
    lines.append("")
    
    # Department Coordinator
    lines.append("### 3. Department Coordinator")
    dept_data = agent_outputs.get("department_coordinator", {})
    if "error" not in dept_data:
        lines.append("✅ **Status:** Success")
        dept_analysis = dept_data.get("department_analysis", {})
        dept_summary = dept_data.get("department_summary", {})
        lines.append(f"- Analyzed {len(dept_analysis)} departments")
        lines.append(f"- Total crew size: {dept_summary.get('total_crew_size', 0)}")
        lines.append(f"- Most involved department: {dept_summary.get('most_involved_department', 'N/A')}")
    else:
        lines.append("❌ **Status:** Failed")
        lines.append(f"- Error: {dept_data.get('error', 'Unknown error')}")
    lines.append("")
    
    # Detailed Statistics
    lines.append("## Detailed Statistics")
    lines.append("")
    
    stats = result.get("statistics", {})
    agent_summary = stats.get("agent_summary", {})
    
    lines.append(f"- **Total Agents:** {agent_summary.get('total_agents', 0)}")
    lines.append(f"- **Successful Agents:** {agent_summary.get('successful_agents', 0)}")
    lines.append(f"- **Total Scenes:** {stats.get('total_scenes', 0)}")
    lines.append(f"- **Total Characters:** {stats.get('total_characters', 0)}")
    lines.append(f"- **Total Locations:** {stats.get('total_locations', 0)}")
    lines.append("")
    
    # Recommendations
    lines.append("## Production Recommendations")
    lines.append("")
    
    recommendations = dept_data.get("coordination_recommendations", [])
    if recommendations:
        for rec in recommendations:
            lines.append(f"- {rec}")
    else:
        lines.append("- No specific recommendations generated")
    
    lines.append("")
    
    # Technical Notes
    lines.append("## Technical Notes")
    lines.append("")
    lines.append("- Script processed using 3-agent sequential pipeline")
    lines.append("- ADK Eighths Calculator uses Google ADK framework")
    lines.append("- Scene Breakdown Cards follow industry AD standards")
    lines.append("- Department Coordinator analyzes 6 major departments")
    lines.append("- All timing calculations follow industry standards (1 page = 8 eighths)")
    lines.append("")
    
    return "\n".join(lines)

def main():
    """Main function"""
    print("🚀 Starting Black Panther Script Analysis")
    print("Time:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print()
    
    try:
        success = asyncio.run(test_black_panther_pipeline())
        
        if success:
            print("\n✅ Analysis completed successfully!")
            exit(0)
        else:
            print("\n❌ Analysis failed!")
            exit(1)
            
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()