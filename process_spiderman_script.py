#!/usr/bin/env python3
"""
Spider-Man Script Ingestion Processor
=====================================

This script processes the Spider-Man: Web of Shadows script through the SD1 
script ingestion coordinator API endpoint and stores each individual agent 
response in separate JSON files in organized folders.

Requirements:
- SD1 backend API server running on port 8000
- Google API key configured for Gemini 2.5 Flash
- All script ingestion agents properly initialized
- Data directories exist and are writable

Usage:
    python process_spiderman_script.py
"""

import requests
import json
import os
from datetime import datetime
from pathlib import Path
import logging
from typing import Dict, Any, Optional

# Configuration
SD1_API_URL = "http://localhost:8000"
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "sd1" / "data" / "scripts"
AGENTS_DIR = DATA_DIR / "agents"
METADATA_DIR = DATA_DIR / "metadata"

# Spider-Man script content
SCRIPT_CONTENT = """SPIDER-MAN: WEB OF SHADOWS
Written by [Author Name]

FADE IN:
EXT. NEW YORK CITY SKYLINE - DAWN
The sun rises over Manhattan's towering skyscrapers. The city awakens as early commuters 
fill the streets below.

INT. PETER PARKER'S APARTMENT - BEDROOM - DAWN
PETER PARKER (20s), disheveled hair, jolts awake to his phone's alarm. Spider-web cracks 
spread across his phone screen. He groans.

PETER
Not again...

He reaches for the broken phone, accidentally sticking it to his palm with his 
web-shooters.

PETER (CONT'D)
(sighs)
Great. Just great.

INT. PETER PARKER'S APARTMENT - KITCHEN - MORNING
Peter hurriedly makes coffee, moving with enhanced agility. He catches a falling mug 
mid-air without looking, then realizes what he's done.

PETER
Focus, Parker. Be normal.

His AUNT MAY (60s) enters, fully dressed and energetic.

AUNT MAY
Morning, sleepyhead. You're going to be late for your interview at the Bugle.

PETER
Right! The interview. I completely forgot—

His spider-sense TINGLES. Peter's head snaps toward the window.

PETER (CONT'D)
(distracted)
Actually, Aunt May, I might need to—

A massive EXPLOSION rocks the building. Car alarms blare outside.

AUNT MAY
What was that?

Peter is already moving toward his closet.

PETER
Probably just construction. I'll... check it out.

EXT. MIDTOWN MANHATTAN - CONTINUOUS
Black smoke billows from a high-tech laboratory building. CIVILIANS run screaming as 
mechanical tentacles smash through windows.

DR. OTTO OCTAVIUS (50s), now DR. OCTOPUS, emerges from the building. Four massive 
mechanical arms extend from his back, each one destroying everything in reach.

DR. OCTOPUS
(to fleeing civilians)
Don't run! You're about to witness the birth of a new age!

One tentacle grabs a NEWS VAN and hurls it toward a group of people.

EXT. NEARBY ROOFTOP - CONTINUOUS
SPIDER-MAN swings into frame, red and blue costume gleaming in the morning light. He 
shoots a web-line, catches the van mid-air, and gently lowers it to safety.

SPIDER-MAN
(to civilians)
Everyone okay? Good. Now might be a great time for that morning jog you've been putting 
off.

Spider-Man lands gracefully, facing Dr. Octopus.

SPIDER-MAN (CONT'D)
Dr. Octopus, I presume? Love the new look. Very... tentacle-y.

DR. OCTOPUS
Spider-Man. How predictable. Always arriving just in time to interfere with progress.

SPIDER-MAN
Hey, I'm all for progress. But maybe next time, try not to endanger innocent people? Just 
a thought.

Dr. Octopus's tentacles slam into the ground where Spider-Man was standing. Spider-Man 
backflips away effortlessly.

DR. OCTOPUS
These people are merely obstacles to evolution! My fusion experiment will revolutionize 
energy production!

SPIDER-MAN
(dodging another tentacle)
Right, because your experiments have such a great track record!

Spider-Man shoots web-lines at two tentacles, yanking them together. They collide with a 
metallic CLANG.

DR. OCTOPUS
Enough!

All four tentacles converge on Spider-Man's position. He leaps high into the air, spinning
 gracefully.

SPIDER-MAN
(mid-flip)
You know what they say about putting all your eggs in one basket!

Spider-Man lands behind Dr. Octopus and shoots webs at his feet, temporarily anchoring 
him.

DR. OCTOPUS
Impossible!

Dr. Octopus breaks free easily, his tentacles smashing the pavement.

SPIDER-MAN
Okay, that was easier for you than I hoped.

A tentacle swipes toward Spider-Man's head. His spider-sense allows him to duck just in 
time.

SPIDER-MAN (CONT'D)
Look, Doc, I get it. Science is frustrating. Trust me, I've been there. But maybe we could
 discuss this over coffee instead of, you know, destroying half of Manhattan?

DR. OCTOPUS
You wouldn't understand! The tritium experiment was perfect! But they called it dangerous,
 shut down my funding!

SPIDER-MAN
(swinging between tentacles)
Let me guess - probably because it was actually dangerous?

Dr. Octopus lunges forward with all four tentacles. Spider-Man shoots web-lines to a 
nearby building and swings up to avoid the attack.

DR. OCTOPUS
I'll show them dangerous!

Dr. Octopus's tentacles grab a CITY BUS and lift it high into the air. PASSENGERS scream 
inside.

SPIDER-MAN
(serious now)
Put them down. Now.

DR. OCTOPUS
Make me.

Spider-Man's demeanor shifts. No more quips.

SPIDER-MAN
Wrong answer.

Spider-Man swings directly at Dr. Octopus, shooting webs with pinpoint accuracy. Each 
web-line targets the joints of the mechanical arms.

The webbing gums up the tentacles' movement. Dr. Octopus struggles to maintain his grip on
 the bus.

DR. OCTOPUS
What—? My arms!

SPIDER-MAN
(while continuing his assault)
Advanced polymers. They'll harden and restrict movement. You've got about thirty seconds 
before those arms seize up completely.

Spider-Man shoots a web-line at the bus and gently guides it to safety as Dr. Octopus's 
tentacles begin to malfunction.

DR. OCTOPUS
This isn't over, Spider-Man!

SPIDER-MAN
(landing near the immobilized villain)
Actually, Doc, I think it kind of is.

INT. POLICE STATION - LATER
Dr. Octopus is led away in a specially designed restraint system. CAPTAIN STACY approaches
 where Spider-Man stands with several OFFICERS.

CAPTAIN STACY
Good work today, Spider-Man. Those mechanical arms could have caused serious damage.

SPIDER-MAN
Just doing what anyone with spider-powers would do, Captain.

CAPTAIN STACY
About that interview at the Daily Bugle...

Spider-Man's mask hides his surprised expression.

SPIDER-MAN
I'm sorry?

CAPTAIN STACY
Peter Parker, right? My daughter Gwen mentioned you. You missed your appointment this 
morning.

Spider-Man realizes his secret identity is at risk.

SPIDER-MAN
I... think you have me confused with someone else, Captain.

CAPTAIN STACY
(smiling knowingly)
Of course. My mistake.

Captain Stacy walks away, leaving Spider-Man wondering how much he actually knows.

EXT. DAILY BUGLE BUILDING - LATER
Spider-Man swings away from the scene. The camera pulls back to reveal the Daily Bugle 
building in the distance.

SPIDER-MAN (V.O.)
With great power comes great responsibility. But sometimes, great responsibility means 
being late for job interviews, missing family dinners, and hoping the people you care 
about never figure out why.

INT. DAILY BUGLE - J. JONAH JAMESON'S OFFICE - CONTINUOUS
J. JONAH JAMESON (60s) slams a newspaper on his desk. The headline reads: "SPIDER-MAN 
SAVES MANHATTAN."

J. JONAH JAMESON
(to his secretary)
Get me pictures of Spider-Man! I want to know everything about this masked menace!

He pauses, looking at the heroic photo of Spider-Man saving the bus.

J. JONAH JAMESON (CONT'D)
(grudgingly)
And... maybe run a small piece about the people he saved. Very small.

EXT. PETER PARKER'S APARTMENT BUILDING - EVENING
Peter Parker, back in civilian clothes, approaches his building. He's carrying flowers and
 Chinese takeout.

PETER
(to himself)
Aunt May loves kung pao chicken. Maybe she'll forgive me for disappearing this morning.

His spider-sense tingles faintly. Peter looks around but sees nothing suspicious.

PETER (CONT'D)
(sighs)
Or maybe I'm just paranoid.

INT. PETER PARKER'S APARTMENT - CONTINUOUS
Peter enters to find Aunt May reading the newspaper with Spider-Man on the front page.

AUNT MAY
Peter! You're home. How did the interview go?

PETER
(sitting down)
Let's just say it was... eventful.

AUNT MAY
(showing him the newspaper)
Did you hear about this Spider-Man fellow? Quite the hero.

Peter tries to look casual while glancing at his own photo.

PETER
Yeah, I heard something about that. Seems like a decent guy.

AUNT MAY
Your Uncle Ben would have liked him. Someone who helps others, no matter the cost to 
himself.

Peter's expression grows serious.

PETER
Aunt May...

AUNT MAY
(standing up)
Well, I better let you get some rest. You look tired, dear.

She kisses his forehead and heads toward her room.

AUNT MAY (CONT'D)
(at the doorway)
Oh, and Peter? Next time you go web-slinging around the city, try not to tear your good 
shirt.

She exits, leaving Peter staring in shock at his torn sleeve - a tear he hadn't noticed 
from the fight.

PETER
(to himself)
How does she always know?

Peter looks out his window at the New York skyline. Distant sirens wail in the night.

PETER (CONT'D)
(standing up)
Looks like it's going to be another long night.

He moves toward his closet where his Spider-Man costume hangs hidden behind his regular 
clothes.

FADE TO BLACK.

THE END

SPIDER-MAN WILL RETURN IN:
"WEB OF SHADOWS: CHAPTER TWO"
"""

