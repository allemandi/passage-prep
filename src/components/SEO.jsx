import { useEffect } from 'react';
import { SEO_CONFIG } from '../utils/seoConfig';

const SEO = () => {
  useEffect(() => {
    // Update basic meta tags
    document.title = `${SEO_CONFIG.title} - ${SEO_CONFIG.tagline}`;

    const updateMetaTag = (name, content, attr = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', SEO_CONFIG.description);
    updateMetaTag('title', `${SEO_CONFIG.title} - ${SEO_CONFIG.tagline}`);
    updateMetaTag('author', SEO_CONFIG.title);

    // Open Graph
    updateMetaTag('og:title', `${SEO_CONFIG.title} - ${SEO_CONFIG.tagline}`, 'property');
    updateMetaTag('og:description', SEO_CONFIG.description, 'property');
    updateMetaTag('og:url', SEO_CONFIG.url, 'property');
    updateMetaTag('og:image', `${SEO_CONFIG.url}/og-image.svg`, 'property');

    // Twitter
    updateMetaTag('twitter:title', `${SEO_CONFIG.title} - ${SEO_CONFIG.tagline}`, 'property');
    updateMetaTag('twitter:description', SEO_CONFIG.description, 'property');
    updateMetaTag('twitter:url', SEO_CONFIG.url, 'property');
    updateMetaTag('twitter:image', `${SEO_CONFIG.url}/og-image.svg`, 'property');

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', SEO_CONFIG.url);

  }, []);

  return null;
};

export default SEO;
