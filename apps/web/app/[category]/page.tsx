import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { TOOLS_LIST, getToolPath } from "@/lib/tools-config";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Keep metadata for the old URL just in case, but standard redirect will happen
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.category;
  const tool = TOOLS_LIST.find((t) => t.slug === slug);

  if (!tool) {
    return {
      title: "Tool Not Found - Mene Tools",
    };
  }

  const title = `${tool.name} - Professional Online Utility | Mene Tools`;
  const description = `${tool.description} Instant, 100% private, client-side execution in your browser. No files are ever uploaded.`;

  return {
    title,
    description,
    robots: {
      index: false, // Don't index the old flat URL, let canonical point to nested or let redirect handle it
      follow: true,
    }
  };
}

// Statically generate routes for all registered tools
export async function generateStaticParams() {
  return TOOLS_LIST.map((tool) => ({
    category: tool.slug,
  }));
}

export default async function ToolPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.category;
  const tool = TOOLS_LIST.find((t) => t.slug === slug);

  if (!tool) {
    notFound();
  }

  // Gracefully redirect flat slugs to correct canonical category paths
  const correctPath = getToolPath(tool.category, tool.slug);
  redirect(correctPath);
}
