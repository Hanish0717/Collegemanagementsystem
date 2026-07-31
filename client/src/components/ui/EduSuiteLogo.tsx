import React from "react";
import logoImg from "./edusuite-logo.png";

export function EduSuiteLogoGraphic({ className = "size-9" }: { className?: string }) {
  // Since the image has the text "EduSuite Pro" at the bottom, when only the graphic is requested,
  // we crop out the bottom portion by scaling and positioning the image.
  return (
    <div className={`${className} overflow-hidden aspect-square relative shrink-0`}>
      <img
        src={logoImg}
        alt="EduSuite Pro"
        className="absolute top-0 left-0 w-full h-[156%] object-cover object-top"
      />
    </div>
  );
}

export function EduSuiteLogo({
  className = "h-10 w-auto",
  showText = true,
  lightText = false,
}: {
  className?: string;
  showText?: boolean;
  lightText?: boolean;
}) {
  // If showText is false, we only show the graphic
  if (!showText) {
    return <EduSuiteLogoGraphic className={className} />;
  }

  // If showText is true, we display the full image which has the text built-in.
  return (
    <div className="flex items-center gap-2 select-none">
      <img
        src={logoImg}
        alt="EduSuite Pro"
        className={`${className} object-contain`}
      />
    </div>
  );
}
