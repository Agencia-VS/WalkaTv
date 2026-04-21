
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/sections/HeroSection";
import BentoGridNew from "../components/ui/BentoGridNew";
import LatestContentSection from "../components/sections/LatestContentSection";
import LatestArticlesSection from "../components/sections/LatestArticlesSection";
import FooterSection from "../components/sections/FooterSection";


export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full h-full">
        <HeroSection />
        <LatestContentSection />
        <LatestArticlesSection />
        {/* <BentoGridNew /> */}
        <FooterSection />
      </main>
    </>
  );
}
