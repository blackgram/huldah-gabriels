import logo from '../assets/logo.svg'
import cart from '../assets/cart.svg'

const Header = () => {
  return (
    <div className='fixed w-full top-0 left-0 px-4 flex items-center justify-between text-white font-urbanist bg-white'>
        <div>
            <img src={logo} className=' p-0 w-10' />
        </div>
        <div className='flex justify-evenly bg-primary rounded-b-lg text-[12px] border-b-primary border-b '>
            <div className='p-2 font-bold'>Home</div>
            <div className='p-2'>Products</div>
            <div className='p-2'>Review</div>
            <div className='p-2'>About Us</div>
        </div>
        <div className='border-b border-r border-l border-primary rounded-b-lg '>
            <img src={cart}  className='p-2 w-10'/>
        </div>
    </div>
  )
}

export default Header