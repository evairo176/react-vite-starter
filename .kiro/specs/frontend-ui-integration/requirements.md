# Requirements Document

## Introduction

The portfolio backend (built in the `portfolio-upgrade` spec) exposes a complete set of
endpoints for rich project case studies, enhanced blog features (categories, tags,
comments, reactions, view counts, related posts), a contact form, newsletter
subscription, testimonials, visit analytics, SEO metadata, and an authenticated admin
dashboard. The frontend (React 19 + Vite 7 + TypeScript) currently does not render UI
for most of these capabilities, so the live site does not reflect the new backend.

This feature delivers the frontend UI and integration layer that consumes those
endpoints. It covers the public-facing experience (portfolio list and case-study detail,
blog list and detail with comments/reactions/related posts, contact form, newsletter,
testimonials, dynamic SEO, visit tracking) and the authenticated dashboard experience
(content management for blog posts and portfolio projects, plus an analytics summary).

Scope is strictly frontend UI and integration behavior. Backend logic, persistence,
email sending, and moderation rules are already implemented and out of scope. The
frontend reuses the existing Axios client (`src/core/api/axios.ts`), the API base URL
(`VITE_API_URL`), TanStack Router, TanStack Query, react-hook-form + zod, and sonner for
toasts, following the established `feature/<Name>/{Component, useComponent, index}`
convention and `core/services` + `core/types` structure.

In addition to the functional integration above, this feature also delivers a layer of
visual and experiential polish (Requirements 14 onward) that raises the perceived quality
of the site without changing its data behavior. The enhancement scope covers a
persistent dark/light theme with a visible toggle, entrance and micro-interaction
animations that respect reduced-motion preferences, content-shaped loading skeletons,
responsive layout and typography polish with sticky navigation and a back-to-top control,
richer content presentation (cover images, badges, tech-stack chips, an image lightbox,
and a reading-progress indicator), illustrated empty and error states, accessibility
polish (focus rings, contrast, ARIA, keyboard operability), and consistent toast and
confirmation feedback. The enhancement layer is built on the project's existing stack:
Tailwind CSS v4 with `tw-animate-css`, framer-motion, AOS, Radix UI primitives, the
existing `ThemeProvider`, sonner, and the `lucide-react` and `react-icons` icon sets.
This enhancement scope remains strictly frontend and visual; it introduces no new backend
calls beyond those already specified in Requirements 1 through 13.

## Glossary

- **Frontend_Application**: The React + Vite single-page application located at `react-vite-starter`.
- **API_Client**: The shared Axios instance at `src/core/api/axios.ts` configured with `VITE_API_URL` and auth/refresh interceptors.
- **Portfolio_List_View**: The UI that lists published portfolio projects with filters, search, and a featured section, served by `GET /portfolio/public`.
- **Project_Case_Study_View**: The UI that renders a single published project's rich case study, served by `GET /portfolio/public/:slug`.
- **Blog_List_View**: The UI that lists published blog posts with category/tag filters and search, served by `GET /blog-posts/public`.
- **Blog_Detail_View**: The UI that renders a single published blog post with metadata, reactions, comments, and related posts, served by `GET /blog-posts/public/:slug`.
- **Comment_Form**: The UI control that submits a new comment via `POST /blog-posts/public/:slug/comments`.
- **Reaction_Control**: The UI control that submits a reaction via `POST /blog-posts/public/:slug/reactions`.
- **Contact_Form**: The UI form that submits messages via `POST /contact`.
- **Newsletter_Form**: The UI form that subscribes an email via `POST /newsletter/subscribe`.
- **Testimonials_View**: The UI that renders published testimonials, served by `GET /testimonial/public`.
- **Analytics_Tracker**: The frontend component that records page visits via `POST /analytics/visit`.
- **SEO_Manager**: The frontend mechanism (react-helmet-async) that sets per-page title, description, and Open Graph metadata.
- **Admin_Blog_Manager**: The authenticated dashboard UI for blog post CRUD and publish toggling, served by `/dashboard/posts` (and `/blog-posts`) endpoints.
- **Admin_Portfolio_Manager**: The authenticated dashboard UI for portfolio project CRUD and publish toggling, served by `/dashboard/projects` (and `/portfolio`) endpoints.
- **Admin_Analytics_View**: The authenticated dashboard UI that renders analytics summaries and aggregations, served by `/dashboard/analytics`, `/analytics/summary`, and `/analytics/aggregations`.
- **Data_Layer**: The TanStack Query hooks and `core/services` modules that fetch and mutate backend data.
- **Loading_State**: A visible indicator shown while a request is in flight.
- **Error_State**: A visible message shown when a request fails.
- **Empty_State**: A visible message shown when a successful request returns no items.
- **Reading_Time**: The estimated minutes-to-read value returned by the blog detail endpoint.
- **Slug**: The URL-safe identifier used to fetch a single published project or post.
- **Theme_Provider**: The existing `ThemeProvider` component that supplies the active color theme (dark or light) to the Frontend_Application.
- **Theme_Toggle**: The visible UI control that switches the Frontend_Application between dark and light themes.
- **Theme_Preference**: The visitor's selected theme value (`dark`, `light`, or `system`) persisted in `localStorage`.
- **Reduced_Motion**: The visitor's operating-system setting exposed via the `prefers-reduced-motion` media query that requests minimized animation.
- **Skeleton_Loader**: A placeholder UI that mirrors the layout of pending content while a request is in flight, used in place of a generic spinner.
- **Sticky_Header**: The site navigation header that remains fixed to the top of the viewport while the page scrolls.
- **Back_To_Top_Control**: The UI control shown on long pages that scrolls the viewport to the top when activated.
- **Lightbox**: The overlay UI that displays an enlarged gallery image with zoom and navigation, used on the Project_Case_Study_View.
- **Reading_Progress_Indicator**: The UI element on the Blog_Detail_View that visually represents how far the visitor has scrolled through the post content.
- **Tech_Stack_Chip**: A compact UI element that displays a tech-stack item's icon and name.
- **Category_Badge**: A compact labeled UI element that displays a content item's category or tag.
- **Focus_Ring**: The visible outline rendered on an interactive control when it receives keyboard focus.

