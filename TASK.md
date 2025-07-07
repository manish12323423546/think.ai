# TASK.md - Spider-Man Script Ingestion Script Creation Task

## TASK
Create a Python script that processes the Spider-Man: Web of Shadows script through the SD1 script ingestion coordinator API endpoint and stores each individual agent response in separate JSON files in organized folders.

## SCOPE
**Included:**
- Create Python script to automate Spider-Man script processing
- Call SD1 API endpoint `/api/script/ingest` programmatically
- Extract individual agent responses from coordinator output
- Store each agent's response in separate JSON files
- Organize outputs in timestamped folders with proper naming
- Error handling and logging for script execution
- Ensure all 5 agent responses are captured individually

**Excluded:**
- Frontend UI modifications
- Database schema changes
- Authentication/authorization updates
- Manual API testing or Postman usage

## FILES INVOLVED
- `process_spiderman_script.py` - New Python script to be created
- `sd1/api.py` - FastAPI server with script ingestion endpoints
- `sd1/src/script_ingestion/coordinator.py` - 5-agent script processing pipeline
- `sd1/src/script_ingestion/agents/` - Individual agent implementations
- `sd1/data/scripts/` - Output directory for processed scripts
- `sd1/data/scripts/agents/` - Individual agent response storage
- `sd1/data/scripts/metadata/` - Script metadata storage

## CONTEXT NEEDED
- **Script Ingestion System**: Uses 5 specialized agents (ScriptParserAgent, EighthsCalculatorAgent, BreakdownSpecialistAgent, DepartmentCoordinatorAgent, ProductionAnalyzerAgent)
- **API Endpoints**: `/api/script/ingest` and `/api/script/text` for processing
- **Data Structure**: Coordinator saves individual agent outputs to `agents_[timestamp].json`
- **Processing Flow**: Script → Coordinator → 5 Agents → Individual JSON files

## SUCCESS CRITERIA
1. Spider-Man script successfully processed through SD1 system
2. All 5 agent responses captured individually
3. Separate JSON files created for each agent output
4. Files organized in timestamped folders under `sd1/data/scripts/`
5. Each agent response stored in `agents/` subfolder
6. Metadata files generated with processing status

## DEPENDENCIES
- SD1 backend API server running on port 8000
- Google API key configured for Gemini 2.5 Flash
- All script ingestion agents properly initialized
- Data directories exist and are writable

## ESTIMATED EFFORT
**Complexity**: Medium
**Time**: 10-15 minutes
**Components**: API call, data processing, file organization

## IMPLEMENTATION STEPS
1. Create `process_spiderman_script.py` with proper imports and configuration
2. Define Spider-Man script content as multi-line string variable
3. Implement API call to SD1 `/api/script/ingest` endpoint
4. Add response parsing to extract individual agent outputs
5. Create folder structure and save each agent response to separate JSON files
6. Add error handling and logging for debugging
7. Test script execution and verify all 5 agent responses are stored

## VALIDATION STEPS
- Verify SD1 API server is running and responds to health check
- Execute `python process_spiderman_script.py` successfully
- Confirm script processing completes without errors
- Check individual agent JSON files exist and contain data
- Validate folder structure matches expected pattern
- Ensure all 5 agents completed successfully
- Verify script logs show processing progress

## SCRIPT CONTENT
```
SPIDER-MAN: WEB OF SHADOWS
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
```

## EXPECTED OUTPUT STRUCTURE
```
sd1/data/scripts/
├── script_YYYYMMDD_HHMMSS.json          # Main processed script
├── metadata/
│   └── metadata_YYYYMMDD_HHMMSS.json    # Processing metadata
└── agents/
    └── agents_YYYYMMDD_HHMMSS.json      # Individual agent responses
```

## SCRIPT REQUIREMENTS
The Python script must include:
- **HTTP Requests**: Use `requests` library to call SD1 API
- **JSON Handling**: Parse API responses and extract agent data
- **File Operations**: Create directories and save individual JSON files
- **Error Handling**: Try/catch blocks for API calls and file operations
- **Logging**: Print progress and status messages
- **Configuration**: SD1 API base URL (http://localhost:8000)

## SCRIPT STRUCTURE
```python
import requests
import json
import os
from datetime import datetime

# Configuration
SD1_API_URL = "http://localhost:8000"
SCRIPT_CONTENT = """[Spider-Man script content]"""

# Main processing function
def process_spiderman_script():
    # API call to /api/script/ingest
    # Parse response
    # Extract individual agent outputs
    # Save to separate JSON files
    pass

if __name__ == "__main__":
    process_spiderman_script()
```

## NOTES
- Each agent response will be stored with individual timestamps
- Processing status tracked throughout 5-agent pipeline
- Error handling ensures partial results are preserved
- All files use JSON format with proper indentation
- Script should be executable with `python process_spiderman_script.py`