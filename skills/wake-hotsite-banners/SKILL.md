---
name: wake-hotsite-banners
description: "Wake Commerce hotsite and landing pages. Use when building landing pages, promotional pages, or campaign URLs. Triggers on: hotsite, banners, contents, landing page, promotional page."
---

# Wake Hotsite Banners

Hotsite (landing page) query for Wake Commerce. Covers banners, contents, products, and SEO for promotional and campaign pages.

## When to Use

- Building landing pages
- Promotional or campaign URLs
- Banner/carousel content
- Page content blocks with products

## hotsite Query

```graphql
query Hotsite($url: String!, $partnerAccessToken: String) {
  hotsite(url: $url, partnerAccessToken: $partnerAccessToken) {
    url
    banners { ... }
    contents { ... }
    productsByOffset(limit: 20, offset: 0) {
      productId
      productName
      alias
      images { url }
      prices { listPrice price }
    }
    seo { content name type httpEquiv scheme }
  }
}
```

- **url**: Landing page URL path (e.g. `/promo/black-friday`).
- **partnerAccessToken**: Optional; use for partner/wholesale context.

## Key Fields

| Field | Purpose |
|-------|---------|
| banners | Banner/carousel content (images, links, order) |
| contents | Page content blocks |
| productsByOffset | Products for the page (limit, offset for pagination) |
| seo | Meta tags, title, description for head |

## Usage

1. Resolve URL from route (e.g. `/promo/:slug` → `url: /promo/black-friday`).
2. Call hotsite(url, partnerAccessToken).
3. Render banners, contents, products per design.
4. Use seo for document head (title, meta description, etc.).

## Error Handling

- **Empty hotsite**: URL may not exist; check for null/empty response.
- **Missing partnerAccessToken**: Omit when not in partner context; required only for wholesale.

## References

- Wake Commerce: wakecommerce.readme.io
- home.graphql in reference: often composes hotsite with search, brands
