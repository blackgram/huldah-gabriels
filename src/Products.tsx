import bb1 from './assets/bb1.png'
import bb2 from './assets/bb2.png'
import hg2 from './assets/hg2.png'
import SectionDivider from './components/SectionDivider';

const Products = () => {
  return (
    <div className="px-5 font-urbanist text-center flex flex-col gap-3 justify-center items-center">
      <div className="font-gentium text-2xl pb-5">Products</div>
      <div className="flex flex-col gap-5 justify-center items-center">
        <div className="flex flex-col gap-3 items-center justify-center text-center">
          <div className="font-bold text-sm">
            Unleash Your True Color with Our Lipstick Collection
          </div>
          <div className="text-sm max-w-[95%] ">
            Discover the perfect shade that defines you. Our luxurious lipgloss
            range offers vibrant, long-lasting colors that glide on
            effortlessly, providing rich pigmentation and a satin finish.
            Whether you're aiming for a bold statement or a subtle touch, our
            formulas are enriched with nourishing ingredients to keep your lips
            soft and hydrated all day. Elevate your beauty routine with a pop of
            color that speaks to your style. Because your lips deserve the best.
          </div>
        </div>
        <div className="relative w-full flex items-center justify-center">
            <img src={hg2} className="z-20"/>
            <img src={bb1} className="absolute right-0" />
            <img src={bb2} className="absolute left-0 " />
        </div>
      </div>

      <div>{/* //Section to be added for products */}</div>
      <SectionDivider />
    </div>
  );
};

export default Products;
