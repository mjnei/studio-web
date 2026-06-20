# Documentation Navigation Pattern

**Last Updated:** June 20, 2026  
**Purpose:** Consistent navigation across all workflow documentation

---

## 🎯 Navigation Design Principles

### Goal
Provide **predictable, consistent navigation** so readers can:
1. Know where they are
2. Jump to previous/next sections
3. Return to table of contents
4. Navigate without scrolling

### Solution: Fixed Position Navigation Bar

Every major section has a navigation bar in a **consistent position**:

```markdown
---

## Section Title

**📍 Navigation:** [← Previous](#prev) | [Table of Contents](#toc) | [Next →](#next)

---

[Section content here...]

---

**📍 Navigation:** [← Previous](#prev) | [Table of Contents](#toc) | [Next →](#next)

---
```

---

## 📐 Navigation Bar Structure

### Format
```
**📍 Navigation:** [← Previous Section](#link) | [Table of Contents](#link) | [Next Section →](#link)
```

### Components
1. **📍 Icon** - Visual indicator (always same)
2. **"Navigation:"** - Label (always same)
3. **← Previous** - Link to previous section (contextual)
4. **Table of Contents** - Link to TOC (always same anchor)
5. **Next →** - Link to next section (contextual)

### Positions
- **Top of section:** Right after the `## Section Title` heading
- **Bottom of section:** Right before the next `---` divider

---

## 📍 Navigation Patterns by Document

### WORKFLOW_GUIDE.md

#### Pattern for Steps (1-4)
```
Top:
**📍 Navigation:** [← Step N-1](#step-n-1) | [Table of Contents](#table-of-contents) | [Step N+1 →](#step-n-1)

Bottom:
**📍 Navigation:** [← Step N-1](#step-n-1) | [Table of Contents](#table-of-contents) | [Step N+1 →](#step-n-1)
```

#### Special Cases

**Step 1 (First Step):**
```
**📍 Navigation:** [← Table of Contents](#table-of-contents) | [Step 2: Script →](#step-2-generate--edit-script)
```

**Step 4 (Last Step):**
```
**📍 Navigation:** [← Step 3: Voice](#step-3-generate--preview-voice) | [Table of Contents](#table-of-contents) | [State Management →](#state-management)
```

#### Pattern for Other Major Sections
```
**📍 Navigation:** [← Previous Section](#prev) | [Table of Contents](#table-of-contents) | [Next Section →](#next)
```

---

## 🎨 Visual Consistency

### What's Always the Same
✅ **📍 Icon** - Always present, same emoji  
✅ **Position** - Top and bottom of each section  
✅ **Format** - Same markdown structure  
✅ **Label** - Always says "Navigation:"  
✅ **Dividers** - Always `---` above and below

### What Changes
🔄 **Previous link** - Points to actual previous section  
🔄 **Next link** - Points to actual next section  
🔄 **Link text** - Describes the section name

---

## 📏 Spacing Rules

### Around Navigation Bars
```markdown
---                          ← Horizontal rule

## Section Title

**📍 Navigation:** [...]      ← Navigation bar (no blank lines above/below)

---                          ← Horizontal rule

[Content starts here]
[Content continues...]
[Content ends here]

---                          ← Horizontal rule

**📍 Navigation:** [...]      ← Navigation bar (no blank lines above/below)

---                          ← Horizontal rule
```

### Key Rules
1. No blank lines between `---` and navigation bar
2. No blank lines between navigation bar and `---`
3. Horizontal rules create visual separation
4. Navigation bar is **always** between two `---` lines

---

## 🧭 Link Anchor Format

### Consistent Anchor Naming
- Use GitHub-style anchors (lowercase, dashes)
- Remove special characters
- Examples:
  - `## Step 1: Select Movie` → `#step-1-select-movie`
  - `## State Management` → `#state-management`
  - `## API Integration` → `#api-integration`

### Link Text Format
- Previous: `← [Short Name]` (e.g., `← Step 1: Movie`)
- Next: `[Short Name] →` (e.g., `Step 2: Script →`)
- TOC: Always `Table of Contents`

---

## ✅ Navigation Checklist

When adding navigation to a section:

