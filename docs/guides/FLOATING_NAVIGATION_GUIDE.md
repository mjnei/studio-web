# Floating Workflow Navigation Guide

**Date:** June 20, 2026  
**Status:** ✅ Implemented  
**Component:** `FloatingWorkflowNavigation`

---

## Overview

The Floating Workflow Navigation is an always-visible navigation bar that stays at the bottom of the screen during the 4-step workflow. It provides consistent navigation controls without taking up permanent screen space, using smart auto-hide behavior on scroll.

---

## Key Features

### 🎯 Always Accessible
- Fixed to bottom of viewport
- Floats above content (z-index: 40)
- Never blocks important content
- Smart scroll behavior (auto-hide/show)

### 🎨 Visual Design
- Backdrop blur effect with transparency
- Border top for visual separation
- Matches design system colors
- Smooth transitions and animations
- Shadow for depth and elevation

### 📱 Responsive Behavior
- **Mobile:** Abbreviated button labels ("Next" vs "Continue to Script")
- **Tablet:** Moderate labels
- **Desktop:** Full descriptive labels
- Touch-friendly button sizes
- Optimized spacing for all screen sizes

### ⚡ Smart Auto-Hide
- Hides when scrolling down (past 100px)
- Shows when scrolling up
- Always visible at top of page
- Smooth slide-in/out animation
- Preserves user's scroll position

---

## Component API

### Props

```typescript
interface FloatingWorkflowNavigationProps {
  projectId: string;                    // Required: Project ID for routing
  currentStep: "source" | "script" | "voice" | "compose"; // Required: Current step
  canGoNext?: boolean;                  // Optional: Enable next button (default: false)
  nextLabel?: string;                   // Optional: Custom next button label
  onNext?: () => void;                  // Optional: Custom next action
  canGoBack?: boolean;                  // Optional: Enable back button (default: true)
  backLabel?: string;                   // Optional: Custom back button label
  onBack?: () => void;                  // Optional: Custom back action
  isProcessing?: boolean;               // Optional: Disable during async operations
}
```

### Usage Example

```tsx
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";

export default function SourcePage() {
  const projectId = "project-123";
  const [movieSelected, setMovieSelected] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        {/* Page content here */}
        {/* pb-24 adds padding to prevent content being hidden by floating nav */}
      </div>
      
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="source"
        canGoNext={movieSelected}
      />
    </>
  );
}
```

---

## Layout Structure

### Anatomy

```
┌─────────────────────────────────────────────────────────┐
│  [Back] [Projects]     Step 1 / 4     [Continue →]      │
│  ← Previous            Center         Next Step          │
│                                                           │
└─────────────────────────────────────────────────────────┘
    Left Side            Middle           Right Side
```

### Sections Breakdown

#### Left Side
- **Back Button:** Returns to previous step (hidden on Step 1)
- **Projects Button:** Quick exit to projects list (always visible)

#### Middle
- **Step Indicator:** Shows current position (e.g., "Step 2 / 4")
- Abbreviated on mobile ("2/4")
- Full text on desktop ("Step 2 / 4")

#### Right Side
- **Next/Continue Button:** Advances to next step
- Disabled when `canGoNext={false}`
- Shows custom label if provided
- Placeholder space when hidden (maintains layout balance)

---

## Responsive Breakpoints

### Mobile (< 640px)
```tsx
<Button>
  <span className="sm:hidden">Next</span>
</Button>
```
- Short labels: "Next", "Back", "Complete"
- Icon-only for Projects button
- Compact spacing

### Tablet (640px - 1024px)
```tsx
<Button>
  <span className="hidden sm:inline">Continue to Script</span>
</Button>
```
- Medium labels
- Balanced spacing
- Full step indicator

### Desktop (> 1024px)
```tsx
<Button>
  <span className="hidden md:inline">Projects</span>
</Button>
```
- Full descriptive labels
- Maximum spacing
- All text visible

---

## Scroll Behavior

### Logic

```typescript
const handleScroll = () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    // Scrolling down & past 100px → Hide
    setIsVisible(false);
  } else {
    // Scrolling up or at top → Show
    setIsVisible(true);
  }
  
  setLastScrollY(currentScrollY);
};
```

### Visual States

#### Visible (Default)
```css
transform: translateY(0);
transition: transform 300ms;
```

#### Hidden (Scroll Down)
```css
transform: translateY(100%);
transition: transform 300ms;
```

---

## Styling & Theming

### Background & Blur

```tsx
<div className="absolute inset-0 bg-surface-panel/95 backdrop-blur-xl border-t border-border-default" />
```

