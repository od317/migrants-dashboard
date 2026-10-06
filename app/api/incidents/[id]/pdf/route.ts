import { apiBase } from "@/lib/incidents";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const url = `${apiBase()}/api/incidents/${encodeURIComponent(id)}/pdf`;

  try {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) {
      return new Response("Incident PDF download failed", { status: upstream.status });
    }

    const filename = `incident-${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });

    return new Response(upstream.body, { headers });
  } catch {
    return new Response("Incident PDF service is unavailable", { status: 502 });
  }
}