---
name: wake-hotsite-banners
description: "Wake Commerce hotsite and landing pages. Use when building landing pages, promotional pages, or campaign URLs. Triggers on: hotsite, banners, contents, landing page, promotional page."
---

# Wake Hotsite Banners

**Forbidden:** api.fbits.net (and any *.fbits.net). **Canonical source:** https://wakecommerce.readme.io/docs/schema

Hotsite (landing page) guidance for Wake Commerce storefront integrations. This skill covers banners, contents, products, and SEO for promotional and campaign pages.

## When to use

- Building landing pages from hotsite URL routes
- Implementing promotional or campaign pages
- Rendering banner/carousel sections from API data
- Mapping content blocks and related products
- Applying SEO metadata from hotsite payload

## Workflow steps

1. Resolve the incoming route to a hotsite `url` value.
2. Call `hotsite(url, partnerAccessToken)` with the appropriate context.
3. Map response data to page sections: `banners`, `contents`, `productsByOffset`, `seo`.
4. Apply SEO fields to the document head.
5. Validate fallback behavior when URL is invalid or API is unavailable.

## hotsite(url, partnerAccessToken)

Use the hotsite root query to fetch landing page data.

- **url**: Landing page path (example: `/promo/black-friday`).
- **partnerAccessToken**: Optional in standard storefront contexts; required in partner/wholesale scenarios.
- **Security note**: Never hardcode `partnerAccessToken`. Source it from secure server-side configuration or environment-managed flows.

```graphql
query Hotsite($url: String!, $partnerAccessToken: String) {
  hotsite(url: $url, partnerAccessToken: $partnerAccessToken) {
    url
    banners {
      id
      name
      images {
        url
      }
      links {
        url
      }
    }
    contents {
      id
      title
      type
    }
    productsByOffset(limit: 20, offset: 0) {
      productId
      productName
      alias
      images {
        url
      }
      prices {
        listPrice
        price
      }
    }
    seo {
      content
      name
      type
      httpEquiv
      scheme
    }
  }
}
```

## Fields to map

| Field | Purpose |
|-------|---------|
| `banners` | Banner/carousel rendering content |
| `contents` | Page sections and content blocks |
| `productsByOffset` | Product listing area for the landing page |
| `seo` | Meta tags and head metadata |

## Edge cases (short bullet list)

- **Invalid URL**: Return graceful fallback (empty-state page or not-found state) without crashing the flow.
- **API unavailable**: Surface retry-friendly error handling and avoid exposing internal diagnostics.
- **Missing token in partner context**: Prompt secure token configuration guidance; do not suggest hardcoded token values.

## Pre-publish checklist

- [ ] No reference to `api.fbits.net` or any `*.fbits.net` in this document, generated guidance, or linked materials.
- [ ] Canonical schema/docs source is https://wakecommerce.readme.io/docs/schema.
- [ ] Frontmatter includes `name` and `description`, and `name` matches directory (`wake-hotsite-banners`).
- [ ] Document includes `When to use`, numbered `Workflow steps`, and `References` sections.
- [ ] Document is under 500 lines.

## References

- Wake Commerce schema and API docs: https://wakecommerce.readme.io/docs/schema
- Wake Commerce hotsite and storefront docs: https://wakecommerce.readme.io/docs
