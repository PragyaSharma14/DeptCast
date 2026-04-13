from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from agents import run_autogen_workflow, run_autogen_blueprint
from cinematographer import run_autogen_cinematographer
import os

app = FastAPI(title="DeptCast AutoGen Microservice")

class VideoGenerationRequest(BaseModel):
    department: str
    dimension: str
    prompt: str
    style: str
    template: str

class MasterShotRequest(BaseModel):
    scenes: List[Dict[str, Any]]
    dimension: str
    style: str
    template: str

async def verify_api_key(x_api_secret: str = Header(None)):
    expected_secret = os.getenv("AUTOGEN_SECRET")
    # If no secret is set in env, we allow it (for local dev dev)
    # But if it is set, we must match it
    if expected_secret and x_api_secret != expected_secret:
        raise HTTPException(status_code=403, detail="Unauthorized: Invalid or missing API Secret.")
    return x_api_secret

@app.post("/generate-script", dependencies=[Depends(verify_api_key)])
async def generate_script(req: VideoGenerationRequest):
    try:
        print(f"Received request for {req.department} with prompt: {req.prompt}")
        scenes = run_autogen_workflow(
            department=req.department,
            style=req.style,
            template=req.template,
            dimension=req.dimension,
            user_prompt=req.prompt
        )
        return {"status": "success", "scenes": scenes}
    except Exception as e:
        error_msg = str(e).lower()
        print(f"Error in AutoGen workflow: {str(e)}")
        if any(keyword in error_msg for keyword in ["quota", "credit", "limit", "rate limit", "balance"]):
            raise HTTPException(status_code=402, detail="AI Quota Exceeded: Please check your API credits/limits.")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-master-shot", dependencies=[Depends(verify_api_key)])
async def generate_master_shot(req: MasterShotRequest):
    try:
        print(f"Received master shot request for {len(req.scenes)} scenes.")
        master_prompt = run_autogen_cinematographer(
            scenes=req.scenes,
            dimension=req.dimension,
            style=req.style,
            template=req.template
        )
        return {"status": "success", "master_prompt": master_prompt}
    except Exception as e:
        print(f"Error in Cinematographer workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-blueprint-text", dependencies=[Depends(verify_api_key)])
async def generate_blueprint_text(req: VideoGenerationRequest):
    try:
        print(f"Received blueprint text request for {req.department} with prompt: {req.prompt}")
        blueprint = run_autogen_blueprint(
            department=req.department,
            style=req.style,
            template=req.template,
            dimension=req.dimension,
            user_prompt=req.prompt
        )
        return {"status": "success", "blueprint": blueprint}
    except Exception as e:
        error_msg = str(e).lower()
        print(f"Error in AutoGen blueprint workflow: {str(e)}")
        if any(keyword in error_msg for keyword in ["quota", "credit", "limit", "rate limit", "balance"]):
            raise HTTPException(status_code=402, detail="AI Quota Exceeded: Please check your API credits/limits.")
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
