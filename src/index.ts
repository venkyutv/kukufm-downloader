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


// Background conversion function
type ProgressCallback = (progress: { seconds: number; message: string }) => void;

async function convertHlsToMp3(hlsUrl: string, mp3Path: string, onProgress?: ProgressCallback, albumArtPath?: string): Promise<void> {
  const { spawn } = await import('child_process');
  const ffmpegArgs = [
    '-i', hlsUrl,
    '-c:a', 'libmp3lame',
    '-q:a', '2',
  ];
  if (albumArtPath) {
    ffmpegArgs.push(
      '-i', albumArtPath,
      '-map', '0:a',
      '-map', '1:v',
      '-id3v2_version', '3',
      '-metadata:s:v', 'title=Album cover',
      '-metadata:s:v', 'comment=Cover (front)',
      '-disposition:v:0', 'attached_pic'
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



app.post('/downloadDummySingleFile', async (c) => {
  const dummyData: KukuData =  {
    "id": 167905,
    "title": "ज़िन्दगी संतरे जैसी तो है पर इसका हर टुकड़ा अलग स्वाद लिए हुए है ",
    "slug": "-1-re",
    "status": "live",
    "image": "https://images.cdn.kukufm.com/f:webp/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
    "original_image": "https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
    "duration_s": 294,
    "image_sizes": {
      "100": "https://images.cdn.kukufm.com/w:100/f:webp/q:85/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
      "150": "https://images.cdn.kukufm.com/w:150/f:webp/q:85/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
      "200": "https://images.cdn.kukufm.com/w:200/f:webp/q:85/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
      "300": "https://images.cdn.kukufm.com/w:300/f:webp/q:85/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg"
    },
    "n_likes": 0,
    "n_shares": 0,
    "n_plays": null,
    "n_listens": 1310424,
    "n_comments": 661,
    "cover_type": "custom",
    "content": {
      "url": "",
      "hls_url": "https://kukufm.akamaized.net/audio/0f35eae7-8a39-4228-96eb-31095a9b154b.m3u8",
      "premium_audio_url": "https://d1l07mcd18xic4.cloudfront.net/audio/478dd67e-734a-4d26-8e84-be1fc0baaf1c.m3u8"
    },
    "dynamic_link": "https://applinks.kukufm.com/MienR5WcpPWJgFCn8",
    "is_premium": true,
    "is_play_locked": false,
    "is_locked": false,
    "is_fictional": false,
    "index": 1,
    "show_id": 63410,
    "season_no": 1,
    "is_demo_premium": true,
    "media_size": 2382328,
    "published_on": "2020-03-19T14:28:07.009355+00:00",
    "thumbnail_image": "https://images.cdn.kukufm.com/f:webp/https://s3.ap-south-1.amazonaws.com/kukufm/channel_icons/1af40f46ab054de9bdf9e6ee932c3577.jpg",
    "web_uri": "/episode/-1-re",
    "view_type": "default",
    "has_srt": false,
    "has_liked": false,
    "seek_position": 10,
    "season_index": 1,
    "season_n_episodes": 1531,
    "can_download": true,
    "is_downloaded": false,
    "is_self": false,
    "transcript": {}
  }
  const dummyTitle = 'Dummy Title'

  // Download the audio
  const audioUrl = dummyData.content?.hls_url
  if (!audioUrl) {
    return c.json({ error: 'Audio URL not found' }, 400)
  }

  // Use ffmpeg directly on the HLS (m3u8) URL, but do not block response
  const audioDir = path.join(__dirname, 'audio');
  await fs.promises.mkdir(audioDir, { recursive: true });
  const mp3Path = path.join(audioDir, `${dummyTitle}.mp3`);

  // Start conversion in background
  convertHlsToMp3(audioUrl, mp3Path)
    .then(() => console.log('Conversion complete:', mp3Path))
    .catch((err) => console.error('Conversion failed:', err));

  return c.json(dummyData)

})


app.get('/downloadDummyMultipleFilesSSE', async (c) => {
  // Create the directory using the name show.title
  const showName = dummyData.show?.title || 'Unknown Show';
  const directoryPath = path.join(__dirname, 'downloads', showName);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // Download all the episodes with concurrency limiting
  const episodes = dummyData.episodes || [];
  const limit = pLimit(2); // Only 2 ffmpeg conversions at a time

  let completed = 0;

  // Use a ReadableStream to push SSE events
  const stream = new ReadableStream({
    async start(controller) {
      const sendSSE = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const tasks = episodes.map((episode) => {
        const episodeName = episode.title || `Episode ${episode.index}`;
        const episodePath = path.join(directoryPath, `${episodeName}.mp3`);
        const hlsUrl = episode.content?.hls_url;
        if (!hlsUrl) {
          sendSSE({ episode: episodeName, status: 'error', message: 'No HLS URL found' });
          return Promise.resolve();
        }
        return limit(() =>
          convertHlsToMp3(hlsUrl, episodePath, (progress) => {
            sendSSE({ episode: episodeName, status: 'progress', ...progress });
          })
            .then(() => {
              completed++;
              sendSSE({ episode: episodeName, status: 'done', completed, total: episodes.length });
            })
            .catch((err) => {
              completed++;
              sendSSE({ episode: episodeName, status: 'error', error: err.message, completed, total: episodes.length });
            })
        );
      });

      await Promise.all(tasks);
      sendSSE({ status: 'all_done', completed, total: episodes.length });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

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
    const episodeName = episode.title || `Episode ${episode.index}`;
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
