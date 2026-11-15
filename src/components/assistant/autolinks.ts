import type { Link, Parent, Root, RootContent, Text } from 'mdast';
import { approvedAssistantUrl } from './links';

function linkText(value: string): Array<Text | Link> {
  const result: Array<Text | Link> = [];
  let offset = 0;
  for (const match of value.matchAll(/https?:\/\/[^\s<>"`]+|mailto:[^\s<>"`]+/gi)) {
    const start = match.index;
    // Sentence punctuation belongs to the surrounding prose, not the URL.
    const url = match[0].replace(/[.,;:!?)\]}]+$/, '');
    if (!approvedAssistantUrl(url)) continue;
    if (start > offset) result.push({ type: 'text', value: value.slice(offset, start) });
    result.push({ type: 'link', url, children: [{ type: 'text', value: url }] });
    offset = start + url.length;
  }
  if (offset < value.length) result.push({ type: 'text', value: value.slice(offset) });
  return result;
}

/** Link approved bare URLs without touching existing links, code or HTML. */
export function remarkApprovedAutolinks() {
  return (tree: Root) => {
    function visit(node: Parent) {
      node.children = node.children.flatMap<RootContent>(child => {
        if (child.type === 'text') return linkText(child.value);
        if (child.type === 'link' || child.type === 'linkReference') return [child];
        if ('children' in child) visit(child as Parent);
        return [child];
      });
    }
    visit(tree);
  };
}
