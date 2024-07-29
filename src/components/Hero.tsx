import CtaButton from "./CtaButton";
import hg1 from "../assets/hg1.png";
import SectionDivider from "./SectionDivider";
import { forwardRef } from "react";

const Hero = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="p-5 xl:p-20">
      <div
        ref={ref}
        className="pt-14 flex flex-col md:flex-row p-5 justify-center md:justify-evenly md:items-start items-center gap-7 text-center md:text-left"
      >
        <div className="max-w-[20rem] md:max-w-none flex flex-col items-center md:items-start gap-4 md:w-full">
          <h1 className="font-gentium text-[24px] xl:text-[80px] ">
            Making You a <br /> More Confident <br />{" "}
            <span className="text-primary font-[700] animate-pulse">YOU.</span>
          </h1>
          <p className="text-[10px] xl:text-2xl leading-[14px] max-w-[280px] xl:max-w-[80%] font-urbanist">
            Our luxurious lipgloss range offers vibrant, long-lasting colors
            that glide on effortlessly, providing rich pigmentation and a satin
            finish. Elevate your beauty routine with a pop of color that speaks
            to your unique style. Because your lips deserve the best.
          </p>
          <CtaButton title="Explore" />
        </div>
        <div className="w-full ">
          <img src={hg1} className="w-full" />
        </div>
      </div>
      <SectionDivider />
    </div>
  );
});

export default Hero;
