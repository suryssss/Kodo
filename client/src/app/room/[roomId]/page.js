"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "@/lib/socket";
import RoomHeader from "@/components/room/RoomHeader";
import ChatSidebar from "@/components/room/ChatSidebar";
import CodeEditor from "@/components/room/CodeEditor";
import OutputConsole from "@/components/room/OutputConsole";

const debounce = (fn, delay) => {
    let timeoutId;
    const debouncedFn = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
    debouncedFn.cancel = () => clearTimeout(timeoutId);
    return debouncedFn;
};
const CODE_SYNC_DEBOUNCE = 300;

export default function RoomPage() {
    const { roomId } = useParams();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("// Start coding together...\n");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [stdin, setStdin] = useState("");
    const [activeTab, setActiveTab] = useState("output");
    const [isRunning, setIsRunning] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isViewer, setIsViewer] = useState(false);
    const [status, setStatus] = useState("Connecting...");
    const [roomStats, setRoomStats] = useState({ latency: null, protocol: "websocket", secure: false });
    const [isChatOpen, setIsChatOpen] = useState(false);
    const editorRef = useRef(null);
    const isRemoteUpdate = useRef(false);
    const debouncedEmitRef = useRef(null);


    const getLanguageTemplate = (lang) => {
        const templates = {
            javascript: "// Start coding together...\nconsole.log('Hello from Live Coding Room!');",
            typescript: "// Start coding together...\nconsole.log('Hello from Live Coding Room!');",
            python: "# Start coding together...\nprint('Hello from Live Coding Room!')",
            java: "// Start coding together...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Live Coding Room!\");\n    }\n}",
            cpp: "// Start coding together...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello from Live Coding Room!\" << endl;\n    return 0;\n}",
            go: "// Start coding together...\npackage main\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello from Live Coding Room!\")\n}",
            rust: "// Start coding together...\nfn main() {\n    println!(\"Hello from Live Coding Room!\");\n}"
        };
        return templates[lang] || "// Start coding together...";
    };
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedIsViewer = localStorage.getItem("isViewer") === "true";

        if (!storedUsername) {
            router.push("/");
            return;
        }
        setUsername(storedUsername);
        setIsViewer(storedIsViewer);

        const handleConnect = () => {
            setStatus("Connected");
            socket.emit("join-room", {
                roomId,
                username: storedUsername,
            });
        };

        const handleDisconnect = () => {
            setStatus("Disconnected");
        };

        const handleConnectError = (err) => {
            setStatus("Connection Error");
            console.error("Socket connection error:", err);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        if (!socket.connected) {
            socket.connect();
        } else {
            // If already connected, join immediately
            handleConnect();
        }

        socket.on("sync-room", ({ code, language, isLocked }) => {
            isRemoteUpdate.current = true;
            setCode(code);
            setLanguage(language);
            setIsLocked(isLocked);
        });
        socket.on("sync-code", ({ code }) => {
            isRemoteUpdate.current = true;
            setCode(code);
        });
        socket.on("language-update", ({ language }) => {
            setLanguage(language);
        });
        socket.on("lock-state-changed", ({ isLocked }) => {
            setIsLocked(isLocked);
        });
        socket.on("host-assigned", ({ isHost }) => {
            setIsHost(isHost);
        })
        socket.on("user-joined", ({ username: newUser, users: userList }) => {
            setUsers(userList);
        });
        socket.on("user-left", ({ username: leftUser, users: userList }) => {
            setUsers(userList);
        });
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("sync-room");
            socket.off("sync-code");
            socket.off("language-update");
            socket.off("lock-state-changed");
            socket.off("host-assigned");
            socket.off("user-joined");
            socket.off("user-left");
            socket.disconnect();
        };
    }, [roomId, router]);
    useEffect(() => {
        debouncedEmitRef.current = debounce((code) => {
            socket.emit("code-change", { roomId, code });
        }, CODE_SYNC_DEBOUNCE);

        return () => {
            if (debouncedEmitRef.current) {
                debouncedEmitRef.current.cancel();
            }
        };
    }, [roomId]);

    const handleEditorChange = useCallback((value) => {
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        const newCode = value || "";
        setCode(newCode);

        if (debouncedEmitRef.current) {
            debouncedEmitRef.current(newCode);
        }
    }, []);

    const handleEditorDidMount = useCallback((editor) => {
        editorRef.current = editor;
    }, []);

    const toggleLock = useCallback(() => {
        if (isHost) {
            socket.emit("toggle-lock", { roomId });
        }
    }, [isHost, roomId]);

    const copyRoomId = useCallback(() => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [roomId]);

    const runCode = useCallback(async () => {
        setIsRunning(true);
        setOutput("Running code...\n");
        setActiveTab("output");

        try {
            const languageMap = {
                javascript: "javascript",
                typescript: "typescript",
                python: "python",
                java: "java",
                cpp: "cpp",
                go: "go",
                rust: "rust",
            };

            const pistonLanguage = languageMap[language] || "javascript";

            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language: pistonLanguage,
                    version: "*",
                    files: [
                        {
                            content: code,
                        },
                    ],
                    stdin: stdin,
                }),
            });
            const result = await response.json();
            if (result.run) {
                const output = result.run.output || "No output";
                const stderr = result.run.stderr || "";
                setOutput(stderr ? `Error:\n${stderr}` : output);
            } else {
                setOutput("Error: Could not execute code");
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    }, [code, language, stdin]);

    const handleLanguageChange = useCallback((newLanguage) => {
        setLanguage(newLanguage);
        const template = getLanguageTemplate(newLanguage);
        setCode(template);
        if (isHost) {
            socket.emit("language-change", {
                roomId,
                language: newLanguage,
            });
            socket.emit("code-change", {
                roomId,
                code: template,
            });
        }
    }, [roomId, isHost]);

    const canEdit = (!isLocked || isHost) && !isViewer;

    useEffect(() => {
        const checkStats = () => {
            if (socket.connected) {
                const start = Date.now();
                socket.emit("ping", () => {
                    const latency = Date.now() - start;
                    setRoomStats(prev => ({
                        ...prev,
                        latency,
                        protocol: socket.io.engine.transport.name,
                        secure: window.location.protocol === 'https:'
                    }));
                });
            }
        };
        const statsInterval = setInterval(checkStats, 10000);

        return () => clearInterval(statsInterval);
    }, []);

    const toggleChat = useCallback(() => {
        setIsChatOpen(prev => !prev);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-black text-white">
            <RoomHeader
                roomId={roomId}
                status={status}
                users={users}
                username={username}
                language={language}
                handleLanguageChange={handleLanguageChange}
                isRunning={isRunning}
                runCode={runCode}
                isHost={isHost}
                isLocked={isLocked}
                toggleLock={toggleLock}
                isViewer={isViewer}
                copied={copied}
                copyRoomId={copyRoomId}
                roomStats={roomStats}
            />

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                <section className="flex-1 p-4 overflow-hidden flex flex-col gap-4 relative">
                    <CodeEditor
                        language={language}
                        code={code}
                        handleEditorChange={handleEditorChange}
                        handleEditorDidMount={handleEditorDidMount}
                        canEdit={canEdit}
                        isViewer={isViewer}
                        isLocked={isLocked}
                    />

                    <OutputConsole
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        output={output}
                        stdin={stdin}
                        setStdin={setStdin}
                    />
                </section>
                <ChatSidebar
                    socket={socket}
                    roomId={roomId}
                    username={username}
                    isOpen={isChatOpen}
                    onToggle={toggleChat}
                />
            </main>
        </div>
    );
}
