from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import cv2
from ultralytics import YOLO
import numpy as np
import time
import os
import uuid
import json

app = FastAPI()

origins = [
    "*",	
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('yolov8n.pt')
processed_videos_dir = 'processed_videos/'
video_metadata_file = os.path.join(processed_videos_dir, 'videos_metadata.json')
os.makedirs(processed_videos_dir, exist_ok=True)

is_processing = False
FRAME_SKIP = 5

TEAM_COLORS = {
    'team1': (0, 255, 0),
    'team2': (255, 0, 0)
}

player_team_cache = {}


def load_video_metadata():
    if os.path.exists(video_metadata_file):
        with open(video_metadata_file, 'r') as f:
            return json.load(f)
    return []


def save_video_metadata(metadata):
    with open(video_metadata_file, 'w') as f:
        json.dump(metadata, f, indent=4)


def generate_thumbnail(frame, video_id):
    thumbnail_path = os.path.join(processed_videos_dir, f'{video_id}_thumbnail.jpg')
    cv2.imwrite(thumbnail_path, frame)
    return thumbnail_path

def process_and_save_video(input_path, video_id):
    cap = cv2.VideoCapture(input_path)
    output_path = os.path.join(processed_videos_dir, f'{video_id}.webm')
    fourcc = cv2.VideoWriter_fourcc(*'VP80')  # Codec VP8 para formato .webm
    fps = cap.get(cv2.CAP_PROP_FPS)  # Mantém o FPS original
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0
    thumbnail_generated = False

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % FRAME_SKIP == 0:
            results = model(frame)[0]
            for result in results.boxes:
                bbox = result.xyxy[0].cpu().numpy().astype(int)
                color = (0, 255, 0)
                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), color, 2)
            out.write(frame)
            if not thumbnail_generated:
                generate_thumbnail(frame, video_id)
                thumbnail_generated = True

        frame_count += 1

    duration = frame_count / fps
    cap.release()
    out.release()

    metadata = load_video_metadata()
    metadata.append({
        'id': video_id,
        'name': f'{video_id}.webm',
        'duration': duration,
        'thumbnail': f'{video_id}_thumbnail.jpg'
    })
    save_video_metadata(metadata)

@app.post('/process_video')
async def upload_and_process_video(file: UploadFile = File(...)):
    video_id = str(uuid.uuid4())
    input_path = os.path.join(processed_videos_dir, f'{video_id}_input.mp4')
    with open(input_path, 'wb') as f:
        f.write(await file.read())

    output_path = os.path.join(processed_videos_dir, f'{video_id}.webm')
    process_and_save_video(input_path, video_id)
    return FileResponse(output_path, media_type='video/mp4')


@app.get('/videos')
async def list_processed_videos():
    return JSONResponse(load_video_metadata())


@app.get('/videos/{video_id}')
async def get_processed_video(video_id: str, range: str = None):
    file_path = os.path.join(processed_videos_dir, f'{video_id}.webm')
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail='Video not found')

    if range:
        start, end = range.replace('bytes=', '').split('-')
        start = int(start)
        file_size = os.path.getsize(file_path)
        end = min(int(end), file_size - 1) if end else file_size - 1
        length = end - start + 1

        with open(file_path, 'rb') as f:
            f.seek(start)
            data = f.read(length)

        headers = {
            'Content-Range': f'bytes {start}-{end}/{file_size}',
            'Accept-Ranges': 'bytes',
            'Content-Length': str(length),
            'Content-Type': 'video/mp4',
            'Content-Disposition': f'inline; filename="{video_id}.mp4"'
        }
        return Response(data, status_code=206, headers=headers)

    return FileResponse(file_path, media_type='video/mp4')
