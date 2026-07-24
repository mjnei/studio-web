/**
 * Audio conversion utilities for converting WebM and other formats to standard audio formats.
 * Attempts to convert WebM to MP3 or WAV using available Web Audio APIs and FFmpeg if available.
 */

/**
 * Convert WebM audio to a pure audio format (WAV preferred, fallback to MP3 if available)
 * This function attempts to extract pure audio from a WebM container.
 *
 * @param blob - The WebM blob to convert
 * @param voiceName - The voice name for logging purposes
 * @returns A promise that resolves to an audio blob (WAV or MP3), or the original blob if conversion fails
 */
export async function convertWebmToAudio(blob: Blob, voiceName: string): Promise<Blob> {
  try {
    // Try to use FFmpeg if available (via FFmpeg.wasm or similar)
    if (typeof window !== "undefined" && "FFmpeg" in window) {
      return await convertWebmUsingFFmpeg(voiceName);
    }

    // Fallback: Try to decode and re-encode using Web Audio API
    return await convertWebmUsingWebAudio(blob, voiceName);
  } catch (error) {
    console.warn(`[Audio Converter] Failed to convert ${voiceName}:`, error);
    // Return original blob if conversion fails
    return blob;
  }
}

/**
 * Convert WebM to WAV using Web Audio API
 * Decodes the WebM audio and encodes it to WAV format
 */
async function convertWebmUsingWebAudio(blob: Blob, voiceName: string): Promise<Blob> {
  // Decode the audio data
  const audioContext = new (
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext: AudioContext }).webkitAudioContext
  )();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Convert AudioBuffer to WAV
  return audioBufferToWav(audioBuffer);
}

/**
 * Convert AudioBuffer to WAV format
 * This is a pure Web Audio API approach that doesn't require external libraries
 */
function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  // Get audio data from all channels
  const channels = [];
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  // Interleave channels and convert to PCM
  const length = audioBuffer.length * numberOfChannels * bytesPerSample;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
  };

  // WAV file header
  writeString(0, "RIFF"); // ChunkDescriptor
  view.setUint32(4, 36 + length, true); // ChunkSize
  writeString(8, "WAVE"); // Format

  writeString(12, "fmt "); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numberOfChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  writeString(36, "data"); // Subchunk2ID
  view.setUint32(40, length, true); // Subchunk2Size

  // Write audio data
  let offset = 44;
  const frameLength = audioBuffer.length;

  if (numberOfChannels === 2) {
    const left = channels[0];
    const right = channels[1];
    for (let i = 0; i < frameLength; i++) {
      const leftSample = Math.max(-1, Math.min(1, left[i]));
      const rightSample = Math.max(-1, Math.min(1, right[i]));

      view.setInt16(offset, leftSample < 0 ? leftSample * 0x8000 : leftSample * 0x7fff, true);
      offset += 2;
      view.setInt16(offset, rightSample < 0 ? rightSample * 0x8000 : rightSample * 0x7fff, true);
      offset += 2;
    }
  } else if (numberOfChannels === 1) {
    floatTo16BitPCM(offset, channels[0]);
  } else {
    // Mono mix for multi-channel
    const mono = new Float32Array(frameLength);
    for (let i = 0; i < frameLength; i++) {
      let sample = 0;
      for (let j = 0; j < numberOfChannels; j++) {
        sample += channels[j][i];
      }
      mono[i] = sample / numberOfChannels;
    }
    floatTo16BitPCM(offset, mono);
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

/**
 * Attempt to use FFmpeg.wasm if available
 * This is a fallback for more advanced conversions
 */
async function convertWebmUsingFFmpeg(voiceName: string): Promise<Blob> {
  // This would require FFmpeg.wasm to be loaded separately
  // For now, we'll use the Web Audio API approach
  throw new Error(`FFmpeg conversion not configured for ${voiceName}`);
}
