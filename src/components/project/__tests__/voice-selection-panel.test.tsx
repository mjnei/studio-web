import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoiceSelectionPanel } from "../voice-selection-panel";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

vi.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        "project.voice.myVoices": "Mine",
        "project.voice.community": "Community",
        "project.voice.yourVoice": "Your voice",
        "project.voice.noPersonalVoices": "No personal voices yet",
        "project.voice.recordFirst": "Record your first voice",
        "project.voice.recordVoice": "Record Voice",
        "project.voice.addVoice": "Add Voice",
        "project.voice.remainingLeft": `${params?.count} remaining`,
        "project.voice.limitReached": "Limit reached",
        "project.voice.noCommunityVoices": "No community voices available",
        "project.voice.communityHint": "Check back later",
        "project.voice.approved": "Approved",
      };
      return translations[key] ?? key;
    },
  }),
}));

describe("VoiceSelectionPanel", () => {
  const mockOwnVoice: VoiceResponse = {
    id: 1,
    user_id: 100,
    name: "My Voice 1",
    audio_path: "/voices/voice1.webm",
    mime_type: "audio/webm",
    duration_seconds: 30,
    is_shared: false,
    is_approved: false,
    is_deleted: false,
    created_at: "2024-07-01T10:00:00Z",
    updated_at: "2024-07-01T10:00:00Z",
  };

  const mockCommunityVoice: VoiceWithCreator = {
    id: 3,
    user_id: 200,
    name: "Community Voice 1",
    audio_path: "/voices/community1.webm",
    mime_type: "audio/webm",
    duration_seconds: 60,
    is_shared: true,
    is_approved: true,
    is_deleted: false,
    creator_username: "alice",
    admin_approved_at: "2024-06-15T10:00:00Z",
    created_at: "2024-06-10T10:00:00Z",
    updated_at: "2024-06-15T10:00:00Z",
  };

  const defaultProps = {
    ownVoices: [mockOwnVoice],
    communityVoices: [mockCommunityVoice],
    selectedVoiceId: null,
    isLoadingVoices: false,
    voicesError: null,
    onVoiceSelect: vi.fn(),
    onAddVoice: vi.fn(),
    canAddVoice: true,
    remainingVoiceCount: 2,
  };

  it("renders voice tabs and own voices by default", () => {
    render(<VoiceSelectionPanel {...defaultProps} />);

    expect(screen.getByText("Mine")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("My Voice 1")).toBeInTheDocument();
    expect(screen.getByText("Your voice")).toBeInTheDocument();
  });

  it("calls onVoiceSelect when an own voice is clicked", async () => {
    const onVoiceSelect = vi.fn();
    render(<VoiceSelectionPanel {...defaultProps} onVoiceSelect={onVoiceSelect} />);

    fireEvent.click(screen.getByText("My Voice 1"));

    await waitFor(() => {
      expect(onVoiceSelect).toHaveBeenCalledWith(1);
    });
  });

  it("switches to community tab and shows community voices", async () => {
    render(<VoiceSelectionPanel {...defaultProps} />);

    fireEvent.click(screen.getByText("Community"));

    await waitFor(() => {
      expect(screen.getByText("Community Voice 1")).toBeInTheDocument();
      expect(screen.getByText("@alice")).toBeInTheDocument();
      expect(screen.getByText("Approved")).toBeInTheDocument();
    });
  });

  it("shows empty state when no own voices", () => {
    render(<VoiceSelectionPanel {...defaultProps} ownVoices={[]} />);
    expect(screen.getByText("No personal voices yet")).toBeInTheDocument();
  });

  it("shows error message when voicesError is set", () => {
    render(<VoiceSelectionPanel {...defaultProps} voicesError="Failed to load voices" />);
    expect(screen.getByText("Failed to load voices")).toBeInTheDocument();
  });

  it("shows loading skeletons when isLoadingVoices is true", () => {
    const { container } = render(<VoiceSelectionPanel {...defaultProps} isLoadingVoices={true} />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("calls onAddVoice from the add voice card", async () => {
    const onAddVoice = vi.fn();
    render(<VoiceSelectionPanel {...defaultProps} onAddVoice={onAddVoice} />);

    fireEvent.click(screen.getByText("Add Voice"));

    await waitFor(() => {
      expect(onAddVoice).toHaveBeenCalled();
    });
  });
});
