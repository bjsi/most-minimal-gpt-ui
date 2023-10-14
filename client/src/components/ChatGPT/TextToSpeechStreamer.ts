import { SequentialAsyncOperationQueue } from "./sequentialAsyncOperationQueue";

// if chunks don't end with space or punctuation (" ", ".", "?", "!"), the stream will wait for more text.
export async function* textChunker(
  chunks: AsyncIterable<{ textDelta: string }>
): AsyncGenerator<string> {
  const splitters = [
    ".",
    ",",
    "?",
    "!",
    ";",
    ":",
    "—",
    "-",
    "(",
    ")",
    "[",
    "]",
    "}",
    " ",
  ];
  let buffer = "";

  for await (const { textDelta: text } of chunks) {
    if (splitters.some((s) => buffer.endsWith(s))) {
      yield buffer + " ";
      buffer = text;
    } else if (splitters.some((s) => text.startsWith(s))) {
      yield buffer + text[0] + " ";
      buffer = text.slice(1);
    } else {
      buffer += text;
    }
  }

  if (buffer) {
    yield buffer + " ";
  }
}

export class TextToSpeechStreamer {
  private voiceId = "21m00Tcm4TlvDq8ikWAM"; // replace with your voice_id
  private model = "eleven_monolingual_v1";
  private wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream-input?model_id=${this.model}`;
  private ttsSocket: WebSocket = new WebSocket(this.wsUrl);
  private audioPlaybackQueue = new SequentialAsyncOperationQueue();
  private sentBOS = false;

  private constructor() {
    this.ttsSocket.onmessage = this.handleMessage.bind(this);
    this.ttsSocket.onerror = this.handleError.bind(this);
    this.ttsSocket.onclose = this.handleClose.bind(this);
  }

  static async create() {
    const ttsStreamer = new TextToSpeechStreamer();
    await new Promise((resolve) => {
      ttsStreamer.ttsSocket.onopen = resolve;
    });
    return ttsStreamer;
  }

  private handleMessage(event: MessageEvent) {
    const response = JSON.parse(event.data);

    console.log("Server response:", response);

    if (response.audio) {
      // decode and handle the audio data (e.g., play it)
      const audioChunk = atob(response.audio); // decode base64
      console.log("Received audio chunk: ", audioChunk);
      // Use AudioContext to play audioBuffer here
      // Decode the base64 audio and convert it to ArrayBuffer
      const audioData = Uint8Array.from(atob(response.audio), (c) =>
        c.charCodeAt(0)
      ).buffer;

      this.audioPlaybackQueue.enqueue(async () => {
        try {
          // Decode the MP3 encoded audio data
          let audioContext = new AudioContext();
          const buffer = await audioContext.decodeAudioData(audioData);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start();
          await new Promise((resolve) => {
            source.onended = resolve;
          });
        } catch {}
      });
    } else {
      console.log("No audio data in the response");
    }

    if (response.isFinal) {
      // the generation is complete
    }

    if (response.normalizedAlignment) {
      // use the alignment info if needed
    }
  }

  private handleError(error: MessageEvent) {
    console.error(`WebSocket Error: ${error}`);
  }

  private handleClose(event: CloseEvent) {
    if (event.wasClean) {
      console.info(
        `Connection closed cleanly, code=${event.code}, reason=${event.reason}`
      );
    } else {
      console.warn("Connection died");
    }
  }

  async sendTextDeltas(textDeltas: AsyncIterable<string>) {
    for await (const textDelta of textDeltas) {
      this.sendTextDelta(textDelta);
    }
    this.done();
  }

  sendTextDelta(textDelta: string) {
    if (!this.sentBOS) {
      const bosMessage = {
        text: " ",
        voice_settings: {
          stability: 0.5,
          similarity_boost: true,
        },
        xi_api_key: import.meta.env.VITE_ELEVEN_LABS_API_KEY, // replace with your API key
      };
      this.ttsSocket.send(JSON.stringify(bosMessage));
    }

    console.log("streamTTS: textDelta", textDelta);
    const textMessage = {
      text: textDelta,
      try_trigger_generation: true,
    };

    this.ttsSocket.send(JSON.stringify(textMessage));
  }

  done() {
    // 4. Send the EOS message with an empty string
    const eosMessage = {
      text: "",
    };

    this.ttsSocket.send(JSON.stringify(eosMessage));
  }
}

// for debugging
async function* createAsyncIterableFromArray(
  strings: string[]
): AsyncGenerator<string> {
  for (const str of strings) {
    yield str;
    await new Promise((resolve) => setTimeout(resolve, 5)); // Optional: Simulate some delay
  }
}

const testArray =
  "Mitochondria are membrane-bound cell organelles that generate most of the chemical energy needed to power the cell's biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called ATP."
    .split(" ")
    .map((word) => word + " ");

console.log(testArray);
const createTestIterable = () => createAsyncIterableFromArray(testArray);

window["createTestIterable"] = createTestIterable;
window["TextToSpeechStreamer"] = TextToSpeechStreamer;