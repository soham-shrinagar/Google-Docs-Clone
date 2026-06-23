import * as Y from 'yjs';
import type { WorkspaceElementData, WorkspacePageData, WorkspaceSeed } from './types';

export const WS_PAGE_ORDER = 'wsPageOrder';
export const WS_PAGES = 'wsPages';
export const WS_ELEMENTS = 'wsElements';

function pageToY(page: WorkspacePageData): Record<string, unknown> {
  return { ...page };
}

function elementToY(el: WorkspaceElementData): Record<string, unknown> {
  return {
    ...el,
    transform: { ...el.transform },
    style: { ...el.style },
    data: { ...el.data },
  };
}

function yToPage(raw: Record<string, unknown>): WorkspacePageData {
  return raw as unknown as WorkspacePageData;
}

function yToElement(raw: Record<string, unknown>): WorkspaceElementData {
  return raw as unknown as WorkspaceElementData;
}

export function seedWorkspaceYDoc(ydoc: Y.Doc, seed: WorkspaceSeed) {
  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  const pages = ydoc.getMap<Record<string, unknown>>(WS_PAGES);
  const elements = ydoc.getMap<Record<string, unknown>>(WS_ELEMENTS);

  ydoc.transact(() => {
    pageOrder.delete(0, pageOrder.length);
    pages.clear();
    elements.clear();

    for (const page of seed.pages) {
      pageOrder.push([page.id]);
      pages.set(page.id, pageToY(page));
    }
    for (const el of seed.elements ?? []) {
      elements.set(el.id, elementToY(el));
    }
  });
}

export function readWorkspaceFromYDoc(ydoc: Y.Doc) {
  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  const pagesMap = ydoc.getMap<Record<string, unknown>>(WS_PAGES);
  const elementsMap = ydoc.getMap<Record<string, unknown>>(WS_ELEMENTS);

  const pages = pageOrder.toArray().map((id) => yToPage(pagesMap.get(id)!)).filter(Boolean);
  const elements = [...elementsMap.values()].map(yToElement);

  return { pages, elements };
}

export function observeWorkspace(
  ydoc: Y.Doc,
  onChange: (state: { pages: WorkspacePageData[]; elements: WorkspaceElementData[] }) => void
) {
  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  const pagesMap = ydoc.getMap(WS_PAGES);
  const elementsMap = ydoc.getMap(WS_ELEMENTS);

  const emit = () => onChange(readWorkspaceFromYDoc(ydoc));

  pageOrder.observe(emit);
  pagesMap.observe(emit);
  elementsMap.observe(emit);

  emit();

  return () => {
    pageOrder.unobserve(emit);
    pagesMap.unobserve(emit);
    elementsMap.unobserve(emit);
  };
}

export function upsertElement(ydoc: Y.Doc, element: WorkspaceElementData) {
  ydoc.getMap(WS_ELEMENTS).set(element.id, elementToY(element));
}

export function deleteElement(ydoc: Y.Doc, elementId: string) {
  ydoc.getMap(WS_ELEMENTS).delete(elementId);
}

export function deletePage(ydoc: Y.Doc, pageId: string) {
  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  const idx = pageOrder.toArray().indexOf(pageId);
  if (idx >= 0) pageOrder.delete(idx, 1);
  ydoc.getMap(WS_PAGES).delete(pageId);

  const elements = ydoc.getMap<Record<string, unknown>>(WS_ELEMENTS);
  for (const [id, el] of elements.entries()) {
    if (el.pageId === pageId) elements.delete(id);
  }
}

export function duplicatePage(ydoc: Y.Doc, pageId: string, newPageId: string) {
  const pagesMap = ydoc.getMap<Record<string, unknown>>(WS_PAGES);
  const page = pagesMap.get(pageId);
  if (!page) return;

  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  const idx = pageOrder.toArray().indexOf(pageId);
  const copy = { ...page, id: newPageId, label: `${page.label ?? 'Page'} (copy)` };
  pagesMap.set(newPageId, copy);

  const elements = ydoc.getMap<Record<string, unknown>>(WS_ELEMENTS);
  const pageElements = [...elements.entries()].filter(([, el]) => el.pageId === pageId);

  for (const [oldId, el] of pageElements) {
    const newId = crypto.randomUUID();
    elements.set(newId, { ...el, id: newId, pageId: newPageId });
  }

  pageOrder.insert(idx + 1, [newPageId]);
}

export function parseWorkspaceSeed(raw: unknown): WorkspaceSeed | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (!obj.workspace || !Array.isArray(obj.pages)) return null;
  return {
    workspace: true,
    pages: obj.pages as WorkspacePageData[],
    elements: (obj.elements as WorkspaceElementData[]) ?? [],
    sourceAsset: obj.sourceAsset as WorkspaceSeed['sourceAsset'],
  };
}
