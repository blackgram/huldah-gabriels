import { MutableRefObject } from "react";
import About from "./About";
import Hero from "./Hero";
import Products from "./Products";
import Review from "./Review";

interface HomeProps {
    homeRef: MutableRefObject<null>,
    productsRef: MutableRefObject<null>,
    reviewRef: MutableRefObject<null>,
    aboutRef: MutableRefObject<null>,
}

const Home: React.FC<HomeProps> = ({homeRef, productsRef, reviewRef, aboutRef}) => {

  
  return (
    <div>
      <Hero ref={homeRef} />
      <Products ref={productsRef} />
      <Review ref={reviewRef} />
      <About ref={aboutRef} />
    </div>
  );
};

export default Home;