## Requirements

### Requirement 1: Portfolio List With Filter, Search, and Featured Section

**User Story:** As a site visitor, I want to browse published projects with filtering and search, so that I can quickly find work relevant to my interest.

#### Acceptance Criteria

1. WHEN a visitor opens the `/projects` route, THE Portfolio_List_View SHALL request published projects from `GET /portfolio/public` through the API_Client and render the returned projects.
2. WHILE the project request is in flight, THE Portfolio_List_View SHALL display a Loading_State.
3. IF the project request fails, THEN THE Portfolio_List_View SHALL display an Error_State with a retry control.
4. WHEN the project request succeeds and returns zero projects, THE Portfolio_List_View SHALL display an Empty_State message.
5. WHEN a visitor selects a category filter, THE Portfolio_List_View SHALL re-request `GET /portfolio/public` with the selected category slug as a query parameter and render the filtered results.
6. WHEN a visitor applies tag or tech-stack filters, THE Portfolio_List_View SHALL re-request `GET /portfolio/public` with the selected values as comma-separated query parameters and render the filtered results.
7. WHEN a visitor types in the search field, THE Portfolio_List_View SHALL re-request `GET /portfolio/public` with the search term as a query parameter after a debounce interval of 400 milliseconds.
8. THE Portfolio_List_View SHALL render projects flagged as featured in a dedicated featured section that is visually distinct from the main list, preserving the section's layout structure even when no featured projects exist.
9. WHEN the response includes pagination metadata and additional pages exist, THE Portfolio_List_View SHALL render pagination controls that request the corresponding page on activation.
10. WHEN a visitor activates a project entry, THE Portfolio_List_View SHALL navigate to the project case-study route for that project's Slug.

### Requirement 2: Project Case-Study Detail Page

**User Story:** As a site visitor, I want to read a full project case study, so that I can understand the problem, solution, results, and technologies involved.

#### Acceptance Criteria

1. WHEN a visitor opens a project detail route with a Slug, THE Project_Case_Study_View SHALL request `GET /portfolio/public/:slug` through the API_Client.
2. WHILE the project detail request is in flight, THE Project_Case_Study_View SHALL display a Loading_State.
3. IF the project detail request fails with a not-found response, THEN THE Project_Case_Study_View SHALL display a not-found message and a link back to the project list.
4. IF the project detail request fails with a non-not-found error, THEN THE Project_Case_Study_View SHALL display an Error_State with a retry control.
5. WHEN the project detail request succeeds, THE Project_Case_Study_View SHALL render the project title, problem, solution, and results sections.
6. WHEN the project includes gallery images, THE Project_Case_Study_View SHALL render the images ordered by their position value.
7. WHERE a project provides a live URL, THE Project_Case_Study_View SHALL render a link to the live URL that opens in a new browser tab with `rel="noopener noreferrer"`.
8. WHERE a project provides a repository URL, THE Project_Case_Study_View SHALL render a link to the repository URL that opens in a new browser tab with `rel="noopener noreferrer"`.
9. THE Project_Case_Study_View SHALL render the project category, tags, and tech stack, displaying each tech-stack item with its name and icon.

