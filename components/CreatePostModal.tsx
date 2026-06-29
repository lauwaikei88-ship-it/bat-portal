import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Sparkles, Loader2, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

type TabType = 'upload' | 'ai';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 1
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
      const data = await res.json();
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
      const data = await res.json();
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

  const handleSubmit = async () => {
    if (!scheduledAt) {
      alert('Please select a date and time');
      return;
    }
    if (activeTab === 'ai' && !previewUrl) {
      alert('Please generate and approve an image first');
      return;
    }
    if (activeTab === 'upload' && !uploadedFile) {
      alert('Please upload a file');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create post logic goes here. If uploading, we would upload to Supabase storage first.
      // For now, we will just pass the url or a placeholder.
      const mediaUrl = activeTab === 'ai' ? previewUrl : uploadPreview; 
      
      let mediaType = 'IMAGE';
      if (activeTab === 'upload' && uploadedFile) {
        mediaType = uploadedFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
      }

      // In a real implementation we upload the file to Supabase Storage if activeTab === 'upload'
      // Since this is a UI pivot demo, we'll simulate the save
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeTab === 'ai' ? aiPrompt : null,
          caption,
          scheduled_at: new Date(scheduledAt).toISOString(),
          media_url: mediaUrl,
          media_type: mediaType
        })
      });

      if (res.ok) {
        onPostCreated();
        onClose();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to schedule post');
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
          {activeTab === 'upload' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Media</label>
              {uploadPreview ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                  <img src={uploadPreview} alt="Preview" className="max-h-full object-contain" />
                  <button 
                    onClick={() => { setUploadedFile(null); setUploadPreview(''); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={16} />
                  </button>
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
            disabled={isSubmitting || (activeTab === 'ai' && !previewUrl) || (activeTab === 'upload' && !uploadPreview)}
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
