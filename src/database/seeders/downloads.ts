import { Prisma } from '@prisma/client';
// Path alias does not works because ts-node-dev and Prisma CLI cannot recognize
import { generateUuid } from '../../utils/crypto';

export const downloads: Prisma.DownloadCreateInput[] = [
  {
    downloadId: '10mb-zip',
    url: 'https://file-examples-com.github.io/uploads/2017/02/zip_10MB.zip',
    priority: 5,
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-examples.com' },
    },
  },
  {
    downloadId: '9mb-zip',
    url: 'https://file-examples-com.github.io/uploads/2017/02/zip_9MB.zip',
    priority: 4,
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-examples.com' },
    },
  },
  {
    downloadId: 'webp-1.5mb',
    url: 'https://file-examples-com.github.io/uploads/2020/03/file_example_WEBP_1500kB.webp',
    priority: 4,
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-examples.com' },
    },
  },
  {
    downloadId: 'mp3-5mb',
    url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-examples.com' },
    },
  },
  {
    downloadId: '10mb-smallfile',
    url: 'http://ipv6.download.thinkbroadband.com/10MB.zip',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'thinkbroadband.com' },
    },
  },
  {
    downloadId: '1gb-very-large',
    url: 'http://ipv6.download.thinkbroadband.com/1GB.zip',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'thinkbroadband.com' },
    },
  },
  {
    downloadId: 'sample_1280x720_surfing_with_audio',
    url: 'https://filesamples.com/samples/video/mp4/sample_1280x720_surfing_with_audio.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_960x400_ocean_with_audio',
    url: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_640x360',
    url: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_960x540',
    url: 'https://filesamples.com/samples/video/mp4/sample_960x540.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_1280x720',
    url: 'https://filesamples.com/samples/video/mp4/sample_1280x720.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_1920x1080',
    url: 'https://filesamples.com/samples/video/mp4/sample_1920x1080.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_2560x1440',
    url: 'https://filesamples.com/samples/video/mp4/sample_2560x1440.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
  {
    downloadId: 'sample_3840x2160',
    url: 'https://filesamples.com/samples/video/mp4/sample_3840x2160.mp4',
    fingerprint: generateUuid(),
    Hoster: {
      connect: { id: 'file-samples.com' },
    },
  },
];
