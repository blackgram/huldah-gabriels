import { forwardRef } from "react";
import CtaButton from "./CtaButton";

const About = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="p-5 w-full font-urbanist">
      <div className="bg-black rounded-xl text-white flex flex-col gap-3 text-center items-center justify-center p-5">
        <div className="font-gentium text-xl">About Us</div>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="bg-primary border border-white h-10 w-10 rounded-full"></div>
          <div className="text-[12px]">Huldah Gabriels</div>
        </div>
        <div className="text-[8px] font-light leading-[24px]">
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Nam at libero et nulla pretium lobortis. Sed
          nec sapien id arcu egestas interdum. tempor est nec orci iaculis, sed
          fermentum erat pharetra. Nullam euismod lacus vitae urna auctor, non
          convallis nunc vestibulum. et eros eget felis eleifend ullamcorper.
          Nunc faucibus, est at pellentesque ultricies, felis tortor luctus
          arcu, eget fermentum odio nisl sed libero.
        </div>
        <CtaButton title="Contact Us" />
      </div>
    </div>
  );
});

export default About;
