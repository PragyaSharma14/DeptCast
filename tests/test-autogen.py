import os
import sys

# Add server directory to path so we can import from autogen_service
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from autogen_service.agents import run_autogen_workflow

user_prompt_mock = """
## Scene 1: Hook
**Visuals:** A professional woman in a modern HR office looking directly at the camera.
**Narration:** Welcome to the new remote work policy. 
**On-Screen Text:** Remote Work 2026.

## Scene 2: Detail
**Visuals:** The same woman pointing to a digital calendar.
**Narration:** You can now work from home 3 days a week.
**On-Screen Text:** 3 Days WFH.
"""

print("Starting AutoGen workflow test...")
try:
    result = run_autogen_workflow(
        department="HR",
        style="Hyper Realistic",
        template="Policy Update",
        dimension="16:9",
        user_prompt=user_prompt_mock,
        target_duration=16,
        avatar="girl"
    )
    print("====================================")
    print("SUCCESS: AutoGen returned:")
    import json
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"FAILED: {e}")
