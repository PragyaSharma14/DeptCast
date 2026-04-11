import os
import json
import autogen
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_workflow(department: str, style: str, template: str, dimension: str, user_prompt: str) -> list:
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

    system_message_director = f"""You are the Visual Director for a corporate video. 
Current Constraints:
- Department Topic: {department}
- System Prompt / Template Override: {template}
- Video Dimension: {dimension}
- Required Visual Style: {style.upper()}
- Visual Directives: {style_guide}
- Required Video Engine: OpenAI Sora 

Task: Take the User's core idea and write a structured list of scenes. 
- Each scene must have a `sceneNumber` (int), `description` (narrative context), and a `prompt` (the literal visual prompt that will be sent to the OpenAI Sora AI generator).
- Make sure the visual `prompt` perfectly matches the Visual Directives mentioned above. Do not mix 2D vector concepts with photorealistic concepts.
- Output ONLY valid JSON containing an array of objects.
"""

    director = autogen.AssistantAgent(
        name="Director",
        system_message=system_message_director,
        llm_config=llm_config,
    )

    system_message_critic = f"""You are the Quality Critic. 
Your job is to review the Director's JSON output. 
- Ensure the JSON is an array of scene objects.
- Ensure the visual constraints ({style_guide}) are strictly adhered to.
- If it looks good, reply ONLY with the exact verbatim JSON array that the Director wrote, with NO conversational text. If it's flawed, instruct the Director to fix it."""

    critic = autogen.AssistantAgent(
        name="Critic",
        system_message=system_message_critic,
        llm_config=llm_config,
    )

    user_proxy = autogen.UserProxyAgent(
        name="UserProxy",
        human_input_mode="NEVER",
        code_execution_config=False,
        max_consecutive_auto_reply=2,
        is_termination_msg=lambda x: "sceneNumber" in str(x.get("content", "")) and "[" in str(x.get("content", ""))
    )

    initial_message = f"Please draft the scenes for the following video concept: {user_prompt}"

    groupchat = autogen.GroupChat(
        agents=[user_proxy, director, critic],
        messages=[],
        max_round=4,
        allow_repeat_speaker=False
    )
    
    manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)

    user_proxy.initiate_chat(manager, message=initial_message)

    final_output = []
    for message in reversed(groupchat.messages):
        content = message.get("content", "")
        if "sceneNumber" in content:
            import re
            json_blocks = re.findall(r'```(?:json)?\s*(\[\s*{.*?}\s*\])\s*```', content, re.DOTALL)
            if json_blocks:
                try:
                    final_output = json.loads(json_blocks[-1])
                    break
                except Exception:
                    pass
            
            match = re.search(r'\[\s*{.*?}\s*\]', content, re.DOTALL)
            if match:
                try:
                    final_output = json.loads(match.group(0))
                    break
                except Exception:
                    continue

    if not final_output:
        print("Failed to extract JSON from conversation. Using blank fallback.")
        final_output = [{"sceneNumber": 1, "description": "Fallback scene", "prompt": f"A standard corporate video for {department}."}]

    return final_output

def run_autogen_blueprint(department: str, style: str, template: str, dimension: str, user_prompt: str) -> str:
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
        "temperature": 0.7,
    }

    system_message = f"""You are the Creative Director for a corporate video.
Current Constraints:
- Department Topic: {department}
- System Prompt / Template Override: {template}
- Video Dimension: {dimension}
- Required Visual Style: {style.upper()}

Task: Take the User's core idea and write a structured "Strategic Video Blueprint".
Format it strictly exactly like this (use markdown):

### Video Objective
(1-2 sentences on exactly what this video will accomplish)

### Key Content to Cover
- (Bullet point the specific details, user-provided data, rules, and facts mentioned in the prompt)
- (Ensure user-specific details are heavily emphasized here so the animation/scene backend won't miss them)

### Visual & Tonal Trajectory
(A paragraph describing the aesthetic, mood, lighting, and pacing based on the {style.upper()} style)

CRITICAL RULES:
- DO NOT write a scene-by-scene script or use words like "Scene 1". 
- Return ONLY the formatted markdown blueprint. No conversational filler or introductory text.
"""

    agent = autogen.AssistantAgent(
        name="CreativeDirector",
        system_message=system_message,
        llm_config=llm_config,
    )

    user_proxy = autogen.UserProxyAgent(
        name="UserProxy",
        human_input_mode="NEVER",
        code_execution_config=False,
        max_consecutive_auto_reply=0
    )

    initial_message = f"Please draft the strategic video blueprint for the following concept: {user_prompt}"

    res = user_proxy.initiate_chat(agent, message=initial_message)
    
    # Extract the last message from the agent
    final_text = "Video blueprint generation failed."
    for msg in reversed(user_proxy.chat_messages[agent]):
        if msg.get("role") == "assistant" or msg.get("name") == "CreativeDirector":
            final_text = msg.get("content", "").strip()
            break

    return final_text
