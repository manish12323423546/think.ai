"""
Google ADK Implementation of EighthsCalculatorAgent
Uses official Google ADK patterns for tool functions and agent creation
"""

from typing import Dict, Any, List
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import ToolContext
import logging
from datetime import datetime
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Industry Standards Constants
INDUSTRY_STANDARDS = {
    "words_per_page": 250,
    "eighths_per_page": 8,
    "minutes_per_eighth": 9,
    "hours_per_eighth": 0.15,
    "standard_shoot_day_eighths": 60,
    "base_crew_hours": 12,
    "setup_time_percentage": 0.3,
    "wrap_time_percentage": 0.2,
    "minimum_scene_size": 0.125
}

# Complexity Factors
COMPLEXITY_FACTORS = {
    "base_factor": 1.0,
    "technical_cue_factor": 0.1,
    "exterior_factor": 0.2,
    "night_factor": 0.3,
    "dusk_dawn_factor": 0.2,
    "character_threshold": 3,
    "character_factor": 0.1,
    "dialogue_threshold": 10,
    "dialogue_factor": 0.1,
    "max_complexity": 3.0
}

# Tool Functions using ADK patterns
def determine_complexity_tool(scene_data: Dict[str, Any], tool_context: ToolContext) -> Dict[str, Any]:
    """
    Calculates the complexity factor for a scene based on technical requirements.
    
    Args:
        scene_data: Dictionary containing scene information
        tool_context: ADK tool context for state management
        
    Returns:
        Dictionary with complexity breakdown
    """
    logger.info(f"Calculating complexity for scene {scene_data.get('scene_number', 'Unknown')}")
    
    complexity = COMPLEXITY_FACTORS["base_factor"]
    factors_applied = ["base_factor: 1.0"]
    
    # Technical cues complexity
    technical_factor = 0.0
    technical_cues = scene_data.get("technical_cues", [])
    if technical_cues:
        cue_count = len(technical_cues)
        technical_factor = cue_count * COMPLEXITY_FACTORS["technical_cue_factor"]
        complexity += technical_factor
        factors_applied.append(f"technical_cues({cue_count}): +{technical_factor}")
    
    # Location complexity
    location_factor = 0.0
    if scene_data.get("location_type") == "EXT":
        location_factor = COMPLEXITY_FACTORS["exterior_factor"]
        complexity += location_factor
        factors_applied.append(f"exterior: +{location_factor}")
    
    # Time of day complexity
    time_factor = 0.0
    time_of_day = scene_data.get("time_of_day", "DAY")
    if time_of_day == "NIGHT":
        time_factor = COMPLEXITY_FACTORS["night_factor"]
        complexity += time_factor
        factors_applied.append(f"night: +{time_factor}")
    elif time_of_day in ["DUSK", "DAWN"]:
        time_factor = COMPLEXITY_FACTORS["dusk_dawn_factor"]
        complexity += time_factor
        factors_applied.append(f"{time_of_day.lower()}: +{time_factor}")
    
    # Character complexity
    character_factor = 0.0
    character_count = scene_data.get("character_count", 0)
    if character_count > COMPLEXITY_FACTORS["character_threshold"]:
        extra_chars = character_count - COMPLEXITY_FACTORS["character_threshold"]
        character_factor = extra_chars * COMPLEXITY_FACTORS["character_factor"]
        complexity += character_factor
        factors_applied.append(f"characters({character_count}): +{character_factor}")
    
    # Dialogue complexity
    dialogue_factor = 0.0
    dialogue_count = scene_data.get("dialogue_count", 0)
    if dialogue_count > COMPLEXITY_FACTORS["dialogue_threshold"]:
        dialogue_factor = COMPLEXITY_FACTORS["dialogue_factor"]
        complexity += dialogue_factor
        factors_applied.append(f"dialogue({dialogue_count}): +{dialogue_factor}")
    
    # Cap complexity at maximum
    total_complexity = min(complexity, COMPLEXITY_FACTORS["max_complexity"])
    
    result = {
        "base_factor": COMPLEXITY_FACTORS["base_factor"],
        "technical_factor": technical_factor,
        "location_factor": location_factor,
        "time_factor": time_factor,
        "character_factor": character_factor,
        "dialogue_factor": dialogue_factor,
        "total_complexity": total_complexity,
        "factors_applied": factors_applied
    }
    
    # Store in context for later use
    tool_context.state[f"complexity_{scene_data.get('scene_number', 'unknown')}"] = result
    
    return result

