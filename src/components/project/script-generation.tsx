"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Check, FileText, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface ScriptGenerationProps {
  movieId: string;
  movieTitle: string;
  script?: string;
  onScriptChange: (script: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

interface ScriptGenerationProps {
  movieId: string;
  movieTitle: string;
  script?: string;
  onScriptChange: (script: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

export function ScriptGeneration({
  movieTitle,
  script,
  onScriptChange,
  onGenerate,
  onRegenerate,
  isGenerating = false,
}: ScriptGenerationProps) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const copyToClipboard = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success("Copied", "Script copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = script ? script.split(/\s+/).filter(Boolean).length : 0;
  const estimatedDuration = Math.ceil(wordCount / 150); // ~150 words per minute

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
        </div>
        <Heading variant="page" as="h2" className="text-text-primary mb-2">
          Generate Script
        </Heading>
        <Text variant="bodyLg" className="text-text-secondary">
          Let AI create a script for {movieTitle}, then review and modify as needed
        </Text>
      </div>

      {!script ? (
        /* Generate Initial Script */
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <Heading variant="section" as="h3" className="text-text-primary mb-2">
              Ready to Generate Script
            </Heading>
            <Text variant="bodyLg" className="text-text-secondary mb-8 max-w-md mx-auto">
              Our AI will analyze {movieTitle} and create a professional voice-over script tailored
              for your project.
            </Text>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Sparkles className="w-5 h-5" />}
              onClick={onGenerate}
              loading={isGenerating}
            >
              {isGenerating ? "Generating Script..." : "Generate Script with AI"}
            </Button>
          </div>
        </Card>
      ) : (
        /* Display and Edit Script */
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <Heading variant="metric" className="text-accent-primary">
                  {wordCount}
                </Heading>
                <Text variant="caption" className="text-text-muted">
                  Words
                </Text>
              </div>
            </Card>
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <Heading variant="metric" className="text-accent-secondary">
                  ~{estimatedDuration}min
                </Heading>
                <Text variant="caption" className="text-text-muted">
                  Est. Duration
                </Text>
              </div>
            </Card>
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <Heading variant="metric" className="text-accent-tertiary">
                  {script.split("\n\n").length}
                </Heading>
                <Text variant="caption" className="text-text-muted">
                  Paragraphs
                </Text>
              </div>
            </Card>
            <Card variant="elevated" padding="md">
              <div className="text-center">
                <Badge variant="success" size="md">
                  Ready
                </Badge>
                <Text variant="caption" className="text-text-muted mt-1">
                  Status
                </Text>
              </div>
            </Card>
          </div>

          {/* Script Editor */}
          <Card variant="elevated" padding="none">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border-default p-4">
              <CardTitle>Script Content</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  onClick={copyToClipboard}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "Preview" : "Edit"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={onRegenerate}
                >
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {editing ? (
                <textarea
                  value={script}
                  onChange={(e) => onScriptChange(e.target.value)}
                  className="w-full min-h-[400px] p-6 bg-surface-base text-text-primary font-mono text-sm border-none focus:outline-none focus:ring-0 resize-none"
                  placeholder="Enter your script here..."
                />
              ) : (
                <div className="p-6 prose prose-invert max-w-none">
                  {script.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="text-text-primary leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card variant="elevated" padding="md" className="border-border-subtle">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">💡 Pro Tips</p>
                <ul className="text-xs text-text-secondary space-y-1">
                  <li>• Keep sentences short and clear for better voice generation</li>
                  <li>• Add pauses with commas and periods for natural pacing</li>
                  <li>• Review pronunciation of unique names or technical terms</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
