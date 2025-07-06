from typing import Dict, Any
import json
import logging
from datetime import datetime
from ...base_config import AGENT_INSTRUCTIONS, get_model_config
from google import genai
from google.genai import types
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EighthsCalculatorAgent:
    """
    ✅ EighthsCalculatorAgent (INDUSTRY STANDARD)
    
    Specialized agent for calculating industry-standard eighths system.
    Responsibilities:
    - Calculate scene eighths (1 page = 8 eighths)
    - Generate time estimates based on industry standards
    - Complexity factor calculations
    """
    
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = """You are an Industry Standards Eighths Calculator Agent for film production.
        Your expertise:
        1. Convert script pages to eighths (1 page = 8 eighths)
        2. Calculate industry-standard time estimates (1 eighth = ~9 minutes)
        3. Apply complexity factors based on technical requirements
        4. Generate accurate shoot time predictions"""
        logger.info("EighthsCalculatorAgent initialized")
    
    def calculate_eighths(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate eighths breakdown for all scenes."""
        logger.info("Starting eighths calculation")
        
        if not scene_data or not isinstance(scene_data, dict):
            logger.error("Invalid scene data received")
            return {"error": "Invalid scene data format"}
        
        scenes = scene_data.get('scenes', [])
        logger.info(f"Processing eighths for {len(scenes)} scenes")
        
        eighths_breakdown = {}
        total_script_eighths = 0
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            
            # Calculate page count from description length
            description = scene.get('description', '')
            dialogue_text = ' '.join([d.get('text', '') for d in scene.get('dialogues', [])])
            
            # Industry standard: ~250 words per page
            word_count = len(description.split()) + len(dialogue_text.split())
            page_count = max(word_count / 250, 0.125)  # Minimum 1/8 page
            
            # Calculate basic eighths
            eighths_data = self._calculate_scene_eighths(page_count, scene)
            eighths_breakdown[f"scene_{scene_number}"] = eighths_data
            total_script_eighths += eighths_data['eighths']
        
        # Calculate total shoot days (industry standard: ~60 eighths per day)
        estimated_shoot_days = round(total_script_eighths / 60, 1)
        
        result = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "eighths_breakdown": {
                **eighths_breakdown,
                "total_script_eighths": total_script_eighths,
                "estimated_total_shoot_days": estimated_shoot_days
            },
            "industry_standards": {
                "eighths_per_page": 8,
                "minutes_per_eighth": 9,
                "eighths_per_day": 60,
                "base_crew_hours": 12
            }
        }
        
        logger.info(f"Calculated {total_script_eighths} total eighths across {len(scenes)} scenes")
        return result
    
    def _calculate_scene_eighths(self, page_count: float, scene: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate eighths for a single scene with complexity factors."""
        # Basic calculations
        total_eighths = round(page_count * 8)
        base_shoot_hours = round(total_eighths * 0.15, 2)  # 9 minutes = 0.15 hours
        
        # Calculate complexity factor
        complexity_factor = self._determine_complexity_factor(scene)
        
        # Apply complexity to time estimates
        actual_shoot_hours = round(base_shoot_hours * complexity_factor, 2)
        
        return {
            "page_count": round(page_count, 3),
            "eighths": total_eighths,
            "estimated_shoot_time": f"{base_shoot_hours} hours",
            "complexity_factor": complexity_factor,
            "actual_time_estimate": f"{actual_shoot_hours} hours",
            "setup_time": round(actual_shoot_hours * 0.3, 2),  # 30% of shoot time for setup
            "wrap_time": round(actual_shoot_hours * 0.2, 2)    # 20% of shoot time for wrap
        }
    
    def _determine_complexity_factor(self, scene: Dict[str, Any]) -> float:
        """Determine complexity factor based on scene elements."""
        base_factor = 1.0
        
        # Technical complexity additions
        technical_cues = scene.get('technical_cues', [])
        complexity_additions = len(technical_cues) * 0.1
        
        # Location complexity
        location = scene.get('location', {})
        if location.get('type') == 'EXT':
            complexity_additions += 0.2  # Exterior shots more complex
        
        # Time of day complexity
        time_of_day = scene.get('time', '').upper()
        if 'NIGHT' in time_of_day:
            complexity_additions += 0.3  # Night shoots more complex
        elif 'DUSK' in time_of_day or 'DAWN' in time_of_day:
            complexity_additions += 0.2  # Magic hour complexity
        
        # Character count complexity
        main_characters = scene.get('main_characters', [])
        if len(main_characters) > 3:
            complexity_additions += 0.1 * (len(main_characters) - 3)
        
        # Dialogue complexity
        dialogues = scene.get('dialogues', [])
        if len(dialogues) > 10:
            complexity_additions += 0.1
        
        # Cap complexity factor at reasonable limits
        final_factor = min(base_factor + complexity_additions, 3.0)
        return round(final_factor, 2)
    
    def generate_eighths_report(self, eighths_data: Dict[str, Any]) -> str:
        """Generate a formatted eighths report."""
        if "error" in eighths_data:
            return f"Error: {eighths_data['error']}"
        
        breakdown = eighths_data.get('eighths_breakdown', {})
        standards = eighths_data.get('industry_standards', {})
        
        report = [
            "="*60,
            "EIGHTHS CALCULATION REPORT",
            "="*60,
            f"Generated: {eighths_data.get('timestamp', 'Unknown')}",
            "",
            "SUMMARY:",
            f"Total Script Eighths: {breakdown.get('total_script_eighths', 0)}",
            f"Estimated Shoot Days: {breakdown.get('estimated_total_shoot_days', 0)}",
            f"Industry Standard: {standards.get('eighths_per_day', 60)} eighths/day",
            "",
            "SCENE BREAKDOWN:",
            "-" * 40
        ]
        
        # Add scene details
        for key, scene_data in breakdown.items():
            if key.startswith('scene_'):
                scene_num = key.replace('scene_', '')
                report.extend([
                    f"Scene {scene_num}:",
                    f"  Pages: {scene_data.get('page_count', 0)}",
                    f"  Eighths: {scene_data.get('eighths', 0)}",
                    f"  Base Time: {scene_data.get('estimated_shoot_time', 'N/A')}",
                    f"  Complexity: {scene_data.get('complexity_factor', 1.0)}x",
                    f"  Actual Time: {scene_data.get('actual_time_estimate', 'N/A')}",
                    ""
                ])
        
        return "\n".join(report)