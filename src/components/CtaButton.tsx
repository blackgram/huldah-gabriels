

interface CtaButtonProps {
  title: string;
  onClick?: () => void;
}


const CtaButton: React.FC<CtaButtonProps> = ({title, onClick}) => {
  return (
    <button type="button" className=" bg-primary text-white w-fit py-2 px-10 rounded-lg text-sm">{title}</button>
  )
}

export default CtaButton