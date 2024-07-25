import logo from '../assets/logoHG.png'
import cart from '../assets/cart.svg'
import React from 'react';

interface HeaderProps {
  onScrollToHome: () => void;
  onScrollToProducts: () => void;
  onScrollToReview: () => void;
  onScrollToAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({onScrollToProducts, onScrollToAbout, onScrollToReview, onScrollToHome}) => {
  return (
    <div className='fixed w-full top-0 left-0 px-4 flex items-center justify-between text-white font-urbanist bg-white z-50'>
        <div>
            <img src={logo} className=' p-0 w-12' />
        </div>
        <div className='flex justify-evenly bg-primary rounded-b-2xl text-[8px] px-4 border-b-primary border-b border-t border-t-primary'>
            <div className='p-2 cursor-pointer font-bold' onClick={onScrollToHome}>Home</div>
            <div className='p-2 cursor-pointer' onClick={onScrollToProducts}>Products</div>
            <div className='p-2 cursor-pointer' onClick={onScrollToReview}>Review</div>
            <div className='p-2 cursor-pointer' onClick={onScrollToAbout}>About Us</div>
        </div>
        <div className='border-b border-r border-l border-primary rounded-b-lg '>
            <img src={cart}  className='p-2 w-10'/>
        </div>
    </div>
  )
}

export default Header