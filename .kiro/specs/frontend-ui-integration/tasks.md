# Implementation Plan: Frontend UI Integration

## Overview

This plan converts the design into incremental, buildable coding tasks for the React 19 +
Vite 7 + TypeScript frontend. Work proceeds bottom-up: domain types and pure utilities
(with property tests) first, then shared services and the query-key registry, then shared
UI primitives, then the theme extension, then public features, then cross-cutting
trackers and routing, then admin features, then enhancement polish, and finally the
integration/property test pass with a checkpoint.

Conventions followed throughout:
- `features/<Name>/{Component.tsx, useComponent.tsx, index.tsx}`
- Shared network code in `src/core/services`, domain types in `src/core/types`
- All HTTP through the shared Axios instance (`src/core/api/axios.ts`)
- TanStack Query for reads/writes, react-hook-form + zod for forms, sonner for toasts
- Tests under `tests/` using Vitest + @testing-library/react; property tests use
  `fast-check` and are tagged `Feature: frontend-ui-integration, Property {n}: {text}`

Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP.

## Tasks

- [x] 1. Establish test/property tooling and domain types
  - [x]* 1.1 Add fast-check and configure the test environment
    - Add `fast-check` to devDependencies and confirm `vitest` jsdom + `jest-dom` setup
      file are wired through `vite.config.js` (the `@` alias resolves in tests)
    - Add a shared test render helper under `tests/` (QueryClientProvider + RouterProvider
      + HelmetProvider wrappers) for reuse by component tests
    - _Requirements: 13.1_

  - [x] 1.2 Define shared API and pagination types
    - Create `core/types/api.type.ts` with `ApiResponse<T>` and `PaginationMeta`
    - _Requirements: 13.1, 13.2_

  - [x] 1.3 Define portfolio, blog, and taxonomy domain types
    - Add `PublicProject` (problem/solution/results) to `core/types/portfolio.type.ts`
    - Add `PublicBlogPost`, `RelatedPost`, `BlogCategory`, `BlogTag`, `BlogComment` to
      `core/types/blogPost.type.ts`
    - _Requirements: 1.1, 2.5, 2.9, 3.1, 4.4, 4.7, 4.11_

  - [x] 1.4 Define contact, newsletter, testimonial, and analytics types
    - Create `core/types/contact.type.ts`, `core/types/newsletter.type.ts`,
      `core/types/testimonial.type.ts`, `core/types/analytics.type.ts`
      (`VisitPayload`, `AnalyticsSummary`, `AnalyticsAggregations`, `TopItem`)
    - _Requirements: 5.3, 6.3, 7.5, 8.1, 12.1, 12.2, 12.5_

  - [x] 1.5 Define zod write-form schemas and their inferred types
    - Add `ContactSchema`, `NewsletterSchema`, `CommentSchema`, extend
      `CreateBlogPostSchema` (category + tags) and `CreatePortfolioSchema`
      (problem/solution/results, gallery, tech, tags arrays)
    - _Requirements: 13.3, 4.10, 5.2, 6.2, 10.6, 10.7, 11.7, 11.8, 11.9, 11.10_