def calculate_single_scene_tool(scene_data: Dict[str, Any], tool_context: ToolContext) -> Dict[str, Any]:
    """
    Calculates eighths breakdown for a single scene with time estimates.
    
    Args:
        scene_data: Dictionary containing scene information
        tool_context: ADK tool context for state management
        
    Returns:
        Dictionary with scene eighths breakdown
    """
    scene_number = scene_data.get("scene_number", "unknown")
    logger.info(f"Calculating eighths for scene {scene_number}")
    
    # Get complexity from context or calculate it
    complexity_key = f"complexity_{scene_number}"
    if complexity_key in tool_context.state:
        complexity_result = tool_context.state[complexity_key]
        complexity_factor = complexity_result["total_complexity"]
    else:
        # Calculate complexity if not in context
        complexity_result = determine_complexity_tool(scene_data, tool_context)
        complexity_factor = complexity_result["total_complexity"]
    
    # Calculate page count from description length
    description = scene_data.get("description", "")
    word_count = len(description.split())
    page_count = max(
        word_count / INDUSTRY_STANDARDS["words_per_page"],
        INDUSTRY_STANDARDS["minimum_scene_size"]
    )
    
    # Calculate base eighths
    base_eighths = page_count * INDUSTRY_STANDARDS["eighths_per_page"]
    
    # Apply complexity to eighths
    adjusted_eighths = base_eighths * complexity_factor
    
    # Calculate time estimates
    base_shoot_hours = adjusted_eighths * INDUSTRY_STANDARDS["hours_per_eighth"]
    setup_hours = base_shoot_hours * INDUSTRY_STANDARDS["setup_time_percentage"]
    wrap_hours = base_shoot_hours * INDUSTRY_STANDARDS["wrap_time_percentage"]
    total_hours = base_shoot_hours + setup_hours + wrap_hours
    
    result = {
        "scene_number": scene_number,
        "word_count": word_count,
        "page_count": page_count,
        "base_eighths": base_eighths,
        "complexity_factor": complexity_factor,
        "adjusted_eighths": adjusted_eighths,
        "estimated_shoot_hours": base_shoot_hours,
        "setup_hours": setup_hours,
        "wrap_hours": wrap_hours,
        "total_hours": total_hours
    }
    
    # Store in context
    tool_context.state[f"scene_eighths_{scene_number}"] = result
    
    return result

def calculate_all_scenes_tool(scenes_data: List[Dict[str, Any]], tool_context: ToolContext) -> Dict[str, Any]:
    """
    Calculates eighths breakdown for all scenes in a script.
    
    Args:
        scenes_data: List of scene dictionaries
        tool_context: ADK tool context for state management
        
    Returns:
        Complete eighths breakdown with totals
    """
    logger.info(f"Processing eighths for {len(scenes_data)} scenes")
    
    scene_results = []
    total_script_eighths = 0.0
    total_adjusted_eighths = 0.0
    total_production_hours = 0.0
    complexity_breakdown = {"simple": 0, "moderate": 0, "complex": 0}
    
    for scene_dict in scenes_data:
        # Calculate complexity
        complexity_result = determine_complexity_tool(scene_dict, tool_context)
        
        # Calculate eighths
        eighths_result = calculate_single_scene_tool(scene_dict, tool_context)
        
        # Aggregate totals
        total_script_eighths += eighths_result["base_eighths"]
        total_adjusted_eighths += eighths_result["adjusted_eighths"]
        total_production_hours += eighths_result["total_hours"]
        
        # Categorize complexity
        if complexity_result["total_complexity"] <= 1.2:
            complexity_breakdown["simple"] += 1
        elif complexity_result["total_complexity"] <= 1.8:
            complexity_breakdown["moderate"] += 1
        else:
            complexity_breakdown["complex"] += 1
        
        # Store result
        scene_results.append({
            "scene": eighths_result,
            "complexity": complexity_result
        })
    
    # Calculate shoot days
    estimated_shoot_days = total_adjusted_eighths / INDUSTRY_STANDARDS["standard_shoot_day_eighths"]
    
    result = {
        "timestamp": datetime.now().isoformat(),
        "scene_calculations": scene_results,
        "totals": {
            "total_scenes": len(scenes_data),
            "total_script_eighths": round(total_script_eighths, 2),
            "total_adjusted_eighths": round(total_adjusted_eighths, 2),
            "estimated_shoot_days": round(estimated_shoot_days, 1),
            "total_production_hours": round(total_production_hours, 2)
        },
        "breakdown_by_complexity": complexity_breakdown,
        "industry_standards_used": INDUSTRY_STANDARDS
    }
    
    # Store complete result in context
    tool_context.state["complete_eighths_calculation"] = result
    
    return result

