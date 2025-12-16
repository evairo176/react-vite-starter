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
              href="dicki.prasetya.pdf"
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
          {[1, 2, 3, 4].map((row) => (
            <VerticalTimelineElement
              key={row}
              visible
              contentStyle={{
                background: "var(--muted)",
                boxShadow: "none",
                border: "1px solid rgba(0,0,0,0.05)",
                textAlign: "left",
                padding: "1.3rem 2rem",
              }}
              contentArrowStyle={{
                borderRight: "var(--muted)",
              }}
              iconStyle={{
                background: "var(--muted)",
                fontSize: "1.5rem",
                marginRight: "20px",
              }}
              date="Sep 2019 - Okt 2022"
              dateClassName="md:mx-3 text-muted-foreground"
              icon={<Home />}
            >
              <h3 className="font-semibold capitalize">
                Studi Diploma 3 Politeknik Negeri Indramayu
              </h3>

              <p className="text-sm text-muted-foreground !mt-0">Jawa Barat</p>

              <p className="mt-1 text-sm text-muted-foreground text-justify">
                Saya lulus setelah 3 tahun belajar. Saya segera mendapatkan
                pekerjaan sebagai pengembang full-stack.
              </p>
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      </div>
    </section>
  );
};

export default CareerList;
