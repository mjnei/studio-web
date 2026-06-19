# Component Usage Examples

Complete examples for the new Modal, Select, and Toast components.

---

## Modal Component

### Basic Modal

```tsx
import { Modal, Button } from "@/components/ui";
import { useState } from "react";

function BasicModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Welcome"
        description="This is a basic modal example"
        size="md"
      >
        <p className="text-text-secondary">
          Modal content goes here. You can put any content inside.
        </p>
      </Modal>
    </>
  );
}
```

### Modal with Custom Footer

```tsx
import { Modal, Button } from "@/components/ui";
import { useState } from "react";

function ModalWithFooter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title="Confirm Action"
      footer={
        <>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            // Handle action
            setIsOpen(false);
          }}>
            Confirm
          </Button>
        </>
      }
    >
      <p className="text-text-secondary">
        Are you sure you want to proceed with this action?
      </p>
    </Modal>
  );
}
```

### Confirmation Modal (Preset)

```tsx
import { ConfirmModal, Button } from "@/components/ui";
import { useState } from "react";

function ConfirmExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    // Perform async action
    await deleteProject();
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setIsOpen(true)}>
        Delete Project
      </Button>
      
      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Project"
        description="This action cannot be undone. All project data will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
```

### Form Modal (Preset)

```tsx
import { FormModal, Input, Button } from "@/components/ui";
import { useState } from "react";

function CreateProjectModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    // Create project
    await createProject(name);
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>New Project</Button>
      
      <FormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        title="Create New Project"
        description="Enter a name for your project"
        submitText="Create"
        loading={loading}
        size="md"
      >
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Project"
        />
      </FormModal>
    </>
  );
}
```

### Modal Sizes

```tsx
<Modal size="sm">Small modal (max-w-sm)</Modal>
<Modal size="md">Medium modal (max-w-md)</Modal>
<Modal size="lg">Large modal (max-w-lg)</Modal>
<Modal size="xl">Extra large modal (max-w-xl)</Modal>
<Modal size="full">Full width modal</Modal>
```

---

## Select Component

### Basic Select

```tsx
import { Select } from "@/components/ui";
import { useState } from "react";

const options = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

function BasicSelect() {
  const [value, setValue] = useState("");

  return (
    <Select
      value={value}
      onChange={setValue}
      options={options}
      placeholder="Select an option"
    />
  );
}
```

### Select with Label and Helper Text

```tsx
<Select
  label="Project Type"
  value={projectType}
  onChange={setProjectType}
  options={projectOptions}
  helperText="Choose the type of project you want to create"
/>
```

### Select with Icons

```tsx
import { Mic, Video, Image } from "lucide-react";

const mediaOptions = [
  { value: "audio", label: "Audio", icon: <Mic size={16} /> },
  { value: "video", label: "Video", icon: <Video size={16} /> },
  { value: "image", label: "Image", icon: <Image size={16} /> },
];

<Select
  value={mediaType}
  onChange={setMediaType}
  options={mediaOptions}
  placeholder="Select media type"
/>
```

### Searchable Select

```tsx
<Select
  value={country}
  onChange={setCountry}
  options={countryOptions}
  searchable
  placeholder="Search countries..."
/>
```

### Select with Error State

```tsx
<Select
  label="Voice"
  value={voice}
  onChange={setVoice}
  options={voiceOptions}
  error={voiceError}
  placeholder="Select a voice"
/>
```

### Disabled Options

```tsx
const options = [
  { value: "basic", label: "Basic Plan", disabled: false },
  { value: "pro", label: "Pro Plan", disabled: false },
  { value: "enterprise", label: "Enterprise Plan", disabled: true },
];

<Select
  value={plan}
  onChange={setPlan}
  options={options}
  placeholder="Select a plan"
/>
```

### Select Sizes

```tsx
<Select size="sm" options={options} />  {/* Small */}
<Select size="md" options={options} />  {/* Medium (default) */}
<Select size="lg" options={options} />  {/* Large */}
```

---

## Multi-Select Component

### Basic Multi-Select

```tsx
import { MultiSelect } from "@/components/ui";
import { useState } from "react";

const tagOptions = [
  { value: "react", label: "React" },
  { value: "typescript", label: "TypeScript" },
  { value: "nextjs", label: "Next.js" },
  { value: "tailwind", label: "Tailwind CSS" },
];

function TagSelector() {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <MultiSelect
      value={tags}
      onChange={setTags}
      options={tagOptions}
      placeholder="Select tags"
      label="Technologies"
    />
  );
}
```

### Multi-Select with Max Selections

```tsx
<MultiSelect
  value={selectedItems}
  onChange={setSelectedItems}
  options={itemOptions}
  maxSelections={3}
  helperText="You can select up to 3 items"
  placeholder="Select up to 3"
/>
```

### Searchable Multi-Select

```tsx
<MultiSelect
  value={selectedUsers}
  onChange={setSelectedUsers}
  options={userOptions}
  searchable
  placeholder="Search and select users..."
  label="Assign Users"
/>
```

---

## Toast Notification System

### Setup ToastProvider

First, wrap your app with the `ToastProvider` in your root layout:

