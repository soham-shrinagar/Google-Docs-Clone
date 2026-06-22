import { useParams, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDocument } from '../hooks/useApi';
import { EditorPage } from './EditorPage';
import { WorkspaceEditorPage } from './WorkspaceEditorPage';
import { PageLoader } from '../components/ui/LoadingOverlay';
import type { Document } from '../types';

export function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();

  const cached = queryClient.getQueryData<{ document: Document }>(['document', id!]);
  const stateDoc = (location.state as { document?: Document } | null)?.document;

  const { data: document, isLoading, isFetching } = useDocument(id!);
  const resolved = document ?? cached?.document ?? stateDoc;

  if (!resolved && (isLoading || isFetching)) {
    return (
      <PageLoader
        message="Opening document…"
        submessage="Loading content"
      />
    );
  }

  if (!resolved) {
    return (
      <PageLoader message="Document not found" submessage="It may have been deleted or you lack access." />
    );
  }

  if ((resolved.documentType ?? 'RICH_TEXT') === 'WORKSPACE') {
    return <WorkspaceEditorPage document={resolved} />;
  }

  return <EditorPage />;
}
