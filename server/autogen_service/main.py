from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from agents import run_autogen_workflow
from cinematographer import run_autogen_cinematographer

app = FastAPI(title="DeptCast AutoGen Microservice")

class VideoGenerationRequest(BaseModel):
    department: str
    avatar: str
    voice: str
    dimension: str
    prompt: str

class MasterShotRequest(BaseModel):
    scenes: List[Dict[str, Any]]
    dimension: str
    avatar: str

@app.post("/generate-script")
async def generate_script(req: VideoGenerationRequest):
    try:
        print(f"Received request for {req.department} with prompt: {req.prompt}")
        scenes = run_autogen_workflow(
            department=req.department,
            avatar=req.avatar,
            voice=req.voice,
            dimension=req.dimension,
            user_prompt=req.prompt
        )
        return {"status": "success", "scenes": scenes}
    except Exception as e:
        print(f"Error in AutoGen workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-master-shot")
async def generate_master_shot(req: MasterShotRequest):
    try:
        print(f"Received master shot request for {len(req.scenes)} scenes.")
        master_prompt = run_autogen_cinematographer(
            scenes=req.scenes,
            dimension=req.dimension,
            avatar=req.avatar
        )
        return {"status": "success", "master_prompt": master_prompt}
    except Exception as e:
        print(f"Error in Cinematographer workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