```tsx
// app/layout.tsx
import { ToastProvider } from "@/components/ui";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider position="top-right" maxToasts={5}>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

### Using Toast Notifications

```tsx
import { useToast, Button } from "@/components/ui";

function ToastExample() {
  const toast = useToast();

  return (
    <div className="space-y-2">
      <Button onClick={() => toast.success("Success!", "Your changes have been saved")}>
        Show Success
      </Button>
      
      <Button onClick={() => toast.error("Error", "Something went wrong")}>
        Show Error
      </Button>
      
      <Button onClick={() => toast.warning("Warning", "Please review your input")}>
        Show Warning
      </Button>
      
      <Button onClick={() => toast.info("Info", "New updates are available")}>
        Show Info
      </Button>
    </div>
  );
}
```

### Toast with Custom Duration

```tsx
// Auto-dismiss after 3 seconds
toast.success("Saved", "Changes saved successfully", 3000);

// Auto-dismiss after 10 seconds
toast.error("Failed", "Operation failed", 10000);

// Never auto-dismiss (duration = 0)
toast.warning("Important", "Read this carefully", 0);
```

### Toast in Async Operations

```tsx
async function handleSave() {
  try {
    await saveData();
    toast.success("Saved", "Your data has been saved successfully");
  } catch (error) {
    toast.error("Error", "Failed to save data. Please try again.");
  }
}
```

### Toast Position Options

```tsx
<ToastProvider position="top-right">      {/* Default */}
<ToastProvider position="top-center">
<ToastProvider position="top-left">
<ToastProvider position="bottom-right">
<ToastProvider position="bottom-center">
<ToastProvider position="bottom-left">
```

### Real-World Example: Form Submission

```tsx
import { FormModal, Input, useToast } from "@/components/ui";

function CreateProjectForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const toast = useToast();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.warning("Validation Error", "Please enter a project name");
      return;
    }

    setLoading(true);
    
    try {
      await createProject(name);
      toast.success("Project Created", `${name} has been created successfully`);
      setIsOpen(false);
      setName("");
    } catch (error) {
      toast.error("Creation Failed", "Unable to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onSubmit={handleSubmit}
      title="Create New Project"
      loading={loading}
    >
      <Input
        label="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter project name"
      />
    </FormModal>
  );
}
```

---

## Combined Example: Complete CRUD Flow

```tsx
import { Button, ConfirmModal, FormModal, Select, Input, useToast } from "@/components/ui";
import { useState } from "react";

function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("");

  const typeOptions = [
    { value: "video", label: "Video Project" },
    { value: "audio", label: "Audio Project" },
    { value: "mixed", label: "Mixed Media" },
  ];

  const handleCreate = async () => {
    setLoading(true);
    try {
      const newProject = await createProject({ name, type });
      setProjects([...projects, newProject]);
      toast.success("Created", `Project "${name}" has been created`);
      setCreateOpen(false);
      setName("");
      setType("");
    } catch (error) {
      toast.error("Failed", "Unable to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProject(selectedProject.id);
      setProjects(projects.filter(p => p.id !== selectedProject.id));
      toast.success("Deleted", `Project "${selectedProject.name}" has been deleted`);
      setDeleteOpen(false);
    } catch (error) {
      toast.error("Failed", "Unable to delete project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={() => setCreateOpen(true)}>
        Create Project
      </Button>

      {/* Create Modal */}
      <FormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        title="Create New Project"
        submitText="Create"
        loading={loading}
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Project"
          />
          <Select
            label="Project Type"
            value={type}
            onChange={setType}
            options={typeOptions}
            placeholder="Select type"
          />
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description={`Are you sure you want to delete "${selectedProject?.name}"?`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
```

---

## Best Practices

### Modal

1. **Always provide a title** for clarity and accessibility
2. **Use appropriate variants**: danger for destructive actions, success for confirmations
3. **Handle loading states** in async operations
4. **Close on escape** by default for better UX
5. **Prevent body scroll** when modal is open (handled automatically)

### Select

1. **Use searchable** for long lists (>10 items)
2. **Provide helper text** for complex selections
3. **Show icons** for visual categorization
4. **Disable options** when appropriate, not hide them
5. **Validate selections** and show errors clearly

### Toast

1. **Keep messages concise** - title + brief description
2. **Use appropriate variants** - success for confirmations, error for failures
3. **Set reasonable durations** - 3-5 seconds for info, longer for errors
4. **Limit simultaneous toasts** - maxToasts=5 is recommended
5. **Position consistently** - choose one position and stick with it

---

## Accessibility

All components follow accessibility best practices:

- **Modal**: Traps focus, supports escape key, ARIA labels
- **Select**: Keyboard navigation (arrows, enter, escape), ARIA roles
- **Toast**: Screen reader announcements, dismissible, clear visual indicators

---

## Troubleshooting

### Modal not showing
- Check that `open` prop is true
- Verify z-index hierarchy (modal uses z-50)
- Ensure no parent has `overflow: hidden`

### Select dropdown clipped
- Parent container might have `overflow: hidden`
- Consider using a portal for dropdown rendering

### Toast not appearing
- Ensure `ToastProvider` wraps your component
- Check that `useToast` is called inside the provider
- Verify position doesn't conflict with other fixed elements
