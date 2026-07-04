"use client";

import { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useExecutionStore } from "@/store/useExecutionStore";

export default function CodeEditor() {
  const code = useExecutionStore((s) => s.code);
  const setCode = useExecutionStore((s) => s.setCode);
  const currentStep = useExecutionStore((s) => s.currentStep());

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Keep the active execution line highlighted and scrolled into view.
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (!currentStep?.line) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(currentStep.line, 1, currentStep.line, 1),
        options: {
          isWholeLine: true,
          className: "jars-active-line",
          linesDecorationsClassName: "jars-active-line-gutter",
        },
      },
    ]);
    editor.revealLineInCenter(currentStep.line);
  }, [currentStep]);

  return (
    <div className="h-full w-full">
      <style jsx global>{`
        .jars-active-line {
          background: rgba(109, 99, 255, 0.12) !important;
        }
        .jars-active-line-gutter {
          background: #6d63ff !important;
          width: 3px !important;
        }
      `}</style>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value ?? "")}
        onMount={handleMount}
        options={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          renderLineHighlight: "none",
          tabSize: 2,
        }}
      />
    </div>
  );
}
