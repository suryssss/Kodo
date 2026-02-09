import { memo } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react").then(mod => mod.default), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-neutral-900 rounded-lg">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-neutral-400 text-sm">Loading editor...</span>
            </div>
        </div>
    ),
});

function CodeEditor({
    language,
    code,
    handleEditorChange,
    handleEditorDidMount,
    canEdit,
    isViewer,
    isLocked
}) {
    return (
        <section className="flex-1 rounded-lg border overflow-hidden transition-colors relative flex flex-col" style={{
            borderColor: !canEdit ? "rgba(239, 68, 68, 0.2)" : "rgb(38, 38, 38)",
            opacity: !canEdit ? 0.9 : 1
        }}>
            {!canEdit && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30 backdrop-blur-sm pointer-events-none">
                    {isViewer ? "View Only Mode" : isLocked ? "Room Locked by Host" : "Read Only"}
                </div>
            )}

            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                    readOnly: !canEdit,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Courier New', monospace",
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    renderValidationDecorations: "on",
                    // Performance optimizations
                    renderWhitespace: "none",
                    folding: false,
                    glyphMargin: false,
                    wordWrap: "off",
                    scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        useShadows: false
                    }
                }}
            />
        </section>
    );
}
export default memo(CodeEditor);
