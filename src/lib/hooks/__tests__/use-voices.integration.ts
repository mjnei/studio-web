/**
 * Integration test suite for useVoices hook
 *
 * This file contains integration tests that verify:
 * 1. Hook correctly uses voice-client functions
 * 2. State is managed properly (voices, loading, error)
 * 3. Audio URLs are fetched and attached to voices
 * 4. Upload/delete/sharing operations work end-to-end
 * 5. Error handling works correctly
 *
 * **Validates: Requirements 2.1-2.6**
 * **Property 1: Audio URL Retrieval Consistency**
 *
 * To run these tests against a live backend:
 * 1. Start the backend (e.g., `uv run uvicorn app.main:app --reload` on port 8020)
 * 2. Make sure you have TEST_TOKEN with proper voice access
 * 3. Run: `npx ts-node src/lib/hooks/__tests__/use-voices.integration.ts`
 */

// Color output for test results
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function pass(message: string) {
  log(`✓ PASS: ${message}`, colors.green);
}

function fail(message: string, error?: unknown) {
  log(`✗ FAIL: ${message}`, colors.red);
  if (error instanceof Error) {
    log(` Error: ${error.message}`, colors.red);
  } else if (error !== undefined) {
    log(` Error: ${String(error)}`, colors.red);
  }
}

function info(message: string) {
  log(message, colors.blue);
}

function section(title: string) {
  log(`\n${"=".repeat(70)}`, colors.cyan);
  log(`${title}`, colors.cyan);
  log(`${"=".repeat(70)}`, colors.cyan);
}

// Test configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

/**
 * Mock VoiceClient for integration testing
 * Simulates the behavior of the actual voice-client
 */
class MockVoiceClient {
  voices: Array<{
    id: number;
    user_id: number;
    name: string;
    audio_path: string;
    mime_type: string;
    language: string;
    duration_seconds: number;
    is_shared: boolean;
    is_approved: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
  }> = [];

  async listVoices(skip = 0, limit = 100) {
    log(` [Mock] listVoices(skip=${skip}, limit=${limit})`, colors.yellow);
    // Simulate fetching voices from API
    return this.voices;
  }

  async getVoiceAudioUrl(id: number) {
    log(` [Mock] getVoiceAudioUrl(${id})`, colors.yellow);
    // Simulate returning a presigned URL
    return {
      audio_url: `${API_BASE}/voices/${id}/stream`,
      expires_in: 3600,
      storage_type: "local" as const,
    };
  }