### Requirement 3: Blog List With Category/Tag Filter and Search

**User Story:** As a site visitor, I want to browse and filter blog posts, so that I can find articles on topics I care about.

#### Acceptance Criteria

1. WHEN a visitor opens the `/blogs` route, THE Blog_List_View SHALL request published posts from `GET /blog-posts/public` through the API_Client and render the returned posts.
2. WHILE the post request is in flight, THE Blog_List_View SHALL display a Loading_State.
3. IF the post request fails, THEN THE Blog_List_View SHALL display an Error_State with a retry control.
4. WHEN the post request succeeds and returns zero posts, THE Blog_List_View SHALL display an Empty_State message.
5. WHEN a visitor selects a category filter, THE Blog_List_View SHALL re-request `GET /blog-posts/public` with the selected category slug as a query parameter and render the filtered results.
6. WHEN a visitor selects a tag filter, THE Blog_List_View SHALL re-request `GET /blog-posts/public` with the selected tag slug as a query parameter and render the filtered results.
7. WHEN a visitor types in the search field, THE Blog_List_View SHALL re-request `GET /blog-posts/public` with the search term as a query parameter after a debounce interval of 400 milliseconds.
8. WHEN the response includes pagination metadata and additional pages exist, THE Blog_List_View SHALL render pagination controls that request the corresponding page on activation.
9. WHEN a visitor activates a post entry, THE Blog_List_View SHALL navigate to the blog detail route for that post's Slug.

### Requirement 4: Blog Detail With Metadata, Reactions, Comments, and Related Posts

**User Story:** As a site visitor, I want to read a blog post with its metadata and engage through reactions and comments, so that I can interact with the content.

#### Acceptance Criteria

1. WHEN a visitor opens the `/blog/$slug` route, THE Blog_Detail_View SHALL request `GET /blog-posts/public/:slug` through the API_Client.
2. WHILE the post detail request is in flight, THE Blog_Detail_View SHALL display a Loading_State.
3. IF the post detail request fails with a not-found response, THEN THE Blog_Detail_View SHALL display a not-found message and a link back to the blog list.
4. WHEN the post detail request succeeds, THE Blog_Detail_View SHALL render the post title, content, category, tags, Reading_Time, and view count.
5. WHEN a visitor activates the Reaction_Control, THE Reaction_Control SHALL submit `POST /blog-posts/public/:slug/reactions` and render the updated reaction count returned by the response.
6. IF the reaction submission fails, THEN THE Reaction_Control SHALL display an error toast and restore the previously displayed reaction count.
7. WHEN the post detail request succeeds, THE Blog_Detail_View SHALL request and render the list of approved comments for the post.
8. WHEN a visitor submits the Comment_Form with valid input, THE Comment_Form SHALL submit `POST /blog-posts/public/:slug/comments` and display a success toast.
9. IF the comment submission returns a status indicating the comment awaits moderation, THEN THE Comment_Form SHALL display a message stating the comment will appear after approval.
10. IF the Comment_Form is submitted with an invalid name or invalid email, THEN THE Comment_Form SHALL display field-level validation messages and SHALL NOT submit the request.
11. WHEN the post detail response includes related posts, THE Blog_Detail_View SHALL render a related-posts section with navigation links to each related post's Slug.

### Requirement 5: Contact Form

**User Story:** As a site visitor, I want to send a message through a contact form, so that I can reach the site owner.

#### Acceptance Criteria

