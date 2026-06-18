const helpSections = [
  {
    title: "Getting Started",
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
    <div>
      <h1 className="mb-2 text-2xl font-bold">Help & Documentation</h1>
      <p className="mb-6 text-sm text-text-muted">
        Learn how to use Huavoi Studio from start to finish. Click a topic below to read more.
      </p>
      <div className="space-y-8">
        {helpSections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-text-secondary">{section.title}</h2>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {section.articles.map((article) => (
                <div
                  key={article.title}
                  className="cursor-pointer rounded-lg border border-border-default bg-surface-panel p-4 transition-colors hover:border-accent-cyan/40 hover:bg-surface-hover"
                >
                  <h3 className="mb-1 text-sm font-medium text-text-primary">{article.title}</h3>
                  <p className="text-xs text-text-muted">{article.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-border-default bg-surface-panel p-4 md:p-6 text-center">
        <h2 className="mb-2 text-lg font-semibold">Still need help?</h2>
        <p className="mb-4 text-sm text-text-muted">
          Can&apos;t find what you&apos;re looking for? Reach out to our support team.
        </p>
        <button className="rounded-md bg-accent-cyan px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Contact support
        </button>
      </div>
    </div>
  );
}
