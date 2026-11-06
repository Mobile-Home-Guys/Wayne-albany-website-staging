import { pageMetadata } from "./lib/seo";
import { site } from "./lib/site";
import { CallToAction, Footer } from "./components/Closing";
import FeaturedHomes from "./components/FeaturedHomes";
import Features from "./components/Features";
import Specials from "./components/Specials";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Series from "./components/Series";

export const metadata = pageMetadata({
  title: `Mobile Homes for Sale in Albany, GA | ${site.fullName}`,
  description:
    "Shop singlewide, doublewide and triplewide Live Oak Homes in Albany, GA. Best prices guaranteed, with unbeatable selection, reduced prices, premium upgrades and quality construction.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Series />
        <FeaturedHomes />
        <Specials />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
