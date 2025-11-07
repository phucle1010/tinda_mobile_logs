import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { LogsResponse } from "@/types/log";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const levelParam = searchParams.get("level") || "ALL";
    const search = searchParams.get("search") || "";
    const searchRegex = searchParams.get("searchRegex") === "true";
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const exportAll = searchParams.get("exportAll") === "true";
    const metadataFiltersParam = searchParams.get("metadataFilters");

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

    // Filter by level - support array or single value
    if (levelParam !== "ALL") {
      try {
        const levels = JSON.parse(levelParam);
        if (Array.isArray(levels) && levels.length > 0) {
          query = query.in("level", levels);
        } else if (typeof levels === "string") {
          query = query.eq("level", levels);
        }
      } catch {
        // If not JSON, treat as single level
        query = query.eq("level", levelParam);
      }
    }

    // Search in message - support regex or ilike
    if (search) {
      if (searchRegex) {
        // For regex, we need to use text search or filter client-side
        // Supabase doesn't support regex directly, so we'll use ilike as fallback
        // and filter client-side if needed
        query = query.ilike("message", `%${search}%`);
      } else {
        query = query.ilike("message", `%${search}%`);
      }
    }

    // Apply metadata filters
    if (metadataFiltersParam) {
      try {
        const metadataFilters = JSON.parse(metadataFiltersParam);
        if (typeof metadataFilters === "object") {
          // Metadata filters need to be applied after fetching
          // We'll filter in the response
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // For export all, don't paginate
    if (!exportAll) {
      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch logs", details: error.message },
        { status: 500 }
      );
    }

    let logs = data || [];

    // Apply metadata filters client-side if needed
    if (metadataFiltersParam) {
      try {
        const metadataFilters = JSON.parse(metadataFiltersParam);
        if (typeof metadataFilters === "object") {
          logs = logs.filter((log) => {
            return Object.entries(metadataFilters).every(([key, value]) => {
              const metaValue = (log.meta as Record<string, unknown>)?.[key];
              if (metaValue === undefined) return false;
              const metaStr = String(metaValue).toLowerCase();
              const filterStr = String(value).toLowerCase();
              return metaStr.includes(filterStr);
            });
          });
        }
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Apply regex search if needed (client-side)
    if (search && searchRegex) {
      try {
        const regex = new RegExp(search, "i");
        logs = logs.filter((log) => regex.test(log.message));
      } catch {
        // Invalid regex, ignore
      }
    }

    const total = exportAll ? logs.length : count || 0;
    const totalPages = exportAll ? 1 : Math.ceil(total / pageSize);

    const response: LogsResponse = {
      logs,
      total: exportAll ? logs.length : total,
      page: exportAll ? 1 : page,
      pageSize: exportAll ? logs.length : pageSize,
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
