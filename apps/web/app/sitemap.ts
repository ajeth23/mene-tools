import { MetadataRoute } from "next";
import { TOOLS_LIST, getToolPath } from "@/lib/tools-config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tools.mene.app";

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  // Dynamic tool routes using canonical category-based paths
  const toolRoutes = TOOLS_LIST.map((tool) => ({
    url: `${baseUrl}${getToolPath(tool.category, tool.slug)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...toolRoutes];
}
