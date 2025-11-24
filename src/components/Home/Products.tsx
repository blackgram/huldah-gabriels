import { forwardRef } from 'react';
import bb1 from '../../assets/bb1.png'
import bb2 from '../../assets/bb2.png'
import hg2 from '../../assets/hg2.png'
import CtaButton from '../CtaButton';
import SectionDivider from '../SectionDivider';

const Products = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="px-5 lg:px-16 xl:px-24 font-urbanist text-center flex flex-col gap-3 lg:gap-14 xl:gap-20 justify-center items-center">
      <div className="font-gentium text-2xl lg:text-3xl xl:text-4xl ">Our Products</div>
      <div className="flex flex-col md:flex-row-reverse gap-5 justify-center md:justify-evenly items-center h-full xl:px-24">
        <div className="flex flex-col gap-3 items-center md:items-start justify-center md:justify-start text-center md:text-left md:w-full md:h-full xl:gap-8">
          <div className="font-bold text-[16px] lg:text-xl xl:text-3xl ">
            Unleash Your True Color with Our Lipgloss Collection
          </div>
          <div className="text-[12px] lg:text-base xl:text-xl leading-[16px] max-w-[95%] xl:max-w-[90%] font-extralight">
            Discover the perfect shade that defines you. Our luxurious lipgloss
            range offers vibrant, long-lasting colors that glide on
            effortlessly, providing rich pigmentation and a satin finish.
            Whether you're aiming for a bold statement or a subtle touch, our
            formulas are enriched with nourishing ingredients to keep your lips
            soft and hydrated all day. Elevate your beauty routine with a pop of
            color that speaks to your style. Because your lips deserve the best.
          </div>
          <CtaButton title='View Products' />
        </div>
        <div className="relative w-full flex items-center justify-center">
            <img 
              src={hg2} 
              alt="Huldah Gabriels Product" 
              className="z-20 w-[90%]"
              loading="lazy"
              decoding="async"
            />
            <img 
              src={bb1} 
              alt="Product Background 1" 
              className="absolute right-0 w-[90%]"
              loading="lazy"
              decoding="async"
            />
            <img 
              src={bb2} 
              alt="Product Background 2" 
              className="absolute left-0 w-[90%]"
              loading="lazy"
              decoding="async"
            />
        </div>
      </div>

      <div>{/* //Section to be added for products */}</div>
      <SectionDivider />
    </div>
  );
});

export default Products;
