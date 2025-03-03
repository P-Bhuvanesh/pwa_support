from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
from fastapi.responses import Response
from pydantic import BaseModel
import cv2
import numpy as np
import io

app = FastAPI()

# Serve static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/static/service-worker.js", response_class=FileResponse)
async def service_worker():
    return FileResponse("static/service-worker.js", media_type="application/javascript")

class TextData(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/data")
async def get_data(data: TextData):
    return {"message": f"Received: {data.text}"}

@app.post("/process-image")
async def process_image(image: UploadFile = File(...)):
    if not image:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        # Read image content
        contents = await image.read()
        np_img = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Apply Image Processing (Grayscale)
        processed_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Encode the processed image
        _, img_encoded = cv2.imencode('.png', processed_img)
        
        # Create response
        return Response(content=img_encoded.tobytes(), media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0",port=8000, ssl_certfile="cert.pem", ssl_keyfile="key.pem" )