- **Background:** `surface-panel` at 95% opacity
- **Blur:** Extra large backdrop blur (`backdrop-blur-xl`)
- **Border:** Top border with default color
- Creates floating effect with depth

### Button Styles

```tsx
// Primary (Next/Continue)
<Button variant="primary" size="md" className="shadow-lg">

// Secondary (Back)
<Button variant="secondary" size="md" className="shadow-lg">

// Ghost (Projects)
<Button variant="ghost" size="md" className="shadow-lg">
```

All buttons include `shadow-lg` for elevation.

---

## Step-by-Step Integration

### Step 1: Import Component

```tsx
import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
```

### Step 2: Add Bottom Padding

Add `pb-24` (6rem padding-bottom) to your main content container:

```tsx
<div className="flex flex-col gap-6 pb-24">
  {/* Your content */}
</div>
```

This prevents content from being hidden behind the floating nav.

### Step 3: Add Navigation Component

Place it as a sibling to your content wrapper:

```tsx
return (
  <>
    <div className="flex flex-col gap-6 pb-24">
      {/* Content */}
    </div>
    
    <FloatingWorkflowNavigation
      projectId={projectId}
      currentStep="source"
      canGoNext={hasRequiredData}
    />
  </>
);
```

### Step 4: Handle Async Operations

Disable navigation during processing:

```tsx
<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="voice"
  canGoNext={!!audioUrl}
  isProcessing={isGenerating}
/>
```

---

## Navigation Flow

### Default Behavior

```
Step 1 (Source)
  Back: Disabled (first step)
  Next: "Continue to Script" → /project/{id}/script

Step 2 (Script)
  Back: "Back" → /project/{id}/source
  Next: "Continue to Voice" → /project/{id}/voice

Step 3 (Voice)
  Back: "Back" → /project/{id}/script
  Next: "Continue to Compose" → /project/{id}/compose

Step 4 (Compose)
  Back: "Back" → /project/{id}/voice
  Next: "Complete Project" → /projects
```

### Custom Actions

Override default routing with callbacks:

```tsx
<FloatingWorkflowNavigation
  projectId={projectId}
  currentStep="script"
  onNext={async () => {
    await saveScript();
    router.push(`/project/${projectId}/voice`);
  }}
  onBack={() => {
    if (hasUnsavedChanges) {
      setShowWarningModal(true);
    } else {
      router.back();
    }
  }}
/>
```

---

## Accessibility

### Keyboard Navigation
- All buttons are keyboard accessible
- Tab order: Back → Projects → Next
- Enter/Space to activate

### Screen Readers
- Semantic button elements
- Clear button labels
- Step indicator announced
- Icon-only buttons have `title` attribute

### Focus Management
- Visible focus indicators
- Maintains focus on interaction
- No focus traps

---

## Best Practices

### ✅ Do

1. **Always add bottom padding** to content containers (`pb-24`)
2. **Disable during async operations** (`isProcessing={true}`)
3. **Enable next only when valid** (`canGoNext={isValid}`)
4. **Test on all screen sizes** (mobile, tablet, desktop)
5. **Use custom labels when helpful** (e.g., "Generate Video")

### ❌ Don't

1. **Don't forget bottom padding** (content will be hidden)
2. **Don't allow navigation during processing**
3. **Don't use on non-workflow pages**
4. **Don't override z-index** (may conflict with modals)
5. **Don't hide Projects button** (always provide exit)

---

## Comparison with Old Navigation

### Before (WorkflowNavigation)
```tsx
<div className="flex items-center justify-between">
  <div>
    <h2>Page Title</h2>
  </div>
  <WorkflowNavigation
    projectId={projectId}
    currentStep="source"
    canGoNext={true}
  />
</div>
```

**Issues:**
- Takes up header space
- Requires scrolling to find on long pages
- Inconsistent position on different pages
- No quick exit option

### After (FloatingWorkflowNavigation)
```tsx
<>
  <div className="flex flex-col gap-6 pb-24">
    <div>
      <h2>Page Title</h2>
    </div>
    {/* Content */}
  </div>
  
  <FloatingWorkflowNavigation
    projectId={projectId}
    currentStep="source"
    canGoNext={true}
  />
</>
```

**Benefits:**
- ✅ Always visible (no scrolling needed)
- ✅ Consistent position across all pages
- ✅ Doesn't take permanent screen space
- ✅ Smart auto-hide on scroll
- ✅ Quick exit with Projects button
- ✅ Better mobile experience

---

## Technical Details

