/**
 * Integration tests for voice-client against backend endpoints
 *
 * These tests verify:
 * 1. Endpoint URLs are correct
 * 2. Form data is serialized properly for uploads
 * 3. Authorization headers are set correctly
 * 4. All HTTP methods are correct (POST, GET, PATCH, DELETE)
 *
 * Requirements: 9.1, 12.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  uploadVoice,
  listVoices,
  getVoice,
  updateVoice,
  deleteVoice,
  getVoiceAudioUrl,
  toggleVoiceSharing,
  getAvailableVoices,
} from "../voice-client";
import * as apiClient from "../api-client";

// Mock the api-client module
vi.mock("../api-client", () => ({
  request: vi.fn(),
  getAccessToken: vi.fn(),
}));

describe("Voice Client Integration Tests", () => {
  let mockFetch: any;
  const API_BASE = "http://localhost:8020/api/v1";
  const TEST_TOKEN = "test-bearer-token";

  beforeEach(() => {
    // Setup mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Setup default mocks
    vi.mocked(apiClient.getAccessToken).mockReturnValue(TEST_TOKEN);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Endpoint URL Verification", () => {
    it("listVoices uses GET /api/v1/voices/?skip={skip}&limit={limit}", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce([]);

      await listVoices(0, 50);

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith("/voices/?skip=0&limit=50");
    });

    it("getVoice uses GET /api/v1/voices/{id}", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({
        id: 123,
        name: "Test Voice",
      });

      await getVoice(123);

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith("/voices/123");
    });

    it("updateVoice uses PATCH /api/v1/voices/{id}", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({
        id: 123,
        name: "Updated Voice",
      });

      await updateVoice(123, { name: "Updated Voice" });

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith(
        "/voices/123",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    it("deleteVoice uses DELETE /api/v1/voices/{id}", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce(undefined);

      await deleteVoice(123);

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith(
        "/voices/123",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("getVoiceAudioUrl uses GET /api/v1/voices/{id}/audio-url", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({
        audio_url: "https://example.com/audio.webm",
        expires_in: 3600,
        storage_type: "s3",
      });

      await getVoiceAudioUrl(123);

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith("/voices/123/audio-url");
    });

    it("toggleVoiceSharing uses PATCH /api/v1/voices/{id}/share", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({
        id: 123,
        is_shared: true,
      });

      await toggleVoiceSharing(123, true);

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith(
        "/voices/123/share",
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    it("getAvailableVoices uses GET /api/v1/voices/available", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({
        own_voices: [],
        community_voices: [],
      });

      await getAvailableVoices();

      expect(vi.mocked(apiClient.request)).toHaveBeenCalledWith("/voices/available");
    });

    it("uploadVoice uses POST /api/v1/voices/upload", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test Voice" }),
      });

      const file = new Blob(["audio data"], { type: "audio/webm" });
      await uploadVoice(file, "Test Voice", 30);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE}/voices/upload`,
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("Form Data Serialization (Upload)", () => {
    it("includes file field with Blob in form data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test Voice" }),
      });

      const file = new Blob(["audio data"], { type: "audio/webm" });
      await uploadVoice(file, "Test Voice");

      const call = mockFetch.mock.calls[0];
      const formData = call[1].body;

      expect(formData).toBeInstanceOf(FormData);
      // FormData.get() is only available in newer Node versions, so we check through entries
      const entries = Array.from(formData.entries());
      const fileEntry = entries.find(([key]) => key === "file");
      expect(fileEntry).toBeDefined();
      expect(fileEntry?.[1]).toBeInstanceOf(File);
    });

    it("includes name field with string value in form data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "My Voice" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "My Voice");

      const call = mockFetch.mock.calls[0];
      const formData = call[1].body;

      const entries = Array.from(formData.entries());
      const nameEntry = entries.find(([key]) => key === "name");
      expect(nameEntry?.[1]).toBe("My Voice");
    });

    it("includes duration_seconds field when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test Voice" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test", 45.5);

      const call = mockFetch.mock.calls[0];
      const formData = call[1].body;

      const entries = Array.from(formData.entries());
      const durationEntry = entries.find(([key]) => key === "duration_seconds");
      expect(durationEntry?.[1]).toBe("45.5");
    });

    it("excludes duration_seconds when not provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test Voice" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      const formData = call[1].body;

      const entries = Array.from(formData.entries());
      const durationEntry = entries.find(([key]) => key === "duration_seconds");
      expect(durationEntry).toBeUndefined();
    });

    it("uses correct MIME type from file blob for various formats", async () => {
      const testCases = [
        { mimeType: "audio/webm", ext: ".webm" },
        { mimeType: "audio/ogg", ext: ".ogg" },
        { mimeType: "audio/wav", ext: ".wav" },
        { mimeType: "audio/mp3", ext: ".mp3" },
        { mimeType: "audio/mpeg", ext: ".mp3" },
        { mimeType: "audio/mp4", ext: ".mp4" },
      ];

      for (const { mimeType, ext } of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 1, name: "Test" }),
        });

        const file = new Blob(["data"], { type: mimeType });
        await uploadVoice(file, "Test Voice");

        const call = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
        const formData = call[1].body;
        const entries = Array.from(formData.entries());
        const fileEntry = entries.find(([key]) => key === "file") as [string, File];
        expect(fileEntry[1].type).toBe(mimeType);
        expect(fileEntry[1].name).toContain(ext);
      }
    });
  });

  describe("Authorization Headers", () => {
    it("includes Authorization: Bearer <token> header in upload request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers.Authorization).toBe(`Bearer ${TEST_TOKEN}`);
    });

    it("uses token from getAccessToken() function", async () => {
      const customToken = "custom-token-123";
      vi.mocked(apiClient.getAccessToken).mockReturnValueOnce(customToken);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      expect(headers.Authorization).toBe(`Bearer ${customToken}`);
    });

    it("gracefully handles empty token (graceful fallback)", async () => {
      vi.mocked(apiClient.getAccessToken).mockReturnValueOnce("");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      const headers = call[1].headers;

      // When token is empty, Authorization header should not be set
      expect(headers.Authorization).toBeUndefined();
    });

    it("sets credentials include in fetch request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: "Test" }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      expect(call[1].credentials).toBe("include");
    });
  });

  describe("HTTP Methods Verification", () => {
    it("listVoices uses GET method via request function", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce([]);

      await listVoices();

      // request() function defaults to GET when no method specified
      const call = vi.mocked(apiClient.request).mock.calls[0];
      expect(call[0]).toBe("/voices/?skip=0&limit=100");
      // Second parameter not passed = GET
      expect(call[1]).toBeUndefined();
    });

    it("updateVoice uses PATCH method", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({});

      await updateVoice(1, { name: "New Name" });

      const call = vi.mocked(apiClient.request).mock.calls[0];
      expect(call[1]?.method).toBe("PATCH");
    });

    it("deleteVoice uses DELETE method", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce(undefined);

      await deleteVoice(1);

      const call = vi.mocked(apiClient.request).mock.calls[0];
      expect(call[1]?.method).toBe("DELETE");
    });

    it("toggleVoiceSharing uses PATCH method", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({});

      await toggleVoiceSharing(1, true);

      const call = vi.mocked(apiClient.request).mock.calls[0];
      expect(call[1]?.method).toBe("PATCH");
    });

    it("uploadVoice uses POST method", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      await uploadVoice(new Blob([], { type: "audio/webm" }), "Test");

      const call = mockFetch.mock.calls[0];
      expect(call[1].method).toBe("POST");
    });
  });

  describe("Request Body Serialization", () => {
    it("updateVoice sends JSON body with name and language fields", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({});

      await updateVoice(1, { name: "New Name", language: "en" });

      const call = vi.mocked(apiClient.request).mock.calls[0];
      const body = JSON.parse(call[1]?.body || "{}");
      expect(body.name).toBe("New Name");
      expect(body.language).toBe("en");
    });

    it("toggleVoiceSharing sends JSON body with is_shared boolean", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({});

      await toggleVoiceSharing(1, true);

      const call = vi.mocked(apiClient.request).mock.calls[0];
      const body = JSON.parse(call[1]?.body || "{}");
      expect(body.is_shared).toBe(true);
    });

    it("toggleVoiceSharing correctly serializes false value", async () => {
      vi.mocked(apiClient.request).mockResolvedValueOnce({});

      await toggleVoiceSharing(1, false);

      const call = vi.mocked(apiClient.request).mock.calls[0];
      const body = JSON.parse(call[1]?.body || "{}");
      expect(body.is_shared).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("uploadVoice throws error when fetch response is not ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Upload failed",
      });

      const file = new Blob([], { type: "audio/webm" });

      await expect(uploadVoice(file, "Test")).rejects.toThrow("Upload failed");
    });

    it("uploadVoice provides default error message when response text is empty", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "",
      });

      const file = new Blob([], { type: "audio/webm" });

      await expect(uploadVoice(file, "Test")).rejects.toThrow("Failed to upload voice");
    });
  });

  describe("Response Parsing", () => {
    it("uploadVoice returns parsed JSON response", async () => {
      const expectedResponse = {
        id: 123,
        name: "Test Voice",
        audio_path: "/uploads/voice.webm",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse,
      });

      const result = await uploadVoice(new Blob([], { type: "audio/webm" }), "Test Voice");

      expect(result).toEqual(expectedResponse);
    });

    it("listVoices returns array of voices", async () => {
      const expectedVoices = [
        { id: 1, name: "Voice 1" },
        { id: 2, name: "Voice 2" },
      ];

      vi.mocked(apiClient.request).mockResolvedValueOnce(expectedVoices);

      const result = await listVoices();

      expect(result).toEqual(expectedVoices);
      expect(Array.isArray(result)).toBe(true);
    });

    it("getAvailableVoices returns AvailableVoicesResponse structure", async () => {
      const expectedResponse = {
        own_voices: [{ id: 1, name: "My Voice" }],
        community_voices: [{ id: 2, name: "Community Voice", creator_username: "user" }],
      };

      vi.mocked(apiClient.request).mockResolvedValueOnce(expectedResponse);

      const result = await getAvailableVoices();

      expect(result).toHaveProperty("own_voices");
      expect(result).toHaveProperty("community_voices");
      expect(Array.isArray(result.own_voices)).toBe(true);
      expect(Array.isArray(result.community_voices)).toBe(true);
    });
  });
});
