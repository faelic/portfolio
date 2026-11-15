import registry from "../../../rag/implementation/public_sources.json";

export interface PublicReference { id: string; title: string; href: string; sections: string[]; excerpt: string }
export function validReferences(value: unknown): PublicReference[] {
  if (!Array.isArray(value) || value.length > 10) return [];
  const sources = registry as Record<string, { title: string; href: string }>;
  const result: PublicReference[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || typeof item.id !== "string") continue;
    const source = Object.hasOwn(sources, item.id) ? sources[item.id] : undefined;
    if (!source || typeof item.excerpt !== "string" || !item.excerpt.trim() || Array.from(item.excerpt).length > 400) continue;
    result.push({ id: item.id, title: source.title, href: source.href,
      excerpt: item.excerpt, sections: Array.isArray(item.sections) ? item.sections.slice(0, 3).filter((section: unknown): section is string => typeof section === "string" && Array.from(section).length <= 160) : [],
    });
  }
  return result;
}
