/// <reference types="node" />

import type { Plugin } from "@opencode-ai/plugin";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { spawn } from "child_process";

type SessionStatus = "completed" | "error";

interface SessionLogEntry {
  sessionId: string;
  title: string;
  activity: string;
  latestUserPrompt?: string;
  latestAssistantResponse?: string;
  toolNames?: string[];
  status: SessionStatus;
  messageCount: number;
  fileChanges: number;
  modifiedFiles?: string[];
  durationMs?: number;
  durationMinutes?: number;
  createdAt?: number;
  completedAt?: number;
  projectId?: string;
  workingDirectory: string;
}

interface StructuredTranscriptEntry {
  timestamp: string;
  day: string;
  sessionId: string;
  projectId?: string;
  workingDirectory: string;
  status: SessionStatus;
  activity: string;
  request?: string;
  response?: string;
  errors: string[];
  tools: string[];
  metrics: {
    messageCount: number;
    fileChanges: number;
    durationMs?: number;
    durationMinutes?: number;
  };
  files: string[];
}

export const SessionLogger: Plugin = async ({
  project,
  client,
  directory,
  worktree,
}) => {
  const home = process.env.HOME || "/root";
  const sessionLoggerScript = join(
    home,
    ".config",
    "opencode",
    "skills",
    "session-logging",
    "session-logger.py",
  );
  const transcriptLoggerScript = join(
    home,
    ".config",
    "opencode",
    "skills",
    "session-logging",
    "transcript-logger.py",
  );
  const transcriptsDir = join(
    home,
    "Documents",
    "mlambert_uk",
    "OpenCode",
    "Transcripts",
  );
  const processedSessions = new Set<string>();

  // Define session logs directory
  const sessionLogsDir = join(home, ".local/share/opencode/sessions");

  // Ensure directory exists
  if (!existsSync(sessionLogsDir)) {
    mkdirSync(sessionLogsDir, { recursive: true });
  }

  if (!existsSync(transcriptsDir)) {
    mkdirSync(transcriptsDir, { recursive: true });
  }

  function normaliseText(value: string | undefined, maxLength = 180): string {
    if (!value) {
      return "";
    }

    const compact = value.replace(/\s+/g, " ").trim();
    if (compact.length <= maxLength) {
      return compact;
    }

    return `${compact.slice(0, maxLength - 1)}…`;
  }

  function truncateForTranscript(
    value: string | undefined,
    maxLength = 1400,
  ): string {
    if (!value) {
      return "";
    }

    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength - 1)}…`;
  }

  function isDefaultSessionTitle(title: string | undefined): boolean {
    if (!title) {
      return true;
    }

    return /^New session\s+-\s+/i.test(title);
  }

  // Helper function to extract message/file stats from session messages
  async function extractSessionMessageStats(sessionId: string): Promise<{
    messageCount: number;
    modifiedFiles: string[];
    latestUserPrompt?: string;
    latestAssistantResponse?: string;
    toolNames: string[];
  }> {
    try {
      const messages = await client.session.messages({
        path: { id: sessionId },
      });

      if (!messages.data) {
        return { messageCount: 0, modifiedFiles: [], toolNames: [] };
      }

      const files = new Set<string>();
      const tools = new Set<string>();

      const userTexts: { createdAt: number; text: string }[] = [];
      const assistantTexts: { createdAt: number; text: string }[] = [];

      function isSubstantiveAssistantText(text: string): boolean {
        const compact = text.trim();
        if (!compact) {
          return false;
        }

        if (compact.length >= 220) {
          return true;
        }

        if (compact.includes("\n- ") || compact.includes("\n1.")) {
          return true;
        }

        if (/^(good catch|let me|i\'ll|i will|i need to)\b/i.test(compact)) {
          return false;
        }

        return compact.length >= 120;
      }

      // Parse parts for explicit file references and patch file lists.
      messages.data.forEach((msg) => {
        const createdAt =
          normaliseEpoch(msg.info?.time?.created as number | undefined) || 0;

        if (msg.info?.role === "user" && msg.parts) {
          const textParts = msg.parts
            .filter((part) => part.type === "text")
            .map((part) => normaliseText(part.text as string, 1200))
            .filter(Boolean);

          if (textParts.length > 0) {
            userTexts.push({ createdAt, text: textParts.join(" ") });
          }
        }

        if (msg.info?.role === "assistant" && msg.parts) {
          const textParts = msg.parts
            .filter((part) => part.type === "text")
            .map((part) => normaliseText(part.text as string, 2400))
            .filter(Boolean);

          if (textParts.length > 0) {
            assistantTexts.push({ createdAt, text: textParts.join("\n\n") });
          }
        }

        if (msg.parts) {
          msg.parts.forEach((part) => {
            if (part.type === "file") {
              if (part.source?.type === "file") {
                files.add(part.source.path);
              } else if (part.filename) {
                files.add(part.filename);
              }
            }

            if (part.type === "patch") {
              part.files.forEach((file) => files.add(file));
            }

            if (part.type === "tool" && part.tool) {
              tools.add(String(part.tool));
            }
          });
        }
      });

      assistantTexts.sort((a, b) => a.createdAt - b.createdAt);
      userTexts.sort((a, b) => a.createdAt - b.createdAt);

      const latestAssistant =
        assistantTexts.length > 0
          ? assistantTexts[assistantTexts.length - 1]
          : undefined;

      const substantiveAssistant =
        [...assistantTexts]
          .reverse()
          .find((entry) => isSubstantiveAssistantText(entry.text)) ||
        latestAssistant;

      const selectedAssistant = substantiveAssistant;

      const pairedUser = selectedAssistant
        ? [...userTexts]
            .reverse()
            .find((entry) => entry.createdAt <= selectedAssistant.createdAt)
        : userTexts.length > 0
          ? userTexts[userTexts.length - 1]
          : undefined;

      return {
        messageCount: messages.data.length,
        modifiedFiles: Array.from(files),
        latestUserPrompt: pairedUser?.text,
        latestAssistantResponse: selectedAssistant?.text,
        toolNames: Array.from(tools),
      };
    } catch (error) {
      // Silently fail; stats aren't critical for logging
      return { messageCount: 0, modifiedFiles: [], toolNames: [] };
    }
  }

  function dayKeyFromTimestamp(timestamp: number | undefined): string {
    const dt = timestamp ? new Date(timestamp) : new Date();
    const year = String(dt.getFullYear());
    const month = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function appendStructuredTranscriptEntry(
    sessionLog: SessionLogEntry,
    errorMessage?: string,
  ): void {
    const day = dayKeyFromTimestamp(
      sessionLog.completedAt || sessionLog.createdAt,
    );
    const path = join(transcriptsDir, `${day}.events.jsonl`);

    const entry: StructuredTranscriptEntry = {
      timestamp: new Date().toISOString(),
      day,
      sessionId: sessionLog.sessionId,
      projectId: sessionLog.projectId,
      workingDirectory: sessionLog.workingDirectory,
      status: sessionLog.status,
      activity: sessionLog.activity,
      request: sessionLog.latestUserPrompt,
      response: sessionLog.latestAssistantResponse,
      errors: errorMessage ? [errorMessage] : [],
      tools: sessionLog.toolNames || [],
      metrics: {
        messageCount: sessionLog.messageCount,
        fileChanges: sessionLog.fileChanges,
        durationMs: sessionLog.durationMs,
        durationMinutes: sessionLog.durationMinutes,
      },
      files: sessionLog.modifiedFiles || [],
    };

    appendFileSync(path, `${JSON.stringify(entry)}\n`, "utf-8");
  }

  function normaliseEpoch(timestamp: number | undefined): number | undefined {
    if (!timestamp) {
      return undefined;
    }

    // Handle either seconds or milliseconds epoch formats.
    return timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
  }

  function formatTimeForTranscript(timestamp: number | undefined): string {
    if (!timestamp) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    }

    const dt = new Date(timestamp);
    return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
  }

  async function appendTranscriptViaPython(
    sessionLog: SessionLogEntry,
  ): Promise<void> {
    if (!existsSync(sessionLoggerScript)) {
      return;
    }

    const startTime = formatTimeForTranscript(sessionLog.createdAt);
    const endTime = formatTimeForTranscript(sessionLog.completedAt);

    const accomplishments =
      sessionLog.status === "error"
        ? `Session error while working on: ${sessionLog.activity}`
        : `Worked on: ${sessionLog.activity}`;

    const filesPreview =
      sessionLog.modifiedFiles && sessionLog.modifiedFiles.length > 0
        ? sessionLog.modifiedFiles.slice(0, 5).join(", ")
        : "None";

    const durationText =
      typeof sessionLog.durationMinutes === "number"
        ? `${sessionLog.durationMinutes}m`
        : "unknown";

    const outcome =
      sessionLog.status === "error"
        ? `Status: error; Messages: ${sessionLog.messageCount}; File changes: ${sessionLog.fileChanges}; Duration: ${durationText}; Files: ${filesPreview}; Session: ${sessionLog.sessionId}`
        : `Status: completed; Messages: ${sessionLog.messageCount}; File changes: ${sessionLog.fileChanges}; Duration: ${durationText}; Files: ${filesPreview}; Session: ${sessionLog.sessionId}`;

    try {
      await new Promise<void>((resolve, reject) => {
        const child = spawn(
          "python3",
          [
            sessionLoggerScript,
            "work",
            startTime,
            endTime,
            accomplishments,
            outcome,
          ],
          { stdio: "ignore" },
        );

        child.once("error", reject);
        child.once("close", (code) => {
          if (code === 0) {
            resolve();
            return;
          }
          reject(
            new Error(`session-logger.py exited with code ${String(code)}`),
          );
        });
      });
    } catch {
      // Do not disrupt plugin execution if transcript logging fails.
    }
  }

  async function appendExchangeViaPython(
    sessionLog: SessionLogEntry,
  ): Promise<void> {
    if (!existsSync(transcriptLoggerScript)) {
      return;
    }

    const userMessage = truncateForTranscript(
      sessionLog.latestUserPrompt,
      1000,
    );
    const assistantResponse = truncateForTranscript(
      sessionLog.latestAssistantResponse,
      1800,
    );

    if (!userMessage || !assistantResponse) {
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const child = spawn(
          "python3",
          [transcriptLoggerScript, "log", userMessage, assistantResponse],
          { stdio: "ignore" },
        );

        child.once("error", reject);
        child.once("close", (code) => {
          if (code === 0) {
            resolve();
            return;
          }
          reject(
            new Error(`transcript-logger.py exited with code ${String(code)}`),
          );
        });
      });
    } catch {
      // Do not disrupt plugin execution if transcript exchange logging fails.
    }
  }

  // Helper function to save session context to a structured file
  async function logSessionToFile(
    sessionId: string,
    status: SessionStatus = "completed",
    errorMessage?: string,
  ): Promise<void> {
    try {
      const session = await client.session.get({ path: { id: sessionId } });

      if (!session.data) {
        return;
      }

      const sessionData = session.data;
      const stats = await extractSessionMessageStats(sessionId);
      const messageCount = stats.messageCount;
      const fileChanges =
        sessionData.summary?.files ?? stats.modifiedFiles.length;
      const activity =
        normaliseText(stats.latestUserPrompt, 220) ||
        (isDefaultSessionTitle(sessionData.title)
          ? "General coding session"
          : normaliseText(sessionData.title, 220));

      const createdAtMs = normaliseEpoch(sessionData.time?.created);
      const updatedAtMs = normaliseEpoch(sessionData.time?.updated);

      // Calculate duration if available
      const duration =
        createdAtMs && updatedAtMs ? updatedAtMs - createdAtMs : null;

      // Build structured session data
      const sessionLog: SessionLogEntry = {
        sessionId,
        title: sessionData.title || "Untitled",
        activity,
        latestUserPrompt: stats.latestUserPrompt,
        latestAssistantResponse: stats.latestAssistantResponse,
        toolNames: stats.toolNames,
        status,
        messageCount,
        fileChanges,
        modifiedFiles:
          stats.modifiedFiles.length > 0 ? stats.modifiedFiles : undefined,
        durationMs: duration || undefined,
        durationMinutes: duration ? Math.round(duration / 60000) : undefined,
        createdAt: createdAtMs,
        completedAt: updatedAtMs,
        projectId: project?.id,
        workingDirectory: directory,
      };

      // Create a filename based on session completion time
      const completedAt = new Date(updatedAtMs || Date.now());
      const timestamp = completedAt
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `session-${timestamp}.json`;
      const filepath = join(sessionLogsDir, filename);

      // Write session data as JSON
      writeFileSync(filepath, JSON.stringify(sessionLog, null, 2), "utf-8");

      // Also append to an index file for quick reference
      const indexPath = join(sessionLogsDir, "index.jsonl");
      appendFileSync(indexPath, JSON.stringify(sessionLog) + "\n", "utf-8");

      appendStructuredTranscriptEntry(sessionLog, errorMessage);

      await appendTranscriptViaPython(sessionLog);
      await appendExchangeViaPython(sessionLog);
    } catch (error) {
      // Silently fail to avoid crashing the plugin
    }
  }

  return {
    event: async (event) => {
      // Log on session completion (idle)
      if (event.event.type === "session.idle") {
        const sessionId = event.event.properties?.sessionID;

        if (sessionId && !processedSessions.has(sessionId)) {
          processedSessions.add(sessionId);
          await logSessionToFile(sessionId, "completed");
        }
      }

      // Log on session error
      if (event.event.type === "session.error") {
        const sessionId = event.event.properties?.sessionID;
        const errorMessage = normaliseText(
          event.event.properties?.error?.data?.message ||
            event.event.properties?.error?.message ||
            event.event.properties?.error?.name,
          300,
        );

        if (sessionId && !processedSessions.has(sessionId)) {
          processedSessions.add(sessionId);
          await logSessionToFile(sessionId, "error", errorMessage || undefined);
        }
      }
    },
  };
};
