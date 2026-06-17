import os
import json
import autogen
from dotenv import load_dotenv

parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_workflow(department: str, style: str, template: str, dimension: str, user_prompt: str, target_duration: int = 15, avatar: str = None) -> dict:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not defined in the environment.")

    config_list = [{
        "model": "gemini-3.1-flash-lite-preview", 
        "api_key": gemini_api_key,
        "api_type": "openai",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/"
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
    dynamic_format = ""
    if style.lower() in ["cinematic", "hyper realistic", "hyper-realistic"]:
        style_guide = "Use photorealistic cinematic terms: volumetric lighting, anamorphic lenses, shallow depth of field, natural professional environments, realistic lifelike human presence."
        dynamic_format = "Create a hyper-realistic, cinematic video featuring highly detailed environments, realistic lighting, and lifelike human subjects."
    elif style.lower() in ["infographic", "info-graphic"]:
        style_guide = "Use infographic and motion graphic terms: clean 2D vector illustrations, bold flat colors, kinetic typography, smooth isometric transitions, NO photorealism."
        dynamic_format = "Create a clean 2D vector infographic video. Use bold, flat colors, motion graphics, animated icons, and kinetic typography. ABSOLUTELY NO photorealism."
    else:
        style_guide = "Use visuals matching the requested style."
        dynamic_format = f"Create a {style.lower()} video."

    num_scenes = 1
    scene_duration = target_duration
    
    avatar_hint = f"\n- Selected Avatar: A {avatar} presenter." if avatar else ""



    system_message_director = f"""You are a Prompt Engineer for Google Veo.
Your task is to write a comprehensive overview command that tells the Video AI exactly what kind of video to create.

Current Constraints:
- Department: {department}
- Visual Style: {style.upper()} ({style_guide})
- Department Tone Guide: {dept_guide}
- Video Dimension: {dimension}{avatar_hint}

Task:
1. **Storyline**: Summarize the core concept.
2. **Image Prompt**: Write a prompt for the reference image.
3. **Scenes**: You must output exactly {num_scenes} scene. 
   - `prompt`: Write an overview command directed at the AI model. Do NOT describe a scene or visual actions. Instead, give it instructions on what to create. 
   
   Example format: "[Insert the user's core topic and specific details HERE as the absolute highest priority]. {dynamic_format} This is for the {department} department in {dimension} dimension. Use the provided avatar image strictly as a character design reference for the presenter. CRITICAL: Do NOT use the reference image as the literal first frame of the video, and do NOT showcase the avatar in a full-body diagram at the start. Keep the tone [insert tone from department guide]."

Output ONLY valid JSON:
{{
  "storyline": "...",
  "image_prompt": "...",
  "scenes": [
    {{ "sceneNumber": 1, "description": "Overview of the video", "prompt": "..." }}
  ]
}}

**CRITICAL RULES**:
- **NO SCENE DESCRIPTIONS**: You must write the prompt as an instruction/overview of the video's purpose, NOT as a description of visual events. Tell the AI what its job is.
"""

    director = autogen.AssistantAgent(
        name="Director",
        system_message=system_message_director,
        llm_config=llm_config,
    )

    system_message_critic = f"""You are the Quality Critic. Review the Prompt Engineer's JSON output.
- Ensure 'storyline', 'image_prompt', and 'scenes' are all present.
- Ensure exactly {num_scenes} scene is provided.
- Ensure the prompt is written as an overview instruction directed at the AI (e.g., "Create a video regarding..."), NOT as a visual scene description (e.g., "A vector avatar stands on the left...").
- You MUST reject any prompt that describes visual sequencing or camera movements. It must simply state what the video is about, the style, the department, and the details to include.
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

    initial_message = f"Please create a comprehensive overview command for the following: {user_prompt}"

    groupchat = autogen.GroupChat(
        agents=[user_proxy, director, critic],
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

def run_autogen_blueprint(department: str, style: str, template: str, dimension: str, user_prompt: str, storyline: str = "Direct & Formal", avatar: str = None) -> str:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not defined in the environment.")

    config_list = [{
        "model": "gemini-3.1-flash-lite-preview",
        "api_key": gemini_api_key,
        "api_type": "openai",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/"
    }]

    llm_config = {
        "config_list": config_list,
        "temperature": 0.7,
    }

    dynamic_format = ""
    if style.lower() in ["cinematic", "hyper realistic", "hyper-realistic"]:
        dynamic_format = "Create a hyper-realistic, cinematic video featuring highly detailed environments, realistic lighting, and lifelike human subjects."
    elif style.lower() in ["infographic", "info-graphic"]:
        dynamic_format = "Create a clean 2D vector infographic video. Use bold, flat colors, motion graphics, animated icons, and kinetic typography. ABSOLUTELY NO photorealism."
    else:
        dynamic_format = f"Create a {style.lower()} video."

    system_message = f"""You are an expert Corporate Video Scriptwriter.
Your job is to generate a comprehensive, highly-structured video script formatted in clean Markdown.

Current Constraints:
- Department: {department}
- Visual Style: {dynamic_format}
- Narrative Storyline to Follow: {storyline}
{f"- Avatar: Use the provided avatar strictly as a character design reference." if avatar else ""}

Task: 
Generate a scene-by-scene script. Apply the narrative principles of "{storyline}".
Structure your output using clear Markdown headers for each scene (e.g., `## Scene 1: Hook`, `## Scene 2: ...`).
For each scene, provide:
**Visuals:** Describe the camera angle, setting, or avatar position.
**Narration:** The exact spoken words the avatar will say.
**On-Screen Text:** Any bullet points, titles, or graphics to appear.

CRITICAL RULES:
- ABSOLUTELY DO NOT omit any factual data provided in the concept/prompt. If the user provides specific numbers, policies, or lists, you MUST weave them prominently into the narration and on-screen text.
- Return ONLY the formatted Markdown text. Do NOT include conversational filler like "Here is the script".
- The output must be directly readable and editable by the user.
- Ensure the tone matches the {department} department.
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

    initial_message = f"Please write the final script for this concept. STRICTLY include all of the following factual data and prioritize it as the core message of the video:\n\n{user_prompt}"

    res = user_proxy.initiate_chat(agent, message=initial_message)
    
    # Extract the last message from the agent
    final_text = "Video blueprint generation failed."
    for msg in reversed(user_proxy.chat_messages[agent]):
        if msg.get("role") == "assistant" or msg.get("name") == "CreativeDirector":
            final_text = msg.get("content", "").strip()
            break

    return final_text
