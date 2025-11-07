import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { LogsResponse } from "@/types/log";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const level = searchParams.get("level") || "ALL";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query for paginated results
    let query = supabase.from("logger").select("*", { count: "exact" });

    // Apply date filters to query
    if (dateFrom && dateFrom !== "undefined" && dateFrom.trim() !== "") {
      // Parse date string (YYYY-MM-DD) and set to start of day in UTC
      const fromDate = new Date(dateFrom + "T00:00:00.000Z");
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (dateTo && dateTo !== "undefined" && dateTo.trim() !== "") {
      // Parse date string (YYYY-MM-DD) and set to end of day in UTC
      const toDate = new Date(dateTo + "T23:59:59.999Z");
      query = query.lte("created_at", toDate.toISOString());
    }

    // Filter by level
    if (level !== "ALL") {
      query = query.eq("level", level);
    }

    // Search in message
    if (search) {
      query = query.ilike("message", `%${search}%`);
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs", details: error.message },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    const response: LogsResponse = {
      logs: data || [],
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
