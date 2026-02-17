from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import yt_dlp
import requests

app = Flask(__name__)

# Allows React to read the file size for the progress bar
CORS(app, expose_headers=["Content-Length", "Content-Disposition"])

@app.route('/')
def home():
    return "Backend is running!"

@app.route('/api/download') # Vercel prefers the /api prefix
@app.route('/download')     # Local fallback
def download():
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "URL is required"}, 400

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            download_url = info['url']
            title = "".join([c for c in info.get('title', 'video') if c.isalnum() or c in (' ', '_')]).rstrip()
            
            r = requests.get(download_url, stream=True, timeout=30)
            
            headers = {
                'Content-Disposition': f'attachment; filename="{title}.mp4"',
                'Content-Type': 'video/mp4',
            }
            if 'Content-Length' in r.headers:
                headers['Content-Length'] = r.headers['Content-Length']

            def generate():
                for chunk in r.iter_content(chunk_size=1024*1024):
                    if chunk:
                        yield chunk

            return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        return {"error": str(e)}, 500

# This line is for local execution
if __name__ == '__main__':
    app.run(port=4000)