- [x] 2. Implement pure utilities with property tests
  - [x] 2.1 Implement list query-string builder
    - Create `core/utils/query.ts` exporting `buildListQuery(params)` that CSV-joins
      `tags`/`tech`, omits undefined/empty/empty-array values, and includes present scalars
    - _Requirements: 1.5, 1.6, 3.5, 3.6_

  - [x]* 2.2 Write property test for the query-string builder
    - **Property 1: List query string builder**
    - **Validates: Requirements 1.5, 1.6, 3.5, 3.6**
    - Tag: `Feature: frontend-ui-integration, Property 1: List query string builder`
    - Generate arbitrary params; parse the result back and assert it equals the non-empty
      inputs (CSV arrays, omitted empties)

  - [x] 2.3 Implement gallery ordering helper
    - Create `core/utils/gallery.ts` exporting `orderGallery(images)` (stable ascending
      sort by `position`) and a gallery-editor reducer producing contiguous `0..n-1`
      positions for add/remove/reorder operations
    - _Requirements: 2.6, 11.8_

  - [x]* 2.4 Write property test for gallery ordering
    - **Property 2: Gallery images render ordered by position**
    - **Validates: Requirements 2.6**
    - Tag: `Feature: frontend-ui-integration, Property 2: Gallery images render ordered by position`
    - Assert output is sorted ascending by position and is a permutation of the input

  - [x]* 2.5 Write property test for the gallery position reducer
    - **Property 3: Gallery position reducer maintains contiguous ordering**
    - **Validates: Requirements 11.8**
    - Tag: `Feature: frontend-ui-integration, Property 3: Gallery position reducer maintains contiguous ordering`
    - Apply arbitrary add/remove/reorder sequences; assert positions form contiguous
      `0..n-1` with no gaps/duplicates and the count matches

  - [x] 2.6 Implement optimistic reaction reducer
    - Create `core/utils/reaction.ts` exporting `applyOptimistic(count)` and
      `rollback(count, previous)` used by the reaction mutation
    - _Requirements: 4.5, 4.6_

  - [x]* 2.7 Write property test for optimistic reaction rollback
    - **Property 4: Optimistic reaction rollback restores the original count**
    - **Validates: Requirements 4.6**
    - Tag: `Feature: frontend-ui-integration, Property 4: Optimistic reaction rollback restores the original count`
    - For any starting count, increment then rollback restores the original count

  - [x] 2.8 Implement SEO metadata resolver
    - Create `core/utils/seo.ts` exporting `resolveSeo(entity)` returning non-empty
      title/description, using explicit meta fields when present and falling back to
      title + short description/excerpt
    - _Requirements: 9.1, 9.2_

  - [x]* 2.9 Write property test for SEO fallback resolution
    - **Property 5: SEO metadata fallback resolution**
    - **Validates: Requirements 9.1, 9.2**
    - Tag: `Feature: frontend-ui-integration, Property 5: SEO metadata fallback resolution`
    - Assert title and description are always non-empty and use explicit/fallback sources

  - [x] 2.10 Implement theme preference resolver
    - Create `core/utils/theme.ts` exporting `resolveTheme(stored, prefersDark)` returning
      the explicit stored value for `dark`/`light`, else the `prefersDark` result
    - _Requirements: 14.4, 14.5_

  - [x]* 2.11 Write property test for theme preference resolution
    - **Property 6: Theme preference resolution**
    - **Validates: Requirements 14.4, 14.5**
    - Tag: `Feature: frontend-ui-integration, Property 6: Theme preference resolution`
    - For any stored preference and `prefersDark`, assert the documented resolution

  - [x] 2.12 Implement reading-progress calculator
    - Create `core/utils/readingProgress.ts` exporting
      `readingProgress(scrollY, contentHeight, viewportHeight)` clamped to `[0, 100]`
    - _Requirements: 18.7_

  - [x]* 2.13 Write property test for reading-progress
    - **Property 7: Reading-progress percentage is clamped and monotonic**
    - **Validates: Requirements 18.7**
    - Tag: `Feature: frontend-ui-integration, Property 7: Reading-progress percentage is clamped and monotonic`
    - Assert result stays within `[0, 100]` and is non-decreasing as scroll increases

