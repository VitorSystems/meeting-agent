from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import time
from typing import List

app = FastAPI(title="Meeting Agent Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class TranscriptRequest(BaseModel):
    transcript: str

class SummaryResponse(BaseModel):
    summary: str
    tasks: List[str]

@app.get("/health")
async def health_check():
    return {"status": "running", "service": "Meeting Agent Backend (FastAPI)"}

@app.post("/summarize", response_model=SummaryResponse)
async def summarize(request: TranscriptRequest):
    transcript = request.transcript
    print(f"Received transcript length: {len(transcript)}")
    
    # Simulate processing time
    time.sleep(1.5)
    
    # Simple dynamic processing
    words = transcript.split()
    word_count = len(words)
    capitalized_words = [w for w in words if w and w[0].isupper()]
    
    # TODO: Integrate real AI model here
    # from transformers import pipeline
    # summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    # summary = summarizer(transcript, max_length=130, min_length=30, do_sample=False)
    
    summary = f"Processed by FastAPI Backend (Length: {word_count} words). Key topics: {', '.join(capitalized_words[:5])}..."
    
    tasks = [
        f"Review transcript of {word_count} words",
        "Install 'transformers' and 'torch' for real AI",
        "Run 'pip install -r server/requirements.txt'"
    ]
    
    return {
        "summary": summary,
        "tasks": tasks
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
