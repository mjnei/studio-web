"use client";

import { useI18n } from "@/i18n";
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
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Grid } from "@/components/ui/Grid";

export default function HelpPage() {
  const { t } = useI18n();

  const helpSections = [
    {
      title: t("help.gettingStarted.title"),
      icon: PlayCircle,
      color: "from-blue-500 to-cyan-500",
      articles: [
        {
          title: t("help.gettingStarted.articles.creatingFirstProject.title"),
          description: t("help.gettingStarted.articles.creatingFirstProject.description"),
        },
        {
          title: t("help.gettingStarted.articles.understandingPipeline.title"),
          description: t("help.gettingStarted.articles.understandingPipeline.description"),
        },
        {
          title: t("help.gettingStarted.articles.choosingMovieClip.title"),
          description: t("help.gettingStarted.articles.choosingMovieClip.description"),
        },
      ],
    },
    {
      title: t("help.scriptAI.title"),
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      articles: [
        {
          title: t("help.scriptAI.articles.generatingScripts.title"),
          description: t("help.scriptAI.articles.generatingScripts.description"),
        },
        {
          title: t("help.scriptAI.articles.editingScripts.title"),
          description: t("help.scriptAI.articles.editingScripts.description"),
        },
        {
          title: t("help.scriptAI.articles.toneAndLength.title"),
          description: t("help.scriptAI.articles.toneAndLength.description"),
        },
      ],
    },
    {
      title: t("help.voiceAudio.title"),
      icon: Mic,
      color: "from-green-500 to-emerald-500",
      articles: [
        {
          title: t("help.voiceAudio.articles.selectingVoice.title"),
          description: t("help.voiceAudio.articles.selectingVoice.description"),
        },
        {
          title: t("help.voiceAudio.articles.cloningVoice.title"),
          description: t("help.voiceAudio.articles.cloningVoice.description"),
        },
        {
          title: t("help.voiceAudio.articles.voicePreview.title"),
          description: t("help.voiceAudio.articles.voicePreview.description"),
        },
      ],
    },
    {
      title: t("help.composeExport.title"),
      icon: Video,
      color: "from-orange-500 to-red-500",
      articles: [
        {
          title: t("help.composeExport.articles.multiTrackTimeline.title"),
          description: t("help.composeExport.articles.multiTrackTimeline.description"),
        },
        {
          title: t("help.composeExport.articles.renderQueue.title"),
          description: t("help.composeExport.articles.renderQueue.description"),
        },
        {
          title: t("help.composeExport.articles.exportFormats.title"),
          description: t("help.composeExport.articles.exportFormats.description"),
        },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title={t("help.title")} description={t("help.description")} />

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <Heading variant="label" as="h3" className="text-text-primary">
                {t("help.documentation.title")}
              </Heading>
              <Text variant="caption" className="text-text-muted">
                {t("help.documentation.subtitle")}
              </Text>
            </div>
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <Heading variant="label" as="h3" className="text-text-primary">
                {t("help.community.title")}
              </Heading>
              <Text variant="caption" className="text-text-muted">
                {t("help.community.subtitle")}
              </Text>
            </div>
          </div>
        </Card>

        <Card variant="interactive" padding="md" className="group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
            <div>
              <Heading variant="label" as="h3" className="text-text-primary">
                {t("help.apiDocs.title")}
              </Heading>
              <Text variant="caption" className="text-text-muted">
                {t("help.apiDocs.subtitle")}
              </Text>
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
                      <Heading
                        variant="label"
                        as="h3"
                        className="mb-2 text-text-primary group-hover:text-accent-cyan transition-colors"
                      >
                        {article.title}
                      </Heading>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {article.description}
                      </p>
                      <div className="mt-3 flex items-center gap-1 text-xs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                        {t("help.gettingStarted.readMore")}
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
          <CardTitle className="mb-2">{t("help.contactSupport.title")}</CardTitle>
          <CardDescription className="mb-6">{t("help.contactSupport.description")}</CardDescription>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg">
              <Mail className="w-4 h-4" />
              {t("help.contactSupport.contact")}
            </Button>
            <Button variant="secondary" size="lg">
              <MessageCircle className="w-4 h-4" />
              {t("help.contactSupport.liveChat")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
