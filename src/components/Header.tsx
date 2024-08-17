import logo from '../assets/logoHG.png'
import cart from '../assets/cart.svg'
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import {useNavigate} from 'react-router-dom'

interface HeaderProps {
  onScrollToHome?: () => void;
  onScrollToProducts?: () => void;
  onScrollToReview?: () => void;
  onScrollToAbout?: () => void;
}

const Header: React.FC<HeaderProps> = ({onScrollToProducts, onScrollToAbout, onScrollToReview, onScrollToHome}) => {

  const navigate = useNavigate()
  const activeMenu = useSelector((state: RootState) => state.data.activeMenu.active)

  return (
    <div className='fixed w-full top-0 left-0 px-4 xl:px-14 flex items-center justify-between text-white font-urbanist bg-white z-50 transition-all ease-in-out duration-500'>
        <div className=' cursor-pointer ' onClick={() => navigate('/')} >
            <img src={logo} className=' p-0 w-12 xl:w-16' />
        </div>
        <div className='flex justify-evenly xl:gap-5 bg-primary rounded-b-2xl text-[8px] xl:text-[24px] px-4 border-b-primary border-b border-t border-t-primary'>
            <div className={`p-2 xl:p-3 cursor-pointer ${activeMenu === 'home' && 'font-bold text-[10px] xl:text-3xl'}`} onClick={onScrollToHome}>Home</div>
            <div className={`p-2 xl:p-3 cursor-pointer ${activeMenu === 'products' && 'font-bold text-[10px] xl:text-3xl '}`} onClick={onScrollToProducts}>Products</div>
            <div className={`p-2 xl:p-3 cursor-pointer ${activeMenu === 'review' && 'font-bold text-[10px] xl:text-3xl '}`} onClick={onScrollToReview}>Review</div>
            <div className={`p-2 xl:p-3 cursor-pointer ${activeMenu === 'about' && 'font-bold text-[10px] xl:text-3xl '}`} onClick={onScrollToAbout}>About Us</div>
        </div>
        <div className='border-b border-r border-l border-primary rounded-b-lg cursor-pointer lg:flex lg:text-black lg:items-center lg:justify-center lg:px-5'>
            <img src={cart}  className='p-2 w-10 xl:w-14'/>
            <div className='hidden lg:flex'>Checkout</div>
        </div>
    </div>
  )
}

export default Header