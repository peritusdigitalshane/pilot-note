import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user is a super admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is super admin
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (!roles) {
      throw new Error("Unauthorized: Super admin access required");
    }

    // Get user ID to delete from request body
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error("Cannot delete your own account");
    }

    console.log(`Deleting user: ${userId}`);

    // Try to delete user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    // If user not found in auth, it's already deleted or orphaned
    // Clean up profile and related data manually
    if (deleteError) {
      const isNotFound = deleteError.status === 404 || 
                        deleteError.message?.includes("User not found") ||
                        (deleteError as any).code === "user_not_found";
      
      if (isNotFound) {
        console.log(`User not found in auth.users, cleaning up orphaned data for: ${userId}`);
        
        // Delete profile (cascade will handle related data via foreign keys)
        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .delete()
          .eq("user_id", userId);

        if (profileError) {
          console.error("Error deleting profile:", profileError);
          throw new Error(`Failed to clean up orphaned profile: ${profileError.message}`);
        }

        console.log(`Successfully cleaned up orphaned data for: ${userId}`);
      } else {
        console.error("Error deleting user:", deleteError);
        throw deleteError;
      }
    } else {
      console.log(`Successfully deleted user from auth: ${userId}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in delete-user function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
