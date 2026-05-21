import path from "path";

try {
    process.loadEnvFile(path.resolve(__dirname, "../.env.local"));
} catch (err) { }
try {
    process.loadEnvFile(path.resolve(__dirname, "../.env"));
} catch (err) { }

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: { text?: string }[];
        };
    }[];
    error?: { message: string };
}

async function callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured. Please add it to server/.env");
    }

    const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as GeminiResponse;

    if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error("Gemini returned an empty response.");
    }

    return text;
}

export async function explainCode(code: string, language: string, output: string): Promise<string> {
    const prompt = `You are an expert programming tutor. A student just ran the following ${language} code and got the output shown below. 

**Code:**
\`\`\`${language}
${code}
\`\`\`

**Output:**
\`\`\`
${output}
\`\`\`

Please provide a clear, beginner-friendly explanation of:
1. What this code does step by step
2. Why it produces the given output
3. Key concepts used in this code

Keep the explanation concise but thorough. Use markdown formatting. Do NOT wrap the entire response in a code block.`;

    return callGemini(prompt);
}

export async function reviewCode(code: string, language: string): Promise<string> {
    const prompt = `You are a senior software engineer conducting a code review. Review the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Provide a structured review covering:

## Code Quality
Rate: ⭐ (1-5 stars) and brief assessment

## Time & Space Complexity
- **Time Complexity**: O(?) with explanation
- **Space Complexity**: O(?) with explanation

## Issues Found
List any bugs, anti-patterns, or potential problems (numbered)

## Suggestions for Improvement
Concrete, actionable improvements (numbered)

## Best Practices
What the code does well (if anything)

Keep feedback constructive and educational. Use markdown formatting. Do NOT wrap the entire response in a code block.`;

    return callGemini(prompt);
}

export async function debugError(code: string, language: string, error: string): Promise<{ explanation: string; fixedCode: string }> {
    const prompt = `You are an expert debugger. A student wrote this ${language} code and got an error.

**Code:**
\`\`\`${language}
${code}
\`\`\`

**Error:**
\`\`\`
${error}
\`\`\`

Respond in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):
{
  "explanation": "A clear, beginner-friendly explanation of what went wrong and why this error occurs. Use plain text, no markdown.",
  "fixedCode": "The complete corrected code that fixes the error. Include the full code, not just the changed parts."
}`;

    const raw = await callGemini(prompt);

    // Try to parse JSON from the response
    try {
        // Strip potential markdown code fences
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        return {
            explanation: parsed.explanation || "Could not parse explanation.",
            fixedCode: parsed.fixedCode || code,
        };
    } catch {
        // Fallback: return raw text as explanation, original code unchanged
        return {
            explanation: raw,
            fixedCode: code,
        };
    }
}

export async function summarizeSession(
    finalCode: string,
    language: string,
    executionCount: number,
    errorCount: number,
    participants: string[]
): Promise<string> {
    const prompt = `You are generating a session summary for a collaborative live coding room. Here are the details:

**Language**: ${language}
**Participants**: ${participants.join(", ")}
**Total Code Executions**: ${executionCount}
**Errors Encountered**: ${errorCount}

**Final Code:**
\`\`\`${language}
${finalCode}
\`\`\`

Generate a concise, professional session summary that includes:

## Session Overview
A brief 2-3 sentence summary of what was built/worked on.

## Key Statistics
- Participants, execution count, error count

## Code Analysis
What the final code accomplishes.

## Learning Highlights
Key concepts practiced during this session.

Keep it concise and motivational. Use markdown formatting. Do NOT wrap the entire response in a code block.`;

    return callGemini(prompt);
}

export async function chatFollowUp(
    code: string,
    language: string,
    previousContext: string,
    userQuestion: string
): Promise<string> {
    const prompt = `You are an AI coding assistant in a collaborative live coding room. The user is asking a follow-up question about their code.

**Current Code (${language}):**
\`\`\`${language}
${code}
\`\`\`

**Previous Context:**
${previousContext}

**User's Question:**
${userQuestion}

Provide a helpful, concise answer. Use markdown formatting for code examples. Do NOT wrap the entire response in a code block.`;

    return callGemini(prompt);
}
