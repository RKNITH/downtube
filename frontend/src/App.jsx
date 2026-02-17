import React, { useState } from 'react';
import { Download, Youtube, Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState('idle');

  const startDownload = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsDownloading(true);
    setProgress(0);
    setStatus('downloading');

    try {
      // REPLACE THIS with your Render URL (e.g., https://downtube-api.onrender.com)
      const renderUrl = "https://downtube-42qb.onrender.com/download";

      const response = await axios({
        url: `${renderUrl}?url=${encodeURIComponent(url)}`,
        method: 'GET',
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'video.mp4');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setStatus('success');
      setIsDownloading(false);
    } catch (err) {
      console.error("Download Error:", err);
      setStatus('error');
      setIsDownloading(false);
    }
  };

  const reset = () => { setUrl(''); setProgress(0); setStatus('idle'); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-900/40">
          <Youtube size={40} fill="white" strokeWidth={0} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter">DOWN<span className="text-red-600">TUBE</span></h1>
      </div>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">YouTube Downloader</h2>
          <p className="text-slate-500 text-sm">Streaming via Render.com</p>
        </div>

        <form onSubmit={startDownload} className="space-y-6 flex flex-col items-center">
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-600 outline-none"
            placeholder="Paste Link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isDownloading}
          />

          <button
            type="submit"
            disabled={isDownloading || !url}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
            {isDownloading ? `Downloading ${progress}%` : 'Download MP4'}
          </button>

          {!isDownloading && url && <img src="/down-arrow.png" className="w-8 h-8 animate-bounce opacity-50" />}
        </form>

        {isDownloading && (
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Transferring Data...</span>
              <span className="text-red-500">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between text-green-400">
            <div className="flex items-center gap-2"><CheckCircle size={20} /> Success!</div>
            <button onClick={reset} className="p-1 hover:bg-green-500/20 rounded-full"><RefreshCcw size={18} /></button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 font-medium">
            <AlertCircle size={20} /> Failed. YouTube blocked the server IP.
          </div>
        )}
      </div>
    </div>
  );
}