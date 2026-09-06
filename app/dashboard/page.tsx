'use client';

import React, { useState, useRef, useEffect, SVGProps } from 'react';
import { Upload, Trash2, Send, ImageIcon, Video, Crop, Sparkles, FileSpreadsheet, Plus, Layers, Calendar, Clock } from 'lucide-react';
import Papa from 'papaparse';
import Sidebar from '@/components/Sidebar';
import { useAccounts } from '@/lib/account-context';
import { MentionTextarea } from '@/components/MentionTextarea';
import ImageCropper from '@/components/ImageCropper';
import { createClient } from '@/lib/supabase-browser';

const Facebook = (props: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Instagram = (props: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const BLUE = "#1d6bf3";
const SKY = "#0ea5e9";

const PLATFORMS = [
  { id: "fb_page", label: "Facebook Page", icon: Facebook, color: "#1877F2" },
  { id: "ig_feed", label: "Instagram Feed", icon: Instagram, color: "#E1306C" },
  { id: "ig_story", label: "Instagram Story", icon: Instagram, color: "#E1306C" },
];

interface PostItem {
  id: string;
  caption: string;
  files: File[];
  imagePreviews: string[];
  date: string;
  time: string;
  selectedPlatforms: string[];
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{
        background: checked ? BLUE : "#e2e8f0",
        boxShadow: checked ? `0 0 0 3px rgba(29,107,243,0.15)` : "none",
      }}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function MobilePreview({ caption, images, isVideo, platforms, itemIndex }: { caption: string; images: string[]; isVideo?: boolean; platforms: string[]; itemIndex: number }) {
  const activePlatform = platforms.includes("ig_feed") || platforms.includes("ig_story") ? "instagram" : "facebook";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
        <span>Live Preview</span>
        <span className="bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[9px]">Post #{itemIndex + 1}</span>
      </div>
      <div
        className="w-52 rounded-[2.25rem] border-[3px] border-slate-800 overflow-hidden flex flex-col bg-white"
        style={{ boxShadow: "0 20px 60px rgba(15,28,53,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
      >
        {/* Notch */}
        <div className="flex justify-center pt-3 pb-1 bg-slate-900">
          <div className="w-16 h-4 rounded-full bg-black" />
        </div>

        {/* App header */}
        <div className="px-3 py-2 flex items-center gap-2 border-b border-slate-100 bg-white">
          {activePlatform === "instagram" ? (
            <Instagram size={13} style={{ color: "#E1306C" }} />
          ) : (
            <Facebook size={13} style={{ color: "#1877F2" }} />
          )}
          <span className="text-[10px] font-semibold text-slate-600">
            {activePlatform === "instagram" ? "Instagram" : "Facebook"}
          </span>
        </div>

        {/* Post */}
        <div className="px-3 py-2 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${SKY})` }}
            />
            <div>
              <div className="text-[9px] font-semibold text-slate-800">YourBrand</div>
              <div className="text-[8px] text-slate-400">Scheduled</div>
            </div>
          </div>

          {images.length > 0 ? (
            <div className="rounded-lg overflow-hidden mb-2 bg-slate-100 relative">
              {isVideo ? (
                <video src={images[0]} className="w-full h-24 object-cover" muted playsInline />
              ) : (
                <img src={images[0]} alt="Post preview" className="w-full h-24 object-cover" />
              )}
              {images.length > 1 && (
                <div className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">
                  1/{images.length}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg h-24 mb-2 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200">
              <ImageIcon size={18} className="text-slate-300" />
            </div>
          )}

          <p className="text-[9px] leading-relaxed text-slate-600 line-clamp-3 whitespace-pre-wrap">
            {caption || "Your caption will appear here…"}
          </p>

          <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
            <span className="text-[8px] text-slate-400">♡ Like</span>
            <span className="text-[8px] text-slate-400">💬 Comment</span>
            <span className="text-[8px] text-slate-400">↗ Share</span>
          </div>
        </div>

        {/* Home bar */}
        <div className="h-5 bg-white flex items-end justify-center pb-1.5">
          <div className="w-16 h-1 rounded-full bg-slate-300" />
        </div>
      </div>

      {platforms.length === 0 && (
        <p className="text-[11px] text-slate-400 text-center max-w-[180px] mt-1">
          Select a platform above to preview your post
        </p>
      )}
    </div>
  );
}

const createDefaultItem = (offsetHours: number = 0): PostItem => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1 + offsetHours * 60);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return {
    id: Math.random().toString(36).substring(7),
    caption: '',
    files: [],
    imagePreviews: [],
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
    selectedPlatforms: ['ig_feed'],
  };
};

export default function Dashboard() {
  const { activeAccount } = useAccounts();
  
  const [items, setItems] = useState<PostItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<{ itemIdx: number; fileIdx: number } | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems([createDefaultItem(0)]);
  }, []);

  const activeItem = items[activeItemIndex] || items[0] || createDefaultItem(0);

  const updateActiveItem = (updater: (prev: PostItem) => PostItem) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      if (next[activeItemIndex]) {
        next[activeItemIndex] = updater(next[activeItemIndex]);
      }
      return next;
    });
  };

  const addPostItem = () => {
    const newItem = createDefaultItem(items.length);
    setItems((prev) => [...prev, newItem]);
    setActiveItemIndex(items.length);
  };

  const removePostItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (activeItemIndex >= items.length - 1) {
      setActiveItemIndex(Math.max(0, items.length - 2));
    }
  };

  const togglePlatform = (id: string) => {
    updateActiveItem((item) => {
      const current = item.selectedPlatforms;
      const next = current.includes(id)
        ? current.filter((p) => p !== id)
        : [...current, id];
      return { ...item, selectedPlatforms: next };
    });
  };

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const newFiles = Array.from(selectedFiles);
    updateActiveItem((item) => {
      const updatedFiles = [...item.files, ...newFiles].slice(0, 10);
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      const updatedPreviews = [...item.imagePreviews, ...newPreviews].slice(0, 10);
      return { ...item, files: updatedFiles, imagePreviews: updatedPreviews };
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const removeFile = (fileIdx: number) => {
    updateActiveItem((item) => {
      const updatedFiles = item.files.filter((_, i) => i !== fileIdx);
      const updatedPreviews = item.imagePreviews.filter((_, i) => i !== fileIdx);
      return { ...item, files: updatedFiles, imagePreviews: updatedPreviews };
    });
  };

  const handleSaveCrop = (croppedFile: File, croppedUrl: string) => {
    if (!editingImageIndex) return;
    const { itemIdx, fileIdx } = editingImageIndex;

    setItems((prevItems) => {
      const next = [...prevItems];
      if (next[itemIdx]) {
        const item = next[itemIdx];
        const newFiles = [...item.files];
        newFiles[fileIdx] = croppedFile;

        const newPreviews = [...item.imagePreviews];
        if (newPreviews[fileIdx]?.startsWith('blob:')) {
          URL.revokeObjectURL(newPreviews[fileIdx]);
        }
        newPreviews[fileIdx] = croppedUrl;

        next[itemIdx] = { ...item, files: newFiles, imagePreviews: newPreviews };
      }
      return next;
    });

    setEditingImageIndex(null);
  };

  const handleImageDropReorder = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    updateActiveItem((item) => {
      const newFiles = [...item.files];
      const [draggedFile] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, draggedFile);

      const newPreviews = [...item.imagePreviews];
      const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
      newPreviews.splice(targetIndex, 0, draggedPreview);

      return { ...item, files: newFiles, imagePreviews: newPreviews };
    });

    setDraggedIndex(null);
  };

  const appendToCaption = (text: string) => {
    updateActiveItem((item) => ({ ...item, caption: item.caption + text }));
    captionRef.current?.focus();
  };

  const generateCaption = async () => {
    if (!activeItem.caption) {
      alert("Please type a short prompt in the caption box first!");
      return;
    }
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activeItem.caption })
      });
      const data = await res.json();
      if (res.ok) {
        updateActiveItem((item) => ({ ...item, caption: data.caption }));
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate caption');
    }
    setIsGeneratingCaption(false);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeAccount) {
      alert("No active account selected. Connect an account first in settings.");
      return;
    }

    setIsUploadingCSV(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as any[];
          const payloads = [];

          let rowIndex = 1;
          for (const row of rows) {
            const dateStr = row['Date'];
            const timeStr = row['Time'];
            const caption = row['Caption'] || '';

            const mirrorUrl = async (url: string): Promise<string> => {
              if (!url) return url;
              const isDrive = url.includes('drive.google.com') || url.includes('drive.usercontent.google.com');
              if (!isDrive) return url;
              try {
                const res = await fetch('/api/mirror-media', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url }),
                });
                const data = await res.json();
                if (data.publicUrl) return data.publicUrl;
                return url;
              } catch (e) {
                return url;
              }
            };

            const rawImages = row['Image Links'] ? String(row['Image Links']).split(',').map((u: string) => u.trim()).filter(Boolean) : [];
            const rawVideos = row['Video Links'] ? String(row['Video Links']).split(',').map((u: string) => u.trim()).filter(Boolean) : [];

            const images = await Promise.all(rawImages.map(mirrorUrl));
            const videos = await Promise.all(rawVideos.map(mirrorUrl));
            const platformStr = String(row['Platforms'] || '');

            if (!dateStr || !timeStr) {
              rowIndex++;
              continue;
            }

            let finalDateStr = dateStr;
            let finalTimeStr = timeStr;

            const timeMatch = timeStr.match(/(\d+):(\d+)(?::\d+)?\s*(AM|PM)?/i);
            if (timeMatch) {
              let hours = parseInt(timeMatch[1], 10);
              const mins = timeMatch[2];
              const ampm = timeMatch[3]?.toUpperCase();
              if (ampm === 'PM' && hours < 12) hours += 12;
              if (ampm === 'AM' && hours === 12) hours = 0;
              finalTimeStr = `${String(hours).padStart(2, '0')}:${mins}`;
            }

            const dateParts = dateStr.split(/[-/]/);
            if (dateParts.length === 3) {
              let y = dateParts[0];
              let m = dateParts[1];
              let d = dateParts[2];

              if (y.length !== 4) {
                y = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
                if (parseInt(dateParts[0]) > 12) {
                  d = dateParts[0];
                  m = dateParts[1];
                } else if (parseInt(dateParts[1]) > 12) {
                  m = dateParts[0];
                  d = dateParts[1];
                } else {
                  d = dateParts[0];
                  m = dateParts[1];
                }
              }
              finalDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            }

            let parsedDate = new Date(`${finalDateStr}T${finalTimeStr}`);

            if (isNaN(parsedDate.getTime())) {
              parsedDate = new Date(`${dateStr.replace(/-/g, '/')} ${timeStr}`);
            }

            if (isNaN(parsedDate.getTime()) && dateParts.length === 3) {
              let y = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
              let m = dateParts[1];
              let d = dateParts[0];
              parsedDate = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${finalTimeStr}`);
            }

            if (isNaN(parsedDate.getTime())) {
              alert(`Row ${rowIndex} has an invalid Date or Time format. Please use YYYY-MM-DD and HH:MM.`);
              setIsUploadingCSV(false);
              if (csvFileRef.current) csvFileRef.current.value = '';
              return;
            }

            const scheduledAt = parsedDate.toISOString();
            const hasIgFeed = platformStr.includes('ig_feed');
            const hasIgStory = platformStr.includes('ig_story');
            const hasFbPage = platformStr.includes('fb_page');

            const mediaUrls = videos.length > 0 ? videos : images;
            const mediaType = videos.length > 0 ? 'VIDEO' : 'IMAGE';

            if (hasIgFeed || hasFbPage) {
              const formatType = mediaUrls.length > 1 ? 'CAROUSEL' : 'FEED';
              payloads.push({
                social_account_id: activeAccount.id,
                caption,
                scheduled_at: scheduledAt,
                media_url: JSON.stringify(mediaUrls),
                media_type: mediaType,
                format_type: formatType,
                post_to_ig: hasIgFeed,
                post_to_fb: hasFbPage
              });
            }

            if (hasIgStory) {
              payloads.push({
                social_account_id: activeAccount.id,
                caption,
                scheduled_at: scheduledAt,
                media_url: JSON.stringify(mediaUrls),
                media_type: mediaType,
                format_type: 'STORY',
                post_to_ig: true,
                post_to_fb: false
              });
            }
            rowIndex++;
          }

          if (payloads.length === 0) {
            alert('No valid posts found in CSV. Make sure you have Date, Time, and Platforms filled out.');
            setIsUploadingCSV(false);
            return;
          }

          const res = await fetch('/api/posts/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ posts: payloads })
          });
          const data = await res.json();
          if (res.ok) {
            alert(`Successfully scheduled ${data.count} posts!`);
          } else {
            alert(data.message || data.error || 'Failed to bulk schedule');
          }
        } catch (err: any) {
          console.error(err);
          alert('Failed to parse and upload CSV');
        } finally {
          setIsUploadingCSV(false);
          if (csvFileRef.current) csvFileRef.current.value = '';
        }
      }
    });
  };

  const handleSchedulePost = async () => {
    if (!activeAccount) {
      alert("No active account selected. Connect an account first in settings.");
      return;
    }

    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.selectedPlatforms.length === 0) {
        alert(`Post #${i + 1}: Select at least one platform.`);
        setActiveItemIndex(i);
        return;
      }
      if (!item.date || !item.time) {
        alert(`Post #${i + 1}: Select a date and time.`);
        setActiveItemIndex(i);
        return;
      }
      if (item.files.length === 0) {
        alert(`Post #${i + 1}: Please upload at least one image or video.`);
        setActiveItemIndex(i);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const allPayloads = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const publicUrls: string[] = [];
        
        for (const f of item.files) {
          const ext = f.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

          const presignRes = await fetch('/api/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
          });
          
          let presignData;
          try {
            presignData = await presignRes.json();
          } catch (e) {
            const text = await presignRes.text();
            throw new Error(`Expected JSON from presign. Status: ${presignRes.status}, preview: ${text.substring(0, 100)}`);
          }

          if (!presignRes.ok) {
            throw new Error(presignData.error || 'Failed to get upload URL');
          }

          try {
            const { error: uploadErr } = await supabase.storage
              .from('media')
              .uploadToSignedUrl(presignData.path, presignData.token, f);
              
            if (uploadErr) {
              throw new Error(`Upload failed: ${uploadErr.message}`);
            }
          } catch (uploadException: any) {
            throw new Error(`Supabase Storage Upload failed: ${uploadException.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(presignData.path);
            
          publicUrls.push(publicUrl);
        }

        const mediaType = item.files[0].type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        const scheduledAt = new Date(`${item.date}T${item.time}`).toISOString();

        const hasIgFeed = item.selectedPlatforms.includes('ig_feed');
        const hasIgStory = item.selectedPlatforms.includes('ig_story');
        const hasFbPage = item.selectedPlatforms.includes('fb_page');

        if (hasIgFeed || hasFbPage) {
          const formatType = item.files.length > 1 ? 'CAROUSEL' : 'FEED';
          allPayloads.push({
            social_account_id: activeAccount.id,
            caption: item.caption,
            scheduled_at: scheduledAt,
            media_url: JSON.stringify(publicUrls),
            media_type: mediaType,
            format_type: formatType,
            post_to_ig: hasIgFeed,
            post_to_fb: hasFbPage
          });
        }

        if (hasIgStory) {
          allPayloads.push({
            social_account_id: activeAccount.id,
            caption: item.caption,
            scheduled_at: scheduledAt,
            media_url: JSON.stringify(publicUrls),
            media_type: mediaType,
            format_type: 'STORY',
            post_to_ig: true,
            post_to_fb: false
          });
        }
      }

      if (allPayloads.length === 0) {
        alert("No valid post payloads generated.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: allPayloads })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      alert(`Successfully scheduled ${items.length} post${items.length > 1 ? 's' : ''}!`);
      setItems([createDefaultItem(0)]);
      setActiveItemIndex(0);
      
    } catch (e: any) {
      console.error(e);
      alert('Failed to schedule posts: ' + e.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#f0f4fa] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto flex gap-8">
          
          {/* Left — Batch Queue Composer */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">New Posts Queue</h1>
                <p className="text-xs text-slate-500 mt-0.5">Schedule multiple videos & photos at different dates & times</p>
              </div>
              <div className="flex items-center gap-3">
                <a 
                  href="/bulk_post_template.csv" 
                  download 
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2 transition-colors"
                >
                  Download Template
                </a>
                <button 
                  onClick={() => csvFileRef.current?.click()}
                  disabled={isUploadingCSV}
                  className="text-sm font-semibold bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isUploadingCSV ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileSpreadsheet size={16} className="text-emerald-600" />
                  )}
                  {isUploadingCSV ? 'Uploading...' : 'Bulk Upload CSV'}
                </button>
                <input ref={csvFileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              </div>
            </div>

            {/* Post Queue Tabs / Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {items.map((item, idx) => {
                const isActive = idx === activeItemIndex;
                const hasMedia = item.files.length > 0;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItemIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Layers size={14} className={isActive ? 'text-white' : 'text-blue-500'} />
                    <span>Post #{idx + 1}</span>
                    {hasMedia && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.files.length} {item.files[0]?.type?.startsWith('video/') ? 'vid' : 'img'}
                      </span>
                    )}
                    {items.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePostItem(idx);
                        }}
                        className={`ml-1 p-1 rounded-md transition-colors ${
                          isActive ? 'hover:bg-blue-700 text-white/80' : 'hover:bg-slate-200 text-slate-400'
                        }`}
                        title="Delete post from queue"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                onClick={addPostItem}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors flex-shrink-0"
              >
                <Plus size={14} />
                <span>Add Post</span>
              </button>
            </div>
            
            {/* Active Item Card Container */}
            <div className="space-y-6">
              {/* Caption */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Caption (Post #{activeItemIndex + 1})
                  </label>
                  <button
                    onClick={generateCaption}
                    disabled={isGeneratingCaption}
                    className="text-[11px] font-semibold text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 hover:shadow-md hover:opacity-90 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                      boxShadow: "0 2px 10px rgba(236, 72, 153, 0.2)"
                    }}
                    title="Type a short prompt below and click to generate"
                  >
                    {isGeneratingCaption ? (
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-white" />
                        AI Generate Caption
                      </span>
                    )}
                  </button>
                </div>
                <MentionTextarea
                  ref={captionRef}
                  value={activeItem.caption}
                  onChange={(val) => updateActiveItem((item) => ({ ...item, caption: val }))}
                  placeholder="Write something your audience will love…"
                  rows={5}
                  className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-300 resize-none outline-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => appendToCaption('#')}
                      className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 font-medium"
                    >
                      # Hashtags
                    </button>
                    <button 
                      onClick={() => appendToCaption('@')}
                      className="text-[11px] text-slate-400 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 font-medium"
                    >
                      @ Mention
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">{activeItem.caption.length} / 2200</span>
                </div>
              </Card>

              {/* Media */}
              <Card className="p-6">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-3">
                  Media for Post #{activeItemIndex + 1}
                </label>
                {activeItem.imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {activeItem.imagePreviews.map((preview, idx) => (
                        <div 
                          key={idx} 
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedIndex(idx);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleImageDropReorder(idx);
                          }}
                          className={`group relative rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 w-32 h-32 border border-slate-200 cursor-move transition-transform ${draggedIndex === idx ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
                        >
                          {activeItem.files[idx]?.type?.startsWith('video/') ? (
                            <video src={preview} className="w-full h-full object-cover" />
                          ) : (
                            <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!activeItem.files[idx]?.type?.startsWith('video/') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingImageIndex({ itemIdx: activeItemIndex, fileIdx: idx }); }}
                                className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-blue-500 shadow-sm transition-colors"
                                title="Crop image"
                              >
                                <Crop size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                              className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 hover:text-red-500 shadow-sm transition-colors"
                              title="Remove media"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {activeItem.imagePreviews.length < 10 && (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl h-16 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                          isDragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                      >
                        <p className="text-sm text-slate-500 font-medium">+ Click to add more or drop here</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(29,107,243,0.08)", border: "1px solid rgba(29,107,243,0.15)" }}
                    >
                      <Upload size={18} style={{ color: BLUE }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-500 font-medium">Drop photos or videos for Post #{activeItemIndex + 1}</p>
                      <p className="text-xs text-slate-400 mt-0.5">or click to browse · PNG, JPG, MP4 (up to 10)</p>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} />
              </Card>

              {/* Platforms */}
              <Card className="p-6">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
                  Publish To (Post #{activeItemIndex + 1})
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {PLATFORMS.map((p) => {
                    const active = activeItem.selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200"
                        style={{
                          border: active ? `1.5px solid ${BLUE}40` : "1.5px solid #e2e8f0",
                          background: active ? `${BLUE}08` : "transparent",
                        }}
                      >
                        <p.icon size={16} style={{ color: active ? p.color : "#94a3b8" }} />
                        <span className={`text-sm font-medium ${active ? "text-slate-800" : "text-slate-400"}`}>
                          {p.label}
                        </span>
                        <div className="ml-auto">
                          <Toggle checked={active} onChange={() => togglePlatform(p.id)} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Schedule */}
              <Card className="p-6">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">
                  Schedule Slot (Post #{activeItemIndex + 1})
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">Date</p>
                    <input
                      type="date"
                      value={activeItem.date}
                      onChange={(e) => updateActiveItem((item) => ({ ...item, date: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">Time</p>
                    <input
                      type="time"
                      value={activeItem.time}
                      onChange={(e) => updateActiveItem((item) => ({ ...item, time: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={addPostItem}
                className="flex-1 py-3.5 rounded-2xl font-semibold border-2 border-dashed border-blue-300 text-blue-600 bg-blue-50/50 hover:bg-blue-50 text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Another Post Slot
              </button>
              <button
                onClick={handleSchedulePost}
                disabled={isSubmitting}
                className="flex-[2] py-4 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2.5 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${SKY} 100%)`,
                  boxShadow: `0 8px 24px rgba(29,107,243,0.3)`,
                }}
              >
                <Send size={16} />
                {isSubmitting
                  ? "Scheduling Posts..."
                  : `Schedule All (${items.length} Post${items.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>

          {/* Right — Live Mobile Preview */}
          <div className="w-68 flex-shrink-0 pt-10" style={{ width: "272px" }}>
            <Card className="p-6 sticky top-8">
              <MobilePreview
                caption={activeItem.caption}
                images={activeItem.imagePreviews}
                isVideo={activeItem.files[0]?.type?.startsWith('video/')}
                platforms={activeItem.selectedPlatforms}
                itemIndex={activeItemIndex}
              />
            </Card>
          </div>
        </div>
      </div>

      {editingImageIndex !== null && (
        <ImageCropper
          imageSrc={items[editingImageIndex.itemIdx]?.imagePreviews[editingImageIndex.fileIdx] || ''}
          fileName={items[editingImageIndex.itemIdx]?.files[editingImageIndex.fileIdx]?.name || 'cropped.jpg'}
          onClose={() => setEditingImageIndex(null)}
          onCropComplete={handleSaveCrop}
        />
      )}
    </div>
  );
}
