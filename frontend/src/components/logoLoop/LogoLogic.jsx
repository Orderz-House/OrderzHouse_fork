import LogoLoop from "./Logo";
import img1 from "../../assets/Battach.jpg";
import img2 from "../../assets/Bildazo.jpg";
import img3 from "../../assets/studyzhouse.png";
const logos = [
  {
    id: "logo1",
    src: img1,
    alt: "Logo 1",
  },
  {
    id: "logo2",
    src: img2,
    alt: "Logo 2",
  },
    {
      id: "logo3",
      src: img3,
      alt: "Logo 3",
    },
];
export default function LogoLogic() {
  return <LogoLoop logos={logos} speed={100} gap={40} logoHeight={200} />;
}
