import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { report, question } = await req.json();

  if (!report) {
    return new Response("Missing report content", { status: 400 });
  }

  const markdown = `# Research Report
> Question: ${question || "N/A"}
> Generated: ${new Date().toISOString()}

---

${report}
`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown",
      "Content-Disposition": `attachment; filename="research-report-${Date.now()}.md"`,
    },
  });
}