1. WHEN a visitor opens the `/contact` route, THE Contact_Form SHALL render fields for name, email, subject, and body.
2. IF the Contact_Form is submitted with a missing required field or an invalid email, THEN THE Contact_Form SHALL display field-level validation messages and SHALL NOT submit the request.
3. WHEN the Contact_Form is submitted with valid input, THE Contact_Form SHALL submit `POST /contact` through the API_Client with name, email, subject, and body.
4. WHILE the contact submission is in flight, THE Contact_Form SHALL disable the submit control and display a Loading_State on the submit control.
5. WHEN the contact submission succeeds, THE Contact_Form SHALL display a success toast and clear all input fields completely.
6. IF the contact submission fails, THEN THE Contact_Form SHALL display an error toast and preserve the entered field values.

### Requirement 6: Newsletter Subscription

**User Story:** As a site visitor, I want to subscribe to the newsletter with my email, so that I receive updates.

#### Acceptance Criteria

1. THE Newsletter_Form SHALL render an email input and a subscribe control.
2. IF the Newsletter_Form is submitted with an invalid email, THEN THE Newsletter_Form SHALL display a validation message and SHALL NOT submit the request.
3. WHEN the Newsletter_Form is submitted with a valid email, THE Newsletter_Form SHALL submit `POST /newsletter/subscribe` through the API_Client.
4. WHEN the newsletter subscription succeeds, THE Newsletter_Form SHALL display a success toast and clear the email input.
5. IF the newsletter subscription fails, THEN THE Newsletter_Form SHALL display an error toast.

### Requirement 7: Testimonials Section

**User Story:** As a site visitor, I want to see testimonials, so that I can gauge the site owner's credibility.

#### Acceptance Criteria

1. WHEN the Testimonials_View mounts, THE Testimonials_View SHALL request `GET /testimonial/public` through the API_Client.
2. WHILE the testimonial request is in flight, THE Testimonials_View SHALL display a Loading_State.
3. IF the testimonial request fails, THEN THE Testimonials_View SHALL display an Error_State.
4. WHEN the testimonial request succeeds and returns zero testimonials, THE Testimonials_View SHALL render nothing or an Empty_State without breaking the surrounding layout.
5. WHEN the testimonial request succeeds and returns testimonials, THE Testimonials_View SHALL render each testimonial's author and message.

### Requirement 8: Visit Analytics Tracking

**User Story:** As the site owner, I want page visits recorded on navigation, so that I can measure traffic.

#### Acceptance Criteria

1. WHEN the active route path changes, THE Analytics_Tracker SHALL submit `POST /analytics/visit` through the API_Client with the current path.
2. IF the visit submission fails, THEN THE Analytics_Tracker SHALL suppress the error and SHALL NOT display a visible message to the visitor.
3. WHEN the active route path changes, THE Analytics_Tracker SHALL continue to send the existing react-ga4 `page_view` event in addition to the backend visit request.

### Requirement 9: Dynamic SEO Metadata Per Page

**User Story:** As the site owner, I want each published project and post page to expose accurate metadata, so that search engines and social previews display correct information.

#### Acceptance Criteria

1. WHEN the Project_Case_Study_View renders a project, THE SEO_Manager SHALL set the document title, meta description, and Open Graph tags from the project's metadata, falling back to the project title and short description when explicit metadata is absent.
2. WHEN the Blog_Detail_View renders a post, THE SEO_Manager SHALL set the document title, meta description, and Open Graph tags from the post's metadata, falling back to the post title and excerpt when explicit metadata is absent.
3. WHEN a list or static page renders, THE SEO_Manager SHALL set a page-appropriate title and description.
4. WHEN a visitor navigates from one page to another, THE SEO_Manager SHALL update the document title and meta tags to reflect the newly rendered page.

### Requirement 10: Admin Blog Content Management

**User Story:** As the authenticated site owner, I want to manage blog posts from the dashboard, so that I can publish and maintain articles.

#### Acceptance Criteria

1. WHEN an authenticated owner opens the blog management route, THE Admin_Blog_Manager SHALL request the post list through the API_Client and render the posts in a table.
2. WHEN an owner submits the create-post form with valid input, THE Admin_Blog_Manager SHALL submit a create request through the API_Client and, on success, refresh the post list and display a success toast.
3. WHEN an owner submits the edit-post form with valid input, THE Admin_Blog_Manager SHALL submit an update request through the API_Client and, on success, refresh the post list and display a success toast.
4. WHEN an owner confirms deletion of a post, THE Admin_Blog_Manager SHALL submit a delete request through the API_Client and, on success, refresh the post list and display a success toast.
5. WHEN an owner toggles a post's publish state, THE Admin_Blog_Manager SHALL submit the publish-state change through the API_Client and render the updated state on success.
6. WHEN an owner edits a post, THE Admin_Blog_Manager SHALL allow assigning a category and one or more tags, and SHALL include the selected category and tags in the submitted request.
7. IF a create or edit form is submitted with a missing required field, THEN THE Admin_Blog_Manager SHALL display field-level validation messages and SHALL NOT submit the request.
8. IF a create, edit, delete, or publish-toggle request fails, THEN THE Admin_Blog_Manager SHALL display an error toast and preserve the current view state.

