import { CgProfile } from "react-icons/cg";

const Review = () => {
  return (
    <div className="p-5 flex flex-col gap-3 items-center justify-center font-urbanist">
      <div className="text-xl font-gentium">Customer Review</div>
      <div className="bg-primary rounded-xl text-center p-10 text-white text-sm font-light flex flex-col items-center justify-center gap-10">
        <div className="font-light text-[8px]">
          “One thing I love about this lipstick is its moisturizing formula. My
          lips felt soft and hydrated, even after hours of wear. The packaging
          is sleek and elegant, adding a touch of luxury to my makeup routine.”
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="bg-[#D9D9D9] text-primary rounded-full p-2 flex flex-col items-center justify-center">
            <CgProfile />
          </div>
          <div className="text-[10px]">Rosaline James</div>
        </div>
      </div>
    </div>
  );
};

export default Review;
