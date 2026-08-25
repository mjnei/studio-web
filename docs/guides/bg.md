For a modern, premium **AI Automation SaaS** (dark theme), a flat `#0a0e17` background can feel sterile or disconnected. The industry standard (used by Linear, Raycast, Vercel, Supabase) combines **subtle ambient glow**, **micro-dot/grid meshes**, or **radial vignette gradients** that add depth without creating visual clutter or hurting readability.

Here are **3 curated background patterns** tailored to your existing palette (`--surface-base: #0a0e17`, indigo `#6366f1`, purple `#8b5cf6`, cyan `#06b6d4`):

---

### Option 1: AI Ambient Aurora / Soft Radial Glow *(Recommended)*
> **Vibe**: Sleek, high-tech, modern AI studio (Linear / Cursor aesthetic).
> Subtle dual-glow from top-left (indigo/purple) and top-right (cyan) with a dark floor.

```css
/* Add to body in src/app/globals.css */
body {
  background-color: var(--surface-base);
  background-image:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.15), transparent),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(6, 182, 212, 0.08), transparent);
  background-attachment: fixed;
  background-repeat: no-repeat;
  color: var(--text-primary);
  /* ...rest of existing body rules */
}
```

* **Why it works**: Creates an elevated atmosphere at the top of the viewport (near headers/heroes) while remaining dark and contrast-safe for dense data tables, node graphs, and cards. Fixed attachment ensures smooth scrolling.

---

### Option 2: AI Circuit Mesh (Radial Dot Matrix)
> **Vibe**: Automation, node graphs, orchestration canvas.
> Ultra-subtle repeating dot pattern masked by a radial vignette so it doesn't distract.

```css
/* Add to src/app/globals.css */
body {
  background-color: var(--surface-base);
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
    radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px;
  background-position: 0 0, 0 0;
  background-attachment: fixed;
  color: var(--text-primary);
  /* ...rest of existing body rules */
}
```

* **Why it works**: Evokes a workflow/builder canvas feel. The dots are kept at `0.07` opacity with a 24px grid so they feel like texture rather than noise.

---

### Option 3: Deep Cybernetic Grid with Top Beam
> **Vibe**: Infrastructure, high-throughput AI pipeline.
> Subtle 32px or 48px grid lines faded out smoothly towards the bottom.

```css
/* Add to src/app/globals.css */
body {
  background-color: var(--surface-base);
  background-image:
    linear-gradient(to bottom, rgba(10, 14, 23, 0.2) 0%, var(--surface-base) 80%),
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    radial-gradient(circle 800px at 50% -100px, rgba(139, 92, 246, 0.14), transparent);
  background-size: 100% 100%, 40px 40px, 40px 40px, 100% 100%;
  background-attachment: fixed;
  color: var(--text-primary);
  /* ...rest of existing body rules */
}
```

---

### Recommended Utility Classes to Pair With This

To make UI cards, panels, and sidebars pop against these dynamic backgrounds, leverage **glassmorphism** and **subtle top-edge highlights**:

```css
@layer utilities {
  /* Subtle glass card with specular top border highlight */
  .glass-panel {
    background: rgba(15, 20, 25, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--border-default);
    box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  }

  /* Interactive glow hover for automation cards */
  .card-glow-hover {
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .card-glow-hover:hover {
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 0 20px -4px rgba(99, 102, 241, 0.2);
  }
}
```

### Recommendation
If your SaaS has workflow canvases, forms, and data tables, **Option 1** or **Option 2** gives the most polished look without interfering with text contrast or rendering performance. 

Would you like me to update [globals.css](file:///d:/runway/git/studio-web/src/app/globals.css) with **Option 1 (Soft Aurora Glow)** or **Option 2 (Dot Matrix Canvas)**?