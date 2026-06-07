import { Helmet } from "react-helmet-async";

interface SEOProps {
  /** Page-specific title; combined with `name` for the document title. */
  title: string;
  /** Meta description and Open Graph / Twitter description. */
  description?: string;
  /** Site / brand name appended to the title and used as the Twitter creator. */
  name?: string;
  /** Open Graph object type (e.g. `website`, `article`). */
  type?: string;
  /** Absolute URL of an image for Open Graph / Twitter previews. */
  image?: string;
  /** Canonical URL / Open Graph `og:url` for the current page. */
  url?: string;
}

/**
 * SEO manager (Req 9). Sets the document title, meta description, and Open
 * Graph / Twitter tags for the current page via `react-helmet-async`. Because
 * the rendered tags are derived from props, they update automatically whenever
 * a visitor navigates and a different page mounts this component (Req 9.4).
 */
export default function SEO({
  title,
  description = "Manage your portfolio with ease.",
  name = "Portfolio Manager",
  type = "website",
  image,
  url,
}: SEOProps) {
  const fullTitle = `${title} | ${name}`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {url ? <link rel="canonical" href={url} /> : null}

      {/* Facebook / Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url ? <meta property="og:url" content={url} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}

      {/* Twitter */}
      <meta name="twitter:creator" content={name} />
      <meta
        name="twitter:card"
        content={image ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}
    </Helmet>
  );
}
