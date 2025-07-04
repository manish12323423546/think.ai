import logging
from typing import Dict, Any, List
import json
import re
import os
from google import genai
from google.genai import types
from ...base_config import AGENT_INSTRUCTIONS, get_model_config

logger = logging.getLogger(__name__)

class CrewAllocatorAgent:
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = AGENT_INSTRUCTIONS["crew_allocator"]
        logger.info("CrewAllocatorAgent initialized")
    
    async def allocate_crew(
        self, 
        scene_data: Dict[str, Any], 
        crew_availability: Dict[str, Any],
        equipment_inventory: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Allocate crew and equipment to scenes based on availability and requirements."""
        try:
            logger.info("Starting crew allocation")
            
            # Extract scenes and validate input
            scenes = []
            if isinstance(scene_data, dict):
                if 'scenes' in scene_data:
                    scenes = scene_data['scenes']
                elif 'parsed_data' in scene_data and isinstance(scene_data['parsed_data'], dict):
                    scenes = scene_data['parsed_data'].get('scenes', [])
            
            if not scenes:
                raise ValueError("No scenes provided in scene_data")
            
            logger.debug(f"Processing {len(scenes)} scenes")
            
            prompt = f"""You are a film production crew allocator. Your task is to create a detailed crew and equipment allocation plan.

IMPORTANT: You must respond with ONLY valid JSON data in the exact format specified below. Do not include any other text or explanations.

Required JSON format:
{{
    "crew_assignments": [
        {{
            "crew_member": "string",
            "role": "string",
            "assigned_scenes": ["scene_id1", "scene_id2"],
            "work_hours": number,
            "turnaround_hours": number,
            "meal_break_interval": number,
            "equipment_assigned": ["equipment1", "equipment2"]
        }}
    ],
    "equipment_assignments": [
        {{
            "equipment_id": "string",
            "type": "string",
            "assigned_scenes": ["scene_id1", "scene_id2"],
            "setup_time_minutes": number,
            "assigned_crew": ["crew_member1", "crew_member2"]
        }}
    ],
    "department_schedules": {{
        "camera": {{
            "crew": ["crew_member1", "crew_member2"],
            "equipment": ["equipment1", "equipment2"],
            "notes": ["note1", "note2"]
        }},
        "sound": {{
            "crew": ["crew_member1", "crew_member2"],
            "equipment": ["equipment1", "equipment2"],
            "notes": ["note1", "note2"]
        }}
    }},
    "availability_windows": {{
        "crew_member_id": {{
            "available_dates": ["YYYY-MM-DD"],
            "daily_hours": {{"start": "HH:MM", "end": "HH:MM"}},
            "restrictions": ["restriction1", "restriction2"]
        }}
    }},
    "resource_conflicts": [
        {{
            "type": "crew|equipment",
            "resource_id": "string",
            "conflicting_scenes": ["scene_id1", "scene_id2"],
            "reason": "string"
        }}
    ],
    "allocation_notes": ["note1", "note2"]
}}

Consider these requirements:
        - Actor availability windows
        - Crew work hour restrictions and union rules
        - Equipment sharing optimization
        - Department-specific requirements
        - Setup and wrap time requirements
        
        Scene Data:
{json.dumps(scenes, indent=2)}
        
        Crew Availability:
        {json.dumps(crew_availability, indent=2)}
        
        Equipment Inventory:
        {json.dumps(equipment_inventory, indent=2) if equipment_inventory else "Using standard equipment package"}

Remember: Return ONLY the JSON data structure. No other text."""
            
            # Combine instructions with prompt
            full_prompt = f"{self.instructions}\n\n{prompt}"

            response = self.client.models.generate_content(
                model=self.model_config["model"],
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=self.model_config["temperature"],
                    max_output_tokens=self.model_config["max_output_tokens"],
                    top_p=self.model_config["top_p"],
                    top_k=self.model_config["top_k"],
                    response_mime_type="application/json"
                )
            )

            # Safe content extraction
            def extract_content_safely(response):
                if not hasattr(response, 'candidates') or not response.candidates:
                    raise ValueError("No candidates in Gemini response")
                
                candidate = response.candidates[0]
                if not hasattr(candidate, 'content') or not candidate.content:
                    raise ValueError("Empty content in Gemini response")
                
                if not hasattr(candidate.content, 'parts') or not candidate.content.parts:
                    raise ValueError("No content parts in Gemini response")
                
                text_content = candidate.content.parts[0].text
                if not text_content:
                    raise ValueError("Empty text content in Gemini response")
                
                return text_content

            try:
                result_final_output = extract_content_safely(response)
            except ValueError as e:
                logger.error(f"Validation error: {e}")
                # Create a basic valid response
                logger.info("Generating fallback crew allocation")
                fallback_response = self._generate_fallback_allocation(scenes, crew_availability)
                return fallback_response
            try:
                # Log the raw response for debugging
                logger.debug(f"Raw API response: {result_final_output}")
                
                # First, validate that we have a response
                if not result_final_output or not result_final_output.strip():
                    raise ValueError("Empty response from API")
                
                # Clean the response - try to extract JSON
                cleaned_response = self._clean_and_extract_json(result_final_output)
                if not cleaned_response:
                    raise ValueError("Could not find valid JSON in response")
                
                # Try to parse the JSON
                allocation_result = json.loads(cleaned_response)
                logger.info("Successfully parsed crew allocation result")
                
                # Validate required fields
                required_fields = ['crew_assignments', 'equipment_assignments', 'availability_windows', 'resource_conflicts']
                for field in required_fields:
                    if field not in allocation_result:
                        raise ValueError(f"Missing required field: {field}")
            
                # Validate crew assignments
                for assignment in allocation_result.get('crew_assignments', []):
                    required_fields = ['crew_member', 'role', 'assigned_scenes']
                    for field in required_fields:
                        if field not in assignment:
                            raise ValueError(f"Missing required crew assignment field: {field}")
                
                # Validate availability windows
                for crew_id, window in allocation_result.get('availability_windows', {}).items():
                    required_fields = ['available_dates', 'daily_hours']
                    for field in required_fields:
                        if field not in window:
                            raise ValueError(f"Missing required availability window field: {field}")
                
                # Validate resource conflicts
                for conflict in allocation_result.get('resource_conflicts', []):
                    required_fields = ['type', 'resource_id', 'conflicting_scenes']
                    for field in required_fields:
                        if field not in conflict:
                            raise ValueError(f"Missing required resource conflict field: {field}")
                
                # Validate the crew assignments against union rules
                self._validate_crew_assignments(allocation_result)
                logger.info("Crew assignments validated")
            
                return allocation_result
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse crew allocation result: {str(e)}")
                logger.debug(f"Raw response: {result_final_output}")
                
                # Create a basic valid response
                logger.info("Generating fallback crew allocation")
                fallback_response = self._generate_fallback_allocation(scenes, crew_availability)
                return fallback_response
                
        except Exception as e:
            logger.error(f"Error during crew allocation: {str(e)}", exc_info=True)
            raise
    
    def _clean_and_extract_json(self, text: str) -> str:
        """Clean and extract JSON from text response."""
        # First, try to find JSON between triple backticks
        matches = re.findall(r'```(?:json)?\s*({\s*.*?\s*})\s*```', text, re.DOTALL)
        if matches:
            return matches[0]
        
        # Then try to find JSON between single backticks
        matches = re.findall(r'`({\s*.*?\s*})`', text, re.DOTALL)
        if matches:
            return matches[0]
        
        # Then try to find any JSON object
        matches = re.findall(r'({\s*"[^"]+"\s*:[\s\S]*})', text)
        if matches:
            return matches[0]
        
        # Try to find anything that looks like JSON
        matches = re.findall(r'({[\s\S]*})', text)
        if matches:
            return matches[0]
        
        # If we can't find JSON, return the original text
        return text.strip()
    
    def _generate_fallback_allocation(self, scenes: List[Dict[str, Any]], crew_availability: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a basic valid crew allocation when the API response fails."""
        logger.info("Generating fallback crew allocation")
        
        # Extract available crew members
        crew_members = []
        if isinstance(crew_availability, dict):
            crew_members = crew_availability.get('crew', [])
            if not crew_members and 'character_breakdown' in crew_availability:
                crew_members = crew_availability['character_breakdown'].get('crew', [])
        
        if not crew_members:
            # Create basic crew structure
            crew_members = [
                {"name": "Director", "role": "Director"},
                {"name": "DP", "role": "Director of Photography"},
                {"name": "Sound Mixer", "role": "Sound"},
                {"name": "Gaffer", "role": "Lighting"},
                {"name": "Key Grip", "role": "Grip"}
            ]
        
        # Create basic allocation
        crew_assignments = []
        for crew in crew_members:
            crew_name = crew.get('name', crew) if isinstance(crew, dict) else crew
            crew_role = crew.get('role', 'Crew') if isinstance(crew, dict) else 'Crew'
            
            crew_assignments.append({
                "crew_member": crew_name,
                "role": crew_role,
                "assigned_scenes": [scene.get('id', 'unknown') for scene in scenes],
                "work_hours": 12,
                "turnaround_hours": 12,
                "meal_break_interval": 6,
                "equipment_assigned": []
            })
        
        return {
            "crew_assignments": crew_assignments,
            "equipment_assignments": [],
            "department_schedules": {
                "camera": {"crew": [], "equipment": [], "notes": ["Fallback schedule"]},
                "sound": {"crew": [], "equipment": [], "notes": ["Fallback schedule"]},
                "lighting": {"crew": [], "equipment": [], "notes": ["Fallback schedule"]}
            },
            "allocation_notes": ["Generated fallback allocation due to API parsing error"],
            "is_fallback": True
        }
    
    def _validate_crew_assignments(self, allocation: Dict[str, Any]) -> None:
        """Validate crew assignments against common union rules."""
        try:
            logger.info("Starting crew assignment validation")
            violations = []
            
            if "crew_assignments" not in allocation:
                logger.warning("No crew assignments found in allocation data")
                return
            
            for assignment in allocation["crew_assignments"]:
                crew_member = assignment.get('crew_member', 'Unknown crew member')
                
                # Check for minimum turnaround time (typically 10 hours)
                if assignment.get("turnaround_hours", 10) < 10:
                    msg = f"Insufficient turnaround time for {crew_member}"
                    logger.warning(msg)
                    violations.append(msg)
                
                # Check for maximum work hours (typically 12 hours)
                if assignment.get("work_hours", 0) > 12:
                    msg = f"Excessive work hours for {crew_member}"
                    logger.warning(msg)
                    violations.append(msg)
                
                # Check for meal breaks (every 6 hours)
                if assignment.get("meal_break_interval", 6) > 6:
                    msg = f"Missing meal break for {crew_member}"
                    logger.warning(msg)
                    violations.append(msg)
            
            if violations:
                logger.warning(f"Found {len(violations)} union rule violations")
                allocation["union_rule_violations"] = violations 
            else:
                logger.info("No union rule violations found")
        except Exception as e:
            logger.error(f"Error during crew assignment validation: {str(e)}", exc_info=True)
            raise 