def generate_report_tool(eighths_data: Dict[str, Any], tool_context: ToolContext) -> Dict[str, Any]:
    """
    Generates a formatted industry-standard eighths report.
    
    Args:
        eighths_data: Complete eighths calculation data
        tool_context: ADK tool context for state management
        
    Returns:
        Dictionary containing formatted report
    """
    logger.info("Generating eighths report")
    
    # Get data from context if not provided
    if not eighths_data and "complete_eighths_calculation" in tool_context.state:
        eighths_data = tool_context.state["complete_eighths_calculation"]
    
    totals = eighths_data.get("totals", {})
    complexity = eighths_data.get("breakdown_by_complexity", {})
    
    report = []
    report.append("=" * 80)
    report.append("INDUSTRY STANDARD EIGHTHS BREAKDOWN REPORT")
    report.append("=" * 80)
    report.append(f"Generated: {eighths_data.get('timestamp', 'N/A')}")
    report.append("")
    
    # Summary Section
    report.append("SUMMARY")
    report.append("-" * 40)
    report.append(f"Total Scenes: {totals.get('total_scenes', 0)}")
    report.append(f"Script Eighths: {totals.get('total_script_eighths', 0)}")
    report.append(f"Adjusted Eighths (w/ complexity): {totals.get('total_adjusted_eighths', 0)}")
    report.append(f"Estimated Shoot Days: {totals.get('estimated_shoot_days', 0)}")
    report.append(f"Total Production Hours: {totals.get('total_production_hours', 0)}")
    report.append("")
    
    # Complexity Breakdown
    report.append("COMPLEXITY BREAKDOWN")
    report.append("-" * 40)
    report.append(f"Simple Scenes: {complexity.get('simple', 0)}")
    report.append(f"Moderate Scenes: {complexity.get('moderate', 0)}")
    report.append(f"Complex Scenes: {complexity.get('complex', 0)}")
    report.append("")
    
    # Industry Standards Used
    report.append("INDUSTRY STANDARDS APPLIED")
    report.append("-" * 40)
    standards = eighths_data.get("industry_standards_used", {})
    report.append(f"• 1 page = {standards.get('eighths_per_page', 8)} eighths")
    report.append(f"• 1 eighth = {standards.get('minutes_per_eighth', 9)} minutes")
    report.append(f"• Standard shoot day = {standards.get('standard_shoot_day_eighths', 60)} eighths")
    report.append(f"• Words per page = {standards.get('words_per_page', 250)}")
    report.append("")
    
    # Scene Details
    report.append("SCENE-BY-SCENE BREAKDOWN")
    report.append("-" * 40)
    
    for scene_calc in eighths_data.get("scene_calculations", []):
        scene = scene_calc["scene"]
        complexity = scene_calc["complexity"]
        
        report.append(f"\nScene {scene['scene_number']}:")
        report.append(f"  • Page Count: {scene['page_count']:.2f}")
        report.append(f"  • Base Eighths: {scene['base_eighths']:.1f}")
        report.append(f"  • Complexity Factor: {scene['complexity_factor']:.2f}x")
        report.append(f"  • Adjusted Eighths: {scene['adjusted_eighths']:.1f}")
        report.append(f"  • Estimated Hours: {scene['total_hours']:.1f}")
        report.append(f"  • Complexity Factors: {', '.join(complexity['factors_applied'])}")
    
    report.append("")
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    formatted_report = "\n".join(report)
    
    # Store report in context
    tool_context.state["generated_report"] = formatted_report
    
    return {"report": formatted_report}

