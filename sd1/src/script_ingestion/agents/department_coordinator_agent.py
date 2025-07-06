from typing import Dict, Any, List
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

class DepartmentCoordinatorAgent:
    """
    ✅ DepartmentCoordinatorAgent (CREW NEEDS)
    
    Specialized agent for department coordination and crew requirements.
    Responsibilities:
    - Camera requirements analysis
    - Sound specifications
    - Art department needs assessment
    - Costume breakdown
    - Crew size calculations per scene
    """
    
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))
        self.model_config = get_model_config()
        self.instructions = """You are a Department Coordinator Agent for film production.
        Your expertise:
        1. Analyze camera and technical requirements per scene
        2. Coordinate sound department specifications
        3. Assess art department and prop needs
        4. Calculate optimal crew sizes
        5. Identify department conflicts and dependencies"""
        logger.info("DepartmentCoordinatorAgent initialized")
    
    def coordinate_departments(self, scene_data: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate all department requirements across scenes."""
        logger.info("Starting department coordination analysis")
        
        if not scene_data or not isinstance(scene_data, dict):
            logger.error("Invalid scene data received")
            return {"error": "Invalid scene data format"}
        
        scenes = scene_data.get('scenes', [])
        logger.info(f"Processing department coordination for {len(scenes)} scenes")
        
        # Analyze each department
        camera_analysis = self._analyze_camera_requirements(scenes)
        sound_analysis = self._analyze_sound_requirements(scenes)
        art_analysis = self._analyze_art_department(scenes)
        costume_analysis = self._analyze_costume_requirements(scenes)
        crew_requirements = self._calculate_crew_requirements(scenes)
        
        # Identify conflicts and dependencies
        conflicts = self._identify_department_conflicts(scenes)
        
        result = {
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "camera_department": camera_analysis,
            "sound_department": sound_analysis,
            "art_department": art_analysis,
            "costume_department": costume_analysis,
            "crew_requirements": crew_requirements,
            "department_conflicts": conflicts,
            "resource_sharing": self._analyze_resource_sharing(scenes)
        }
        
        logger.info(f"Generated department coordination for {len(scenes)} scenes")
        return result
    
    def _analyze_camera_requirements(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze camera department requirements across all scenes."""
        camera_analysis = {
            "equipment_needed": set(),
            "special_rigs": set(),
            "lens_requirements": set(),
            "scene_requirements": [],
            "total_setups": 0
        }
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            technical_cues = scene.get('technical_cues', [])
            description = scene.get('description', '').lower()
            
            scene_camera = {
                "scene": scene_number,
                "camera_count": 1,  # Default single camera
                "movement": [],
                "special_equipment": [],
                "lighting_needs": [],
                "setup_complexity": "Standard"
            }
            
            # Analyze technical cues for camera requirements
            for cue in technical_cues:
                cue_lower = cue.lower()
                
                # Camera movement
                if any(term in cue_lower for term in ['pan', 'tilt', 'track', 'dolly']):
                    scene_camera["movement"].append('Dolly/Track')
                    camera_analysis["equipment_needed"].add('Dolly track')
                
                if 'steadicam' in cue_lower:
                    scene_camera["special_equipment"].append('Steadicam')
                    camera_analysis["special_rigs"].add('Steadicam')
                
                if 'crane' in cue_lower:
                    scene_camera["special_equipment"].append('Camera crane')
                    camera_analysis["special_rigs"].add('Camera crane')
                
                if 'handheld' in cue_lower:
                    scene_camera["movement"].append('Handheld')
                
                # Lens requirements
                if 'close-up' in cue_lower or 'cu' in cue_lower:
                    camera_analysis["lens_requirements"].add('Telephoto lens')
                if 'wide' in cue_lower or 'establishing' in cue_lower:
                    camera_analysis["lens_requirements"].add('Wide angle lens')
                if 'macro' in cue_lower:
                    camera_analysis["lens_requirements"].add('Macro lens')
            
            # Analyze scene complexity
            dialogue_count = len(scene.get('dialogues', []))
            character_count = len(scene.get('main_characters', []))
            
            if dialogue_count > 10 or character_count > 3:
                scene_camera["camera_count"] = 2
                scene_camera["setup_complexity"] = "Multi-camera"
            
            # Lighting analysis
            time_of_day = scene.get('time', '').upper()
            location_type = scene.get('location', {}).get('type', 'INT')
            
            if 'NIGHT' in time_of_day:
                scene_camera["lighting_needs"].append('Night lighting package')
            if location_type == 'EXT' and 'DAY' in time_of_day:
                scene_camera["lighting_needs"].append('Daylight balance/fill')
            
            camera_analysis["scene_requirements"].append(scene_camera)
            camera_analysis["total_setups"] += scene_camera["camera_count"]
        
        # Convert sets to lists for JSON serialization
        camera_analysis["equipment_needed"] = list(camera_analysis["equipment_needed"])
        camera_analysis["special_rigs"] = list(camera_analysis["special_rigs"])
        camera_analysis["lens_requirements"] = list(camera_analysis["lens_requirements"])
        
        return camera_analysis
    
    def _analyze_sound_requirements(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze sound department requirements."""
        sound_analysis = {
            "recording_scenarios": {},
            "equipment_needed": set(),
            "special_requirements": [],
            "scene_analysis": []
        }
        
        dialogue_scenes = 0
        location_audio_scenes = 0
        playback_scenes = 0
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            dialogues = scene.get('dialogues', [])
            location = scene.get('location', {})
            technical_cues = scene.get('technical_cues', [])
            
            scene_sound = {
                "scene": scene_number,
                "dialogue": len(dialogues) > 0,
                "location_type": location.get('type', 'INT'),
                "special_audio": [],
                "microphone_plan": [],
                "challenges": []
            }
            
            # Dialogue recording
            if dialogues:
                dialogue_scenes += 1
                scene_sound["microphone_plan"].append('Boom microphone')
                
                if len(dialogues) > 5:
                    scene_sound["microphone_plan"].append('Multiple wireless lavs')
                
                # Location challenges
                if location.get('type') == 'EXT':
                    location_audio_scenes += 1
                    scene_sound["challenges"].append('Wind noise control')
                    sound_analysis["equipment_needed"].add('Wind protection')
            
            # Special audio requirements
            for cue in technical_cues:
                cue_lower = cue.lower()
                if 'music' in cue_lower or 'song' in cue_lower:
                    playback_scenes += 1
                    scene_sound["special_audio"].append('Playback system')
                    sound_analysis["equipment_needed"].add('Playback speakers')
            
            sound_analysis["scene_analysis"].append(scene_sound)
        
        sound_analysis["recording_scenarios"] = {
            "dialogue_scenes": dialogue_scenes,
            "location_audio": location_audio_scenes,
            "playback_scenes": playback_scenes,
            "total_scenes": len(scenes)
        }
        
        sound_analysis["equipment_needed"] = list(sound_analysis["equipment_needed"])
        
        return sound_analysis
    
    def _analyze_art_department(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze art department and props requirements."""
        art_analysis = {
            "locations_to_dress": set(),
            "prop_categories": {
                "hand_props": set(),
                "set_decoration": set(),
                "special_props": set(),
                "period_props": set()
            },
            "construction_needs": [],
            "scene_breakdown": []
        }
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            location = scene.get('location', {})
            description = scene.get('description', '').lower()
            
            scene_art = {
                "scene": scene_number,
                "location": location.get('place', 'Unknown'),
                "set_decoration": [],
                "props_needed": [],
                "special_builds": []
            }
            
            # Location dressing requirements
            place = location.get('place', '')
            if place:
                art_analysis["locations_to_dress"].add(place)
            
            # Basic prop identification from description
            prop_keywords = {
                'hand_props': ['phone', 'bag', 'keys', 'wallet', 'gun', 'knife', 'document'],
                'set_decoration': ['furniture', 'painting', 'lamp', 'decoration'],
                'special_props': ['blood', 'fake', 'prop gun', 'stunt'],
                'period_props': ['vintage', 'antique', 'period', 'historical']
            }
            
            for category, keywords in prop_keywords.items():
                for keyword in keywords:
                    if keyword in description:
                        art_analysis["prop_categories"][category].add(keyword.title())
                        scene_art["props_needed"].append(keyword.title())
            
            art_analysis["scene_breakdown"].append(scene_art)
        
        # Convert sets to lists
        art_analysis["locations_to_dress"] = list(art_analysis["locations_to_dress"])
        for category in art_analysis["prop_categories"]:
            art_analysis["prop_categories"][category] = list(art_analysis["prop_categories"][category])
        
        return art_analysis
    
    def _analyze_costume_requirements(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze costume department requirements."""
        costume_analysis = {
            "character_wardrobes": {},
            "continuity_tracking": [],
            "special_requirements": [],
            "scene_breakdown": []
        }
        
        # Track characters across scenes for continuity
        character_scenes = {}
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            characters = scene.get('main_characters', [])
            
            scene_costume = {
                "scene": scene_number,
                "characters": characters,
                "wardrobe_changes": [],
                "special_costumes": [],
                "continuity_notes": []
            }
            
            for character in characters:
                if character not in character_scenes:
                    character_scenes[character] = []
                character_scenes[character].append(scene_number)
                
                if character not in costume_analysis["character_wardrobes"]:
                    costume_analysis["character_wardrobes"][character] = {
                        "total_scenes": 0,
                        "costume_changes": 0,
                        "special_requirements": []
                    }
                
                costume_analysis["character_wardrobes"][character]["total_scenes"] += 1
            
            costume_analysis["scene_breakdown"].append(scene_costume)
        
        # Generate continuity tracking
        for character, scenes_list in character_scenes.items():
            if len(scenes_list) > 1:
                costume_analysis["continuity_tracking"].append({
                    "character": character,
                    "scenes": scenes_list,
                    "continuity_critical": True
                })
        
        return costume_analysis
    
    def _calculate_crew_requirements(self, scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Calculate detailed crew requirements for each scene."""
        crew_requirements = []
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            
            # Base crew requirements
            essential_crew = {
                "director": 1,
                "dp": 1,  # Director of Photography
                "1st_ad": 1,  # First Assistant Director
                "script_supervisor": 1,
                "sound_mixer": 1
            }
            
            # Technical crew based on scene requirements
            technical_crew = {
                "camera_operator": 1,
                "focus_puller": 1,
                "gaffer": 1,  # Chief Lighting Technician
                "key_grip": 1,
                "boom_operator": 1,
                "makeup_artist": 1
            }
            
            # Adjust crew based on scene complexity
            dialogue_count = len(scene.get('dialogues', []))
            character_count = len(scene.get('main_characters', []))
            technical_cues = scene.get('technical_cues', [])
            
            # Additional crew for complex scenes
            if dialogue_count > 10 or character_count > 3:
                technical_crew["2nd_camera_operator"] = 1
                technical_crew["2nd_ad"] = 1
            
            if len(technical_cues) > 5:
                technical_crew["grip"] = 2
                technical_crew["electrician"] = 2
            
            # Special equipment crew
            for cue in technical_cues:
                cue_lower = cue.lower()
                if 'steadicam' in cue_lower:
                    technical_crew["steadicam_operator"] = 1
                if 'crane' in cue_lower:
                    technical_crew["crane_operator"] = 1
            
            # Calculate time estimates
            page_count = len(scene.get('description', '').split()) / 250
            complexity_score = min(len(technical_cues) + character_count, 10)
            
            prep_time = round(0.5 + (complexity_score / 10), 1)
            shoot_time = round(page_count * 2 + (complexity_score / 5), 1)
            wrap_time = round(0.5 + (complexity_score / 20), 1)
            
            crew_req = {
                "scene": scene_number,
                "essential_crew": essential_crew,
                "technical_crew": technical_crew,
                "total_crew": len(essential_crew) + len(technical_crew),
                "prep_time_hours": prep_time,
                "shoot_time_hours": shoot_time,
                "wrap_time_hours": wrap_time,
                "total_hours": prep_time + shoot_time + wrap_time
            }
            
            crew_requirements.append(crew_req)
        
        return crew_requirements
    
    def _identify_department_conflicts(self, scenes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify potential conflicts between departments."""
        conflicts = []
        
        for scene in scenes:
            scene_number = scene.get('scene_number', '0')
            technical_cues = scene.get('technical_cues', [])
            location_type = scene.get('location', {}).get('type', 'INT')
            
            scene_conflicts = []
            
            # Camera vs Sound conflicts
            handheld_camera = any('handheld' in cue.lower() for cue in technical_cues)
            dialogue_heavy = len(scene.get('dialogues', [])) > 5
            
            if handheld_camera and dialogue_heavy and location_type == 'EXT':
                scene_conflicts.append({
                    "departments": ["Camera", "Sound"],
                    "conflict": "Handheld camera work in exterior dialogue scene - wind noise risk",
                    "solution": "Consider boom arm extension or wireless lavs"
                })
            
            # Lighting vs Wardrobe conflicts
            night_scene = 'NIGHT' in scene.get('time', '').upper()
            multiple_characters = len(scene.get('main_characters', [])) > 3
            
            if night_scene and multiple_characters:
                scene_conflicts.append({
                    "departments": ["Lighting", "Wardrobe"],
                    "conflict": "Night scene with multiple actors - wardrobe visibility issues",
                    "solution": "Coordinate lighting tests with wardrobe colors"
                })
            
            if scene_conflicts:
                conflicts.append({
                    "scene_number": scene_number,
                    "conflicts": scene_conflicts
                })
        
        return conflicts
    
    def _analyze_resource_sharing(self, scenes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze opportunities for resource sharing between scenes."""
        resource_sharing = {
            "equipment_efficiency": {},
            "crew_optimization": {},
            "location_grouping": {}
        }
        
        # Group scenes by location for efficient shooting
        location_groups = {}
        for scene in scenes:
            location = scene.get('location', {}).get('place', 'Unknown')
            if location not in location_groups:
                location_groups[location] = []
            location_groups[location].append(scene.get('scene_number'))
        
        resource_sharing["location_grouping"] = {
            "groups": location_groups,
            "efficiency_gain": f"{len(location_groups)} locations vs {len(scenes)} scenes"
        }
        
        # Equipment sharing analysis
        steadicam_scenes = []
        crane_scenes = []
        
        for scene in scenes:
            technical_cues = scene.get('technical_cues', [])
            scene_number = scene.get('scene_number', '0')
            
            for cue in technical_cues:
                if 'steadicam' in cue.lower():
                    steadicam_scenes.append(scene_number)
                if 'crane' in cue.lower():
                    crane_scenes.append(scene_number)
        
        if steadicam_scenes:
            resource_sharing["equipment_efficiency"]["steadicam"] = {
                "scenes": steadicam_scenes,
                "recommendation": "Group these scenes to minimize equipment rental days"
            }
        
        if crane_scenes:
            resource_sharing["equipment_efficiency"]["crane"] = {
                "scenes": crane_scenes,
                "recommendation": "Schedule consecutively to reduce setup time"
            }
        
        return resource_sharing