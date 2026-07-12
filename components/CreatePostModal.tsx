import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Sparkles, Loader2, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useAccounts } from '@/lib/account-context';
import { createClient } from '@/lib/supabase-browser';

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Expected JSON but got HTML/text (Status: ${res.status}). Response preview: ${text.substring(0, 100)}`);
  }
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

type TabType = 'upload' | 'ai';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { accounts, activeAccount } = useAccounts();
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [formatType, setFormatType] = useState<'FEED' | 'STORY' | 'CAROUSEL'>('FEED');
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  
  // Update default selected account when modal opens
  React.useEffect(() => {
    if (isOpen && activeAccount && selectedAccounts.length === 0) {
      setSelectedAccounts([activeAccount.id]);
    }
  }, [isOpen, activeAccount]);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...acceptedFiles].slice(0, 10);
      setUploadedFiles(newFiles);
      setUploadPreviews(newFiles.map(f => URL.createObjectURL(f)));
      if (newFiles.length > 1) {
        setFormatType('CAROUSEL');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 10
  });

  const generateImage = async () => {
    if (!aiPrompt) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await safeJson(res);
      if (res.ok) {
        setPreviewUrl(data.url);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to generate image');
    }
    setIsGeneratingImage(false);
  };

  const generateCaption = async () => {
    if (!aiPrompt && !caption) return;
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt || caption || 'A beautiful day' })
      });
      const data = await safeJson(res);
      if (res.ok) {
        setCaption(data.caption);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGeneratingCaption(false);
  };

  const toggleAccount = (id: string) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter(a => a !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const handleSubmit = async () => {
    if (selectedAccounts.length === 0) {
      alert('Please select at least one account to post to');
      return;
    }
    if (!scheduledAt) {
      alert('Please select a date and time');
      return;
    }
    if (activeTab === 'ai' && !previewUrl) {
      alert('Please generate and approve an image first');
      return;
    }
    if (activeTab === 'upload' && uploadedFiles.length === 0) {
      alert('Please upload a file');
      return;
    }

    setIsSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      let mediaType = 'IMAGE';

      if (activeTab === 'upload' && uploadedFiles.length > 0) {
        const supabase = createClient();
        for (const file of uploadedFiles) {
          const ext = file.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
          
          // 1. Get signed URL from our server (bypasses RLS)
          const presignRes = await fetch('/api/upload/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
          });
          
          const presignData = await safeJson(presignRes);
          if (!presignRes.ok) {
            throw new Error(presignData.error || 'Failed to get upload URL');
          }

          // 2. Upload directly to Supabase using the signed URL
          try {
            const { error: uploadErr } = await supabase.storage
              .from('media')
              .uploadToSignedUrl(presignData.path, presignData.token, file);
              
            if (uploadErr) {
              throw new Error(`Upload failed: ${uploadErr.message}`);
            }
          } catch (uploadException: any) {
            throw new Error(`Supabase Storage Upload failed: ${uploadException.message}`);
          }

          // 3. Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(presignData.path);
            
          mediaUrls.push(publicUrl);
        }
        mediaType = uploadedFiles[0].type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      } else {
        mediaUrls = [previewUrl];
        mediaType = 'IMAGE';
      }

      // Create a post for each selected account
      for (const accountId of selectedAccounts) {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            social_account_id: accountId,
            prompt: activeTab === 'ai' ? aiPrompt : null,
            caption,
            scheduled_at: new Date(scheduledAt).toISOString(),
            media_url: JSON.stringify(mediaUrls),
            media_type: mediaType,
            format_type: formatType
          })
        });

        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data.error || 'Failed to schedule post');
        }
      }

      onPostCreated();
      onClose();
      // Reset form
      setCaption('');
      setScheduledAt('');
      setAiPrompt('');
      setPreviewUrl('');
      setUploadedFiles([]);
      setUploadPreviews([]);
    } catch (e: any) {
      console.error(e);
      alert('[v2] Failed to schedule post: ' + e.message);
    }
    setIsSubmitting(false);
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Create New Post</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upload My Own
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Generate with AI
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Post To</label>
            <div className="flex flex-wrap gap-2">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => toggleAccount(acc.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${selectedAccounts.includes(acc.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${selectedAccounts.includes(acc.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {selectedAccounts.includes(acc.id) && <Check size={12} className="text-white" />}
                  </div>
                  {acc.profile_picture_url ? (
                    <img src={acc.profile_picture_url} className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                      {acc.account_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{acc.account_name}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <select 
                    value={formatType}
                    onChange={(e: any) => {
                      setFormatType(e.target.value);
                      if (e.target.value !== 'CAROUSEL' && uploadedFiles.length > 1) {
                        setUploadedFiles([uploadedFiles[0]]);
                        setUploadPreviews([uploadPreviews[0]]);
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
                  >
                    <option value="FEED">Post / Reel</option>
                    <option value="STORY">Story</option>
                    <option value="CAROUSEL">Carousel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
                {uploadPreviews.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {uploadPreviews.map((preview, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-32 w-32 flex-shrink-0 flex items-center justify-center">
                          <img src={preview} alt="Preview" className="max-h-full object-contain" />
                          <button 
                            onClick={() => { 
                              const newFiles = [...uploadedFiles];
                              const newPreviews = [...uploadPreviews];
                              newFiles.splice(idx, 1);
                              newPreviews.splice(idx, 1);
                              setUploadedFiles(newFiles); 
                              setUploadPreviews(newPreviews); 
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {uploadPreviews.length < 10 && (
                      <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                      >
                        <input {...getInputProps()} />
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-blue-600">Click to add more</span> or drag and drop
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                  >
                    <input {...getInputProps()} />
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 up to 50MB</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Prompt</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g., A glowing neon bat symbol over a futuristic city"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                  />
                  <button
                    onClick={generateImage}
                    disabled={isGeneratingImage || !aiPrompt}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    Generate
                  </button>
                </div>
              </div>

              {previewUrl && (
                <div className="space-y-3">
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square flex items-center justify-center">
                    <img src={previewUrl} alt="AI Generation" className="max-h-full object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={generateImage}
                      disabled={isGeneratingImage}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Caption</label>
              <button
                onClick={generateCaption}
                disabled={isGeneratingCaption}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
              >
                {isGeneratingCaption ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Auto-Caption
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="Write a caption or use AI to generate one..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (activeTab === 'ai' && !previewUrl) || (activeTab === 'upload' && uploadedFiles.length === 0)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Approve & Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
