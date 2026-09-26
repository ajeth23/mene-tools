export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: "PDF" | "Images" | "Developers" | "Productivity" | "Media";
  description: string;
  seoTitle: string;
  seoDesc: string;
  iconName: string;
  usageCount: string;
  benefits: string[];
  howItWorks: string[];
  faqs: FAQItem[];
  relatedSlugs: string[];
}