### Requirement 11: Admin Portfolio Content Management

**User Story:** As the authenticated site owner, I want to manage portfolio projects with their case-study fields from the dashboard, so that I can present my work accurately.

#### Acceptance Criteria

1. WHEN an authenticated owner opens the portfolio management route, THE Admin_Portfolio_Manager SHALL request the project list through the API_Client and render the projects in a table.
2. WHEN an owner submits the create-project form with valid input, THE Admin_Portfolio_Manager SHALL submit a create request through the API_Client and, on success, refresh the project list and display a success toast.
3. WHEN an owner submits the edit-project form with valid input, THE Admin_Portfolio_Manager SHALL submit an update request through the API_Client and, on success, refresh the project list and display a success toast.
4. WHEN an owner confirms deletion of a project, THE Admin_Portfolio_Manager SHALL submit a delete request through the API_Client and, on success, refresh the project list and display a success toast.
5. WHEN an owner toggles a project's publish state, THE Admin_Portfolio_Manager SHALL submit the publish-state change through the API_Client and render the updated state on success.
6. IF a publish-state change succeeds at the API but the displayed state fails to update, THEN THE Admin_Portfolio_Manager SHALL treat the operation as failed and display an error toast.
7. THE Admin_Portfolio_Manager SHALL provide form inputs for the case-study fields problem, solution, and results.
8. THE Admin_Portfolio_Manager SHALL allow adding, removing, and ordering gallery images, and SHALL include each image's URL and position in the submitted request.
9. THE Admin_Portfolio_Manager SHALL allow assigning one or more tech-stack items and one or more tags, and SHALL include the selected tech-stack items and tags in the submitted request.
10. IF a create or edit form is submitted with a missing required field, THEN THE Admin_Portfolio_Manager SHALL display field-level validation messages and SHALL NOT submit the request.
11. IF a create, edit, delete, or publish-toggle request fails, THEN THE Admin_Portfolio_Manager SHALL display an error toast and preserve the current view state.

### Requirement 12: Admin Analytics Summary Dashboard

**User Story:** As the authenticated site owner, I want an analytics summary dashboard, so that I can review traffic and content performance.

#### Acceptance Criteria

1. WHEN an authenticated owner opens the analytics dashboard route, THE Admin_Analytics_View SHALL request `/analytics/summary` through the API_Client and render the returned totals.
2. WHEN an authenticated owner opens the analytics dashboard route, THE Admin_Analytics_View SHALL request `/analytics/aggregations` through the API_Client and render the returned aggregations.
3. WHILE an analytics request is in flight, THE Admin_Analytics_View SHALL display a Loading_State.
4. IF an analytics request fails, THEN THE Admin_Analytics_View SHALL display an Error_State with a retry control.
5. WHEN the analytics requests succeed, THE Admin_Analytics_View SHALL render the top posts and top projects sections from the returned data.
6. WHEN an analytics request succeeds and returns zero items for a section, THE Admin_Analytics_View SHALL display an Empty_State for that section.

### Requirement 13: Cross-Cutting Data Layer, Forms, and Accessibility

**User Story:** As a developer maintaining the frontend, I want consistent data-fetching, form, feedback, and accessibility conventions, so that the integration is reliable and maintainable.

#### Acceptance Criteria

1. THE Data_Layer SHALL perform all backend reads and writes through TanStack Query hooks that call `core/services` modules using the shared API_Client.
2. WHEN a mutation succeeds, THE Data_Layer SHALL invalidate or update the affected query caches so that displayed data reflects the change.
3. THE Frontend_Application SHALL validate all user-submitted forms with react-hook-form and zod schemas before sending requests.
4. WHEN a user-facing request succeeds or fails, THE Frontend_Application SHALL surface the outcome using sonner toasts consistent with existing usage.
5. THE Frontend_Application SHALL render every data-driven view with explicit Loading_State, Error_State, and Empty_State handling.
6. THE Frontend_Application SHALL render all new views responsively across mobile, tablet, and desktop viewport widths.
7. THE Frontend_Application SHALL provide accessible labels for all interactive controls and SHALL ensure interactive controls are operable by keyboard.
8. WHEN a new public route is added, THE Frontend_Application SHALL register the route in the TanStack Router route tree under the appropriate layout.

