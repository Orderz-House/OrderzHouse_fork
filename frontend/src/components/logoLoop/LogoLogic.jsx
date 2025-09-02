import LogoLoop from "./Logo";
import img1 from "../../assets/imgi_4_WhatsApp-Image-2025-06-27-at-00.21.22_577f6365.jpg";
import img2 from "../../assets/imgi_6_WhatsApp-Image-2025-06-27-at-00.21.23_141b33d3.jpg";
// import img3 from "../../assets/imgi_7.jpg";
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
  //   {
  //     id: "logo3",
  //     src: img3,
  //     alt: "Logo 3",
  //   },
];
export default function LogoLogic() {
  return <LogoLoop logos={logos} speed={100} gap={40} logoHeight={150} />;
}
