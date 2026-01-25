import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-42996a40/health", (c) => {
  return c.json({ status: "ok" });
});

// Delete account endpoint
app.delete("/make-server-42996a40/delete-account", async (c) => {
  try {
    // Get access token from Authorization header
    const authHeader = c.req.header("Authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      console.log("Authorization error during account deletion: No access token provided");
      return c.text("Unauthorized: No access token provided", 401);
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user with the access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.log("Authorization error during account deletion: Invalid access token -", userError);
      return c.text("Unauthorized: Invalid access token", 401);
    }

    console.log(`Account deletion request from user: ${user.email} (${user.id})`);

    // Delete the user account using admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.log(`Error deleting user account ${user.id}:`, deleteError);
      return c.text(`Failed to delete account: ${deleteError.message}`, 500);
    }

    console.log(`Successfully deleted user account: ${user.email} (${user.id})`);
    return c.json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("Error in delete-account endpoint:", error);
    return c.text(`Server error during account deletion: ${error instanceof Error ? error.message : "Unknown error"}`, 500);
  }
});

Deno.serve(app.fetch);