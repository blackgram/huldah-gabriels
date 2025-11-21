import { forwardRef, useState } from "react";
import CtaButton from "../CtaButton";
import ContactModal from "../ContactModal";
import hg1 from "../../assets/hg1.png";
import logoHG from "../../assets/logoHG.png";

const About = forwardRef<HTMLDivElement>((_, ref) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div ref={ref} className="p-5 xl:p-14 w-full font-urbanist">
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <div className="bg-black rounded-xl text-white flex flex-col gap-3 text-center md:text-left items-center justify-center p-5 xl:p-20 xl:gap-20">
        <div className="font-gentium text-xl xl:text-4xl">About Us</div>
        <div className="md:flex md:justify-between md:items-start xl:px-24">
          <div className="flex flex-col items-center justify-center md:justify-between md:items-start gap-2 md:gap-8 xl:w-full">
            <div className="flex flex-col items-center justify-center md:items-start gap-2 ">
              <div className="md:hidden">
                <img src={logoHG} alt="Huldah Gabriels Logo" className="h-10 w-10 object-contain" />
              </div>
              <div className="text-[12px]  md:text-sm xl:text-3xl">Huldah Gabriels</div>
            </div>
            <div className="text-[10px] font-light leading-[24px] md:max-w-[800px] xl:max-w-[80%] xl:text-xl">
              At Huldah Gabriels, we believe that beauty is about confidence and self-expression. 
              Our mission is to make you a more confident YOU through our luxurious collection of 
              premium lipgloss. Each product is crafted with the finest ingredients, offering vibrant, 
              long-lasting colors that glide on effortlessly with rich pigmentation and a satin finish. 
              Whether you're looking for a bold statement shade or a subtle everyday glow, our formulas 
              are enriched with nourishing ingredients to keep your lips soft, hydrated, and irresistibly 
              beautiful. We're passionate about helping you discover the perfect shade that defines your 
              unique style, because your lips deserve nothing but the best.
            </div>
            <CtaButton title="Contact Us" onClick={() => setIsContactModalOpen(true)} />
          </div>
          <div className="hidden md:flex xl:w-[50%] items-center justify-center">
            <img src={hg1} alt="Huldah Gabriels" className="w-full h-auto object-contain rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default About;