- [x] 3. Checkpoint - pure utilities and types
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement shared service modules and query-key registry
  - [x] 4.1 Create the query-key registry
    - Create `core/query/keys.ts` with the `queryKeys` object (publicPortfolio, publicBlog,
      testimonials, blogTaxonomy, adminBlog, adminPortfolio, analytics)
    - _Requirements: 13.1, 13.2_

  - [x] 4.2 Create public portfolio service
    - Create `core/services/publicPortfolio.service.ts` with `getPublicList(params)` and
      `getPublicBySlug(slug)` over the shared Axios client
    - _Requirements: 1.1, 2.1, 13.1_

  - [x] 4.3 Extend blog post service for public detail, comments, and reactions
    - Add `getPublicBySlug(slug)`, `getPublicComments(slug)`, `createComment(slug, dto)`,
      `createReaction(slug, dto)` to `core/services/blogPost.service.ts`
    - _Requirements: 3.1, 4.1, 4.5, 4.7, 4.8, 13.1_

  - [x] 4.4 Create contact, newsletter, and testimonial services
    - Create `core/services/contact.service.ts` (`submit`),
      `core/services/newsletter.service.ts` (`subscribe`, `unsubscribe`),
      `core/services/testimonial.service.ts` (`getPublic`)
    - _Requirements: 5.3, 6.3, 7.1, 13.1_

  - [x] 4.5 Create analytics and blog-taxonomy services
    - Create `core/services/analytics.service.ts` (`recordVisit`, `getSummary`,
      `getAggregations`) and `core/services/blogCategory.service.ts` /
      `core/services/blogTag.service.ts` (`getAll`)
    - _Requirements: 8.1, 12.1, 12.2, 1.5, 3.5, 3.6, 13.1_

- [x] 5. Implement motion/scroll/theme hooks and shared UI primitives
  - [x] 5.1 Implement reduced-motion and scroll-progress hooks
    - Create `hooks/useReducedMotion.tsx` (wraps `prefers-reduced-motion`) and
      `hooks/useScrollProgress.tsx` (uses `readingProgress`)
    - _Requirements: 15.4, 18.7_

  - [x] 5.2 Implement EmptyState and ErrorState primitives
    - Create `components/shared/EmptyState.tsx` (icon/illustration + text) and
      `components/shared/ErrorState.tsx` (icon + text + retry control), theme-aware
    - _Requirements: 1.3, 13.5, 19.1, 19.2, 19.3, 19.4_

  - [x] 5.3 Implement content-shaped skeleton family
    - Create `components/shared/skeletons/` with `ProjectGridSkeleton`,
      `BlogListSkeleton`, `BlogDetailSkeleton`, `TestimonialSkeleton`, `TableSkeleton`
      built on `ui/skeleton`
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [x] 5.4 Implement motion wrappers
    - Create `components/shared/motion/FadeIn.tsx` and `MotionSection.tsx` (framer-motion
      entrance/transition 150-500ms, disabled under reduced motion)
    - _Requirements: 15.1, 15.4, 15.5_

  - [x] 5.5 Implement TechChip and CategoryBadge
    - Create `components/shared/TechChip.tsx` (icon + name) and
      `components/shared/CategoryBadge.tsx` (on `ui/badge`)
    - _Requirements: 2.9, 18.1, 18.4_

  - [x] 5.6 Implement BackToTop control
    - Create `components/shared/BackToTop.tsx` (appears past one viewport height, scrolls
      to top on activate, ARIA label)
    - _Requirements: 17.5, 17.6, 20.3_

  - [x] 5.7 Implement ReadingProgress indicator
    - Create `components/shared/ReadingProgress.tsx` (fixed bar fed by `useScrollProgress`)
    - _Requirements: 18.7_

  - [x] 5.8 Implement Lightbox primitive
    - Create `components/shared/Lightbox.tsx` (zoom, prev/next, Escape close, arrow keys,
      focus trap while open, focus restore on close, ARIA label) on `ui/dialog`
    - _Requirements: 18.5, 18.6, 20.3, 20.4, 20.5_

  - [x]* 5.9 Write component tests for shared primitives
    - Test EmptyState/ErrorState retry callback, BackToTop visibility threshold + scroll,
      and Lightbox keyboard (Escape/arrows), focus trap, and focus restore
    - _Requirements: 17.5, 17.6, 19.1, 19.2, 20.3, 20.4, 20.5_

