"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

type LabelMap = Record<string, string>;

/** Bisa mengembalikan string atau undefined (sinkron/async) */
type ResolveLabelFn = (
  segment: string,
  index: number,
  fullPath: string
) => string | undefined | Promise<string | undefined>;

interface Props {
  showHome?: boolean;
  homeLabel?: string;
  labelMap?: LabelMap;
  resolveLabel?: ResolveLabelFn;
  className?: string;

  activeClassName?: string;
  inactiveClassName?: string;
}

export default function DynamicBreadcrumb({
  showHome = true,
  homeLabel = "Home",
  labelMap = {},
  resolveLabel,
  className,

  // default styling (Tailwind/shadcn)
  activeClassName = "text-blue-600 font-semibold",
  inactiveClassName = "text-muted-foreground hover:text-foreground",
}: Props) {
  const { pathname } = useLocation();
  const segments = useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname]
  );

  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const fullSegments = segments.slice();

    const prettify = (s: string) =>
      s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // inisialisasi label (dari labelMap atau prettify)
    const initial = fullSegments.map((seg) => {
      if (labelMap[seg]) return labelMap[seg];
      return prettify(seg);
    });

    setLabels(initial);

    if (!resolveLabel) {
      return () => {
        mounted = false;
      };
    }

    (async () => {
      const results = [...initial];
      let changed = false;

      for (let i = 0; i < fullSegments.length; i++) {
        if (!mounted) break;
        const seg = fullSegments[i];

        // skip kalau ada mapping statis
        if (labelMap[seg]) continue;

        try {
          const res = await resolveLabel(
            seg,
            i,
            "/" + fullSegments.slice(0, i + 1).join("/")
          );

          if (!mounted) break;

          // res mungkin undefined -> hanya pakai kalau bukan null/undefined
          if (res != null && res !== results[i]) {
            results[i] = res;
            changed = true;
          }
        } catch (e) {
          // ignore error dari resolver, biarkan label awal tetap ada
          // (bisa log jika mau)
        }
      }

      if (mounted && changed) setLabels(results);
    })();

    return () => {
      mounted = false;
    };
  }, [pathname, segments, labelMap, resolveLabel]);

  const buildHref = (index: number) =>
    "/" + segments.slice(0, index + 1).join("/");

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {showHome && (
          <>
            <BreadcrumbItem>
              {segments.length === 0 ? (
                <BreadcrumbPage className={activeClassName}>
                  {homeLabel}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to="/" className={inactiveClassName}>
                    {homeLabel}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {segments.length > 0 && <BreadcrumbSeparator />}
          </>
        )}

        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const href = buildHref(idx);
          const label = labels[idx] ?? seg;

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className={activeClassName}>
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={href} className={inactiveClassName}>
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
