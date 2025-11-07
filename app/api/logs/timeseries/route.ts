import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import type { TimeSeriesData } from "@/types/log";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const interval = searchParams.get("interval") || "hour"; // hour, day

    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build base query
    let query = supabase.from("logger").select("created_at, level");

    // Apply date filters
    if (dateFrom && dateFrom !== "undefined" && dateFrom.trim() !== "") {
      const fromDate = new Date(dateFrom + "T00:00:00.000Z");
      query = query.gte("created_at", fromDate.toISOString());
    }
    if (dateTo && dateTo !== "undefined" && dateTo.trim() !== "") {
      const toDate = new Date(dateTo + "T23:59:59.999Z");
      query = query.lte("created_at", toDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch time series data", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Group by time interval
    const grouped: Record<string, TimeSeriesData> = {};

    data.forEach((log) => {
      const date = new Date(log.created_at);
      let key: string;

      if (interval === "hour") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          ERROR: 0,
          WARN: 0,
          INFO: 0,
          DEBUG: 0,
          total: 0,
        };
      }

      const level = log.level as "ERROR" | "WARN" | "INFO" | "DEBUG";
      if (grouped[key][level] !== undefined) {
        grouped[key][level]++;
        grouped[key].total++;
      }
    });

    // Convert to array and sort by date
    const result = Object.values(grouped).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

