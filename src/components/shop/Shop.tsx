import { TiArrowBack } from "react-icons/ti";
import clearLustre from "../../assets/clear-lustre.jpg";
import cherryPop from "../../assets/cherry-pop.jpg";
// import cocoaBrown from "../../assets/cocoa-brown.jpg";
import cocoaBrown2 from "../../assets/cocoa-brown2.jpg";
import { useNavigate } from "react-router-dom";
import star from "../../assets/star.svg";
import starOutline from "../../assets/star-outline.svg";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

const Shop = () => {
  const navigate = useNavigate();
  const [productCount, setProductCount] = useState(0);

  return (
    <div className="px-6 pt-[4rem] font-urbanist flex flex-col items-center justify-center gap-5">
      {/* Back button */}
      <div className="flex w-full" onClick={() => navigate("/")}>
        <div className=" flex items-center gap-1 bg-[#F9F6F6] px-8 py-2 rounded-full">
          <TiArrowBack />
          <span>Back</span>
        </div>
      </div>

      <div className=" flex flex-col gap-2  border-[0.2px] border-black/25 rounded-3xl">
        <div className="rounded-3xl">
          <img
            src={clearLustre}
            alt="clear lustre lipgloss"
            className="rounded-3xl"
          />
        </div>
        <div className="p-5 flex items-center justify-evenly gap-4 border rounded-3xl">
          <div className="w-fit rounded-md text-center shadow-md shadow-primary/50 ">
            <img src={clearLustre} alt="" className="h-[5rem] rounded-lg " />
            <span className="text-xs text-primary">Clear Lustre</span>
          </div>
          <div className="w-fit rounded-md text-center shadow-sm shadow-black/40 ">
            <img src={cherryPop} alt="" className="h-[5rem] rounded-lg " />
            <span className="text-xs text-primary">Cherry Pop</span>
          </div>
          <div className="w-fit rounded-md text-center shadow-sm shadow-black/40">
            <img src={cocoaBrown2} alt="" className="h-[5rem] rounded-lg " />
            <span className="text-xs text-primary">Cocoa Brown</span>
          </div>
          <div className="w-fit rounded-md text-center shadow-sm shadow-black/40">
            <img src={clearLustre} alt="" className="h-[5rem] rounded-lg " />
            <span className="text-xs text-primary">Clear Lustre</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-6">
        <div className="flex flex-col gap-5">
          <div className="font-urbanist text-3xl font-bold">Clear Lustre</div>
          <div>
            Discover the perfect shade that defines you. Our luxurious lipstick
            range offer vibrant, long-lasting colors that glide on effortlessly,
            providing rich pigmentation and a satin finish. Whether you're
            aiming for a bold statement or a subtle touch, our formulas are
            enriched with nourishing ingredients to keep your lips soft and
            hydrated all day. Elevate your beauty routine with a pop of color
            that speaks to your unique style. Because your lips deserve the
            best.
          </div>
          <div className="flex items-center gap-8 ">
            <div className="stars flex gap-1">
              <img src={star} alt="review star" />
              <img src={star} alt="review star" />
              <img src={star} alt="review star" />
              <img src={star} alt="review star" />
              <img src={starOutline} alt="review star" />
            </div>
            <div className="flex gap-2 items-center ">
              <div className="relative text-3xl text-gray-500">
                <FaUserCircle className=" absolute right-1 z-10" />
                <FaUserCircle className=" absolute right-2 z-20" />
                <FaUserCircle className=" absolute right-4 z-30" />
                <FaUserCircle className="z-50" />
              </div>
              <div className="cursor-pointer underline">5 Reviews</div>
            </div>
          </div>
          <div className="text-3xl">$20.00</div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className=" bg-[#EEE9E9B2] w-full h-14 rounded-xl flex justify-evenly px-2 items-center text-lg font-bold">
            <div
              onClick={() =>
                productCount > 0 && setProductCount(productCount - 1)
              }
            >
              -
            </div>
            <div className="w-[60%] h-full bg-white rounded-2xl flex items-center justify-center">
              {productCount}
            </div>
            <div onClick={() => setProductCount(productCount + 1)}>+</div>
          </div>

          <div className="w-full h-14 rounded-xl flex bg-primary text-white items-center justify-center">Add to Cart</div>
        </div>

      <div className="w-full h-[1px] bg-black/50" />

      <div className="flex flex-col">
        <div className="w-full text-center underline underline-offset-8">Reviews</div>
      </div>
      </div>

    </div>
  );
};

export default Shop;
