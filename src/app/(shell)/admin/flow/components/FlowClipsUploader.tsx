"use client";

import { useState, useRef } from "react";
import { Upload, Video, Trash2, CheckCircle2, AlertCircle, FileVideo, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadFlowClips } from "@/lib/api/flow-client";

interface FlowClipsUploaderProps {
  clipS3Keys: string[];
  onChangeClipKeys: (keys: string[]) => void;
  disabled?: boolean;
}

export function FlowClipsUploader({
  clipS3Keys,
  onChangeClipKeys,
  disabled = false,
}: FlowClipsUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Natural alphanumeric sort helper (a to z)
  const sortFilesAlphanumerically = (files: File[]): File[] => {
    return [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );
  };

  const handleFilesAdded = (incomingFiles: FileList | File[]) => {
    setUploadError(null);
    const newFilesList = Array.from(incomingFiles);
    // Combine existing and new files, deduplicate by filename, and sort alphanumerically
    const fileMap = new Map<string, File>();
    for (const f of selectedFiles) {
      fileMap.set(f.name, f);
    }
    for (const f of newFilesList) {
      fileMap.set(f.name, f);
    }

    const sorted = sortFilesAlphanumerically(Array.from(fileMap.values())).slice(0, 10);
    setSelectedFiles(sorted);
    // Clear S3 keys since files changed
    if (clipS3Keys.length > 0) {
      onChangeClipKeys([]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(sortFilesAlphanumerically(updated));
    if (clipS3Keys.length > 0) {
      onChangeClipKeys([]);
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    onChangeClipKeys([]);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length !== 10) {
      setUploadError("Exactly 10 video clips are required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await uploadFlowClips(selectedFiles);
      onChangeClipKeys(response.clip_s3_keys);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload video clips";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseSampleKeys = () => {
    const sampleKeys = Array.from(
      { length: 10 },
      (_, i) => `flow-clips/sample/clip_${String(i + 1).padStart(2, "0")}.mp4`
    );
    onChangeClipKeys(sampleKeys);
    setSelectedFiles([]);
    setUploadError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const has10Keys = clipS3Keys.length === 10;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileVideo className="h-5 w-5 text-accent-primary" />
          <h3 className="text-body font-semibold text-text-primary">
            Video Clips (Exactly 10 Clips)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUseSampleKeys}
            disabled={disabled || isUploading}
            className="text-caption text-accent-primary hover:text-accent-secondary"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Use Sample S3 Keys
          </Button>
          {(selectedFiles.length > 0 || clipS3Keys.length > 0) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled || isUploading}
              className="text-caption text-text-muted hover:text-red-500"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {has10Keys ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span className="text-body font-medium">
                10 S3 Clip Keys Ready for Flow Job
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled || isUploading}
            >
              Change Clips
            </Button>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 text-micro font-mono text-text-secondary bg-surface-panel/80 p-2.5 rounded-lg border border-border-default">
            {clipS3Keys.map((key, idx) => (
              <div key={key + idx} className="truncate">
                <span className="text-accent-primary font-bold mr-2">#{idx + 1}</span>
                {key}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              disabled || isUploading
                ? "border-border-default opacity-50 cursor-not-allowed bg-surface-panel/30"
                : "border-border-default hover:border-accent-primary bg-surface-panel/50 hover:bg-surface-hover"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
              multiple
              onChange={handleFileInputChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-accent-muted flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="h-6 w-6 text-accent-primary" />
            </div>
            <p className="text-body font-medium text-text-primary">
              Click or drag & drop video files here
            </p>
            <p className="text-caption text-text-muted mt-1">
              Supports MP4, MOV, WebM, AVI, MKV. Automatically sorted alphabetically (a-z).
            </p>
            <div className="mt-2 text-micro px-2.5 py-1 rounded-full bg-surface-base border border-border-default text-text-secondary">
              Selected: <span className="font-semibold text-text-primary">{selectedFiles.length}</span> / 10 clips
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="rounded-xl border border-border-default bg-surface-panel p-3 space-y-2">
              <div className="flex items-center justify-between text-caption font-medium text-text-secondary px-1">
                <span>Selected Clips (Alphanumeric Order)</span>
                <span className={selectedFiles.length === 10 ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                  {selectedFiles.length} of 10
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={file.name + index}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-base border border-border-default text-caption"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded bg-accent-muted text-accent-primary text-micro font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <Video className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate">{file.name}</p>
                        <p className="text-micro text-text-muted">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                      disabled={isUploading}
                      className="text-text-muted hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {selectedFiles.length > 0 && (
                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={selectedFiles.length !== 10 || isUploading}
                    className="w-full sm:w-auto"
                  >
                    {isUploading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Uploading {selectedFiles.length} clips to S3...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {selectedFiles.length} Clips to S3
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-caption text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