- [x] 6. Checkpoint - services and primitives
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Extend the theme provider and ship the toggle
  - [x] 7.1 Extend ThemeProvider for tri-state preference and persistence
    - Update `core/providers/theme-provider.tsx` to a `dark|light|system` preference using
      `resolveTheme`, persist under `app-mode`, apply `dark` class within the same tick,
      and read `prefers-color-scheme` when no preference is stored
    - _Requirements: 14.2, 14.3, 14.4, 14.5, 14.6_

  - [x] 7.2 Implement ThemeToggle and StickyHeader
    - Create `components/shared/ThemeToggle.tsx` (calls `setMode`, ARIA label naming the
      action) and `components/shared/StickyHeader.tsx` (condenses after 80px scroll, hosts
      nav + ThemeToggle); wire StickyHeader into the public/dashboard layouts
    - _Requirements: 14.1, 14.7, 17.3, 20.3_

  - [x]* 7.3 Write component tests for theme toggle and sticky header
    - Toggle switches theme and persists to localStorage; header condenses past 80px
    - _Requirements: 14.2, 14.3, 17.3_

- [x] 8. Implement Portfolio List feature
  - [x] 8.1 Implement useProjectList hook
    - Create `features/Me/Projects/useProjectList.tsx`: read filter/page/search from router
      search params, debounce search 400ms via `useDebounce`, build params with
      `buildListQuery`, `useQuery(queryKeys.publicPortfolio.list(params))`, load
      category/tag/tech option lists
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.9, 13.1_

  - [x] 8.2 Implement ProjectList component and index
    - Create `features/Me/Projects/ProjectList.tsx` + `index.tsx`: featured section
      (always structurally present), filter bar, card grid (cover/placeholder, badges,
      hover elevation), pagination, navigation to `/projects/$slug`; render
      `ProjectGridSkeleton`/`ErrorState`(retry)/`EmptyState`
    - _Requirements: 1.2, 1.3, 1.4, 1.8, 1.10, 16.1, 18.1, 18.2, 18.3, 13.5_

  - [x]* 8.3 Write component tests for Portfolio List
    - Loading/error/empty states, debounced search→fetch, filter→fetch wiring,
      featured-section presence, pagination, and navigation target
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 1.9, 1.10_

- [x] 9. Implement Project Case-Study Detail feature
  - [x] 9.1 Implement useProjectDetail hook
    - Create `features/Me/Projects/Detail/useProjectDetail.tsx`:
      `useQuery(queryKeys.publicPortfolio.detail(slug))`, derive `isNotFound` from 404
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 9.2 Implement ProjectDetail component and index
    - Create `features/Me/Projects/Detail/ProjectDetail.tsx` + `index.tsx`: render
      title/problem/solution/results, gallery ordered via `orderGallery` feeding Lightbox,
      category/tags, TechChips, live/repo links (`target="_blank" rel="noopener noreferrer"`);
      not-found message + back link vs `ErrorState`+retry; set SEO via `resolveSeo`
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 9.1, 18.4, 18.5, 18.6_

  - [x]* 9.3 Write component tests for Project Detail
    - Gallery order, lightbox open/close, external link rel/target, 404 vs error branch,
      and SEO tag values
    - _Requirements: 2.3, 2.4, 2.6, 2.7, 2.8, 9.1_