### Z-Index Hierarchy
```
Floating Navigation: z-40
Modals/Dialogs: z-50
Tooltips: z-60
```

Floating nav sits below modals but above page content.

### Performance
- Uses `passive` scroll listeners
- Debounced scroll handler (browser native)
- Minimal re-renders
- Smooth CSS transitions
- GPU-accelerated transforms

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback: No backdrop blur on older browsers
- Progressive enhancement approach

---

## Troubleshooting

### Navigation Hides Content

**Problem:** Bottom content is hidden behind navigation  
**Solution:** Add `pb-24` (or larger) to content container

```tsx
<div className="flex flex-col gap-6 pb-24">
```

### Navigation Not Hiding on Scroll

**Problem:** Auto-hide not working  
**Solution:** Check scroll event listener is attached. May need to scroll past 100px threshold.

### Buttons Disabled When They Shouldn't Be

**Problem:** Next button always disabled  
**Solution:** Verify `canGoNext` prop is being set correctly based on state

### Custom Actions Not Working

**Problem:** `onNext` callback not firing  
**Solution:** Ensure you're providing the callback and it's not undefined

---

## Migration Guide

### From WorkflowNavigation to FloatingWorkflowNavigation

1. **Import new component:**
   ```tsx
   - import { WorkflowNavigation } from "@/components/project/workflow-navigation";
   + import { FloatingWorkflowNavigation } from "@/components/project/floating-workflow-navigation";
   ```

2. **Wrap content and add padding:**
   ```tsx
   - <div className="flex flex-col gap-6">
   + <div className="flex flex-col gap-6 pb-24">
   ```

3. **Move navigation outside content wrapper:**
   ```tsx
   return (
   -  <div className="flex flex-col gap-6">
   +  <>
   +    <div className="flex flex-col gap-6 pb-24">
         {/* Content without WorkflowNavigation in header */}
   -    </div>
   +    </div>
   +    
   +    <FloatingWorkflowNavigation
   +      projectId={projectId}
   +      currentStep="source"
   +      canGoNext={canProceed}
   +    />
   +  </>
   );
   ```

4. **Remove inline navigation from header:**
   ```tsx
   <div className="flex items-center justify-between">
     <div>
       <h2>Page Title</h2>
     </div>
   -  <WorkflowNavigation ... />
   </div>
   ```

---

## Examples

### Basic Example (Step 1)

```tsx
export default function SourcePage() {
  const { projectId } = useParams();
  const { state } = useProjectState(projectId);
  
  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <h2>Select Source Movie</h2>
        <MovieSelection onSelect={handleSelect} />
      </div>
      
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="source"
        canGoNext={!!state?.movieId}
      />
    </>
  );
}
```

### Advanced Example (Step 3 with Processing)

```tsx
export default function VoicePage() {
  const { projectId } = useParams();
  const { state } = useProjectState(projectId);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    await generateVoice();
    setIsGenerating(false);
  };
  
  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <h2>Generate Voice</h2>
        
        {isGenerating && <ProgressIndicator />}
        {state?.audioUrl && <AudioPlayer />}
        
        <Button onClick={handleGenerate}>
          Generate
        </Button>
      </div>
      
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="voice"
        canGoNext={!!state?.audioUrl}
        isProcessing={isGenerating}
      />
    </>
  );
}
```

### Custom Navigation Example

```tsx
export default function ComposePage() {
  const { projectId } = useParams();
  const router = useRouter();
  
  const handleComplete = async () => {
    await saveProject();
    await sendAnalytics();
    router.push("/projects");
  };
  
  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <h2>Video Composition</h2>
        <VideoPlayer />
      </div>
      
      <FloatingWorkflowNavigation
        projectId={projectId}
        currentStep="compose"
        canGoNext={isVideoReady}
        nextLabel="Complete & Download"
        onNext={handleComplete}
      />
    </>
  );
}
```

---

## Summary

The Floating Workflow Navigation provides:

- ✅ **Always accessible** navigation without scrolling
- ✅ **Consistent UX** across all workflow steps
- ✅ **Smart auto-hide** on scroll down/up
- ✅ **Responsive design** optimized for all devices
- ✅ **Quick exit** with Projects home button
- ✅ **Better mobile** experience with abbreviated labels
- ✅ **Smooth animations** and transitions
- ✅ **Easy integration** with minimal code changes

**Result:** A more intuitive and efficient workflow navigation experience that doesn't compromise on screen real estate or accessibility.

---

**Last Updated:** June 20, 2026  
**Component Location:** `/src/components/project/floating-workflow-navigation.tsx`  
**Status:** ✅ Production Ready
