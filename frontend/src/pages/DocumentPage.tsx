import { useParams } from 'react-router-dom';
import { useDocument } from '../hooks/useApi';
import { EditorPage } from './EditorPage';
import { WorkspaceEditorPage } from './WorkspaceEditorPage';

export function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const { data: document, isLoading } = useDocument(id!);

  if (isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if ((document.documentType ?? 'RICH_TEXT') === 'WORKSPACE') {
    return <WorkspaceEditorPage document={document} />;
  }

  return <EditorPage />;
}