### Requirement 14: Dark/Light Theme Toggle and Persistence

**User Story:** As a site visitor, I want to switch between dark and light themes and have my choice remembered, so that I can read the site comfortably in my preferred appearance.

#### Acceptance Criteria

1. THE Frontend_Application SHALL render a visible Theme_Toggle in the Sticky_Header on every public and dashboard route.
2. WHEN a visitor activates the Theme_Toggle, THE Theme_Provider SHALL switch the active theme between dark and light and apply the corresponding theme to the rendered UI within 100 milliseconds.
3. WHEN a visitor selects a theme through the Theme_Toggle, THE Frontend_Application SHALL persist the selected Theme_Preference to `localStorage`.
4. WHEN the Frontend_Application loads and a persisted Theme_Preference exists in `localStorage`, THE Theme_Provider SHALL apply the persisted Theme_Preference as the active theme.
5. WHEN the Frontend_Application loads and no persisted Theme_Preference exists, THE Theme_Provider SHALL apply the theme indicated by the `prefers-color-scheme` media query as the active theme.
6. THE Frontend_Application SHALL render the Portfolio_List_View, Project_Case_Study_View, Blog_List_View, Blog_Detail_View, Contact_Form, Testimonials_View, and dashboard views with theme-appropriate colors in both dark and light themes.
7. THE Theme_Toggle SHALL expose an accessible label that states the action it performs.

### Requirement 15: Motion and Micro-Interactions

**User Story:** As a site visitor, I want smooth entrance animations and responsive interaction feedback, so that the interface feels polished and alive.

#### Acceptance Criteria

1. WHEN a public route renders its primary content, THE Frontend_Application SHALL apply an entrance animation to the page sections using framer-motion or AOS.
2. WHEN a pointer hovers over a card, button, or link, THE Frontend_Application SHALL apply a hover state that changes the control's visual appearance.
3. WHEN a card, button, or link receives keyboard focus, THE Frontend_Application SHALL apply a focus state that changes the control's visual appearance.
4. WHILE Reduced_Motion is requested by the visitor, THE Frontend_Application SHALL disable or reduce non-essential entrance and transition animations.
5. WHERE Reduced_Motion is not requested, THE Frontend_Application SHALL apply animated transitions to route and section changes with a duration between 150 and 500 milliseconds.

### Requirement 16: Content-Shaped Loading Skeletons

**User Story:** As a site visitor, I want loading placeholders that resemble the content being loaded, so that I perceive the page as fast and understand what is coming.

#### Acceptance Criteria

1. WHILE the project list request is in flight, THE Portfolio_List_View SHALL display a Skeleton_Loader whose layout matches the project card grid instead of a generic spinner.
2. WHILE the post list request is in flight, THE Blog_List_View SHALL display a Skeleton_Loader whose layout matches the post list instead of a generic spinner.
3. WHILE the post detail request is in flight, THE Blog_Detail_View SHALL display a Skeleton_Loader whose layout matches the article header and body instead of a generic spinner.
4. WHILE the testimonial request is in flight, THE Testimonials_View SHALL display a Skeleton_Loader whose layout matches the testimonial cards.
5. WHILE a dashboard table request is in flight, THE Admin_Blog_Manager, THE Admin_Portfolio_Manager, and THE Admin_Analytics_View SHALL each display a Skeleton_Loader whose layout matches the table rows.
6. WHEN the corresponding request resolves, THE Frontend_Application SHALL replace the Skeleton_Loader with the rendered content or the applicable Empty_State or Error_State.

### Requirement 17: Responsive Layout and Navigation Polish

**User Story:** As a site visitor on any device, I want consistent spacing, readable typography, and convenient navigation, so that I can move through long pages easily.

#### Acceptance Criteria

