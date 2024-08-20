import { TiArrowBack } from "react-icons/ti";
// import clearLustre from "../../assets/clear-lustre.jpg";
import { useNavigate } from "react-router-dom";
import star from "../../assets/star.svg";
import starOutline from "../../assets/star-outline.svg";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import products from "./productsDetails";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../Redux/store";
import { ProductI, setCartItems } from "../../Redux/features/cartSlice";
import toast, { Toaster } from "react-hot-toast";

const Shop = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const [productCount, setProductCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductI>(products[0]);

  const selectProduct = (id: number) => {
    const findProd = products!.find((prod) => prod.id === id);

    if (findProd) {
      setSelectedProduct(findProd);
    }
  };

  const handleAddToCart = () => {
    dispatch(
      setCartItems({ product: selectedProduct, quantity: productCount })
    );

    toast.success("Added to Cart")

    setProductCount(0);
  };

  return (
    <div className="px-6 md:px-20 pt-[5rem] lg:pt-[6rem] font-urbanist flex flex-col items-center justify-center gap-5">
      <div><Toaster toastOptions={
        {
          success: {
            duration: 3000,
            iconTheme: {primary: "#946A2E", secondary: 'white'},
            style: {
              color: "#946A2E",
              fontSize: '8px'
            }
          }
        }
      }/></div>
      
      {/* Back button */}
      <div className="flex w-full" onClick={() => navigate("/")}>
        <div className=" flex items-center gap-1 bg-[#F9F6F6] text-xs sm:text-base px-8 py-2 rounded-full">
          <TiArrowBack />
          <span>Back</span>
        </div>
      </div>

      <div className="flex flex-col px-5 gap-5  lg:flex-row lg:justify-evenly lg:items-center lg:border-[0.2px] lg:border-black/25 lg:rounded-3xl">
        <div className=" flex flex-col lg:w-1/2 lg:p-5  gap-2  border-[0.2px] border-black/25 rounded-3xl lg:border-none">
          <div className="rounded-3xl">
            <img
              src={selectedProduct.display}
              alt={selectedProduct.name}
              className="rounded-3xl"
            />
          </div>
          <div className="p-5 flex items-center justify-evenly gap-4 border rounded-3xl">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => selectProduct(product.id)}
                className={`w-fit rounded-md text-center ${
                  selectedProduct?.id === product.id
                    ? "border-2 border-primary"
                    : "shadow-sm md:shadow-md shadow-primary/50"
                }`}
              >
                <img
                  src={product.display}
                  alt=""
                  className={`h-[5rem] rounded-lg hover:object-fill `}
                />
                <span className="text-[8px] sm:text-[10px] xl:text-sm text-primary leading-0">
                  {product.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className=" hidden lg:flex h-[30rem] w-[1px] bg-black/50" />

        <div className="flex flex-col lg:w-1/2 lg:p-5 gap-5 pb-6">
          <div className="flex flex-col gap-5">
            <div className="font-urbanist text-2xl sm:text-3xl font-bold">
              {selectedProduct.name}
            </div>
            <div className=" text-sm  sm:text-base">{selectedProduct.desc}</div>
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
            <div className="text-3xl">{`$${selectedProduct.price}.00`}</div>
          </div>

          <div className="w-full flex flex-col gap-6">
            <div className=" bg-[#EEE9E9B2] w-full h-14 rounded-xl flex justify-evenly px-2 items-center text-lg font-bold">
              <button
                className="p-3 cursor-pointer"
                onClick={() =>
                  productCount > 0 && setProductCount(productCount - 1)
                }
              >
                -
              </button>
              <div className="w-[60%] h-full bg-white rounded-2xl flex items-center justify-center">
                {productCount}
              </div>
              <button
                className="p-3 cursor-pointer"
                onClick={() => setProductCount(productCount + 1)}
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAddToCart()}
              className="w-full h-14 rounded-xl flex bg-primary text-white items-center justify-center"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-black/50 lg:hidden" />

      <div className="flex flex-col">
        <div className="w-full text-center underline underline-offset-8">
          Reviews
        </div>
      </div>
    </div>
  );
};

export default Shop;
