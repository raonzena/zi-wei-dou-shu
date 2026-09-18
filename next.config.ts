import type { NextConfig } from 'next';
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();
const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/result/*/image': ['./public/images/characters/v1/*.jpg'],
  },
  webpack(config) {
    // Next.js detects this SVG rule and excludes SVG from next-image-loader.
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
            svgo: false,
            replaceAttrValues: { '#1E1E1E': 'currentColor' },
          },
        },
      ],
    });
    return config;
  },
};

export default withVanillaExtract(nextConfig);
