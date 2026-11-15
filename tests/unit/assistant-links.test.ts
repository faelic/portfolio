import { expect, it } from 'vitest';
import { approvedAssistantUrl } from '../../src/components/assistant/links';
import approved from '../../rag/implementation/approved_links.json';
import sources from '../../rag/implementation/public_sources.json';

it('accepts approved repository, project, contact and reference destinations', () => {
  for (const url of [...approved, ...Object.values(sources).map(source => source.href)]) {
    expect(approvedAssistantUrl(url)).toBe(url);
  }
  expect(approvedAssistantUrl('https://github.com/faelic/monierave/')).toContain('monierave');
});

it('rejects unknown destinations, phishing lookalikes and redirects even on approved hosts', () => {
  for (const url of [
    'javascript:alert(1)', 'data:text/html,hello', '//github.com/faelic/monierave',
    'http://github.com/faelic/monierave', 'https://github.com/attacker/monierave',
    'https://github.com.evil.example/faelic/monierave', 'https://github.com@evil.example/faelic/monierave',
    'https://github.com/faelic/monierave?redirect=https://evil.example',
    'https://github.com/faelic/monierave#unapproved', 'https://evil.example/',
    'mailto:attacker@example.com', 'mailto:ututufavour7@gmail.com?body=private',
    'https://github.com:444/faelic/monierave', 'https://github.com/faelic/monierave\n',
  ]) expect(approvedAssistantUrl(url)).toBe('');
});