- [x] 10. Implement Blog List feature
  - [x] 10.1 Implement useBlogList hook
    - Create `features/Me/Blogs/useBlogList.tsx`: router-search params + 400ms debounce +
      `buildListQuery` + `useQuery(queryKeys.publicBlog.list(params))`; load category/tag
      option lists
    - _Requirements: 3.1, 3.5, 3.6, 3.7, 3.8, 13.1_

  - [x] 10.2 Implement BlogList component and index
    - Create/extend `features/Me/Blogs/BlogList.tsx` + `index.tsx`: filter bar, card grid
      (cover/placeholder, badges, hover elevation), pagination, navigation to
      `/blog/$slug`; `BlogListSkeleton`/`ErrorState`(retry)/`EmptyState`
    - _Requirements: 3.2, 3.3, 3.4, 3.9, 16.2, 18.1, 18.2, 18.3, 13.5_

  - [x]* 10.3 Write component tests for Blog List
    - Loading/error/empty, debounced search, filter→fetch, pagination, navigation target
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [x] 11. Implement Blog Detail feature
  - [x] 11.1 Implement useBlogDetail hook
    - Create/extend `features/blog/BlogDetail/useBlogDetail.tsx`: detail query, comments
      query, reaction mutation (optimistic via `applyOptimistic`/`rollback`, invalidate on
      settle), comment mutation (moderation-aware success), derive `isNotFound`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 13.2_

  - [x] 11.2 Implement ReactionControl sub-component
    - Create `features/blog/BlogDetail/ReactionControl.tsx`: submit reaction, render updated
      count, confirmation animation on success (unless reduced motion), error toast +
      restore previous count
    - _Requirements: 4.5, 4.6, 21.2_

  - [x] 11.3 Implement CommentList and CommentForm sub-components
    - Create `features/blog/BlogDetail/CommentList.tsx` (approved comments) and
      `CommentForm.tsx` (RHF+zod name/email/content validation, success toast +
      moderation message + confirmation animation)
    - _Requirements: 4.7, 4.8, 4.9, 4.10, 21.3_

  - [x] 11.4 Implement BlogDetail component and index
    - Create/extend `features/blog/BlogDetail/BlogDetail.tsx` + `index.tsx`: render
      title/content/category/tags/reading time/view count, ReadingProgress over body,
      ReactionControl, CommentList, CommentForm, related-posts section with slug links;
      `BlogDetailSkeleton`; not-found message + back link; set SEO via `resolveSeo`
    - _Requirements: 4.2, 4.3, 4.4, 4.11, 9.2, 16.3, 18.7_

  - [x]* 11.5 Write component tests for Blog Detail
    - Metadata rendering, optimistic reaction success + failure rollback, comment
      validation + moderation message, related-posts links, not-found branch, SEO values
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.9, 4.10, 4.11, 9.2_

- [x] 12. Implement Contact and Newsletter forms
  - [x] 12.1 Implement Contact feature
    - Create `features/Me/Contact/{Contact.tsx, useContact.tsx, index.tsx}`: RHF+zod
      name/email/subject/body, disable submit + loading during flight, success → toast +
      full reset + confirmation animation, error → toast + preserved values
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 21.3_

  - [x] 12.2 Implement Newsletter feature
    - Create `features/Me/Newsletter/{NewsletterForm.tsx, useNewsletter.tsx, index.tsx}`:
      email input + subscribe, zod validation, success → toast + clear + confirmation
      animation, error → toast
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 21.3_

  - [x]* 12.3 Write component tests for Contact and Newsletter
    - Validation blocks submit, success reset/clear, error preserves values, loading state
    - _Requirements: 5.2, 5.4, 5.5, 5.6, 6.2, 6.4, 6.5_