class ADKEighthsCalculatorAgent:
    """
    Google ADK Implementation of EighthsCalculatorAgent
    Uses official ADK patterns for agent creation and tool orchestration
    """
    
    def __init__(self):
        """Initialize the ADK agent with tools."""
        # Create the ADK agent with tools
        self.agent = LlmAgent(
            name="eighths_calculator_agent",
            model="gemini-2.0-flash-exp",
            description="Industry-standard eighths calculator for film production",
            instruction="""You are an Industry Standards Eighths Calculator Agent for film production.

Your expertise:
1. Convert script pages to eighths (1 page = 8 eighths)
2. Calculate industry-standard time estimates (1 eighth = ~9 minutes)
3. Apply complexity factors based on technical requirements
4. Generate accurate shoot time predictions

Use the provided tools to:
- determine_complexity_tool: Calculate scene complexity factors
- calculate_single_scene_tool: Calculate eighths for individual scenes
- calculate_all_scenes_tool: Process multiple scenes at once
- generate_report_tool: Create formatted industry reports

Always follow industry standards and provide detailed breakdowns for production planning.""",
            tools=[
                determine_complexity_tool,
                calculate_single_scene_tool,
                calculate_all_scenes_tool,
                generate_report_tool
            ]
        )
        
        # Initialize session service
        self.session_service = InMemorySessionService()
        
        # Initialize runner with required parameters
        self.runner = Runner(
            app_name="eighths_calculator",
            agent=self.agent,
            session_service=self.session_service
        )
        
        logger.info("ADK EighthsCalculatorAgent initialized")
    
    def process_script_scenes(self, scenes_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process script scenes using ADK tools to calculate eighths.
        
        Args:
            scenes_data: List of scene dictionaries
            
        Returns:
            Dictionary with eighths calculations and report
        """
        logger.info(f"Processing {len(scenes_data)} scenes with ADK agent")
        
        # Create the prompt for the agent
        prompt = f"""Process the following scenes and calculate eighths breakdown.

Use the tools in this order:
1. Use calculate_all_scenes_tool with all the scenes data
2. Use generate_report_tool with the calculated data

Scenes data:
{json.dumps(scenes_data, indent=2)}

Provide a complete eighths breakdown with:
- Per-scene calculations
- Total eighths and shoot days
- Complexity analysis
- Formatted report"""
        
        try:
            # Run the agent
            result = self.runner.run()
            
            # Parse the result
            if hasattr(result, 'message') and result.message:
                # Extract the response
                response_text = result.message
                
                return {
                    "status": "success",
                    "message": "ADK agent completed successfully",
                    "eighths_data": {},
                    "report": response_text
                }
            else:
                return {
                    "status": "error",
                    "message": "No response from ADK agent",
                    "eighths_data": {},
                    "report": ""
                }
                
        except Exception as e:
            logger.error(f"Error running ADK agent: {e}")
            return {
                "status": "error",
                "message": str(e),
                "eighths_data": {},
                "report": ""
            }
    
    def process_single_scene(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single scene for detailed eighths calculation.
        
        Args:
            scene_data: Single scene dictionary
            
        Returns:
            Detailed eighths breakdown for the scene
        """
        logger.info(f"Processing single scene: {scene_data.get('scene_number', 'Unknown')}")
        
        prompt = f"""Calculate detailed eighths for this single scene.

Use the tools in this order:
1. Use determine_complexity_tool to calculate complexity
2. Use calculate_single_scene_tool with the scene data

Scene data:
{json.dumps(scene_data, indent=2)}

Provide detailed analysis including complexity factors and time estimates."""
        
        try:
            result = self.runner.run()
            
            # Get data from result
            scene_number = scene_data.get("scene_number", "unknown")
            
            return {
                "status": "success",
                "scene_eighths": {},
                "complexity": {},
                "summary": result.message if hasattr(result, 'message') else "Calculation completed"
            }
            
        except Exception as e:
            logger.error(f"Error processing single scene: {e}")
            return {
                "status": "error",
                "message": str(e),
                "scene_eighths": {},
                "complexity": {},
                "summary": ""
            }

def create_adk_eighths_agent() -> ADKEighthsCalculatorAgent:
    """Factory function to create an ADK eighths calculator agent."""
    return ADKEighthsCalculatorAgent()