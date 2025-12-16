import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
}

export default function SEO({
  title,
  description = "Manage your portfolio with ease.",
  name = "Portfolio Manager",
  type = "website",
}: SEOProps) {
  useEffect(() => {
    // Update Title
    document.title = `${title} | ${name}`;

    // Helper to update or create meta tags
    const updateMeta = (selector: string, attribute: string, value: string) => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        // Parse selector to set attributes (simple support for name/property)
        if (selector.includes('[name="')) {
          meta.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        } else if (selector.includes('[property="')) {
          meta.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute(attribute, value);
    };

    // Update Meta Description
    updateMeta('meta[name="description"]', 'content', description);

    // Facebook / Open Graph
    updateMeta('meta[property="og:type"]', 'content', type);
    updateMeta('meta[property="og:title"]', 'content', `${title} | ${name}`);
    updateMeta('meta[property="og:description"]', 'content', description);

    // Twitter
    updateMeta('meta[name="twitter:creator"]', 'content', name);
    updateMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMeta('meta[name="twitter:title"]', 'content', `${title} | ${name}`);
    updateMeta('meta[name="twitter:description"]', 'content', description);

  }, [title, description, name, type]);

  return null;
}