# Agent names from the SD1 system
AGENT_NAMES = [
    "script_parser",
    "eighths_calculator", 
    "breakdown_specialist",
    "department_coordinator",
    "production_analyzer"
]

def setup_logging() -> logging.Logger:
    """Set up logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('spiderman_script_processing.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def create_directories():
    """Create necessary directories for output files."""
    directories = [DATA_DIR, AGENTS_DIR, METADATA_DIR]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created/verified directory: {directory}")

def check_sd1_health() -> bool:
    """Check if SD1 API server is running and healthy."""
    try:
        response = requests.get(f"{SD1_API_URL}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            logger.info(f"SD1 API health check passed: {health_data}")
            return True
        else:
            logger.error(f"SD1 API health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to SD1 API: {e}")
        return False

def call_script_ingest_api(script_content: str) -> Optional[Dict[str, Any]]:
    """Call the SD1 script ingestion API endpoint."""
    try:
        logger.info("Calling SD1 script ingestion API...")
        
        # Prepare the request payload
        payload = {
            "script_text": script_content,
            "metadata": {
                "title": "Spider-Man: Web of Shadows",
                "author": "Script Processing System",
                "processed_at": datetime.now().isoformat()
            }
        }
        
        # Make the API call
        response = requests.post(
            f"{SD1_API_URL}/api/script/ingest",
            json=payload,
            timeout=300,  # 5 minutes timeout for processing
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            logger.info("Script ingestion API call successful")
            return response.json()
        else:
            logger.error(f"API call failed with status {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        logger.error(f"API call failed: {e}")
        return None

def extract_agent_outputs(api_response: Dict[str, Any]) -> Dict[str, Any]:
    """Extract individual agent outputs from the API response."""
    try:
        if not api_response.get("success", False):
            logger.error("API response indicates failure")
            return {}
        
        data = api_response.get("data", {})
        agent_outputs = data.get("agent_outputs", {})
        
        logger.info(f"Extracted agent outputs for {len(agent_outputs)} agents")
        
        # Log which agents completed successfully
        for agent_name, output in agent_outputs.items():
            if output:
                logger.info(f"Agent '{agent_name}' completed successfully")
            else:
                logger.warning(f"Agent '{agent_name}' returned empty output")
        
        return agent_outputs
        
    except Exception as e:
        logger.error(f"Failed to extract agent outputs: {e}")
        return {}

def save_individual_agent_files(agent_outputs: Dict[str, Any], timestamp: str) -> bool:
    """Save each agent's output to separate JSON files."""
    try:
        success_count = 0
        
        for agent_name, output in agent_outputs.items():
            if not output:
                logger.warning(f"Skipping empty output for agent '{agent_name}'")
                continue
                
            # Create individual agent file
            agent_filename = f"{agent_name}_{timestamp}.json"
            agent_filepath = AGENTS_DIR / agent_filename
            
            # Prepare agent-specific data structure
            agent_data = {
                "agent_name": agent_name,
                "timestamp": timestamp,
                "processed_at": datetime.now().isoformat(),
                "output": output,
                "metadata": {
                    "script_title": "Spider-Man: Web of Shadows",
                    "processing_pipeline": "5-agent specialized pipeline"
                }
            }
            
            # Save agent file
            with open(agent_filepath, 'w', encoding='utf-8') as f:
                json.dump(agent_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved agent '{agent_name}' output to: {agent_filepath}")
            success_count += 1
        
        logger.info(f"Successfully saved {success_count} individual agent files")
        return success_count > 0
        
    except Exception as e:
        logger.error(f"Failed to save individual agent files: {e}")
        return False

def save_main_script_file(api_response: Dict[str, Any], timestamp: str) -> bool:
    """Save the main processed script file."""
    try:
        script_filename = f"script_{timestamp}.json"
        script_filepath = DATA_DIR / script_filename
        
        # Save main script file
        with open(script_filepath, 'w', encoding='utf-8') as f:
            json.dump(api_response, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved main script file to: {script_filepath}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save main script file: {e}")
        return False

def save_metadata_file(api_response: Dict[str, Any], timestamp: str, processing_stats: Dict[str, Any]) -> bool:
    """Save the processing metadata file."""
    try:
        metadata_filename = f"metadata_{timestamp}.json"
        metadata_filepath = METADATA_DIR / metadata_filename
        
        # Extract metadata from response
        data = api_response.get("data", {})
        metadata = data.get("metadata", {})
        
        # Create comprehensive metadata
        metadata_data = {
            "script_title": "Spider-Man: Web of Shadows",
            "processing_timestamp": timestamp,
            "processing_completed_at": datetime.now().isoformat(),
            "processing_stats": processing_stats,
            "api_metadata": metadata,
            "agent_status": {
                agent_name: "completed" if output else "failed"
                for agent_name, output in data.get("agent_outputs", {}).items()
            },
            "statistics": data.get("statistics", {}),
            "system_info": {
                "api_endpoint": f"{SD1_API_URL}/api/script/ingest",
                "agent_pipeline": "5-agent specialized pipeline",
                "agents_processed": len(data.get("agent_outputs", {}))
            }
        }
        
        # Save metadata file
        with open(metadata_filepath, 'w', encoding='utf-8') as f:
            json.dump(metadata_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved metadata file to: {metadata_filepath}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save metadata file: {e}")
        return False

def save_combined_agents_file(agent_outputs: Dict[str, Any], timestamp: str) -> bool:
    """Save the combined agents file as specified in the task requirements."""
    try:
        agents_filename = f"agents_{timestamp}.json"
        agents_filepath = AGENTS_DIR / agents_filename
        
        # Create combined agents data structure
        agents_data = {
            "timestamp": timestamp,
            "processed_at": datetime.now().isoformat(),
            "script_title": "Spider-Man: Web of Shadows",
            "total_agents": len(agent_outputs),
            "agent_outputs": agent_outputs,
            "processing_summary": {
                "successful_agents": len([output for output in agent_outputs.values() if output]),
                "failed_agents": len([output for output in agent_outputs.values() if not output]),
                "pipeline_status": "completed" if all(agent_outputs.values()) else "partial"
            }
        }
        
        # Save combined agents file
        with open(agents_filepath, 'w', encoding='utf-8') as f:
            json.dump(agents_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved combined agents file to: {agents_filepath}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save combined agents file: {e}")
        return False

def validate_processing_results(timestamp: str) -> Dict[str, Any]:
    """Validate that all expected files were created and contain data."""
    results = {
        "timestamp": timestamp,
        "validation_status": "success",
        "files_created": [],
        "files_missing": [],
        "agent_files_created": [],
        "validation_errors": []
    }
    
    try:
        # Check main script file
        script_file = DATA_DIR / f"script_{timestamp}.json"
        if script_file.exists():
            results["files_created"].append(str(script_file))
        else:
            results["files_missing"].append(str(script_file))
        
        # Check metadata file
        metadata_file = METADATA_DIR / f"metadata_{timestamp}.json"
        if metadata_file.exists():
            results["files_created"].append(str(metadata_file))
        else:
            results["files_missing"].append(str(metadata_file))
        
        # Check combined agents file
        agents_file = AGENTS_DIR / f"agents_{timestamp}.json"
        if agents_file.exists():
            results["files_created"].append(str(agents_file))
        else:
            results["files_missing"].append(str(agents_file))
        
        # Check individual agent files
        for agent_name in AGENT_NAMES:
            agent_file = AGENTS_DIR / f"{agent_name}_{timestamp}.json"
            if agent_file.exists():
                results["agent_files_created"].append(str(agent_file))
            else:
                results["files_missing"].append(str(agent_file))
        
        # Determine overall validation status
        if results["files_missing"]:
            results["validation_status"] = "partial"
            results["validation_errors"].append(f"Missing {len(results['files_missing'])} expected files")
        
        logger.info(f"Validation completed: {results['validation_status']}")
        logger.info(f"Files created: {len(results['files_created'])}")
        logger.info(f"Agent files created: {len(results['agent_files_created'])}")
        
        if results["files_missing"]:
            logger.warning(f"Missing files: {results['files_missing']}")
        
        return results
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        results["validation_status"] = "failed"
        results["validation_errors"].append(str(e))
        return results

def process_spiderman_script() -> bool:
    """Main processing function to handle the Spider-Man script ingestion."""
    try:
        logger.info("Starting Spider-Man script processing...")
        
        # Create directories
        create_directories()
        
        # Check SD1 API health
        if not check_sd1_health():
            logger.error("SD1 API health check failed. Cannot proceed.")
            return False
        
        # Generate timestamp for file naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        logger.info(f"Processing timestamp: {timestamp}")
        
        # Call the script ingestion API
        api_response = call_script_ingest_api(SCRIPT_CONTENT)
        if not api_response:
            logger.error("Script ingestion API call failed")
            return False
        
        # Extract agent outputs
        agent_outputs = extract_agent_outputs(api_response)
        if not agent_outputs:
            logger.error("Failed to extract agent outputs")
            return False
        
        # Save all files
        processing_stats = {
            "total_agents": len(agent_outputs),
            "successful_agents": len([output for output in agent_outputs.values() if output]),
            "processing_timestamp": timestamp,
            "script_length": len(SCRIPT_CONTENT),
            "script_title": "Spider-Man: Web of Shadows"
        }
        
        # Save main script file
        if not save_main_script_file(api_response, timestamp):
            logger.error("Failed to save main script file")
            return False
        
        # Save metadata file
        if not save_metadata_file(api_response, timestamp, processing_stats):
            logger.error("Failed to save metadata file")
            return False
        
        # Save combined agents file
        if not save_combined_agents_file(agent_outputs, timestamp):
            logger.error("Failed to save combined agents file")
            return False
        
        # Save individual agent files
        if not save_individual_agent_files(agent_outputs, timestamp):
            logger.error("Failed to save individual agent files")
            return False
        
        # Validate results
        validation_results = validate_processing_results(timestamp)
        
        # Log final results
        logger.info("Spider-Man script processing completed successfully!")
        logger.info(f"Processing timestamp: {timestamp}")
        logger.info(f"Files created: {len(validation_results['files_created'])}")
        logger.info(f"Agent files created: {len(validation_results['agent_files_created'])}")
        logger.info(f"Validation status: {validation_results['validation_status']}")
        
        if validation_results['validation_status'] == 'success':
            logger.info("🎉 All processing completed successfully!")
            return True
        else:
            logger.warning("⚠️  Processing completed with some issues")
            return False
        
    except Exception as e:
        logger.error(f"Script processing failed: {e}")
        return False

def main():
    """Main entry point for the script."""
    global logger
    logger = setup_logging()
    
    logger.info("=" * 60)
    logger.info("Spider-Man Script Ingestion Processor")
    logger.info("=" * 60)
    
    try:
        success = process_spiderman_script()
        
        if success:
            logger.info("✅ Spider-Man script processing completed successfully!")
            print("\n🎉 Processing completed successfully!")
            print(f"📁 Check output files in: {DATA_DIR}")
            print(f"📊 Individual agent outputs in: {AGENTS_DIR}")
            print(f"📋 Metadata in: {METADATA_DIR}")
        else:
            logger.error("❌ Spider-Man script processing failed")
            print("\n❌ Processing failed. Check the log file for details.")
            
    except KeyboardInterrupt:
        logger.info("Script processing interrupted by user")
        print("\n⚠️  Processing interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()