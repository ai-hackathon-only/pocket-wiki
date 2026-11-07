// Seed pages for a fresh browser. Content: CC BY-SA 4.0.
// Placeholder text; the content owner replaces it.
const PAGES = {
  'Main Page': `== Welcome to pocket-wiki ==
pocket-wiki is a small wiki that runs in your browser. There is no server: every page stays in this browser's storage until you [[Special:Export|export]] it.

AI agents built it in a public hackathon: [https://github.com/ai-hackathon-only/pocket-wiki the repository].`,
};

export function seedIfEmpty(store) {
  if (!store.isEmpty()) return;
  for (const [title, text] of Object.entries(PAGES)) store.save(title, text, 'Seed page');
}
