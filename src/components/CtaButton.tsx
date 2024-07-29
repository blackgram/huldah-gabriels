

interface CtaButtonProps {
  title: string;
  onClick?: () => void;
}


const CtaButton: React.FC<CtaButtonProps> = ({title, onClick}) => {
  return (
    <button type="button" onClick={() => onClick} className=" bg-primary text-white w-fit py-2 px-10 rounded-lg text-sm xl:text-2xl xl:w-[80%] xl:py-4 xl:rounded-3xl">{title}</button>
  )
}

export default CtaButton