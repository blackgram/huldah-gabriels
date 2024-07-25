import CtaButton from "./CtaButton";
import hg1 from '../assets/hg1.png'
import SectionDivider from "./SectionDivider";



const Hero = () => {
  return (
    <div className="pt-14 flex flex-col p-5 justify-center items-center gap-7 text-center">
      <div className="max-w-[20rem] flex flex-col items-center gap-4">
        <h1 className="font-gentium text-[24px]">
          Making You a <br /> More Confident <br />{" "}
          <span className="text-primary font-[700]">YOU.</span>
        </h1>
        <p className="text-[8px] leading-[14px] max-w-[250px] font-urbanist">
          Our luxurious lipgloss range offers vibrant, long-lasting colors that
          glide on effortlessly, providing rich pigmentation and a satin finish.
          Elevate your beauty routine with a pop of color that speaks to your
          unique style. Because your lips deserve the best.
        </p>
        <CtaButton title="Explore" />
      </div>
      <div className="w-full ">
        <img src={hg1} className="w-full" />
      </div>
      <SectionDivider />
    </div>
  );
};

export default Hero;