- [ ] Added navigation bar at **top** of section
- [ ] Added navigation bar at **bottom** of section
- [ ] Both bars have same links (consistent)
- [ ] Previous link goes to correct section
- [ ] Next link goes to correct section
- [ ] TOC link goes to table of contents
- [ ] Navigation bars surrounded by `---`
- [ ] No blank lines around navigation bars
- [ ] Link anchors are correct
- [ ] Link text is descriptive

---

## 📚 Example: Complete Section

```markdown
---

## Step 2: Generate & Edit Script

**📍 Navigation:** [← Step 1: Movie](#step-1-select-movie-source) | [Table of Contents](#table-of-contents) | [Step 3: Voice →](#step-3-generate--preview-voice)

---

**Route:** `/project/[projectId]/script`  
**Component:** Updated script page with version support

#### Features
- Multiple script versions
- AI-powered generation
- Real-time statistics
[... more content ...]

#### Auto-Save
- Each version saved immediately
- No unsaved changes

---

**📍 Navigation:** [← Step 1: Movie](#step-1-select-movie-source) | [Table of Contents](#table-of-contents) | [Step 3: Voice →](#step-3-generate--preview-voice)

---
```

---

## 🎯 Benefits of This Pattern

### For Readers
✅ **Predictable** - Always in same position  
✅ **Visible** - Don't need to scroll to find  
✅ **Consistent** - Same format everywhere  
✅ **Efficient** - Quick navigation without hunting

### For Writers
✅ **Easy to add** - Copy/paste pattern  
✅ **Easy to maintain** - Same structure always  
✅ **Hard to miss** - Obvious when missing  
✅ **Visual consistency** - Looks professional

---

## 🔍 Quick Reference

### Copy This Template

```markdown
---

## Your Section Title

**📍 Navigation:** [← Previous](#prev-anchor) | [Table of Contents](#table-of-contents) | [Next →](#next-anchor)

---

[Your content here]

---

**📍 Navigation:** [← Previous](#prev-anchor) | [Table of Contents](#table-of-contents) | [Next →](#next-anchor)

---
```

### Replace These Parts
1. `Your Section Title` → Actual section name
2. `Previous` → Name of previous section
3. `#prev-anchor` → Anchor to previous section
4. `Next` → Name of next section
5. `#next-anchor` → Anchor to next section

---

## 📖 Documents Using This Pattern

### Currently Implemented
✅ **WORKFLOW_GUIDE.md** - All major sections  
✅ **Step 1: Select Movie** - Top and bottom  
✅ **Step 2: Generate Script** - Top and bottom  
✅ **Step 3: Generate Voice** - Top and bottom  
✅ **Step 4: Generate Video** - Top and bottom  
✅ **State Management** - Top and bottom  
✅ **API Integration** - Top and bottom  
✅ **Testing Checklist** - Top and bottom  

### To Be Implemented
⏳ **NEW_PROJECT_UI_DESIGN.md** - Can add if needed  
⏳ **DESIGN_GUIDE.md** - Can add if needed  
⏳ **Other guides** - Apply pattern as needed

---

## 🚀 Adding Navigation to a New Document

### Step-by-Step

1. **Identify major sections** in your document
2. **Create table of contents** with anchors
3. **For each section:**
   - Add navigation bar at top (after title)
   - Add navigation bar at bottom (before next section)
4. **Link previous/next sections** correctly
5. **Test all links** by clicking through
6. **Verify spacing** (no blank lines around nav bars)

---

## 💡 Pro Tips

### Tip 1: Test Your Links
Click every link to make sure anchors work correctly.

### Tip 2: Keep Text Short
Navigation text should be brief: "Step 1: Movie" not "Step 1: Select Movie and Configure Settings"

### Tip 3: Use TOC Consistently
Always link to `#table-of-contents` for the middle link.

### Tip 4: Match Visual Style
Keep the `📍` emoji and format exactly the same everywhere.

### Tip 5: Copy/Paste
Don't recreate - copy an existing navigation bar and update the links.

---

## 🎉 Result

With this navigation pattern, readers can:
- Jump to any section in **1-2 clicks**
- Return to TOC from anywhere
- Navigate sequentially through steps
- Never get lost in long documents

**Consistent UX = Happy Readers** ✅

---

**Last Updated:** June 20, 2026  
**Status:** ✅ Implemented in WORKFLOW_GUIDE.md  
**Pattern:** Fixed position navigation bars
