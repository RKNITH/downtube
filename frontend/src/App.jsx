import React, { useState } from 'react';
import { Download, Youtube, Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, downloading, success, error

  const startDownload = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsDownloading(true);
    setProgress(0);
    setStatus('downloading');

    try {
      const response = await axios({
        url: `https://vercel.com/raviranjans-projects-25bb5106/downtube/download?url=${encodeURIComponent(url)}`,
        method: 'GET',
        responseType: 'blob', // Necessary for file data
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      // Trigger the file save
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'video.mp4');
      document.body.appendChild(link);
      link.click();

      // Cleanup
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

  const reset = () => {
    setUrl('');
    setProgress(0);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-red-600 p-3 rounded-2xl shadow-xl shadow-red-900/40">
          <Youtube size={40} fill="white" strokeWidth={0} />
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">
          DOWN<span className="text-red-600">TUBE</span>
        </h1>
      </div>

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">YouTube Downloader</h2>

        </div>

        <form onSubmit={startDownload} className="space-y-6">
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-600 outline-none transition-all"
            placeholder="Paste URL here..."
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
            {isDownloading ? `Downloading ${progress}%` : 'Download Video'}
          </button>
        </form>

        {/* Progress Bar Container */}
        {isDownloading && (
          <div className="mt-8 space-y-2 animate-in fade-in duration-500">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Transferring...</span>
              <span className="text-red-500">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-800 overflow-hidden">
              <div
                className="bg-red-600 h-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between text-green-400">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle size={20} /> Download complete!
            </div>
            <button onClick={reset} className="p-1 hover:bg-green-500/20 rounded-full"><RefreshCcw size={18} /></button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">Error: YouTube blocked the stream or URL is invalid.</span>
          </div>
        )}
      </div>
    </div>
  );
}