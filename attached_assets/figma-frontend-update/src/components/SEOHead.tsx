import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}

export function SEOHead({ title, description, path, image, type = "website" }: SEOHeadProps) {
  const baseUrl = "https://PIX.IMMO";
  const fullUrl = `${baseUrl}${path}`;
  const fullTitle = `${title} | PIX.IMMO`;
  const defaultImage = `${baseUrl}/og-image.jpg`;
  const ogImage = image || defaultImage;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Standard meta tags
    updateMetaTag("description", description, true);
    
    // Open Graph tags
    updateMetaTag("og:title", fullTitle);
    updateMetaTag("og:description", description);
    updateMetaTag("og:url", fullUrl);
    updateMetaTag("og:type", type);
    updateMetaTag("og:image", ogImage);
    updateMetaTag("og:site_name", "PIX.IMMO");
    updateMetaTag("og:locale", "de_DE");
    
    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:title", fullTitle, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", ogImage, true);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;
  }, [title, description, path, image, type, fullUrl, fullTitle, ogImage]);

  return null;
}
