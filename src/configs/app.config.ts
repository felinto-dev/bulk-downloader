import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  downloads_directory: process.env.DOWNLOADS_DIRECTORY,
}));
