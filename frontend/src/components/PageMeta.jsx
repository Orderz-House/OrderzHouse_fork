import { Helmet } from "react-helmet-async";

/**
 * Sets document title and meta description for SEO.
 * Use once per page/route.
 */
export default function PageMeta({ title, description }) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && (
        <meta name="description" content={description} />
      )}
    </Helmet>
  );
}
