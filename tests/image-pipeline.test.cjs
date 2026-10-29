/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness for the installed Next.js image pipeline. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const semver = require('semver');
const requireFromNext = createRequire(require.resolve('next/package.json'));
const sharp = requireFromNext('sharp');
const { optimizeImage } = require('next/dist/server/image-optimizer/transform');

test('the runtime image stack stays above the DEP-01 security baseline', () => {
  const nextVersion = require('next/package.json').version;
  assert.ok(semver.gte(nextVersion, '16.4.3'), `Next.js ${nextVersion} is below the security baseline`);
  const sharpVersion = sharp.versions.sharp;
  assert.ok(semver.gte(sharpVersion, '0.35.5'), `sharp ${sharpVersion} is below the security baseline`);
});

for (const format of ['webp', 'avif']) {
  test(`Next.js resizes a PNG and produces a valid ${format} image`, async () => {
    const input = await sharp({ create: { width: 32, height: 16, channels: 3, background: '#123456' } })
      .png().toBuffer();
    const output = await optimizeImage({
      buffer: input, contentType: `image/${format}`, quality: 75, width: 16, height: 8,
    });
    const metadata = await sharp(output).metadata();
    // AVIF images use the HEIF container in sharp's metadata.
    assert.equal(metadata.format, format === 'avif' ? 'heif' : format);
    assert.equal(metadata.width, 16);
    assert.equal(metadata.height, 8);
  });
}

test('the patched SVG renderer remains functional in the Next.js pipeline', async () => {
  const input = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="16"><rect width="32" height="16" fill="blue"/></svg>');
  const output = await optimizeImage({
    buffer: input, contentType: 'image/webp', quality: 75, width: 16, height: 8,
  });
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'webp');
  assert.equal(metadata.width, 16);
  assert.equal(metadata.height, 8);
});

test('malformed image data is rejected', async () => {
  await assert.rejects(optimizeImage({
    buffer: Buffer.from('not an image'), contentType: 'image/webp', quality: 75, width: 16,
  }));
});

test('oversized input is rejected before resizing when a pixel limit is configured', async () => {
  const input = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#123456' } })
    .png().toBuffer();
  await assert.rejects(optimizeImage({
    buffer: input, contentType: 'image/webp', quality: 75, width: 16, limitInputPixels: 100,
  }));
});
