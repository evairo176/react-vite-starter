import React from "react";

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="mb-10 px-4 text-center text-gray-500">
      <small className="mb-2 block text-xs">
        Copy {new Date().getFullYear()} Dicki Prasetya, All rights reserved.
      </small>
      <p className="text-xs">
        <span className="font-semibold">About this website:</span> built with
        React & Next.js (App Router & Server Actions), Typescript, Tailwind CSS,
        Framer Motion, React Email & Nodemailer & Vercel Hosting.
      </p>
    </footer>
  );
};

export default Footer;
