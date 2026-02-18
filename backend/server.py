from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import yt_dlp
import requests
import os

app = Flask(__name__)
CORS(app, expose_headers=["Content-Length", "Content-Disposition"])

# Real browser headers to prevent throttling
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/'
}

@app.route('/download')
def download():
    video_url = request.args.get('url')
    if not video_url:
        return {"error": "URL is required"}, 400

    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        'user_agent': HEADERS['User-Agent'],
        'nocheckcertificate': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # 1. Faster extraction
            info = ydl.extract_info(video_url, download=False)
            download_url = info['url']
            title = "".join([c for c in info.get('title', 'video') if c.isalnum() or c in (' ', '_')]).rstrip()
            
            # 2. Stream with impersonated headers
            # We use a timeout to prevent the 10-minute "hang"
            r = requests.get(download_url, stream=True, headers=HEADERS, timeout=30)
            r.raise_for_status()
            
            headers = {
                'Content-Disposition': f'attachment; filename="{title}.mp4"',
                'Content-Type': 'video/mp4',
                'Cache-Control': 'no-cache',
            }
            if 'Content-Length' in r.headers:
                headers['Content-Length'] = r.headers['Content-Length']

            def generate():
                # Increase chunk size for faster transfers
                for chunk in r.iter_content(chunk_size=512*1024): 
                    if chunk:
                        yield chunk

            return Response(stream_with_context(generate()), headers=headers)

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return {"error": "YouTube blocked the request or timed out."}, 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 4000))
    app.run(host='0.0.0.0', port=port)