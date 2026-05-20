export interface ChatMessage {
    username: string;
    message: string;
    timestamp: number;
    socketId: string;
}

export interface User {
    username: string;
    socketId: string;
}

export interface Room {
    users: Record<string, User>;
    hostSocketId: string | null;
    code: string;
    isLocked: boolean;
    language: string;
    messages: ChatMessage[];
}

const rooms: Record<string, Room> = {};

export default rooms;