- [x] 13. Implement Testimonials feature
  - [x] 13.1 Implement Testimonials feature
    - Create `features/Me/Testimonials/{Testimonials.tsx, useTestimonials.tsx, index.tsx}`:
      `useQuery(queryKeys.testimonials())`, `TestimonialSkeleton` while loading,
      `ErrorState` on error, nothing/`EmptyState` on zero (layout intact), author + message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 16.4_

  - [x]* 13.2 Write component tests for Testimonials
    - Loading/error/empty-without-breaking-layout, author + message rendering
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 14. Checkpoint - public features
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement cross-cutting trackers, SEO, and route wiring
  - [x] 15.1 Extend AnalyticsTracker
    - Update `components/shared/analytics.tsx`: on pathname change fire the existing
      react-ga4 `page_view` AND call `analyticsService.recordVisit({ path })` inside a
      try/catch that swallows failures silently
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 15.2 Extend SEO manager
    - Update `components/shared/SEO.tsx` to accept optional `image`/`url`/`type` and update
      title/description/OG tags on navigation
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 15.3 Register public and admin routes
    - Update `app/routes/index.tsx`: replace the `projectsRoute` placeholder with
      `ProjectList`, add `/projects/$slug` (ProjectDetail), `/blogs` (BlogList), reuse
      `/blog/$slug` (BlogDetail), `/contact` under `homeLayoutRoute`; add
      `/dashboard/blog`, `/dashboard/portfolio`, `/dashboard/analytics` under
      `dashboardLayoutRoute`; add all to `routeTree`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 13.8_

  - [x]* 15.4 Write tests for analytics, SEO, and route tree
    - Analytics fires both ga4 + visit and swallows visit failure; SEO updates on
      navigation; route-tree assertions for the new public/admin routes
    - _Requirements: 8.1, 8.2, 8.3, 9.4, 13.8_

- [x] 16. Implement Admin Blog Manager feature
  - [x] 16.1 Implement useBlogManager hook
    - Create `features/blog-post/BlogPost/useBlogManager.tsx`: list query + create/update/
      delete/publish mutations invalidating `adminBlog.list` (and public blog keys when
      affected) and refreshing on success
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 13.2_

  - [x] 16.2 Implement AdminBlogManager component and index
    - Create `features/blog-post/BlogPost/AdminBlogManager.tsx` + `index.tsx`: react-table
      list (`TableSkeleton` while loading), create/edit dialog (RHF+zod, category +
      multi-tag assignment), delete confirmation, publish toggle; field validation blocks
      submit; errors → toast + preserved view state
    - _Requirements: 10.1, 10.6, 10.7, 10.8, 16.5_

  - [x]* 16.3 Write component tests for Admin Blog Manager
    - List render, create/edit/delete/publish flows refresh + toast, validation blocks
      submit, error preserves view state
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.7, 10.8_

- [x] 17. Implement Admin Portfolio Manager feature
  - [x] 17.1 Implement usePortfolioManager hook
    - Create `features/portfolio-management/Portfolio/usePortfolioManager.tsx`: list query +
      CRUD/publish mutations invalidating `adminPortfolio.list` (and public portfolio keys
      when affected); publish toggle re-reads returned state and treats display mismatch as
      failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 13.2_

  - [x] 17.2 Implement gallery editor sub-component
    - Create `features/portfolio-management/Portfolio/GalleryEditor.tsx`: add/remove/reorder
      images via the gallery reducer, submitting each image's URL + position
    - _Requirements: 11.8_

  - [x] 17.3 Implement AdminPortfolioManager component and index
    - Create `features/portfolio-management/Portfolio/AdminPortfolioManager.tsx` +
      `index.tsx`: react-table list (`TableSkeleton`), create/edit dialog with case-study
      fields (problem/solution/results), GalleryEditor, tech-stack + tags multi-assignment,
      delete confirmation, publish toggle; validation blocks submit; errors → toast +
      preserved state
    - _Requirements: 11.1, 11.7, 11.9, 11.10, 11.11, 16.5_

  - [x]* 17.4 Write component tests for Admin Portfolio Manager
    - CRUD/publish flows, publish display-mismatch → failure toast, gallery add/remove/
      reorder, validation blocks submit, error preserves state
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.8, 11.10, 11.11_

