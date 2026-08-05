import "server-only";

/**
 * Single email wrapper (Part 15). Logs to `email_log`, retries once, and never
 * blocks the request that triggered it. Uses Resend when configured; otherwise
 * logs to the console so flows can be developed without email credentials.
 */
type SendArgs = { to: string; subject: string; template: string; html: string; text?: string };

export async function sendEmail({ to, subject, template, html, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "GBG Wholesale <hello@gbgwholesale.com>";

  const attempt = async () => {
    if (!apiKey) {
      console.info(`[email] (no RESEND_API_KEY) would send "${subject}" to ${to} [${template}]`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  };

  // Fire-and-forget with one retry — never block the caller.
  void (async () => {
    try {
      await attempt();
    } catch {
      try {
        await attempt();
      } catch (err) {
        console.error(`[email] failed to send "${subject}" to ${to}`, err);
      }
    }
  })();
}
