import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Loader2,
  Youtube,
  Image as ImageIcon,
  Copy,
  Check,
  Settings,
  ImageDown
} from "lucide-react";

/**
 * HomePage component that allows users to download YouTube thumbnails.
 * Provides functionality to preview and download thumbnails in different qualities.
 * 
 * @component
 * @returns {JSX.Element} The rendered home page
 */
export default function HomePage() {
  const [url, setUrl] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quality, setQuality] = useState("maxresdefault"); // maxresdefault, sddefault, hqdefault, mqdefault
  const [displayText, setDisplayText] = useState("");
  const fullText = "Download high-quality thumbnails in 4K, HD, or Standard definition instantly.";

  useEffect(() => {
    setDisplayText("");
    let i = 0;
    const typingInterval = setInterval(() => {
      i++;
      setDisplayText(fullText.slice(0, i));
      if (i === fullText.length) {
        clearInterval(typingInterval);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, []);

  // Check for shared URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      const sharedUrl = `https://www.youtube.com/watch?v=${v}`;
      setUrl(sharedUrl);
      handleGetThumbnail(sharedUrl);
    }
  }, []);

  // Reset quality when URL changes
  useEffect(() => {
    if (!url) setThumbnail(null);
  }, [url]);

  /**
   * Extracts the YouTube video ID from a given URL.
   * Supports various YouTube URL formats including short links and embedded URLs.
   * 
   * @param {string} inputUrl - The YouTube URL input by the user
   * @returns {string|boolean} The video ID if found, otherwise false
   */
  const extractVideoId = (inputUrl) => {
    try {
      if (!inputUrl) return false;
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = inputUrl.match(regExp);
      return match && match[7].length === 11 ? match[7] : false;
    } catch (e) {
      return false;
    }
  };

  /**
   * Handles the retrieval of the thumbnail based on the user's input URL.
   * Checks for valid video ID and attempts to load the thumbnail image.
   * Sets appropriate error or success states.
   */
  const handleGetThumbnail = async (inputUrl) => {
    const targetUrl = typeof inputUrl === 'string' ? inputUrl : url;

    setError("");
    setThumbnail(null);
    setLoading(true);

    // Simulate short network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const videoId = extractVideoId(targetUrl);

    if (videoId) {
      // We start by trying the user's selected quality, but we might need to fallback if it doesn't exist
      // For simplicity in this demo, we construct the URL based on selection.
      // In a production app, you might ping the URL to check existence.
      const getUrl = (q) => `https://img.youtube.com/vi/${videoId}/${q}.jpg`;

      const targetUrl = getUrl(quality);

      // Basic check if image loads
      const img = new Image();
      img.src = targetUrl;
      img.onload = () => {
        setThumbnail(targetUrl);
        setLoading(false);
      };
      img.onerror = () => {
        // Fallback logic could go here, but for now we let the user see it might be blank or error
        // Or we try to fallback to hqdefault if maxres fails
        if (quality === "maxresdefault") {
          setThumbnail(getUrl("hqdefault")); // Fallback
        } else {
          setError("Thumbnail resolution not available.");
        }
        setLoading(false);
      };
    } else {
      setError("Please enter a valid YouTube URL");
      setLoading(false);
    }
  };

  /**
   * Downloads the currently displayed thumbnail image.
   * Fetches the image as a blob and triggers a browser download.
   */
  const downloadThumbnail = async () => {
    if (!thumbnail) return;
    setDownloading(true);
    try {
      const response = await fetch(thumbnail, {
        method: "GET",
        headers: {},
        mode: "cors"
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `thumbnail-${quality}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(thumbnail, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Copies the current YouTube URL to the system clipboard.
   * Shows a temporary success state.
   */
  const copyToClipboard = () => {
    const videoId = extractVideoId(url);
    if (videoId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?v=${videoId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-rose-500/30 font-sans relative flex flex-col">
      {/* Background Gradients & Grid - Fixed to stay in place while scrolling */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[100px] rounded-full animate-blob mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-rose-600/20 blur-[100px] rounded-full animate-blob animation-delay-2000 mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/20 blur-[100px] rounded-full animate-blob animation-delay-4000 mix-blend-screen" />
      </div>

      <main className="container mx-auto px-4 py-16 relative z-10 flex flex-col items-center max-w-5xl flex-1">

        {/* Header */}
        <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">YouTube Thumbnail Downloader</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-600 tracking-tighter drop-shadow-sm">
            Grab it. Save it.
          </h1>

          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed h-8">
            {displayText}
            <span className="animate-pulse text-rose-500">|</span>
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl relative mb-12 group z-20 animate-in zoom-in-50 duration-500 delay-150">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative flex flex-col md:flex-row gap-2 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl ring-1 ring-white/10">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Youtube className="h-5 w-5 text-zinc-500" />
              </div>
              <Input
                type="text"
                placeholder="Paste YouTube link here..."
                className="w-full h-14 pl-12 pr-4 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-zinc-600 text-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGetThumbnail()}
              />
            </div>
            <Button
              onClick={handleGetThumbnail}
              className="h-14 px-8 rounded-lg bg-white text-black hover:bg-zinc-200 font-bold text-base transition-all shadow-lg hover:shadow-white/10"
              disabled={loading || !url}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Extract"}
            </Button>
          </div>
        </div>

        {/* Results Area */}
        {thumbnail && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 grid md:grid-cols-2 gap-8 shadow-2xl">

              {/* Preview */}
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative group">
                  <img src={thumbnail} alt="Thumbnail preview" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    PREVIEW
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col justify-center space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Download</h3>
                  <p className="text-zinc-400">Select your preferred quality below.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "maxresdefault", label: "Max HD (4K)" },
                      { id: "sddefault", label: "Standard (SD)" },
                      { id: "hqdefault", label: "High (HQ)" },
                      { id: "mqdefault", label: "Medium (MQ)" },
                    ].map((q) => (
                      <button
                        key={q.id}
                        onClick={() => {
                          setQuality(q.id);
                          // We re-fetch or just re-set the thumbnail URL based on selection
                          // In a real app we might want to verify it exists again, but here we just update request
                          const videoId = extractVideoId(url);
                          if (videoId) setThumbnail(`https://img.youtube.com/vi/${videoId}/${q.id}.jpg`);
                        }}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${quality === q.id ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={downloadThumbnail}
                      disabled={downloading}
                      className="h-14 w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white rounded-xl text-lg font-semibold shadow-lg shadow-rose-900/20"
                    >
                      {downloading ? <Loader2 className="mr-2 animate-spin" /> : <Download className="mr-2" />}
                      {downloading ? "Downloading..." : "Download Selected"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={copyToClipboard}
                      className="h-12 w-full text-zinc-400 hover:text-white rounded-xl hover:bg-white/5"
                    >
                      {copied ? "Link Copied" : "Copy Shared Link"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer info/How to */}
        {!thumbnail && (
          <div className="mt-20 opacity-60 hover:opacity-100 transition-opacity">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Copy className="w-10 h-10 text-white relative z-10 group-hover:animate-heartbeat" />,
                  title: "Copy URL",
                  desc: "Find a video on YouTube and copy its link from the address bar.",
                  color: "bg-blue-500",
                  shadow: "shadow-blue-500/20"
                },
                {
                  icon: <Youtube className="w-10 h-10 text-white relative z-10 group-hover:animate-wiggle" />,
                  title: "Paste Link",
                  desc: "Paste the link into the search box above and press enter.",
                  color: "bg-red-500",
                  shadow: "shadow-red-500/20"
                },
                {
                  icon: <Download className="w-10 h-10 text-white relative z-10 group-hover:animate-bounce" />,
                  title: "Download",
                  desc: "Instantly preview and download the high-quality thumbnail.",
                  color: "bg-green-500",
                  shadow: "shadow-green-500/20"
                }
              ].map((item, i) => (
                <div key={i} className="group bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:bg-zinc-900/50 transition-all hover:-translate-y-1 duration-300 relative overflow-hidden">
                  <div className={`mb-6 p-4 rounded-2xl w-fit border border-white/10 transition-all duration-300 relative ${item.shadow} shadow-lg group-hover:scale-105`}>
                    {/* Inner Glow Blob */}
                    <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-500 ${item.color}`} />
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-rose-400 transition-colors">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
