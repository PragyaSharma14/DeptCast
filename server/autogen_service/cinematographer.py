import os
import json
import autogen
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_cinematographer(scenes: list, dimension: str, style: str, template: str) -> str:
    """
    Takes an array of discrete narrative scenes and synthesizes them into ONE continuous 
    cinematic master prompt suitable for OpenAI Sora.
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

    style_guide = ""
    if style.lower() == "cinematic":
        style_guide = "Use photorealistic cinematic terms: volumetric lighting, anamorphic lenses, depth of field, natural professional environments, realistic human presence."
    else:
        style_guide = "Use infographic and motion graphic terms: clean 2D vector illustrations, bold flat colors, kinetic typography, smooth isometric transitions, NO photorealism, isolated minimal backgrounds."


    system_message_cinematographer = f"""You are an elite Cinematographer and Visual Concept Artist.
Current Constraints:
- Output Dimension: {dimension}
- Specific Template Constraints: {template}
- Target Platform: OpenAI Sora 
- Target Formulation: Continuous dynamic flow.
- Required Visual Style: {style.upper()}
- Visual Directives: {style_guide}

Task: The user will provide a JSON array of scenes representing text overlays / narrative beats. 
You must output exactly ONE highly descriptive, continuous visual prompt for OpenAI Sora that captures the essence of these beats seamlessly in one cohesive flow. 
- Focus extensively on lighting, camera movement/transitions, and adhering strictly to the Visual Directives above.
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

    initial_message = f"Synthesize this script into a continuous master visual prompt:\n{json.dumps(scenes, indent=2)}"

    user_proxy.initiate_chat(cinematographer, message=initial_message, max_turns=1)

    final_output = ""
    for msg in reversed(user_proxy.chat_messages[cinematographer]):
        if msg.get("role") == "assistant" and msg.get("content"):
            final_output = msg.get("content").strip()
            break
            
    if not final_output:
        final_output = f"A continuous {dimension} 8-second visual flow, highly professional, reflecting standard corporate messaging."
        
    return final_output
