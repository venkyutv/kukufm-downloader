import { serve } from '@hono/node-server'
import fs from 'fs'
import { Hono } from 'hono'
import path from 'path'
import { fileURLToPath } from 'url'
import type { KukuData } from './types/kukuData.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import pLimit from 'p-limit'
import { dummyData } from './data/dummyData.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


// Add a type for metadata
interface Mp3Metadata {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  date?: string;
  comment?: string;
  track?: string;
  album_artist?: string;
  explicit?: string;
  tags?: string;
  contributors?: string;
  audio_quality?: string;
  file_size?: string;
}

import { getCookieHeaderString } from './cookieUtil.js';

async function convertHlsToMp3(
  hlsUrl: string,
  mp3Path: string,
  onProgress?: (progress: { seconds: number; message: string }) => void,
  albumArtPath?: string,
  metadata?: Mp3Metadata
): Promise<void> {
  const { spawn } = await import('child_process');
  // Build ffmpeg args in correct order
  const ffmpegArgs: string[] = [];

  // Insert cookies as a header for the m3u8 request
  const cookiesPath = path.join(__dirname, 'cookies.json');
  let cookieHeader: string;
  try {
    cookieHeader = getCookieHeaderString(cookiesPath);
    if (cookieHeader) {
      ffmpegArgs.push('-headers', `Cookie: ${cookieHeader}`);
    }
  } catch (e) {
    console.warn('[ffmpeg] Could not read cookies.json for HLS authentication:', e);
  }

  ffmpegArgs.push('-i', hlsUrl);
  if (albumArtPath) {
    ffmpegArgs.push('-i', albumArtPath);
    // Only map the first audio stream from the HLS input and the cover image
    ffmpegArgs.push(
      '-map', '0:a:0', // first audio stream only
      '-map', '1:v',
      '-c:a', 'libmp3lame',
      '-q:a', '2',
      '-id3v2_version', '3',
      '-metadata:s:v', 'title=Album cover',
      '-metadata:s:v', 'comment=Cover (front)',
      '-disposition:v:0', 'attached_pic',
    );
  } else {
    ffmpegArgs.push(
      '-c:a', 'libmp3lame',
      '-q:a', '2',
    );
  }
  // Add metadata as ffmpeg -metadata args
  if (metadata) {
    if (metadata.title) ffmpegArgs.push('-metadata', `title=${metadata.title}`);
    if (metadata.artist) ffmpegArgs.push('-metadata', `artist=${metadata.artist}`);
    if (metadata.album) ffmpegArgs.push('-metadata', `album=${metadata.album}`);
    if (metadata.genre) ffmpegArgs.push('-metadata', `genre=${metadata.genre}`);
    if (metadata.date) ffmpegArgs.push('-metadata', `date=${metadata.date}`);
    if (metadata.comment) ffmpegArgs.push('-metadata', `comment=${metadata.comment}`);
    if (metadata.track) ffmpegArgs.push('-metadata', `track=${metadata.track}`);
    if (metadata.album_artist) ffmpegArgs.push('-metadata', `album_artist=${metadata.album_artist}`);
    if (metadata.explicit) ffmpegArgs.push('-metadata', `explicit=${metadata.explicit}`);
    if (metadata.tags) ffmpegArgs.push('-metadata', `TXXX=tags=${metadata.tags}`);
    if (metadata.contributors) ffmpegArgs.push('-metadata', `TXXX=contributors=${metadata.contributors}`);
    if (metadata.audio_quality) ffmpegArgs.push('-metadata', `TXXX=audio_quality=${metadata.audio_quality}`);
    if (metadata.file_size) ffmpegArgs.push('-metadata', `TXXX=file_size=${metadata.file_size}`);
  }
  ffmpegArgs.push('-progress', 'pipe:1', mp3Path);

  return new Promise((resolve, reject) => {
    console.log('[ffmpeg] Running command: ffmpeg', ffmpegArgs.join(' '));
    const process = spawn('ffmpeg', ffmpegArgs);

    let stderr = '';
    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully converted ${mp3Path}`);
        resolve();
      } else {
        console.error(`[ffmpeg error] Exit code: ${code}`);
        if (stderr) {
          console.error(`[ffmpeg stderr]\n${stderr}`);
        }
        if (code === 1 && stderr.includes('not recognized')) {
          reject(new Error('ffmpeg not found: Please ensure ffmpeg is installed and available in your PATH.'));
        } else {
          reject(new Error(`ffmpeg process exited with code ${code}.\n${stderr}`));
        }
      }
    });
  });
}

// (Keep the old POST endpoint if needed)
app.post('/downloadDummyMultipleFiles', async (c) => {
  // Create the directory using the name show.title
  const showName = dummyData.show?.title || 'Unknown Show';
  const directoryPath = path.join(__dirname, 'downloads', showName);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // Download the album image if present
  const albumImageUrl = dummyData.show?.original_image;
  let albumArtPath: string | undefined = undefined;
  if (albumImageUrl) {
    const isUrl = /^https?:\/\//.test(albumImageUrl);
    if (isUrl) {
      // Download image to a temp file
      const https = await import('https');
      const { createWriteStream } = await import('fs');
      const tmpPath = path.join(directoryPath, 'cover.jpg');
      albumArtPath = tmpPath;
      await new Promise((resolve, reject) => {
        const file = createWriteStream(tmpPath);
        https.get(albumImageUrl, (response) => {
          if (response.statusCode !== 200) {
            file.close();
            return reject(new Error(`Failed to download album art: ${response.statusCode}`));
          }
          response.pipe(file);
          file.on('finish', () => file.close(resolve));
        }).on('error', (err) => {
          file.close();
          reject(err);
        });
      });
    } else {
      albumArtPath = albumImageUrl;
    }
  }

  // Download all the episodes with concurrency limiting
  const episodes = dummyData.episodes || [];
  const limit = pLimit(10); // Only 10 ffmpeg conversions at a time
  const tasks = episodes.map((episode) => {
    // Ensure episode index is present and use "<index>. <title>" format
    const indexStr = (episode.season_index !== undefined && episode.season_index !== null) ? `${episode.season_index}. ` : '';
    const episodeTitle = episode.title || `Episode ${episode.season_index}`;
    // Sanitize filename for Windows
    const episodeName = `${indexStr}${episodeTitle}`.replace(/[\\/:*?"<>|]/g, '_');
    const episodePath = path.join(directoryPath, `${episodeName}.mp3`);
    const hlsUrl = episode.content?.hls_url;
    if (!hlsUrl) {
      // Instead of returning immediately, reject this task so others can proceed
      return Promise.reject(new Error('No HLS URL found'));
    }
    // Gather metadata for this episode
    const show = dummyData.show;
    const genre = show?.genre?.title || '';
    const author = show?.author?.name || '';
    const album = show?.title || '';
    const year = show?.published_on ? String(new Date(show.published_on).getFullYear()) : '';
    const tags = (show?.labels || []).join(', ');
    // Use episode.description if present, else show.description
    const episodeDescription = (typeof episode.description === 'string' ? episode.description : (show?.description || ''));
    const contributors = author;
    const audio_quality = '128kbps'; // Example, you can adjust logic
    const file_size = episode.media_size ? String(episode.media_size) : '';
    const explicit = show?.is_adult_content ? '1' : '0';
    const track = episode.index !== undefined ? String(episode.index) : '';
    const metadata = {
      title: episode.title || '',
      artist: author,
      album,
      genre,
      date: year,
      comment: episodeDescription,
      track,
      album_artist: author,
      explicit,
      tags,
      contributors,
      audio_quality,
      file_size,
    };
    return limit(() => convertHlsToMp3(hlsUrl, episodePath, undefined, albumArtPath, metadata));
  });

  // Wait for all conversions to finish (or fail)
  try {
    // await Promise.allSettled(tasks);
    return c.json({ message: 'All episodes download has been started (with concurrency limit)' });
  } catch (err) {
    return c.json({ error: 'Some downloads failed', details: err }, 500);
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
