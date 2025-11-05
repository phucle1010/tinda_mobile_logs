import { createServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the target URL from query parameters
    const targetUrl = request.nextUrl.searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing 'url' query parameter" },
        { status: 400 }
      );
    }

    try {
      // Get the session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return NextResponse.json(
          { error: "No valid session" },
          { status: 401 }
        );
      }

      // Make the proxied request with authentication
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          Authorization: `Bearer ${session.access_token}`,
        },
        body:
          request.method !== "GET" && request.method !== "HEAD"
            ? await request.text()
            : undefined,
      });

      const data = await response.text();

      // Return the proxied response
      return new NextResponse(data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") || "application/json",
        },
      });
    } catch (fetchError) {
      console.error("Proxy fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to proxy request" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