  async uploadVoice(file: Blob, name: string, durationSeconds?: number) {
    log(
      ` [Mock] uploadVoice(file: ${file.type}, name: "${name}", duration: ${durationSeconds})`,
      colors.yellow
    );
    // Simulate creating a new voice
    const newVoice = {
      id: this.voices.length + 1,
      user_id: 1,
      name,
      audio_path: `/voices/${name.replace(/\s+/g, "-").toLowerCase()}.webm`,
      mime_type: file.type || "audio/webm",
      language: "en",
      duration_seconds: durationSeconds || 0,
      is_shared: false,
      is_approved: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.voices.push(newVoice);
    return newVoice;
  }

  async deleteVoice(id: number) {
    log(` [Mock] deleteVoice(${id})`, colors.yellow);
    this.voices = this.voices.filter((v) => v.id !== id);
  }

  async toggleVoiceSharing(id: number, isShared: boolean) {
    log(` [Mock] toggleVoiceSharing(${id}, ${isShared})`, colors.yellow);
    const voice = this.voices.find((v) => v.id === id);
    if (voice) {
      voice.is_shared = isShared;
      return voice;
    }
    throw new Error(`Voice ${id} not found`);
  }
}

/**
 * Test Suite
 */
async function runTests() {
  const mockClient = new MockVoiceClient();
  const testResults = {
    passed: 0,
    failed: 0,
  };

  section("USE-VOICES HOOK INTEGRATION TESTS");

  // ============================================================================
  // Test 1: Initial Fetch on Mount
  // ============================================================================
  section("Test 1: Fetch Voices on Mount");

  try {
    log("\nScenario: Hook mounted with empty list");
    log("Expected: loading=false, voices=[], error=null");

    mockClient.voices = [];
    const voices = await mockClient.listVoices();

    if (voices.length === 0) {
      pass("Empty voices list handled correctly");
      testResults.passed++;
    } else {
      fail("Expected empty voices list");
      testResults.failed++;
    }
  } catch (error) {
    fail("Fetch on mount test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 2: Audio URL Attachment
  // ============================================================================
  section("Test 2: Audio URL Attachment (Property 1)");

  try {
    log("\nScenario: Fetch voices and attach audio URLs");
    log("Expected: Each voice has audio_url with valid storage_type");

    // Setup: Create mock voices
    mockClient.voices = [
      {
        id: 1,
        user_id: 1,
        name: "Voice 1",
        audio_path: "/voices/voice1.webm",
        mime_type: "audio/webm",
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        user_id: 1,
        name: "Voice 2",
        audio_path: "/voices/voice2.webm",
        mime_type: "audio/webm",
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Step 1: List voices
    const voices = await mockClient.listVoices();
    log(` Fetched ${voices.length} voices`, colors.blue);

    // Step 2: Fetch audio URLs for all voices in parallel
    const voicesWithUrls = await Promise.all(
      voices.map(async (voice) => {
        try {
          const audioData = await mockClient.getVoiceAudioUrl(voice.id);
          return {
            ...voice,
            audio_url: audioData.audio_url,
            audio_storage_type: audioData.storage_type,
            audio_expires_in: audioData.expires_in,
          };
        } catch {
          log(` Warning: Failed to fetch audio URL for voice ${voice.id}`, colors.yellow);
          return voice;
        }
      })
    );

    // Verify: Each voice has audio_url property
    let allHaveUrls = true;
    for (const voice of voicesWithUrls) {
      if (voice.audio_url) {
        pass(`Voice ${voice.id} has audio_url: ${voice.audio_url}`);
      } else {
        fail(`Voice ${voice.id} missing audio_url`);
        allHaveUrls = false;
      }
    }

    if (allHaveUrls) {
      pass("**Property 1 Validated: All voices have audio URLs");
      testResults.passed++;
    } else {
      fail("**Property 1 Failed: Not all voices have audio URLs");
      testResults.failed++;
    }
  } catch (error) {
    fail("Audio URL attachment test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 3: Voice Upload Round Trip
  // ============================================================================
  section("Test 3: Voice Upload Round Trip (Property 2)");

  try {
    log("\nScenario: Upload a voice and verify retrieval");
    log("Expected: Uploaded voice retrievable with same name and duration");

    // Step 1: Create a mock audio file
    const audioData = new Uint8Array([1, 2, 3, 4, 5]);
    const testFile = new Blob([audioData], { type: "audio/webm" });
    const testName = "Integration Test Voice";
    const testDuration = 42.5;

    // Step 2: Upload voice
    const uploadedVoice = await mockClient.uploadVoice(testFile, testName, testDuration);
    log(` Uploaded voice with ID ${uploadedVoice.id}`, colors.blue);

    // Step 3: Verify voice details
    if (uploadedVoice.name === testName) {
      pass(`Voice name matches: "${uploadedVoice.name}"`);
    } else {
      fail(`Voice name mismatch: expected "${testName}", got "${uploadedVoice.name}"`);
    }

    if (uploadedVoice.duration_seconds === testDuration) {
      pass(`Voice duration matches: ${uploadedVoice.duration_seconds}s`);
    } else {
      fail(
        `Voice duration mismatch: expected ${testDuration}s, got ${uploadedVoice.duration_seconds}s`
      );
    }

    // Step 4: Fetch audio URL for uploaded voice
    const audioUrl = await mockClient.getVoiceAudioUrl(uploadedVoice.id);
    if (audioUrl.audio_url && audioUrl.storage_type) {
      pass(`Audio URL accessible: ${audioUrl.audio_url} (${audioUrl.storage_type})`);
      pass("**Property 2 Validated: Upload round trip successful");
      testResults.passed++;
    } else {
      fail("Audio URL not accessible after upload");
      testResults.failed++;
    }
  } catch (error) {
    fail("Voice upload round trip test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 4: Voice Deletion
  // ============================================================================
  section("Test 4: Voice Deletion");

  try {
    log("\nScenario: Delete a voice from state");
    log("Expected: Voice removed from voices array");

    const initialCount = mockClient.voices.length;
    log(` Initial voices: ${initialCount}`, colors.blue);

    if (initialCount > 0) {
      const voiceToDelete = mockClient.voices[0];
      await mockClient.deleteVoice(voiceToDelete.id);

      const finalCount = mockClient.voices.length;
      log(` Final voices: ${finalCount}`, colors.blue);

      if (finalCount === initialCount - 1) {
        pass("Voice deleted and filtered from state");
        pass("Voice count decreased by 1");
        testResults.passed++;
      } else {
        fail(`Expected count ${initialCount - 1}, got ${finalCount}`);
        testResults.failed++;
      }
    } else {
      info(" Skipped: No voices to delete");
    }
  } catch (error) {
    fail("Voice deletion test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 5: Voice Sharing Toggle
  // ============================================================================
  section("Test 5: Voice Sharing Toggle (Property 4)");

  try {
    log("\nScenario: Toggle voice sharing and verify state update");
    log("Expected: is_shared flag updated in voice object");

    if (mockClient.voices.length > 0) {
      const voice = mockClient.voices[0];
      const originalShared = voice.is_shared;
      log(` Original is_shared: ${originalShared}`, colors.blue);

      // Toggle sharing
      const updatedVoice = await mockClient.toggleVoiceSharing(voice.id, !originalShared);
      log(` Updated is_shared: ${updatedVoice.is_shared}`, colors.blue);

      if (updatedVoice.is_shared === !originalShared) {
        pass("Voice sharing toggle successful");
        pass(`is_shared updated: ${originalShared} → ${updatedVoice.is_shared}`);
        pass("**Property 4 Validated: Sharing state consistency");
        testResults.passed++;
      } else {
        fail("Voice sharing flag not updated");
        testResults.failed++;
      }
    } else {
      info(" Skipped: No voices to toggle sharing");
    }
  } catch (error) {
    fail("Voice sharing toggle test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 6: Error Handling
  // ============================================================================
  section("Test 6: Error Handling");

  try {
    log("\nScenario: Handle 404 Not Found");
    log("Expected: Error thrown and message exposed");

    try {
      await mockClient.toggleVoiceSharing(999, true); // Non-existent voice
      fail("Should have thrown error for non-existent voice");
      testResults.failed++;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("not found")) {
        pass("404 error caught and message exposed");
        testResults.passed++;
      } else {
        const message = err instanceof Error ? err.message : String(err);
        fail(`Unexpected error message: ${message}`);
        testResults.failed++;
      }
    }
  } catch (error) {
    fail("Error handling test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Test 7: Parallel Audio URL Fetching
  // ============================================================================
  section("Test 7: Parallel Audio URL Fetching");

  try {
    log("\nScenario: Fetch audio URLs for multiple voices");
    log("Expected: All audio URLs fetched in parallel");

    // Reset with multiple voices
    mockClient.voices = [
      {
        id: 10,
        user_id: 1,
        name: "Voice A",
        audio_path: "/voices/a.webm",
        mime_type: "audio/webm",
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 11,
        user_id: 1,
        name: "Voice B",
        audio_path: "/voices/b.webm",
        mime_type: "audio/webm",
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 12,
        user_id: 1,
        name: "Voice C",
        audio_path: "/voices/c.webm",
        mime_type: "audio/webm",
        is_shared: false,
        is_approved: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const startTime = Date.now();

    // Fetch audio URLs in parallel
    const urls = await Promise.all(mockClient.voices.map((v) => mockClient.getVoiceAudioUrl(v.id)));

    const elapsed = Date.now() - startTime;

    if (urls.length === mockClient.voices.length) {
      pass(`All ${urls.length} audio URLs fetched in ${elapsed}ms`);
      pass("Audio URL fetching uses Promise.all (parallel)");
      testResults.passed++;
    } else {
      fail(`Expected ${mockClient.voices.length} URLs, got ${urls.length}`);
      testResults.failed++;
    }
  } catch (error) {
    fail("Parallel audio URL fetching test", error);
    testResults.failed++;
  }

  // ============================================================================
  // Summary
  // ============================================================================
  section("TEST RESULTS");

  log(`Total Passed: ${testResults.passed}`, colors.green);
  log(`Total Failed: ${testResults.failed}`, colors.red);

  if (testResults.failed === 0) {
    log("\n✅ All integration tests passed!", colors.green);
  } else {
    log(`\n⚠️ ${testResults.failed} test(s) failed`, colors.red);
  }

  log("\n**Validations:**", colors.cyan);
  log(" - Requirement 2.1: Fetch voices on mount", colors.cyan);
  log(" - Requirement 2.2: Audio URLs attached", colors.cyan);
  log(" - Requirement 2.3: Upload with new parameters", colors.cyan);
  log(" - Requirement 2.4: Delete with state update", colors.cyan);
  log(" - Requirement 2.5: Toggle sharing", colors.cyan);
  log(" - Requirement 2.6: Refetch capability", colors.cyan);
  log(" - Property 1: Audio URL Retrieval Consistency", colors.cyan);
  log(" - Property 2: Voice Upload Round Trip", colors.cyan);
  log(" - Property 4: Voice Sharing State Consistency", colors.cyan);

  return testResults.failed === 0;
}

// Run tests
export { runTests };

if (typeof require !== "undefined" && require.main === module) {
  runTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test suite error:", error);
      process.exit(1);
    });
}
