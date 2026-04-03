import os
import json
import autogen
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_cinematographer(scenes: list, dimension: str, avatar: str) -> str:
    """
    Takes an array of discrete narrative scenes and synthesizes them into ONE continuous 8-second 
    cinematic master prompt suitable for Google Veo 3.1.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not defined in the environment.")

    config_list = [{
        "model": "llama-3.3-70b-versatile",
        "api_key": groq_api_key,
        "base_url": "https://api.groq.com/openai/v1"
    }]

    llm_config = {
        "config_list": config_list,
        "temperature": 0.5,
    }

    system_message_cinematographer = f"""You are an elite Cinematographer.
Current Constraints:
- Output Dimension: {dimension}
- Anchor Subject: {avatar}
- Target Platform: OpenAI Sora AI
- Target Duration: Continuous dynamic tracking shot.

Task: The user will provide a JSON array of scenes representing text overlays / narrative beats. 
You must output exactly ONE highly descriptive, continuous visual prompt for OpenAI Sora that captures the essence of these beats seamlessly in one cohesive camera shot. 
- Focus extensively on lighting, camera movement (e.g. 'drone tracking shot', 'dynamic pan'), and subject consistency.
- Return ONLY the exact text prompt. Do not output JSON. Do not output markdown. Do not include introductory text.
"""

    cinematographer = autogen.AssistantAgent(
        name="Cinematographer",
        system_message=system_message_cinematographer,
        llm_config=llm_config,
    )

    user_proxy = autogen.UserProxyAgent(
        name="UserProxy",
        human_input_mode="NEVER",
        code_execution_config=False,
        max_consecutive_auto_reply=1
    )

    initial_message = f"Synthesize this script into a continuous 8-second master visual prompt:\n{json.dumps(scenes, indent=2)}"

    # Direct conversation between user and cinematographer for speed/efficiency
    user_proxy.initiate_chat(cinematographer, message=initial_message, max_turns=1)

    # Get the last response from cinematographer
    final_output = ""
    for msg in reversed(user_proxy.chat_messages[cinematographer]):
        if msg.get("role") == "assistant" and msg.get("content"):
            final_output = msg.get("content").strip()
            break
            
    if not final_output:
        final_output = f"A continuous {dimension} 8-second cinematic tracking shot, professionally lit, featuring {avatar} gracefully performing various professional tasks in an upscale modern environment."
        
    return final_output
