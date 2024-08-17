import { forwardRef } from "react";
import CtaButton from "../CtaButton";
import rect from "../../assets/rectblur.png";

const About = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="p-5 xl:p-14 w-full font-urbanist">
      <div className="bg-black rounded-xl text-white flex flex-col gap-3 text-center md:text-left items-center justify-center p-5 xl:p-20 xl:gap-20">
        <div className="font-gentium text-xl xl:text-6xl">About Us</div>
        <div className="md:flex md:justify-between md:items-start">
          <div className="flex flex-col items-center justify-center md:justify-between md:items-start gap-2 md:gap-8 xl:w-full">
            <div className="flex flex-col items-center justify-center md:items-start gap-2 ">
              <div className="bg-primary border border-white h-10 w-10 rounded-full md:hidden"></div>
              <div className="text-[12px]  md:text-sm xl:text-4xl">Huldah Gabriels</div>
            </div>
            <div className="text-[10px] font-light leading-[24px] md:max-w-[800px] xl:max-w-[80%] xl:text-2xl">
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Nam at libero et nulla pretium
              lobortis. Sed nec sapien id arcu egestas interdum. tempor est nec
              orci iaculis, sed fermentum erat pharetra. Nullam euismod lacus
              vitae urna auctor, non convallis nunc vestibulum. et eros eget
              felis eleifend ullamcorper. Nunc faucibus, est at pellentesque
              ultricies, felis tortor luctus arcu, eget fermentum odio nisl sed
              libero.
            </div>
            <CtaButton title="Contact Us" />
          </div>
          <div className=" hidden md:flex xl:w-[50%]">
            <img src={rect} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default About;
