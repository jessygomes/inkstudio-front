import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const source = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('non-régression : la route et la conversation historique restent en place', () => {
  assert.ok(existsSync(new URL('./app/(root)/(application)/messagerie/[id]/page.tsx', import.meta.url)));
  assert.ok(existsSync(new URL('./components/Application/Messaging/Conversation.tsx', import.meta.url)));
});

test('les actions Inbox passent par le jeton NextAuth côté serveur', () => {
  const actions = source('./lib/queries/inbox.action.ts');
  assert.match(actions, /^['"]use server['"]/);
  assert.match(actions, /getAuthHeaders/);
  assert.match(actions, /\/messaging\/inbox/);
  for (const method of ['getInboxThreadsAction', 'getInboxMessagesAction', 'sendInboxReplyAction', 'setInboxAssignmentAction']) {
    assert.ok(actions.includes(method), `Action manquante : ${method}`);
  }
});

test('les 4 canaux sont visibles et l’envoi externe ne se présente pas comme disponible', () => {
  const workspace = source('./components/Application/Messaging/InboxWorkspace.tsx');
  for (const channel of ['INKERA', 'INSTAGRAM', 'FACEBOOK', 'EMAIL']) assert.ok(workspace.includes(channel));
  assert.match(workspace, /thread\.channel\s*===\s*['"]INKERA['"]/);
});

test('les contrôles de test couvrent affectation, droits, notes, fiches, statuts et non-lus', () => {
  const workspace = source('./components/Application/Messaging/InboxWorkspace.tsx');
  const actions = source('./lib/queries/inbox.action.ts');
  for (const fragment of ['setInboxMemberPermissionAction', 'addInboxNoteAction', 'createInboxClientAction', 'linkInboxClientAction', 'setInboxReadStateAction', 'setInboxStatusAction']) {
    assert.ok(actions.includes(fragment), `Action manquante : ${fragment}`);
    assert.ok(workspace.includes(fragment), `Fonction non utilisée : ${fragment}`);
  }
});

test('la nouvelle boîte permet la pièce jointe image sur les messages Inkera', () => {
  const workspace = source('./components/Application/Messaging/InboxWorkspace.tsx');
  const actions = source('./lib/queries/inbox.action.ts');
  assert.match(workspace, /useUploadThing\("imageUploader"\)/);
  assert.match(workspace, /imageCompression/);
  assert.match(actions, /attachments\?\.length/);
});
