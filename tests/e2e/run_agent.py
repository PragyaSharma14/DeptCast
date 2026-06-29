import sys
import json
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../autogen_service")
from agents import run_autogen_workflow

res = run_autogen_workflow("hr", "Infographics", "blank", "16:9", "Create a video explaining the new 2026 Leave Policy. Key points: 25 days annual leave, 5 sick days, mandatory 2 weeks continuous leave. Use a clean, corporate layout.", 15, None)
print("===FINAL_JSON===")
print(json.dumps(res))
