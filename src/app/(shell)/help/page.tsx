"use client";

import {
  PlayCircle,
  FileText,
  Mic,
  Video,
  HelpCircle,
  Mail,
  MessageCircle,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Grid } from "@/components/ui/Grid";

const helpSections = [
  {
    title: "Getting Started",
    icon: PlayCircle,
    color: "from-blue-500 to-cyan-500",
    articles: [
      {
        title: "Creating your first project",
        description: "Learn how to set up a new video project and select a source clip.",
      },
      {
        title: "Understanding the pipeline",
        description: "A walkthrough of the Source → Script → Voice → Compose workflow.",
      },
      {
        title: "Choosing a movie clip",
        description: "How to browse, filter, and preview clips from the movie library.",
      },
    ],
  },
  {
    title: "Script & AI",
    icon: FileText,
    color: "from-purple-500 to-pink-500",
    articles: [
      {
        title: "Generating AI scripts",
        description: "How Huavoi creates candidate scripts and how to pick the best one.",
      },
      {
        title: "Editing scripts by segment",
        description: "Timestamped editing, AI-assisted rewrites, and version history.",
      },
      {
        title: "Tone and length options",
        description: "Customizing the AI output: narrative, promotional, short, or detailed.",
      },
    ],
  },
  {
    title: "Voice & Audio",
    icon: Mic,
    color: "from-green-500 to-emerald-500",
    articles: [
      {
        title: "Selecting a preset voice",
        description: "Browsing and previewing stock voices for your voiceover.",
      },
      {
        title: "Cloning your own voice",
        description: "Recording a sample from your microphone to create a custom voice clone.",
      },
      {
        title: "Voice preview before render",
        description: "How to test a short preview clip before committing to a full TTS render.",
      },
    ],
  },
  {
    title: "Compose & Export",
    icon: Video,
    color: "from-orange-500 to-red-500",
    articles: [
      {
        title: "Using the multi-track timeline",
        description: "Arranging video, voiceover, music, and SFX on the timeline.",
      },
      {
        title: "Render queue and wait times",
        description: "How rendering works, expected wait times, and safe-to-close behavior.",
      },
      {
        title: "Export formats and resolution",
        description: "Choosing resolution, FPS, and format for your final export.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Help & Documentation"
        description="Learn how to use Huavoi Studio from start to finish"
      />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Documentation</h3>
              <p className="text-xs text-text-muted">Browse all guides</p>
            </div>
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Community</h3>
              <p className="text-xs text-text-muted">Join discussions</p>
            </div>
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">API Docs</h3>
              <p className="text-xs text-text-muted">Developer resources</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Help Sections */}
      <div className="space-y-6">
        {helpSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.title} variant="elevated" padding="lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Grid cols={3} gap="md">
                  {section.articles.map((article) => (
                    <button
                      key={article.title}
                      className="group text-left rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-accent-cyan/40 hover:bg-surface-hover hover:shadow-lg"
                    >
                      <h3 className="mb-2 text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {article.description}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </button>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Support */}
      <Card variant="elevated" padding="lg" className="mt-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="mb-2">Still need help?</CardTitle>
          <CardDescription className="mb-6">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
            <Button variant="secondary" size="lg">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
