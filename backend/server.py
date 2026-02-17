from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import yt_dlp
import requests
import os

app = Flask(__name__)

# Allow your React app to connect
CORS(app, expose_headers=["Content-Length", "Content-Disposition"])

@app.route('/')
def health_check():
    return "Render Backend is Running", 200

@app.route('/download')
def download():
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "URL is required"}, 400

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        # Render's environment is more stable for yt-dlp
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            download_url = info['url']
            title = "".join([c for c in info.get('title', 'video') if c.isalnum() or c in (' ', '_')]).rstrip()
            
            # Request the video from YouTube
            r = requests.get(download_url, stream=True, timeout=60)
            
            headers = {
                'Content-Disposition': f'attachment; filename="{title}.mp4"',
                'Content-Type': 'video/mp4',
            }
            if 'Content-Length' in r.headers:
                headers['Content-Length'] = r.headers['Content-Length']

            # Stream the chunks back to the user
            def generate():
                for chunk in r.iter_content(chunk_size=1024*1024):
                    if chunk:
                        yield chunk

            return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    # Render provides a PORT environment variable
    port = int(os.environ.get("PORT", 4000))
    app.run(host='0.0.0.0', port=port)