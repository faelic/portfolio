import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

it('social metadata references a real HTTPS image whose dimensions match the PNG', () => {
  const document = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html');
  const content = (key: string) => {
    const nodes = document.querySelectorAll(`meta[property="${key}"],meta[name="${key}"]`);
    expect(nodes).toHaveLength(1);
    return nodes[0].getAttribute('content')!;
  };
  const canonical = document.querySelector('link[rel="canonical"]')!.getAttribute('href')!;
  const image = new URL(content('og:image'));
  expect(image.protocol).toBe('https:');
  expect(image.origin).toBe(new URL(canonical).origin);
  expect(content('twitter:image')).toBe(image.href);
  expect(content('og:image:secure_url')).toBe(image.href);
  expect(image.pathname).toMatch(/^\/og\/[\w-]+\.png$/);
  const png = readFileSync(resolve('public', image.pathname.slice(1)));
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(content('og:image:type')).toBe('image/png');
  expect(Number(content('og:image:width'))).toBe(png.readUInt32BE(16));
  expect(Number(content('og:image:height'))).toBe(png.readUInt32BE(20));
  expect(png.readUInt32BE(16) / png.readUInt32BE(20)).toBeCloseTo(1200 / 630);
  expect(content('og:image:alt')).toBe(content('twitter:image:alt'));
  expect(content('og:image:alt')).toContain('portrait');
  expect(content('og:image:alt')).not.toContain('lamp');
  expect(image.pathname).not.toContain('portfolio-v4');
  expect(content('og:description')).toBe(content('twitter:description'));
  expect(document.title).toContain('Favour Ututu');
});
