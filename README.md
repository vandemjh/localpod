# Localpod

Localpod is a tool for converting articles or PDFs into audio podcasts. It extracts text from uploaded PDFs or article links, processes the content for text-to-speech (TTS) optimization, and generates audio files. The audio files are then made available via an RSS feed.

## Features

- Extract text from PDFs or web articles.
- Clean and optimize text for TTS narration.
- Generate audio files using multiple TTS providers (e.g., Google TTS, Kokoro).
- Serve audio files via an RSS feed for podcast consumption.
- Optional integration with Ollama for advanced text processing.

## Dependencies

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) (v20.x)
- [Ollama](https://ollama.ai/) (optional, for LLM-based text processing)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd localpod
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=production
   PORT=56225
   LOCALCPOD_HOSTNAME=localhost
   PROTO=http
   USE_LLM=true
   USE_PUPPETEER=false
   PODIFY=true
   ```

4. Start the application:
   ```bash
   npm start
   ```

5. (Optional) Start Ollama for LLM-based features:
   ```bash
   docker-compose up ollama
   ```

## Usage

1. Access the web interface at `http://localhost:56225`.
2. Upload a PDF or paste an article link.
3. The application will process the content and generate an audio file.
4. Access the RSS feed at `http://localhost:56225/rss` to subscribe to the podcast.

## Development

- To run the tuning script for prompt optimization:
  ```bash
  npm run tune
  ```

- To build and run the application in Docker:
  ```bash
  docker-compose up --build
  ```

## File Structure

- `src/service`: Core services for text extraction, TTS, and LLM processing.
- `src/routes`: API routes for file upload, RSS feed, and audio serving.
- `src/public`: Static files for the web interface.
- `data/`: Directory for storing generated audio and articles.

## Notes

- The application supports two TTS providers: Google TTS (`gtts`) and Kokoro (`kokoro-js`). The provider can be selected via the `TTS` environment variable.
- Ollama is optional but recommended for advanced text cleaning and metadata generation.
- Ensure `ffmpeg` is installed for audio processing.

## License

This project is licensed under the MIT License.
