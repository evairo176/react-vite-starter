import SEO from "@/components/shared/SEO";
import { Button } from "@/components/ui/button";
import { fmtDate } from "@/core/utils/date";
import { ArrowLeft, Eye, Heart, List, X } from "lucide-react";
import { Link } from "react-router-dom";
import useBlogDetail from "./useBlogDetail";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BiListUl } from "react-icons/bi";

type TocItem = {
  id: string;
  text: string;
  level: 1 | 2 | 3;
};

const BlogDetail = () => {
  const { data, isLoading, liked, optimisticLikes, handleLike } =
    useBlogDetail();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [tocOpen, setTocOpen] = useState<boolean>(true);

  // Inject HTML content manually so React never touches the DOM afterward,
  // then collect headings and assign unique stable ids.
  useLayoutEffect(() => {
    console.log("[TOC] build effect run", {
      hasContent: !!data?.content,
      hasRef: !!contentRef.current,
    });
    if (!contentRef.current) return;
    const root = contentRef.current;
    root.innerHTML = data?.content ?? "";

    const headings = Array.from(
      root.querySelectorAll<HTMLElement>("h1, h2, h3"),
    );
    console.log("[TOC] headings found:", headings.length);
    const items: TocItem[] = headings.map((el, index) => {
      const text = (el.textContent || "").trim() || `Section ${index + 1}`;
      const id = `toc-heading-${index}`;
      el.id = id;
      el.setAttribute("data-toc-id", id);
      el.style.scrollMarginTop = "96px";
      const level = (el.tagName === "H1" ? 1 : el.tagName === "H2" ? 2 : 3) as
        | 1
        | 2
        | 3;
      console.log("[TOC] heading", index, { id, text, tag: el.tagName, el });
      return { id, text, level };
    });
    setToc(items);
  }, [data?.content]);

  // Highlight current section while scrolling
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] },
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  // Make sure the page is scrollable (Sidebar may have locked body overflow)
  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  const findHeading = (id: string): HTMLElement | null => {
    return (
      document.getElementById(id) ||
      (contentRef.current?.querySelector<HTMLElement>(
        `[data-toc-id="${id}"]`,
      ) ?? null)
    );
  };

  const findScrollableParent = (el: HTMLElement): HTMLElement | null => {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
      const style = getComputedStyle(node);
      const oy = style.overflowY;
      if (
        (oy === "auto" || oy === "scroll" || oy === "overlay") &&
        node.scrollHeight > node.clientHeight
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const performScroll = (el: HTMLElement, id: string) => {
    // Force-unlock window scroll just in case
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    const headerOffset = 96;
    const scrollableParent = findScrollableParent(el);
    const bodyOverflow = getComputedStyle(document.body).overflow;
    const htmlOverflow = getComputedStyle(document.documentElement).overflow;

    console.log("[TOC] click", {
      id,
      scrollableParent,
      bodyOverflow,
      htmlOverflow,
      windowScrollY: window.scrollY,
      docHeight: document.documentElement.scrollHeight,
      winHeight: window.innerHeight,
    });

    if (scrollableParent) {
      const targetTop =
        el.getBoundingClientRect().top -
        scrollableParent.getBoundingClientRect().top +
        scrollableParent.scrollTop -
        headerOffset;
      scrollableParent.scrollTo({ top: targetTop, behavior: "smooth" });
    } else {
      const top =
        el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }

    // Always also try scrollIntoView as a final fallback
    try {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      el.scrollIntoView();
    }

    setActiveId(id);
    if (history.pushState) {
      history.pushState(null, "", `#${id}`);
    }
  };

  const handleScrollTo = (item: TocItem) => {
    console.log("[TOC] click handler fired", item);
    console.log("[TOC] DOM check via getElementById:", document.getElementById(item.id));
    console.log(
      "[TOC] DOM check via querySelector data-toc-id:",
      document.querySelector(`[data-toc-id="${item.id}"]`),
    );

    const beforeY = window.scrollY;
    const el = findHeading(item.id);
    if (el) {
      performScroll(el, item.id);
    } else {
      // Retry once on next frame in case DOM was just replaced
      requestAnimationFrame(() => {
        const retry = findHeading(item.id);
        if (retry) {
          performScroll(retry, item.id);
        } else {
          console.warn("[TOC] Heading element not in DOM:", item.id);
        }
      });
    }

    // Verify scroll actually moved
    setTimeout(() => {
      console.log("[TOC] scrollY before/after:", beforeY, "->", window.scrollY);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="rounded-md border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Blog tidak ditemukan.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 text-primary text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  const totalLikes = optimisticLikes ?? data.totalLikes;

  return (
    <article className="p-4 lg:p-8 rounded-md border bg-card text-card-foreground space-y-6 rela">
      <SEO title={`${data.title} | Blog`} description={data.excerpt ?? ""} />

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>

      {data.coverImage && (
        <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
          <img
            src={data.coverImage}
            alt={data.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
          {data.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{fmtDate(data.updatedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {data.totalViews}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {totalLikes}
          </span>
        </div>
        {data.excerpt && (
          <p className="text-sm text-muted-foreground">{data.excerpt}</p>
        )}
      </header>

      <div ref={contentRef} className="rte-content max-w-none" />

      {toc.length > 0 &&
        createPortal(
          tocOpen ? (
            <aside
              className="toc-panel fixed top-24 right-6 w-72 max-h-[70vh] flex flex-col rounded-md border bg-card shadow-lg z-50"
              aria-label="Table of contents"
            >
              <div className="flex items-center justify-between p-3 border-b text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <List className="w-4 h-4" /> Daftar Isi
                </span>
                <button
                  type="button"
                  onClick={() => setTocOpen(false)}
                  className="p-1 rounded-md hover:bg-muted transition"
                  aria-label="Sembunyikan daftar isi"
                  title="Sembunyikan daftar isi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <ul className="toc-tree overflow-y-auto p-3 text-sm flex-1">
                {toc.map((item) => (
                  <li
                    key={item.id}
                    className={`toc-item toc-level-${item.level}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleScrollTo(item)}
                      className={`toc-link ${
                        activeId === item.id ? "toc-active" : ""
                      }`}
                      title={item.text}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <button
              type="button"
              onClick={() => setTocOpen(true)}
              className="fixed top-24 right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full border bg-card text-card-foreground shadow-lg hover:bg-muted transition"
              aria-label="Tampilkan daftar isi"
              title="Tampilkan daftar isi"
            >
              <BiListUl className="w-6 h-6" />
            </button>
          ),
          document.body,
        )}

      <style>{`
        .rte-content h1 { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin: 1rem 0 0.5rem; }
        .rte-content h2 { font-size: 1.5rem;   font-weight: 700; line-height: 1.25; margin: 1rem 0 0.5rem; }
        .rte-content h3 { font-size: 1.25rem;  font-weight: 600; line-height: 1.3;  margin: 0.75rem 0 0.5rem; }
        .rte-content p  { margin: 0.5rem 0; line-height: 1.7; }
        .rte-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
        .rte-content a  { color: hsl(var(--primary)); text-decoration: underline; }
        .rte-content code {
          background: rgba(127,127,127,0.15);
          padding: 0.125rem 0.35rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.85em;
        }
        .rte-content pre {
          background: rgba(0,0,0,0.85);
          color: #f8f8f2;
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          margin: 0.75rem 0;
          max-width: 100%;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .rte-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-size: 0.9em;
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: anywhere;
          display: block;
        }

        /* === TOC tree === */
        .toc-tree { list-style: none; margin: 0; padding: 0.5rem 0.75rem; }
        .toc-item { position: relative; padding: 2px 0; }
        .toc-link {
          display: block;
          width: 100%;
          text-align: left;
          padding: 4px 6px;
          border-radius: 4px;
          color: hsl(var(--muted-foreground));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
          background: transparent;
          border: 0;
        }
        .toc-link:hover { background: rgba(127,127,127,0.12); color: hsl(var(--foreground)); }
        .toc-active { color: hsl(var(--primary)) !important; font-weight: 600; background: rgba(127,127,127,0.08); }

        /* Tree indents + connectors */
        .toc-level-1 { padding-left: 0; }
        .toc-level-2 { padding-left: 16px; }
        .toc-level-3 { padding-left: 32px; }

        /* Vertical guide lines */
        .toc-level-2::before,
        .toc-level-3::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 6px;
          border-left: 1px solid rgba(127,127,127,0.35);
        }
        .toc-level-3::before {
          left: 6px;
        }
        .toc-level-3::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 22px;
          border-left: 1px solid rgba(127,127,127,0.25);
        }

        /* Horizontal connector */
        .toc-level-2 > .toc-link::before,
        .toc-level-3 > .toc-link::before {
          content: "";
          position: absolute;
          left: 6px;
          top: 14px;
          width: 8px;
          border-top: 1px solid rgba(127,127,127,0.35);
        }
        .toc-level-3 > .toc-link::before {
          left: 22px;
        }
      `}</style>

      <div className="pt-4 border-t flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Sukai tulisan ini? Tekan tombol like!
        </div>
        <Button
          type="button"
          variant={liked ? "default" : "outline"}
          onClick={handleLike}
          disabled={liked}
          className="gap-2"
        >
          <Heart
            className={`w-4 h-4 ${liked ? "fill-current" : ""}`}
          />
          {liked ? "Liked" : "Like"} ({totalLikes})
        </Button>
      </div>
    </article>
  );
};

export default BlogDetail;
