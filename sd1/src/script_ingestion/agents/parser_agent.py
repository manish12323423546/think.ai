from typing import Dict, Any, List
import json
import logging
import re
from datetime import datetime, timedelta
from ...base_config import AGENT_INSTRUCTIONS, get_model_config
from google import genai
from google.genai import types
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScriptParserAgent:
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = AGENT_INSTRUCTIONS["script_parser"]
        logger.info("ScriptParserAgent initialized")
    
    def _clean_json_response(self, response: str) -> str:
        """Clean the response text to extract JSON content from potential markdown wrapping."""
        # Try to extract JSON from markdown code blocks if present
        json_pattern = r"```(?:json)?\n([\s\S]*?)\n```"
        matches = re.findall(json_pattern, response)
        
        if matches:
            logger.info("Found JSON content wrapped in code blocks, extracting...")
            return matches[0].strip()
        
        # If no code blocks found, return the original response
        return response.strip()
    
    def _generate_timeline(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a timeline from scene data with accurate duration tracking."""
        current_time = timedelta()
        timeline = []
        total_duration = timedelta()
        
        for scene in scenes:
            # Get or calculate duration - ensure it's a number
            try:
                duration_minutes = (
                    scene.get("duration_minutes")  # Use existing if available
                    or scene.get("duration")
                    or self._estimate_scene_duration(scene)
                )
                
                # Convert to integer if it's a string or float
                if isinstance(duration_minutes, str):
                    # Try to convert string to float first, then to int
                    duration_minutes = int(float(duration_minutes.strip().replace('min', '')))
                elif isinstance(duration_minutes, float):
                    duration_minutes = int(duration_minutes)
                
                # Ensure we have a valid integer
                if not isinstance(duration_minutes, int) or duration_minutes < 0:
                    duration_minutes = 1  # Default to 1 minute if invalid
                
                duration = timedelta(minutes=duration_minutes)
            except (ValueError, TypeError, AttributeError):
                # Fallback to a default duration if conversion fails
                logger.warning(f"Invalid duration value for scene {scene.get('scene_number', 'unknown')}, using default")
                duration_minutes = 1
                duration = timedelta(minutes=1)
            
            # Create timeline entry with detailed timing
            timeline.append({
                "scene_number": scene.get("scene_number", ""),
                "start_time": str(current_time).split(".")[0],
                "end_time": str(current_time + duration).split(".")[0],
                "duration_minutes": duration_minutes,
                "location": scene.get("location", {}).get("place", ""),
                "characters": self._extract_characters(scene),
                "technical_complexity": len(scene.get("technical_cues", [])),
                "setup_time": self._calculate_setup_time(scene)
            })
            
            current_time += duration
            total_duration += duration
        
        return {
            "total_duration": str(total_duration).split(".")[0],
            "scene_breakdown": timeline,
            "average_scene_duration": round(total_duration.total_seconds() / (60 * max(len(scenes), 1)), 2)
        }
    
    def _estimate_scene_duration(self, scene: Dict[str, Any]) -> int:
        """
        Estimate scene duration in minutes based on content and technical requirements.
        Uses a more accurate algorithm considering multiple factors.
        """
        # Base duration calculation
        duration = 1  # minimum scene duration
        
        # Calculate based on description length
        description_words = len(scene.get("description", "").split())
        description_time = max(1, description_words // 30)  # ~2 seconds per word
        duration += description_time
        
        # Add time for dialogues with more accurate estimation
        dialogues = scene.get("dialogues", [])
        if dialogues:
            dialogue_time = 0
            for dialogue in dialogues:
                # Count words in dialogue
                line_words = len(dialogue.get("line", "").split())
                # Average speaking rate is ~130 words per minute
                dialogue_time += (line_words / 130)
                # Add time for parentheticals/actions
                if dialogue.get("parenthetical"):
                    dialogue_time += 0.25  # 15 seconds for action
            duration += max(1, round(dialogue_time))
        
        # Add time for technical requirements
        tech_cues = scene.get("technical_cues", [])
        if tech_cues:
            # Complex shots take more time
            complex_cues = ["CRANE", "STEADICAM", "DOLLY"]
            complex_shots = sum(1 for cue in tech_cues if any(comp in cue.upper() for comp in complex_cues))
            duration += complex_shots * 2
        
        # Add time for transitions
        transitions = scene.get("transitions", [])
        if transitions:
            # Certain transitions need more time
            complex_transitions = ["FADE", "DISSOLVE"]
            complex_trans_count = sum(1 for trans in transitions if any(comp in trans.upper() for comp in complex_transitions))
            duration += complex_trans_count
        
        # Add time for department-specific requirements
        dept_notes = scene.get("department_notes", {})
        if dept_notes:
            # Complex setups need more time
            setup_time = sum(
                len(notes) * 0.5  # 30 seconds per note
                for notes in dept_notes.values()
            )
            duration += round(setup_time)
        
        # Ensure minimum duration and return as integer
        return max(2, int(round(duration)))
    
    def _calculate_setup_time(self, scene: Dict[str, Any]) -> int:
        """Calculate setup time needed for scene based on technical requirements."""
        setup_time = 0
        
        # Technical cues setup time
        tech_cues = scene.get("technical_cues", [])
        if tech_cues:
            setup_time += len(tech_cues) * 5  # 5 minutes per technical cue
        
        # Department notes setup time
        dept_notes = scene.get("department_notes", {})
        if dept_notes:
            setup_time += sum(len(notes) * 3 for notes in dept_notes.values())  # 3 minutes per note
        
        return setup_time
    
    def _extract_characters(self, scene: Dict[str, Any]) -> List[str]:
        """Extract unique characters from scene."""
        characters = set()
        for dialogue in scene.get("dialogues", []):
            if "character" in dialogue:
                characters.add(dialogue["character"])
        return list(characters)
    
    def _extract_technical_cues(self, scene: Dict[str, Any]) -> List[str]:
        """Extract technical cues from scene description and dialogues."""
        cues = []
        
        # Look for technical terms in description
        description = scene.get("description", "").lower()
        technical_terms = ["crane", "dolly", "steadicam", "zoom", "pan", "tilt", "fade", "dissolve"]
        
        for term in technical_terms:
            if term in description:
                cues.append(f"{term.upper()} shot/movement required")
        
        # Add transitions as cues
        transitions = scene.get("transitions", [])
        if transitions:
            cues.extend(transitions)
        
        return cues
    
    def _extract_department_notes(self, scene: Dict[str, Any]) -> Dict[str, List[str]]:
        """Extract department-specific notes from scene."""
        notes = {
            "props": [],
            "lighting": [],
            "sound": [],
            "camera": []
        }
        
        description = scene.get("description", "").lower()
        
        # Props notes
        prop_keywords = ["holds", "carries", "using", "with a", "wearing"]
        for keyword in prop_keywords:
            if keyword in description:
                # Extract the phrase containing the prop
                index = description.find(keyword)
                phrase = description[index:index + 50].split(".")[0]
                notes["props"].append(phrase.strip())
        
        # Lighting notes
        if any(word in description for word in ["dark", "bright", "shadow", "light", "sunlight"]):
            notes["lighting"].append(f"Lighting note: {scene.get('time', '')}")
        
        # Sound notes
        if any(word in description for word in ["quiet", "loud", "noise", "sound", "music"]):
            notes["sound"].append("Special sound consideration needed")
        
        # Camera notes
        if any(word in description for word in ["close", "wide", "angle", "focus"]):
            notes["camera"].append("Special camera setup required")
        
        return notes
    
    def format_scene_data(self, parsed_data: Dict[str, Any]) -> str:
        """Format parsed scene data into readable text."""
        if "error" in parsed_data:
            return f"Error: {parsed_data['error']}"
            
        output = []
        scenes = parsed_data.get("scenes", [])
        
        # Add timeline summary if available
        if "timeline" in parsed_data:
            timeline = parsed_data["timeline"]
            output.extend([
                "SCRIPT TIMELINE",
                f"Total Duration: {timeline.get('total_duration', 'Unknown')}",
                f"Total Scenes: {len(scenes)}\n"
            ])
        
        for scene in scenes:
            # Scene header
            scene_text = [
                f"\n{'='*80}\n",
                f"SCENE {scene['scene_number']}",
                f"{scene['location']['type']}. {scene['location']['place']} - {scene['time']}",
                f"{'-'*80}\n"
            ]
            
            # Duration
            if "duration" in scene:
                scene_text.append(f"Estimated Duration: {scene['duration']}\n")
            
            # Scene description
            scene_text.append(f"Description:\n{scene['description']}\n")
            
            # Main characters
            if "main_characters" in scene:
                scene_text.append(f"Main Characters: {', '.join(scene['main_characters'])}\n")
            
            # Technical cues
            if "technical_cues" in scene:
                scene_text.append("Technical Cues:")
                for cue in scene["technical_cues"]:
                    scene_text.append(f"  - {cue}")
                scene_text.append("")
            
            # Department notes
            if "department_notes" in scene:
                scene_text.append("Department Notes:")
                for dept, notes in scene["department_notes"].items():
                    if notes:
                        scene_text.append(f"  {dept.upper()}:")
                        for note in notes:
                            scene_text.append(f"    - {note}")
                scene_text.append("")
            
            # Dialogues
            if scene.get('dialogues'):
                scene_text.append("\nDialogue:")
                for dialogue in scene['dialogues']:
                    char_line = f"{dialogue['character']}"
                    if dialogue.get('parenthetical'):
                        char_line += f" {dialogue['parenthetical']}"
                    scene_text.append(char_line)
                    scene_text.append(f"    \"{dialogue['line']}\"\n")
            
            # Transitions
            if scene.get('transitions'):
                scene_text.append(f"\nTransitions: {', '.join(scene['transitions'])}")
            
            output.extend(scene_text)
        
        return "\n".join(output)
    
    async def parse_script(self, script_text: str) -> Dict[str, Any]:
        """Parse the script and return structured scene data."""
        logger.info("Starting script parsing")
        
        if not script_text:
            logger.error("Empty script text received")
            return {"error": "Script text cannot be empty"}
        
        logger.info(f"Processing script of length: {len(script_text)} characters")
        
        prompt = f"""You are a script parser. Analyze this script and return ONLY valid JSON with the scene breakdown.

IMPORTANT: 
- Return ONLY JSON, no explanations or markdown
- Keep descriptions concise to fit within token limits
- Focus on the main scenes only

Return this exact JSON structure:
{{
    "scenes": [
        {{
            "scene_number": "1",
            "location": {{"type": "INT/EXT", "place": "location"}},
            "time": "time of day", 
            "description": "brief scene description",
            "duration": 5,
            "main_characters": ["CHARACTER1"],
            "technical_cues": ["basic cue"],
            "department_notes": {{"props": [], "lighting": [], "sound": [], "camera": []}},
            "dialogues": [{{"character": "NAME", "line": "dialogue", "parenthetical": ""}}],
            "transitions": ["CUT TO"]
        }}
    ]
}}

Script to analyze (keep response concise):
{script_text[:1500]}"""
        
        logger.info("Sending script to agent for processing")
        try:
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
            
            logger.info("Received response from Gemini")
            logger.info(f"Response type: {type(response)}")
            
            # Debug response content
            logger.info(f"Response candidates: {response.candidates if hasattr(response, 'candidates') else 'No candidates attr'}")
            if hasattr(response, 'candidates') and response.candidates:
                logger.info(f"Number of candidates: {len(response.candidates)}")
                first_candidate = response.candidates[0]
                logger.info(f"First candidate: {first_candidate}")
                logger.info(f"First candidate finish_reason: {getattr(first_candidate, 'finish_reason', 'No finish_reason')}")
                if hasattr(first_candidate, 'content') and first_candidate.content:
                    logger.info(f"Content parts: {first_candidate.content.parts if hasattr(first_candidate.content, 'parts') else 'No parts'}")
                else:
                    logger.error("First candidate has no content!")
            else:
                logger.error("No candidates in response!")
            
            # Check for safety/prompt feedback
            if hasattr(response, 'prompt_feedback'):
                logger.info(f"Prompt feedback: {response.prompt_feedback}")
                if hasattr(response.prompt_feedback, 'block_reason'):
                    logger.warning(f"Prompt blocked: {response.prompt_feedback.block_reason}")
            
            try:
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
                
                # Extract text safely
                try:
                    response_text = extract_content_safely(response)
                    logger.info("Successfully extracted text using safe extraction method")
                except ValueError as e:
                    logger.error(f"Validation error: {e}")
                    return {"error": f"Failed to extract content from Gemini response: {e}"}
                
                logger.info(f"Response text type: {type(response_text)}")
                logger.info(f"Response text length: {len(response_text) if response_text else 0}")
                logger.info(f"Response text preview: {response_text[:200] if response_text else 'None'}...")
                
                # Clean the response first
                cleaned_response = self._clean_json_response(response_text)
                logger.info("Cleaned response for JSON parsing")
                
                # Try to parse the JSON response
                parsed_data = json.loads(cleaned_response)
                logger.info("Successfully parsed JSON response")
                
                # Validate the structure
                if not isinstance(parsed_data, dict):
                    raise ValueError("Response is not a dictionary")
                if "scenes" not in parsed_data:
                    raise ValueError("Response missing 'scenes' key")
                if not isinstance(parsed_data["scenes"], list):
                    raise ValueError("'scenes' is not a list")
                
                # Process each scene to add additional data
                for scene in parsed_data["scenes"]:
                    # Extract technical cues if not present
                    if "technical_cues" not in scene:
                        scene["technical_cues"] = self._extract_technical_cues(scene)
                    
                    # Extract department notes if not present
                    if "department_notes" not in scene:
                        scene["department_notes"] = self._extract_department_notes(scene)
                    
                    # Extract main characters if not present
                    if "main_characters" not in scene:
                        scene["main_characters"] = self._extract_characters(scene)
                
                # Generate timeline
                parsed_data["timeline"] = self._generate_timeline(parsed_data["scenes"])
                
                logger.info(f"Successfully parsed {len(parsed_data['scenes'])} scenes")
                
                # Add formatted text representation
                parsed_data["formatted_text"] = self.format_scene_data(parsed_data)
                
                return parsed_data
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON parsing error: {str(e)}")
                logger.error(f"Raw response: {result.final_output}")
                return {
                    "error": "Failed to parse script into valid JSON format",
                    "details": str(e),
                    "raw_response": result.final_output[:500],
                    "formatted_text": "Error: Failed to parse script data"
                }
            except ValueError as e:
                logger.error(f"Validation error: {str(e)}")
                return {
                    "error": f"Invalid response structure: {str(e)}",
                    "raw_response": result.final_output[:500],
                    "formatted_text": f"Error: Invalid script data structure - {str(e)}"
                }
                
        except Exception as e:
            logger.error(f"Processing error: {str(e)}")
            return {
                "error": f"Error processing script: {str(e)}",
                "formatted_text": f"Error: Failed to process script - {str(e)}"
            } 