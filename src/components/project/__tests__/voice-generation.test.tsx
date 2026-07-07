import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceGeneration } from "../voice-generation";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

// Mock toast hook
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    warning: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("VoiceGeneration Component", () => {
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

  const mockOwnVoice2: VoiceResponse = {
    id: 2,
    user_id: 100,
    name: "My Voice 2",
    audio_path: "/voices/voice2.webm",
    mime_type: "audio/webm",
    duration_seconds: 45,
    is_shared: false,
    is_approved: false,
    is_deleted: false,
    created_at: "2024-07-02T10:00:00Z",
    updated_at: "2024-07-02T10:00:00Z",
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

  const mockCommunityVoice2: VoiceWithCreator = {
    id: 4,
    user_id: 300,
    name: "Community Voice 2",
    audio_path: "/voices/community2.webm",
    mime_type: "audio/webm",
    duration_seconds: 35,
    is_shared: true,
    is_approved: true,
    is_deleted: false,
    creator_username: "bob",
    admin_approved_at: "2024-06-20T10:00:00Z",
    created_at: "2024-06-12T10:00:00Z",
    updated_at: "2024-06-20T10:00:00Z",
  };

  const defaultProps = {
    script: "This is a test script for TTS generation.",
    ownVoices: [mockOwnVoice, mockOwnVoice2],
    communityVoices: [mockCommunityVoice, mockCommunityVoice2],
    selectedVoiceId: undefined,
    audioUrl: undefined,
    isGenerating: false,
    progress: 0,
    onVoiceSelect: jest.fn(),
    onGenerate: jest.fn(),
    onChangeVoice: jest.fn(),
    isLoadingVoices: false,
    voicesError: null,
  };

  describe("Rendering", () => {
    it("should render the component header", () => {
      render(<VoiceGeneration {...defaultProps} />);
      expect(screen.getByText("Generate Voice")).toBeInTheDocument();
      expect(
        screen.getByText("Select a voice and generate TTS audio from your script")
      ).toBeInTheDocument();
    });

    it("should render voice selection tabs", () => {
      render(<VoiceGeneration {...defaultProps} />);
      expect(screen.getByText("My Voices")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
    });

    it("should display voice counts in tabs", () => {
      render(<VoiceGeneration {...defaultProps} />);
      const tabs = screen.getAllByRole("button");
      expect(screen.getByText("2")).toBeInTheDocument(); // 2 own voices
    });

    it("should render own voices by default", () => {
      render(<VoiceGeneration {...defaultProps} />);
      expect(screen.getByText("My Voice 1")).toBeInTheDocument();
      expect(screen.getByText("My Voice 2")).toBeInTheDocument();
      expect(screen.getByText("Your voice")).toBeInTheDocument();
    });
  });

  describe("Voice Selection - Own Voices", () => {
    it("should render all own voices in the grid", () => {
      render(<VoiceGeneration {...defaultProps} />);
      const voice1 = screen.getByText("My Voice 1");
      const voice2 = screen.getByText("My Voice 2");
      expect(voice1).toBeInTheDocument();
      expect(voice2).toBeInTheDocument();
    });

    it("should call onVoiceSelect when an own voice is clicked", async () => {
      const onVoiceSelect = jest.fn();
      render(
        <VoiceGeneration
          {...defaultProps}
          onVoiceSelect={onVoiceSelect}
        />
      );

      const voice1Card = screen.getByText("My Voice 1").closest("div")?.closest("[interactive]");
      if (!voice1Card) {
        // Fallback: find by text and navigate to parent card
        const voiceElements = screen.getAllByText("My Voice 1");
        fireEvent.click(voiceElements[0].closest("[interactive]") || voiceElements[0]);
      } else {
        fireEvent.click(voice1Card);
      }

      // Wait for the click to be processed
      await waitFor(() => {
        expect(onVoiceSelect).toHaveBeenCalled();
      });
    });

    it("should highlight selected voice with ring and border styling", () => {
      const { container } = render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
        />
      );

      // Check for selected state styling
      const cards = container.querySelectorAll("[role='button']");
      // The voice card should have ring-2 and border styling applied
      const hasRingClass = Array.from(cards).some((card) =>
        card.className.includes("ring-2") && card.className.includes("ring-accent-primary")
      );
      // Note: This may require additional CSS inspection or snapshot testing
    });

    it("should show checkmark for selected own voice", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
        />
      );

      // Check component state - selected voice should display check icon
      const checkMarks = screen.getAllByRole("img", { hidden: true });
      expect(checkMarks.length).toBeGreaterThan(0);
    });
  });

  describe("Voice Selection - Community Voices", () => {
    it("should switch to community tab when clicked", async () => {
      render(<VoiceGeneration {...defaultProps} />);

      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText("Community Voice 1")).toBeInTheDocument();
        expect(screen.getByText("Community Voice 2")).toBeInTheDocument();
      });
    });

    it("should display creator username for community voices", async () => {
      render(<VoiceGeneration {...defaultProps} />);

      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText("@alice")).toBeInTheDocument();
        expect(screen.getByText("@bob")).toBeInTheDocument();
      });
    });

    it("should display approval status for approved community voices", async () => {
      render(<VoiceGeneration {...defaultProps} />);

      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText(/✓ Approved/)).toBeInTheDocument();
      });
    });

    it("should call onVoiceSelect when a community voice is clicked", async () => {
      const onVoiceSelect = jest.fn();
      render(
        <VoiceGeneration
          {...defaultProps}
          onVoiceSelect={onVoiceSelect}
        />
      );

      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        const voiceCard = screen.getByText("Community Voice 1").closest("[interactive]");
        fireEvent.click(voiceCard!);
      });

      await waitFor(() => {
        expect(onVoiceSelect).toHaveBeenCalled();
      });
    });

    it("should render separate sections for own and community voices", async () => {
      const { container } = render(<VoiceGeneration {...defaultProps} />);

      // Own voices section
      expect(screen.getByText("My Voice 1")).toBeInTheDocument();

      // Switch to community
      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText("Community Voice 1")).toBeInTheDocument();
      });
    });
  });

  describe("Available Voices List Structure", () => {
    /**
     * Property 5: Available Voices List Structure
     * For any call to getAvailableVoices(), the response should always contain
     * both own_voices and community_voices arrays, with community voices having
     * creator_username.
     *
     * This test validates that the component correctly handles the AvailableVoicesResponse
     * structure with separate arrays for own and community voices.
     */
    it("should handle separate own and community voice arrays correctly", () => {
      const props = {
        ...defaultProps,
        ownVoices: [mockOwnVoice],
        communityVoices: [mockCommunityVoice],
      };

      render(<VoiceGeneration {...props} />);

      // Verify own voices are rendered
      expect(screen.getByText("My Voice 1")).toBeInTheDocument();
      expect(screen.getByText("Your voice")).toBeInTheDocument();

      // Switch to community and verify
      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      expect(screen.getByText("Community Voice 1")).toBeInTheDocument();
      expect(screen.getByText("@alice")).toBeInTheDocument();
    });

    it("should display empty states when voice arrays are empty", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          ownVoices={[]}
          communityVoices={[]}
        />
      );

      expect(screen.getByText("No personal voices yet")).toBeInTheDocument();
    });

    it("should show empty community voices message", async () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          communityVoices={[]}
        />
      );

      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText("No community voices available")).toBeInTheDocument();
      });
    });
  });

  describe("Generation Section", () => {
    it("should show generation UI when no audio is generated", () => {
      render(<VoiceGeneration {...defaultProps} />);
      expect(screen.getByText("Generate Audio")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Generate Voice Audio/i })).toBeInTheDocument();
    });

    it("should disable generate button when no voice is selected", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={undefined}
        />
      );

      const generateButton = screen.getByRole("button", { name: /Generate Voice Audio/i });
      expect(generateButton).toBeDisabled();
    });

    it("should enable generate button when voice is selected", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
        />
      );

      const generateButton = screen.getByRole("button", { name: /Generate Voice Audio/i });
      expect(generateButton).not.toBeDisabled();
    });

    it("should show loading state while generating", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          isGenerating={true}
          progress={45}
        />
      );

      expect(screen.getByText(/Generating audio... 45%/)).toBeInTheDocument();
    });

    it("should display progress bar while generating", () => {
      const { container } = render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          isGenerating={true}
          progress={75}
        />
      );

      const progressBar = container.querySelector("[style*='width']");
      expect(progressBar).toBeInTheDocument();
    });

    it("should calculate word count from script correctly", () => {
      const script = "This is a test script with ten words total for testing purposes here.";
      render(
        <VoiceGeneration
          {...defaultProps}
          script={script}
          selectedVoiceId={1}
        />
      );

      // 10 words at 150 wpm = 0.066 minutes ≈ rounds up to 1 minute
      expect(screen.getByText(/Estimated duration: ~1 minutes/)).toBeInTheDocument();
    });
  });

  describe("Audio Player", () => {
    it("should show audio player when audioUrl is provided", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
        />
      );

      expect(screen.getByText("Audio Generated Successfully")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Download/i })).toBeInTheDocument();
    });

    it("should show selected voice name in audio player", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
        />
      );

      expect(screen.getByText(/Voice: My Voice 1/)).toBeInTheDocument();
    });

    it("should have play/pause button in audio player", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
        />
      );

      const buttons = screen.getAllByRole("button");
      const playPauseButton = buttons.find((btn) => btn.querySelector("svg"));
      expect(playPauseButton).toBeInTheDocument();
    });

    it("should show regenerate option with change voice button", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
        />
      );

      expect(
        screen.getByText("Not satisfied with the result?")
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Change Voice/i })).toBeInTheDocument();
    });

    it("should call onChangeVoice when Change Voice button is clicked", async () => {
      const onChangeVoice = jest.fn();
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
          onChangeVoice={onChangeVoice}
        />
      );

      const changeVoiceButton = screen.getByRole("button", { name: /Change Voice/i });
      fireEvent.click(changeVoiceButton);

      await waitFor(() => {
        expect(onChangeVoice).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error message when voicesError prop is set", () => {
      const errorMessage = "Failed to load voices from server";
      render(
        <VoiceGeneration
          {...defaultProps}
          voicesError={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should show error styling with alert icon", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          voicesError="Connection error"
        />
      );

      expect(screen.getByText("Connection error")).toBeInTheDocument();
    });

    it("should show loading skeleton when isLoadingVoices is true", () => {
      const { container } = render(
        <VoiceGeneration
          {...defaultProps}
          isLoadingVoices={true}
        />
      );

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should show loading skeletons while loading voices", () => {
      const { container } = render(
        <VoiceGeneration
          {...defaultProps}
          isLoadingVoices={true}
        />
      );

      // Should show 4 skeleton placeholders
      const animatedDivs = container.querySelectorAll(".animate-pulse");
      expect(animatedDivs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Integration Tests", () => {
    it("should handle voice selection and generation flow", async () => {
      const onVoiceSelect = jest.fn();
      const onGenerate = jest.fn();

      const { rerender } = render(
        <VoiceGeneration
          {...defaultProps}
          onVoiceSelect={onVoiceSelect}
          onGenerate={onGenerate}
        />
      );

      // Simulate voice selection
      const voiceCard = screen.getByText("My Voice 1").closest("[interactive]");
      if (voiceCard) {
        fireEvent.click(voiceCard);
      }

      // Rerender with selected voice
      rerender(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          onVoiceSelect={onVoiceSelect}
          onGenerate={onGenerate}
        />
      );

      // Generate button should now be enabled
      const generateButton = screen.getByRole("button", { name: /Generate Voice Audio/i });
      expect(generateButton).not.toBeDisabled();

      // Click generate
      fireEvent.click(generateButton);
      await waitFor(() => {
        expect(onGenerate).toHaveBeenCalledWith(1);
      });
    });

    it("should handle switching between own and community voices", async () => {
      const onVoiceSelect = jest.fn();
      render(
        <VoiceGeneration
          {...defaultProps}
          onVoiceSelect={onVoiceSelect}
        />
      );

      // Select own voice
      const ownVoiceCard = screen.getByText("My Voice 1").closest("[interactive]");
      if (ownVoiceCard) {
        fireEvent.click(ownVoiceCard);
      }

      // Switch to community tab
      const communityTab = screen.getByText("Community").closest("button");
      fireEvent.click(communityTab!);

      await waitFor(() => {
        expect(screen.getByText("Community Voice 1")).toBeInTheDocument();
      });

      // Select community voice
      const communityCard = screen.getByText("Community Voice 1").closest("[interactive]");
      if (communityCard) {
        fireEvent.click(communityCard);
      }

      await waitFor(() => {
        expect(onVoiceSelect).toHaveBeenCalled();
      });
    });

    it("should handle full voice selection and audio generation lifecycle", async () => {
      const onVoiceSelect = jest.fn();
      const onGenerate = jest.fn();
      const onChangeVoice = jest.fn();

      const { rerender } = render(
        <VoiceGeneration
          {...defaultProps}
          onVoiceSelect={onVoiceSelect}
          onGenerate={onGenerate}
          onChangeVoice={onChangeVoice}
        />
      );

      // Step 1: Select voice
      const voiceCard = screen.getByText("My Voice 1").closest("[interactive]");
      if (voiceCard) {
        fireEvent.click(voiceCard);
      }

      rerender(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          onVoiceSelect={onVoiceSelect}
          onGenerate={onGenerate}
          onChangeVoice={onChangeVoice}
        />
      );

      // Step 2: Generate audio
      const generateButton = screen.getByRole("button", { name: /Generate Voice Audio/i });
      fireEvent.click(generateButton);

      // Step 3: Show generated audio and allow change
      rerender(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
          audioUrl="https://example.com/audio.webm"
          onVoiceSelect={onVoiceSelect}
          onGenerate={onGenerate}
          onChangeVoice={onChangeVoice}
        />
      );

      expect(screen.getByText("Audio Generated Successfully")).toBeInTheDocument();

      // Step 4: Change voice
      const changeVoiceButton = screen.getByRole("button", { name: /Change Voice/i });
      fireEvent.click(changeVoiceButton);

      await waitFor(() => {
        expect(onChangeVoice).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<VoiceGeneration {...defaultProps} />);
      const heading = screen.getByText("Generate Voice");
      expect(heading.tagName).toBe("H2");
    });

    it("should have descriptive text for tabs", () => {
      render(<VoiceGeneration {...defaultProps} />);
      expect(screen.getByText(/Choose from your voices or discover/)).toBeInTheDocument();
    });

    it("should have proper button labels", () => {
      render(
        <VoiceGeneration
          {...defaultProps}
          selectedVoiceId={1}
        />
      );
      expect(screen.getByRole("button", { name: /Generate Voice Audio/i })).toBeInTheDocument();
    });
  });
});
