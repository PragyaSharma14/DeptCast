import os
import json
import autogen
from dotenv import load_dotenv

# Load the parent .env file
parent_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(parent_env_path)

def run_autogen_workflow(department: str, avatar: str, voice: str, dimension: str, user_prompt: str) -> list:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY is not defined in the environment.")

    # We use OpenAI base_url for Groq compatibility
    config_list = [{
        "model": "llama-3.3-70b-versatile",
        "api_key": groq_api_key,
        "base_url": "https://api.groq.com/openai/v1"
    }]

    llm_config = {
        "config_list": config_list,
        "temperature": 0.4,
    }

    # Agent roles
    system_message_director = f"""You are the Visual Director for a corporate video. 
Current Constraints:
- Department Topic: {department}
- Avatar Concept: {avatar}
- Voice Tone: {voice}
- Video Dimension / Framing: {dimension}
- Required Video Engine: OpenAI Sora (generate high visual fidelity cinematic videos)

Task: Take the User's core idea and write a structured list of scenes. 
- Each scene must have a `sceneNumber` (int), `description` (narrative context), and a `prompt` (the literal cinematic prompt that will be sent to the OpenAI Sora AI generator).
- Make sure the cinematic `prompt` is descriptive enough to define lighting, camera movement, and clearly includes the avatar traits. Use terms like '{dimension} aspect ratio composition'.
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
- Ensure the avatar ({avatar}) is consistently described.
- Ensure the formatting hints for dimension ({dimension}) are present.
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
        max_consecutive_auto_reply=2, # Limit chat turns to manage latency/costs
        is_termination_msg=lambda x: "sceneNumber" in str(x.get("content", "")) and "[" in str(x.get("content", ""))
    )

    initial_message = f"Please draft the scenes for the following video concept: {user_prompt}"

    # We have User Proxy start a chat with Director. 
    # But for a true multi-agent workflow, a GroupChat is better. Let's use two agents in a chat loop to keep code simple but effective.
    # UserProxy -> Director -> Critic -> Director
    
    # Let's use a simple GroupChat
    groupchat = autogen.GroupChat(
        agents=[user_proxy, director, critic],
        messages=[],
        max_round=4,
        allow_repeat_speaker=False
    )
    
    manager = autogen.GroupChatManager(groupchat=groupchat, llm_config=llm_config)

    user_proxy.initiate_chat(manager, message=initial_message)

    # Find the last message that contains the JSON list
    final_output = []
    for message in reversed(groupchat.messages):
        content = message.get("content", "")
        if "sceneNumber" in content:
            import re
            # Extract content specifically inside markdown json blocks if they exist
            json_blocks = re.findall(r'```(?:json)?\s*(\[\s*{.*?}\s*\])\s*```', content, re.DOTALL)
            if json_blocks:
                try:
                    final_output = json.loads(json_blocks[-1])
                    break
                except Exception:
                    pass
            
            # Fallback: Find the generic array array brackets
            match = re.search(r'\[\s*{.*?}\s*\]', content, re.DOTALL)
            if match:
                try:
                    final_output = json.loads(match.group(0))
                    break
                except Exception:
                    continue

    if not final_output:
        # Fallback if parsing fails
        print("Failed to extract JSON from conversation. Using blank fallback.")
        final_output = [{"sceneNumber": 1, "description": "Fallback scene", "prompt": f"A standard corporate video for {department} with {avatar} avatar."}]

    return final_output
