from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp

app = Flask(__name__)

# Allow your React frontend to access the data
CORS(app)

@app.route('/')
def home():
    return "DownTube API is Live"

@app.route('/api/download')
@app.route('/download')
def download():
    video_url = request.args.get('url')
    if not video_url:
        return jsonify({"error": "URL is required"}), 400

    # configuration to get the direct URL
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            # This is the secret direct link to the video file
            direct_link = info.get('url')
            title = info.get('title', 'video')

            return jsonify({
                "download_url": direct_link,
                "title": title
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# For local testing
if __name__ == '__main__':
    app.run(port=4000)