"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, User, AlertCircle, CheckCircle2, FileAudio, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { adminSearchUsers, adminBulkUploadVoices, type UserSearchResult } from "@/lib/api/admin";

interface VoiceBulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  duration?: number;
}

export function VoiceBulkImportModal({ open, onClose, onSuccess }: VoiceBulkImportModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{
    success_count: number;
    failure_count: number;
    errors: string[];
  } | null>(null);

  // Search users with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userSearchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await adminSearchUsers(userSearchQuery, 10);
          setUserSearchResults(results);
          setShowUserDropdown(true);
        } catch (error) {
          console.error("User search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setUserSearchResults([]);
        setShowUserDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearchQuery]);

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setUserSearchQuery(user.name);
    setShowUserDropdown(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filter audio files only
    const audioFiles = Array.from(files).filter(
      (file) => file.type.startsWith("audio/") || file.name.match(/\.(mp3|wav|ogg|webm|m4a|aac)$/i)
    );

    if (audioFiles.length === 0) {
      toast.error("No audio files", "Please select valid audio files");
      return;
    }

    // Convert to SelectedFile format
    const newFiles: SelectedFile[] = audioFiles.map((file) => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display name
      size: file.size,
      type: file.type || "audio/unknown",
    }));

    setSelectedFiles(newFiles);
    toast.success("Files selected", `${audioFiles.length} audio files ready to upload`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleImport = async () => {
    if (!selectedUser) {
      toast.error("User required", "Please select a target user");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("No files", "Please select audio files to import");
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setImportProgress({ current: 0, total: selectedFiles.length });

    try {
      // Use the bulk upload API
      const files = selectedFiles.map((sf) => sf.file);
      const result = await adminBulkUploadVoices(selectedUser.id, files);

      setImportResult({
        success_count: result.success_count,
        failure_count: result.failure_count,
        errors: result.errors,
      });

      if (result.failure_count === 0) {
        toast.success(
          "Import successful",
          `Uploaded ${result.success_count} voices for ${selectedUser.name}`
        );
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        toast.warning(
          "Import completed with errors",
          `${result.success_count} succeeded, ${result.failure_count} failed`
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error("Upload failed", message);
      setImportResult({
        success_count: 0,
        failure_count: selectedFiles.length,
        errors: [message],
      });
    } finally {
      setIsImporting(false);
      setImportProgress({ current: selectedFiles.length, total: selectedFiles.length });
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setUserSearchQuery("");
    setUserSearchResults([]);
    setShowUserDropdown(false);
    setSelectedFiles([]);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-default bg-surface-base shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border-default bg-gradient-to-r from-accent-primary to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <Heading variant="section" as="h2" className="text-white">
                  Bulk Import Voices
                </Heading>
                <p className="text-body text-white/80">Upload multiple audio files for a user</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isImporting}
              className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-body font-semibold text-text-primary mb-2">
              Target User *
            </label>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-xl border-2 border-border-default bg-surface-panel px-4 py-3 focus-within:border-accent-primary transition-colors">
                <Search className="h-4 w-4 text-text-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => {
                    setUserSearchQuery(e.target.value);
                    if (selectedUser && e.target.value !== selectedUser.name) {
                      setSelectedUser(null);
                    }
                  }}
                  onFocus={() => {
                    if (userSearchResults.length > 0) setShowUserDropdown(true);
                  }}
                  disabled={isImporting}
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none disabled:opacity-50"
                />
                {isSearching && <Spinner size="sm" className="text-text-muted" />}
              </div>

              {/* User Dropdown */}
              {showUserDropdown && userSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border-default bg-surface-panel shadow-xl z-20 max-h-64 overflow-y-auto">
                  {userSearchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-raised transition-colors text-left border-b border-border-default last:border-0"
                    >
                      {user.picture_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs use dynamic hosts
                        <img
                          src={user.picture_url}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-accent-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-text-primary truncate">
                          {user.name}
                        </p>
                        <p className="text-caption text-text-muted truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-green-600">
                    Selected: {selectedUser.name}
                  </p>
                  <p className="text-caption text-green-600/80">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-body font-semibold text-text-primary mb-2">
              Audio Files *
            </label>
            <div
              onClick={() => !isImporting && fileInputRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed border-border-default bg-surface-panel p-8 text-center transition-colors ${
                isImporting
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-accent-primary hover:bg-accent-primary/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.ogg,.webm,.m4a,.aac"
                onChange={handleFileSelect}
                disabled={isImporting}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-primary/10">
                  <FileAudio className="h-8 w-8 text-accent-primary" />
                </div>
                <div>
                  <p className="text-body font-semibold text-text-primary">
                    Click to select audio files
                  </p>
                  <p className="text-caption text-text-muted mt-1">
                    Supports MP3, WAV, OGG, WebM, M4A, AAC
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-caption text-text-muted">
              All voices will be uploaded with language set to English by default
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div>
              <label className="block text-body font-semibold text-text-primary mb-2">
                Selected Files ({selectedFiles.length})
              </label>
              <div className="rounded-xl border border-border-default bg-surface-panel overflow-hidden max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 border-b border-border-default last:border-0 hover:bg-surface-raised transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-primary/10 flex-shrink-0">
                      <FileAudio className="h-5 w-5 text-accent-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold text-text-primary truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-caption text-text-muted">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-caption text-text-muted">•</span>
                        <span className="text-caption text-text-muted">{file.type}</span>
                      </div>
                    </div>
                    {!isImporting && (
                      <button
                        onClick={() => removeFile(index)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-600 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && importProgress.total > 0 && (
            <div className="rounded-xl border border-border-default bg-surface-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body font-semibold text-text-primary">
                  Uploading files...
                </span>
                <span className="text-body font-medium text-accent-primary">
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-purple-600 transition-all duration-300"
                  style={{
                    width: `${(importProgress.current / importProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="rounded-xl border border-border-default bg-surface-panel p-4">
              <Heading variant="label" as="h3" className="text-text-primary mb-3">
                Import Result
              </Heading>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-body text-text-secondary">Success:</span>
                  <span className="text-body font-bold text-green-600">
                    {importResult.success_count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-text-secondary">Failed:</span>
                  <span className="text-body font-bold text-orange-600">
                    {importResult.failure_count}
                  </span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-default">
                    <p className="text-caption font-semibold text-text-muted mb-2">Errors:</p>
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-caption text-orange-600"
                        >
                          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border-default bg-surface-base px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="md" onClick={handleClose} disabled={isImporting}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleImport}
              disabled={!selectedUser || selectedFiles.length === 0 || isImporting}
              loading={isImporting}
              leftIcon={!isImporting ? <Upload className="h-4 w-4" /> : undefined}
            >
              {isImporting
                ? "Uploading..."
                : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} Files` : "Voices"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
