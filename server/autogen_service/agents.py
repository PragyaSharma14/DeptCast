import os
import json
import autogen
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_workflow(department: str, style: str, template: str, dimension: str, user_prompt: str, target_duration: int = 15) -> dict:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not defined in the environment.")

    config_list = [{
        "model": "gemini-3-flash-preview", 
        "api_key": gemini_api_key,
        "api_type": "google"
    }]

    llm_config = {
        "config_list": config_list,
        "temperature": 0.4
    }

    # Department-specific visual guidelines
    dept_guides = {
        "hr": "Visuals should feel warm, inclusive, and professional. Use natural office lighting, diverse human interactions, and soft color palettes.",
        "marketing": "Visuals should be vibrant, energetic, and high-contrast. Use dynamic camera angles, bold branding elements, and modern urban settings.",
        "it-support": "Visuals should be clean, tech-focused, and organized. Use cool lighting (blues/whites), futuristic interfaces, and minimalist workspaces.",
        "finance": "Visuals should be formal, trustworthy, and precise. Use classic architecture, data visualizations, and professional business attire.",
        "operations": "Visuals should be industrial, efficient, and active. Use factory floors, logistics hubs, and smooth motion of machinery or goods.",
        "admin": "Visuals should be clear, corporate, and structured. Use standard office environments, organized desks, and calm atmospheres.",
        "quality": "Visuals should be detail-oriented and clean. Use lab settings, inspection processes, and sharp, high-focus macro shots."
    }
    dept_guide = dept_guides.get(department.lower(), "Visuals should be professional and aligned with modern corporate aesthetics.")

    style_guide = ""
    if style.lower() == "cinematic":
        style_guide = "Use photorealistic cinematic terms: volumetric lighting, anamorphic lenses, shallow depth of field, natural professional environments, realistic human presence."
    else:
        style_guide = "Use infographic and motion graphic terms: clean 2D vector illustrations, bold flat colors, kinetic typography, smooth isometric transitions, NO photorealism."

    if target_duration <= 4:
        num_scenes = 1
        scene_duration = 4
    elif target_duration <= 8:
        num_scenes = 1
        scene_duration = 8
    else:
        num_scenes = 2
        scene_duration = 8
    
    system_message_scriptwriter = f"""You are the Lead ScriptWriter and Storyteller for corporate communications.
Your task is to take the user's raw prompt and transform it into a coherent, engaging storyline that prioritizes the core message.
Current Context:
- Department: {department}
- Template Rules: {template}

Task:
1. Identify the 'Must-Have' information from the user's prompt (dates, names, specific rules).
2. Write a short, punchy script (1-2 paragraphs) that conveys this information effectively.
3. This script will serve as the narrative foundation for the visual director.
4. Focus on clarity and professional tone.
5. **CRITICAL STYLE RULE**: Your narrative MUST support a {style.upper()} aesthetic ({style_guide}). Describe visual metaphors that fit this specific style only.
"""

    scriptwriter = autogen.AssistantAgent(
        name="ScriptWriter",
        system_message=system_message_scriptwriter,
        llm_config=llm_config,
    )

    system_message_director = f"""You are the master Visual Director and Cinematographer.
Your task is to translate a script into a high-fidelity visual plan for AI generation (Imagen and Veo).
Current Constraints:
- Department: {department}
- Visual Style: {style.upper()} ({style_guide})
- Department Visual Guide: {dept_guide}
- Video Dimension: {dimension}

Task:
1. **Storyline**: Summarize the script into a final polished storyline for the video.
2. **Image Prompt**: Write one spectacular, dense visual prompt for a reference image (Imagen). It MUST capture the central theme and aesthetic of the entire video in a single high-fidelity shot.
3. **Scenes**: Create exactly {num_scenes} scenes (each {scene_duration}s). Each scene needs:
   - `sceneNumber`: int
   - `description`: User-facing story snippet.
   - `prompt`: A 4-5 sentence cinematic visual prompt for Google Veo. Include camera movement (drone, push-in, pan), micro-story action, and lighting details.

Output ONLY valid JSON:
{{
  "storyline": "...",
  "image_prompt": "...",
  "scenes": [
    {{ "sceneNumber": 1, "description": "...", "prompt": "..." }},
    ...
  ]
}}

**CRITICAL RULES**:
- **STYLE ENFORCEMENT**: You MUST strictly adhere to the {style.upper()} style. {style_guide}.
- **DEPARTMENT GUIDELINE**: {dept_guide}.
- If you ignore these, the Critic will reject your work.
"""

    director = autogen.AssistantAgent(
        name="Director",
        system_message=system_message_director,
        llm_config=llm_config,
    )

    system_message_critic = f"""You are the Quality Critic. Review the Director's JSON output.
- Ensure 'storyline', 'image_prompt', and 'scenes' are all present.
- Ensure exactly {num_scenes} scenes are provided.
- Ensure the prompts are dense (4-5 sentences) and adhere to the {style.upper()} style and {department} guide.
- If perfect, reply ONLY with the exact verbatim JSON. Otherwise, point out errors."""

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
        is_termination_msg=lambda x: "scenes" in str(x.get("content", "")) and "image_prompt" in str(x.get("content", ""))
    )

    initial_message = f"Please create a script and visual plan for the following: {user_prompt}"

    groupchat = autogen.GroupChat(
        agents=[user_proxy, scriptwriter, director, critic],
        messages=[],
        max_round=10,
        allow_repeat_speaker=False
    )
    
    manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)
    user_proxy.initiate_chat(manager, message=initial_message)

    final_data = {
        "storyline": "Standard corporate video.",
        "image_prompt": f"A professional {style} visual representing {department}.",
        "scenes": [{"sceneNumber": 1, "description": "Intro", "prompt": f"A corporate scene for {department}."}]
    }

    for message in reversed(groupchat.messages):
        content = message.get("content", "")
        if "scenes" in content and "image_prompt" in content:
            try:
                import re
                match = re.search(r'\{.*\}', content, re.DOTALL)
                if match:
                    parsed = json.loads(match.group(0))
                    if "scenes" in parsed and "image_prompt" in parsed:
                        final_data = parsed
                        break
            except Exception:
                pass

    return final_data

def run_autogen_blueprint(department: str, style: str, template: str, dimension: str, user_prompt: str) -> str:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not defined in the environment.")

    config_list = [{
        "model": "gemini-3.1-pro-preview",
        "api_key": gemini_api_key,
        "api_type": "google"
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
