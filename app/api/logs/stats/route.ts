import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get counts for each level efficiently using parallel queries
    const [errorResult, warnResult, infoResult, debugResult] =
      await Promise.all([
        supabase
          .from("logger")
          .select("level", { count: "exact", head: true })
          .eq("level", "ERROR"),
        supabase
          .from("logger")
          .select("level", { count: "exact", head: true })
          .eq("level", "WARN"),
        supabase
          .from("logger")
          .select("level", { count: "exact", head: true })
          .eq("level", "INFO"),
        supabase
          .from("logger")
          .select("level", { count: "exact", head: true })
          .eq("level", "DEBUG"),
      ]);

    const stats = {
      ERROR: errorResult.count || 0,
      WARN: warnResult.count || 0,
      INFO: infoResult.count || 0,
      DEBUG: debugResult.count || 0,
      total:
        (errorResult.count || 0) +
        (warnResult.count || 0) +
        (infoResult.count || 0) +
        (debugResult.count || 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

