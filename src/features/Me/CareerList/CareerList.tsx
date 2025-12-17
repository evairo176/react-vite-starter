import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { FaTimeline } from "react-icons/fa6";
import { IoIosDownload } from "react-icons/io";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/core/providers/theme-provider";
import SectionHeading from "@/shared/SectionHeading";
import SectionSubHeading from "@/shared/SectionSubHeading";
import { Home } from "lucide-react";
import { CAREER } from "@/app/layouts/HomeLayout/constant";

interface CareerListInterface {}

const CareerList = ({}: CareerListInterface) => {
  const { theme } = useTheme();

  return (
    <section className="space-y-6 mt-3 p-4 lg:p-8 rounded-md border bg-card text-card-foreground">
      <div className="space-y-2">
        <SectionHeading title="Karir" icon={<FaTimeline className="mr-2" />} />

        <SectionSubHeading>
          <p className="text-muted-foreground">
            Perjalanan karir profesional saya.
          </p>

          <Button
            variant="secondary"
            aria-label="download resume"
            className="flex gap-2 items-center transition-all duration-300"
            asChild
          >
            <a
              href="dicki-prasetya-cv.pdf"
              target="_blank"
              download="Dicki Prasetya CV"
            >
              <div className="border-b-2 border-border overflow-hidden">
                <IoIosDownload className="animate-rain-arrow text-muted-foreground" />
              </div>
              <span>Unduh Resume</span>
            </a>
          </Button>
        </SectionSubHeading>
        <VerticalTimeline lineColor="var(--muted)">
          {CAREER.map((row) => {
            const Icon = row.icon;
            return (
              <VerticalTimelineElement
                key={row.title}
                visible
                contentStyle={{
                  background: "var(--muted)",
                  boxShadow: "none",
                  border: `1px solid ${
                    row.highlight ? "#05df72" : "rgba(0,0,0,0.05)"
                  }`,
                  textAlign: "left",
                  padding: "1.3rem 2rem",
                }}
                contentArrowStyle={{
                  borderRight: "var(--muted)",
                }}
                iconStyle={{
                  background: `${row.highlight ? "#05df72" : "var(--muted)"}`,
                  fontSize: "1.5rem",
                  marginRight: "20px",
                }}
                date={`${row.startYear} - ${row.endYear}`}
                dateClassName="md:mx-3 text-muted-foreground"
                icon={<Icon />}
              >
                <h3 className="font-semibold capitalize">{row.title}</h3>

                <p className="text-sm text-muted-foreground !mt-0">
                  {row.location}
                </p>

                <p className="mt-1 text-sm text-muted-foreground text-justify">
                  {row.desc}
                </p>
              </VerticalTimelineElement>
            );
          })}
        </VerticalTimeline>
      </div>
    </section>
  );
};

export default CareerList;
