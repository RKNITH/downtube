import React, { useState } from 'react';
import { Download, Youtube, Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

export default function App() {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState('idle');

  const startDownload = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsDownloading(true);
    setStatus('downloading');

    try {
      // USING YOUR SIGMA URL
      const backendUrl = "https://downtube-sigma.vercel.app/api/download";
      const response = await axios.get(`${backendUrl}?url=${encodeURIComponent(url)}`);

      const { download_url, title } = response.data;

      // Force native browser download
      const link = document.createElement('a');
      link.href = download_url;
      link.setAttribute('download', `${title}.mp4`);
      // Target _blank ensures it doesn't navigate away from your app
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus('success');
      setIsDownloading(false);
    } catch (err) {
      console.error("Vercel Error:", err);
      setStatus('error');
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setUrl('');
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

      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold">YouTube Downloader</h2>
          <p className="text-slate-500 text-sm italic">Direct Browser Transfer Enabled</p>
        </div>

        <form onSubmit={startDownload} className="space-y-6 flex flex-col items-center">
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-red-600 outline-none transition-all placeholder:text-slate-800"
            placeholder="Paste Link Here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isDownloading}
          />

          <button
            type="submit"
            disabled={isDownloading || !url}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
            {isDownloading ? 'Finding Video...' : 'Download MP4'}
          </button>

          {/* Your UI Asset */}
          {!isDownloading && url && (
            <img src="/down-arrow.png" alt="Download" className="w-10 h-10 animate-bounce mt-2" />
          )}
        </form>

        {status === 'success' && (
          <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between text-green-400">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <span className="text-sm">Download triggered! Check browser bar.</span>
            </div>
            <button onClick={reset} className="hover:bg-green-500/20 p-1 rounded-full"><RefreshCcw size={16} /></button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">Link failed. The video might be restricted.</span>
          </div>
        )}
      </div>

      <footer className="mt-12 text-slate-800 text-[10px] uppercase tracking-widest font-bold">
        Python • React • Vercel Sigma
      </footer>
    </div>
  );
}