1. THE Frontend_Application SHALL apply a consistent spacing and typography scale across all public and dashboard views using shared Tailwind tokens.
2. THE Frontend_Application SHALL render all new views with mobile-first responsive layouts at viewport widths of 360, 768, and 1280 pixels without horizontal overflow.
3. WHILE the visitor scrolls a public page downward beyond 80 pixels, THE Sticky_Header SHALL remain fixed to the top of the viewport in a condensed form.
4. WHEN a visitor activates an in-page anchor or navigation link that targets a section on the current page, THE Frontend_Application SHALL scroll to the target section using smooth scrolling, unless Reduced_Motion is requested.
5. WHILE the visitor has scrolled a page beyond one viewport height, THE Frontend_Application SHALL display the Back_To_Top_Control.
6. WHEN a visitor activates the Back_To_Top_Control, THE Frontend_Application SHALL scroll the viewport to the top of the page.

### Requirement 18: Visual Richness for Content Cards and Media

**User Story:** As a site visitor, I want visually rich project and blog cards and an immersive media experience, so that the content is engaging and easy to scan.

#### Acceptance Criteria

1. THE Portfolio_List_View and THE Blog_List_View SHALL render each content card with a cover image, a title, and one or more Category_Badge elements.
2. WHERE a content item provides no cover image, THE Frontend_Application SHALL render a placeholder image in the cover image area.
3. WHEN a pointer hovers over a content card, THE Frontend_Application SHALL apply an elevation effect to the card.
4. THE Project_Case_Study_View SHALL render each tech-stack item as a Tech_Stack_Chip displaying the item's icon and name.
5. WHEN a visitor activates a gallery image on the Project_Case_Study_View, THE Lightbox SHALL open and display the enlarged image with controls to zoom and to navigate to adjacent gallery images.
6. WHEN a visitor activates the Lightbox close control or presses the Escape key, THE Lightbox SHALL close and return keyboard focus to the gallery image that opened it.
7. WHILE a visitor scrolls through the Blog_Detail_View content, THE Reading_Progress_Indicator SHALL update to represent the proportion of the post content that has been scrolled past.

### Requirement 19: Illustrated Empty and Error States

**User Story:** As a site visitor, I want friendly and clear empty and error states, so that I understand what happened and what I can do next.

#### Acceptance Criteria

1. WHEN a data-driven view renders an Empty_State, THE Frontend_Application SHALL display an icon or illustration together with explanatory text rather than text alone.
2. WHEN a data-driven view renders an Error_State, THE Frontend_Application SHALL display an icon or illustration, explanatory text, and a retry control.
3. THE Frontend_Application SHALL render Empty_State and Error_State presentations with a consistent visual structure across the Portfolio_List_View, Blog_List_View, Blog_Detail_View, Testimonials_View, and dashboard views.
4. THE Frontend_Application SHALL render Empty_State and Error_State presentations with theme-appropriate colors in both dark and light themes.

### Requirement 20: Accessibility Polish for Enhancements

**User Story:** As a visitor using assistive technology or a keyboard, I want the enhanced interactions to be operable and perceivable, so that I can use the site without barriers.

#### Acceptance Criteria

1. WHEN an interactive control receives keyboard focus, THE Frontend_Application SHALL render a visible Focus_Ring on that control.
2. THE Frontend_Application SHALL render text and interactive controls with a contrast ratio of at least 4.5 to 1 against their background in both dark and light themes.
3. THE Theme_Toggle, THE Back_To_Top_Control, and THE Lightbox SHALL each expose an ARIA label describing the control's purpose.
4. THE Lightbox SHALL be operable by keyboard, supporting closing with the Escape key and navigating between images with the arrow keys.
5. WHILE the Lightbox is open, THE Frontend_Application SHALL confine keyboard focus to the Lightbox controls until the Lightbox closes.

### Requirement 21: Consistent Feedback and Confirmation Animations

**User Story:** As a site visitor, I want clear and consistent confirmation when my actions succeed or fail, so that I trust the interface responded to me.

#### Acceptance Criteria

1. THE Frontend_Application SHALL present all action success and failure feedback through sonner toasts with consistent styling, positioning, and duration across all views.
2. WHEN a visitor activates the Reaction_Control and the reaction submission succeeds, THE Reaction_Control SHALL play a confirmation animation on the control, unless Reduced_Motion is requested.
3. WHEN a Contact_Form, Comment_Form, or Newsletter_Form submission succeeds, THE Frontend_Application SHALL display a confirmation animation in addition to the success toast, unless Reduced_Motion is requested.
4. THE Frontend_Application SHALL render success and error toasts with theme-appropriate colors in both dark and light themes.