- [x] 18. Implement Admin Analytics View feature
  - [x] 18.1 Implement useAnalytics hook
    - Create `features/dashboard/Analytics/useAnalytics.tsx`: `analytics.summary()` and
      `analytics.aggregations()` queries
    - _Requirements: 12.1, 12.2_

  - [x] 18.2 Implement AdminAnalyticsView component and index
    - Create `features/dashboard/Analytics/AdminAnalyticsView.tsx` + `index.tsx`: render
      totals + aggregations + top posts/projects; skeletons while loading; `ErrorState` +
      retry on failure; per-section `EmptyState` on zero items
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 16.5_

  - [x]* 18.3 Write component tests for Admin Analytics View
    - Totals/aggregations/top sections render, loading skeleton, error + retry, per-section
      empty state
    - _Requirements: 12.3, 12.4, 12.5, 12.6_

- [x] 19. Checkpoint - admin features
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Apply enhancement polish across views
  - [x] 20.1 Apply motion and reduced-motion to public routes
    - Wrap primary content of public views in `MotionSection`/`FadeIn`; ensure hover/focus
      utility classes on cards/buttons/links; disable entrance animation under reduced
      motion
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 20.2 Wire sticky header, smooth scroll, and back-to-top
    - Mount `BackToTop` in the public layout; enable smooth scrolling for in-page anchors
      unless reduced motion; confirm `StickyHeader` condensing behavior
    - _Requirements: 17.3, 17.4, 17.5, 17.6_

  - [x] 20.3 Apply responsive spacing/typography tokens
    - Apply shared Tailwind spacing/typography tokens and mobile-first layouts (no
      horizontal overflow at 360/768/1280) across the new views
    - _Requirements: 17.1, 17.2_

  - [x] 20.4 Apply accessibility polish
    - Add visible `focus-visible` rings, accessible labels for interactive controls, and
      confirm contrast tokens across new views in both themes
    - _Requirements: 20.1, 20.2, 13.7_

  - [x] 20.5 Standardize toaster configuration
    - Configure a single `<Toaster>` (position/duration/theme-aware styling) driving all
      success/error feedback consistently
    - _Requirements: 21.1, 21.4_

  - [x]* 20.6 Write tests for enhancement behaviors
    - Reduced-motion disables entrance animation; smooth-scroll/back-to-top behavior;
      focus-ring presence on representative controls
    - _Requirements: 15.4, 17.4, 17.6, 20.1_

- [x] 21. Final checkpoint - full verification
  - Ensure all tests pass (`npm test`), ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Each task references specific requirement clauses for traceability.
- Property tests (2.2, 2.4, 2.5, 2.7, 2.9, 2.11, 2.13) validate the seven universal
  correctness properties and are tagged
  `Feature: frontend-ui-integration, Property {n}: {property_text}`.
- Example/integration component tests and route-tree assertions validate the UI behavior
  that is not amenable to property testing.
- Checkpoints ensure incremental validation at natural boundaries (utilities, services +
  primitives, public features, admin features, final).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.4", "2.1", "2.3", "2.6", "2.8", "2.10", "2.12"] },
    { "id": 2, "tasks": ["1.5", "2.2", "2.4", "2.5", "2.7", "2.9", "2.11", "2.13", "4.1", "4.2", "4.3", "4.4", "4.5", "5.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "7.1"] },
    { "id": 4, "tasks": ["5.9", "7.2", "8.1", "9.1", "10.1", "11.1", "13.1", "16.1", "17.1", "17.2", "18.1"] },
    { "id": 5, "tasks": ["7.3", "8.2", "9.2", "10.2", "11.2", "11.3", "12.1", "12.2", "16.2", "17.3", "18.2"] },
    { "id": 6, "tasks": ["8.3", "9.3", "10.3", "11.4", "12.3", "13.2", "15.1", "15.2", "16.3", "17.4", "18.3"] },
    { "id": 7, "tasks": ["11.5", "15.3"] },
    { "id": 8, "tasks": ["15.4", "20.1", "20.2", "20.3", "20.4", "20.5"] },
    { "id": 9, "tasks": ["20.6"] }
  ]
}
```
