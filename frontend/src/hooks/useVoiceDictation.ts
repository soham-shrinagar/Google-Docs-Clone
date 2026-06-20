import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import type { DictationInsertMode, DictationState } from '../lib/aiTypes';
import { api } from '../lib/api';
import { applyVoiceCommand } from '../lib/voiceCommands';

interface SpeechRecognitionResult {
  [index: number]: { transcript: string };
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  results: { [index: number]: SpeechRecognitionResult; length: number };
  resultIndex: number;
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceDictation(
  editor: Editor | null,
  documentId: string,
  language: string,
  insertMode: DictationInsertMode
) {
  const [state, setState] = useState<DictationState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startTimeRef = useRef(0);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const liveRangeRef = useRef<{ from: number; to: number } | null>(null);
  const insertModeRef = useRef(insertMode);

  useEffect(() => {
    insertModeRef.current = insertMode;
  }, [insertMode]);

  const clearLiveRange = useCallback(() => {
    if (!editor || !liveRangeRef.current) return;
    const { from, to } = liveRangeRef.current;
    if (from < to) {
      editor.chain().focus().deleteRange({ from, to }).run();
    }
    liveRangeRef.current = null;
  }, [editor]);

  const updateLiveText = useCallback(
    (text: string) => {
      if (!editor || insertModeRef.current === 'append') return;
      clearLiveRange();
      if (!text) return;

      const chain = editor.chain().focus();
      if (insertModeRef.current === 'replace' && !editor.state.selection.empty) {
        chain.deleteSelection();
      }
      const from = editor.state.selection.from;
      chain.insertContent(text).run();
      liveRangeRef.current = { from, to: from + text.length };
    },
    [editor, clearLiveRange]
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const insertText = useCallback(
    (text: string) => {
      if (!editor || !text.trim()) return;
      const chain = editor.chain().focus();
      const content = text.endsWith(' ') ? text : `${text} `;
      if (insertMode === 'append') {
        const end = editor.state.doc.content.size;
        chain.setTextSelection(end).insertContent(content).run();
      } else if (insertMode === 'replace' && !editor.state.selection.empty) {
        chain.deleteSelection().insertContent(content).run();
      } else {
        chain.insertContent(content).run();
      }
    },
    [editor, insertMode]
  );

  const start = useCallback(() => {
    if (!editor) return;
    const SR = getSpeechRecognition();
    if (!SR) {
      setError('Speech recognition is not supported in this browser. Try Chrome.');
      setState('error');
      return;
    }

    setError(null);
    setTranscript('');
    setInterim('');
    finalRef.current = '';
    startTimeRef.current = Date.now();

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = finalRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += part;
        } else {
          interimText += part;
        }
      }

      finalRef.current = finalText;
      interimRef.current = interimText;
      setTranscript(finalText);
      setInterim(interimText);
      updateLiveText(`${finalText}${interimText}`);
    };

    recognition.onerror = (ev) => {
      if (ev.error !== 'aborted') {
        setError(ev.error === 'not-allowed' ? 'Microphone permission denied' : ev.error);
        setState('error');
      }
    };

    recognition.onend = async () => {
      setState('processing');
      const final = `${finalRef.current}${interimRef.current}`.trim();
      interimRef.current = '';
      setInterim('');

      const finalizeTranscript = () => {
        if (!editor || !final) return;
        const content = final.endsWith(' ') ? final : `${final} `;
        if (insertModeRef.current === 'append') {
          insertText(final);
          return;
        }
        if (liveRangeRef.current) {
          const { from, to } = liveRangeRef.current;
          editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, content).run();
          liveRangeRef.current = null;
          return;
        }
        insertText(final);
      };

      if (final && editor) {
        try {
          const cmd = await api.aiVoiceCommand(documentId, final);
          if (cmd.isCommand && cmd.action) {
            clearLiveRange();
            applyVoiceCommand(editor, cmd.action, cmd.payload);
          } else {
            finalizeTranscript();
          }
          if (documentId) {
            await api.aiSaveTranscript(documentId, {
              transcript: final,
              language,
              insertMode,
              durationMs: Date.now() - startTimeRef.current,
            });
          }
        } catch {
          finalizeTranscript();
        }
      } else {
        clearLiveRange();
      }

      setState(final ? 'completed' : 'idle');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setState('listening');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start');
      setState('error');
    }
  }, [editor, documentId, language, insertMode, insertText, updateLiveText, clearLiveRange]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { state, transcript, interim, error, start, stop, setState };
}
