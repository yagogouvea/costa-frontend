export const cloudfrontConfig = {
  distributionDomain: import.meta.env.VITE_CLOUDFRONT_DOMAIN,
  getAssetUrl: (key: string) => {
    const domain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
    if (!domain) return key;
    return `https://${domain}/${key}`;
  }
}; 