import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Play, MoreVertical } from 'lucide-react';


type VideosType = Array<{ id: string, name: string, thumbnail: string, duration: number }>

export default function Videos() {
  const [selectedVideo, setSelectedVideo] = useState<VideosType[0] | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<VideosType>([])
  const videoRef = useRef(null);
  useEffect(() => {
    fetch('http://127.0.0.1:8000/videos').then(async res => {
      const data = await res.json()
      setVideos(data)
    })
  }, [])


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedVideo(file)
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/process_video', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const stream = response.body?.getReader();
        const reader = new ReadableStream({
          start(controller) {
            function push() {
              stream?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                push();
              });
            }
            push();
          },
        });
        const videoUrl = URL.createObjectURL(new Response(reader));
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
        }
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const totalSize = file.size;
    let progress = 0;
    const interval = setInterval(() => {
      progress += (totalSize / 100) * 5;
      const percentage = Math.min((progress / totalSize) * 100, 100);
      setUploadProgress(percentage);

      if (percentage >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 200);
  };

  const resetUpload = () => {
    if (videoURL) {
      URL.revokeObjectURL(videoURL);
    }
    setSelectedVideo(null);
    setVideoURL(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Video Management</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload New
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative aspect-video group">
              <img
                src={video.thumbnail}
                alt={video.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="p-3 bg-white rounded-full" onClick={() => setSelectedVideo(video)}>
                  <Play className="w-6 h-6 text-gray-800" />
                </button>
              </div>
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-sm px-2 py-1 rounded">
                {video.duration}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">{video.name}</h3>
                  {/* <p className="text-sm text-gray-500">{video.views.toLocaleString()} views</p> */}
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal/Section */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Upload Video</h3>
              <button
                onClick={resetUpload}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <video
              // src={videoURL || undefined}
              controls
              autoPlay
              className="w-full rounded-lg bg-black mb-4"
            >
              <source src={'http://127.0.0.1:8000/videos/' + selectedVideo.id} type="video/mp4" />
              Your browser does not support the video tag
            </video>

            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-2">File Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>File name: {selectedVideo.name}</p>
                <p>Size: {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p>Type: {selectedVideo.type}</p>
              </div>
            </div> */}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}