import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import clsx from "clsx";
import background from "/images/ilustrations/background_profile.webp";

import ModeToggle from "../ModeToggle";
import profile from "/images/ilustrations/profile.png";
import Status from "../Status";

type Props = {
  isOpen: boolean;
};

const Profile = ({ isOpen }: Props) => {
  return (
    <div className={clsx("flex lg:flex-col lg:items-center flex-row")}>
      <div className="relative w-full h-24 overflow-hidden dark:brightness-50 rounded-md hidden lg:block">
        <Status />
        <img
          alt="background-profile"
          src={background}
          width={40}
          height={40}
          className="w-full "
        />
        <div className="absolute top-1 right-1">
          {/* <ToggleLanguage language={language} /> */}
        </div>
        <div className="absolute bottom-1 right-1">
          <ModeToggle />
        </div>
      </div>
      <div
        className={`flex ${
          isOpen ? "flex-col gap-5 mt-2 justify-between" : "flex-row"
        } lg:flex-col lg:items-center`}
      >
        <Avatar
          className={`${
            isOpen ? "w-[60px] h-[60px]" : "w-[40px] h-[40px]"
          } md:w-[70px] md:h-[70px] lg:-mt-11 mr-3 lg:mr-0 shadow-md border-2 z-10 border-white dark:border-neutral-800 rounded-full`}
        >
          <img
            alt="Dicki Prasetya"
            className="lg:hover:scale-105 transition-all duration-300"
            src={profile}
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className={`flex flex-col lg:items-center`}>
          <div className="flex items-center ">
            <h2 className="flex-grow text-lg lg:text-xl font-sora font-medium mr-2">
              Dicki Prasetya
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger aria-label="verified">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth={0}
                    viewBox="0 0 24 24"
                    className="text-blue-400"
                    height={18}
                    width={18}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
                  </svg>
                </TooltipTrigger>
                <TooltipContent className="bg-neutral-500 border-none p-2 text-xs">
                  <p className="text-white">Verified</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-sm text-neutral-500">@evairo176</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
