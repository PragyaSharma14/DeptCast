from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from agents import run_autogen_workflow

app = FastAPI(title="DeptCast AutoGen Microservice")

class VideoGenerationRequest(BaseModel):
    department: str
    avatar: str
    voice: str
    dimension: str
    prompt: str

@app.post("/generate-script")
async def generate_script(req: VideoGenerationRequest):
    try:
        print(f"Received request for {req.department} with prompt: {req.prompt}")
        
        # Run the AutoGen workflow
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
