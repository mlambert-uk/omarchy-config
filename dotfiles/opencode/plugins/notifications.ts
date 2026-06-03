import type { Plugin } from "@opencode-ai/plugin";

export const Notifications: Plugin = async ({
  project,
  client,
  $,
  directory,
  worktree,
}) => {
  // Helper function to safely send notifications with fallback
  async function sendNotification(
    title: string,
    body: string,
    timeout: number = 5000,
  ) {
    try {
      const escapedTitle = title.replace(/"/g, '\\"');
      const escapedBody = body.replace(/"/g, '\\"');

        // Linux (notify-send)
        await $`notify-send -t ${timeout} "${escapedTitle}" "${escapedBody}"`;
    } catch (error) {
      // Silently fail if notification system unavailable
    }
  }

  // Helper function to fetch session summary via SDK
  async function getSessionSummary(sessionId: string): Promise<string> {
    try {
      // Get the session details
      const session = await client.session.get({ path: { id: sessionId } });

      if (!session.data) {
        return "Session completed";
      }

      const sessionData = session.data;
      let summary = await client.session.summarize({ path: { id: sessionId } });
      // const messageCount = sessionData.message_count || 0;
      // const fileChanges = sessionData.file_count || 0;
      const status = "completed";

      // Build a concise summary
      //let summary = `Session ${status}`;

      // if (messageCount > 0) {
      //   summary += ` • ${messageCount} message${messageCount !== 1 ? "s" : ""}`;
      // }

      // if (fileChanges > 0) {
      //   summary += ` • ${fileChanges} file${fileChanges !== 1 ? "s" : ""} modified`;
      // }

      return summary.response.statusText || "Session completed";

    } catch (error) {
      // Fallback if SDK call fails
      return "Session completed";
    }
  }

  return {
    event: async (event) => {
      // Notify on session idle with summary
      if (event.event.type === "session.idle") {
        const sessionId = event.event.properties?.sessionID;

        if (sessionId) {
          const summary = await getSessionSummary(sessionId);
          await sendNotification("OpenCode Session Complete", summary, 7000);
        } else {
          await sendNotification(
            "OpenCode Session Complete",
            "Session finished",
            5000,
          );
        }
      }

      // Notify on session errors (high priority)
      if (event.event.type === "session.error") {
        const errorMsg =
          event.event.properties?.error?.data?.message || "Unknown error";
        const errorType = event.event.properties?.error?.name || "Error";
        await sendNotification(
          "OpenCode Error",
          `${errorType}: ${errorMsg}`.slice(0, 100),
          10000, // Longer timeout for errors
        );
      }
    },
  };
};
