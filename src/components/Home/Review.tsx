import { forwardRef } from "react";
import { CgProfile } from "react-icons/cg";



const Review = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="p-5 xl:p-14 flex flex-col gap-3 xl:gap-10 items-center justify-center font-urbanist">
      <div ref={ref} className="text-xl font-gentium  xl:text-4xl">Customer Review</div>
      <div className="bg-primary rounded-xl text-center p-10 xl:p-36 text-white text-sm font-light flex flex-col items-center justify-center gap-10 xl:gap-16">
        <div className="font-light text-[10px] xl:text-xl">
          “One thing I love about this lipstick is its moisturizing formula. My
          lips felt soft and hydrated, even after hours of wear. The packaging
          is sleek and elegant, adding a touch of luxury to my makeup routine.”
        </div>
        <div className="flex flex-col md:flex-row md:gap-5 items-center justify-center">
          <div className="bg-[#D9D9D9] text-primary rounded-full p-2 xl:text-3xl flex flex-col items-center justify-center">
            <CgProfile />
          </div>
          <div className="text-[10px] xl:text-2xl">Rosaline James</div>
        </div>
      </div>
    </div>
  );
});

export default Review;
