import type { Story } from './types';

// Every story is stored separately in src/data/stories/<LEVEL>/<slug>.json.
// Vite finds every file automatically; no manual imports or giant TS array.
const modules = import.meta.glob<Story>('./stories/**/*.json', {
  eager: true,
  import: 'default'
});

const levelOrder: Record<Story['level'], number> = { A2: 0, B1: 1, B2: 2 };

export const stories: Story[] = Object.values(modules).sort((a, b) =>
  levelOrder[a.level] - levelOrder[b.level] ||
  a.title.localeCompare(b.title, 'de')
);

const storyById = new Map(stories.map(story => [story.id, story]));

export function getStory(id: string): Story | undefined {
  return storyById.get(id);
}

export function getWordCount(story: Story): number {
  return story.german.join(' ').trim().split(/\s+/).length;
}

export function getReadingMinutes(story: Story): number {
  return Math.max(2, Math.ceil(getWordCount(story) / 110));
}

if (import.meta.env.DEV) {
  if (storyById.size !== stories.length) {
    console.warn('Duplicate story IDs detected. Run npm run validate:stories.');
  }
}
