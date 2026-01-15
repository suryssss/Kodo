import Editor from "@monaco-editor/react";

export default function CodeEditor({
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
                    renderValidationDecorations: "on"
                }}
            />
        </section>
    );
}
