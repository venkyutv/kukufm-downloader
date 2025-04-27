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


async function convertHlsToMp3(hlsUrl: string, mp3Path: string, onProgress?: (progress: { seconds: number; message: string }) => void, albumArtPath?: string): Promise<void> {
  const { spawn } = await import('child_process');
  // Build ffmpeg args in correct order
  const ffmpegArgs: string[] = [];
  ffmpegArgs.push('-i', hlsUrl);
  if (albumArtPath) {
    ffmpegArgs.push('-i', albumArtPath);
    ffmpegArgs.push(
      '-map', '0:a',
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
  ffmpegArgs.push('-progress', 'pipe:1', mp3Path);

  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', ffmpegArgs);

    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('out_time_ms')) {
        const timeMatch = output.match(/out_time_ms=(\d+)/);
        if (timeMatch) {
          const milliseconds = parseInt(timeMatch[1], 10);
          const seconds = Math.floor(milliseconds / 1000000);
          if (onProgress) {
            onProgress({ seconds, message: `Download progress: ${seconds} seconds processed` });
          } else {
            console.log(`Download progress: ${seconds} seconds processed`);
          }
        }
      }
    });

    process.stderr.on('data', (data) => {
      console.log(`ffmpeg: ${data.toString()}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully converted ${mp3Path}`);
        resolve();
      } else {
        reject(new Error(`ffmpeg process exited with code ${code}`));
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
    const indexStr = (episode.index !== undefined && episode.index !== null) ? `${episode.index}. ` : '';
    const episodeTitle = episode.title || `Episode ${episode.index}`;
    const episodeName = `${indexStr}${episodeTitle}`;
    const episodePath = path.join(directoryPath, `${episodeName}.mp3`);
    const hlsUrl = episode.content?.hls_url;
    if (!hlsUrl) {
      // Instead of returning immediately, reject this task so others can proceed
      return Promise.reject(new Error('No HLS URL found'));
    }
    return limit(() => convertHlsToMp3(hlsUrl, episodePath, undefined, albumArtPath));
  });

  // Wait for all conversions to finish (or fail)
  try {
    await Promise.allSettled(tasks);
    return c.json({ message: 'All episodes downloaded (with concurrency limit)' });
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
