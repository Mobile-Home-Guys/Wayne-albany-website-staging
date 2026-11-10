import { pageMetadata } from "./lib/seo";
import { site } from "./lib/site";
import { CallToAction, Footer } from "./components/Closing";
import MeetUs from "./components/MeetUs";
import OnTheLot from "./components/OnTheLot";
import PhenomenalFive from "./components/PhenomenalFive";
import Features from "./components/Features";
import Specials from "./components/Specials";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Series from "./components/Series";

export const metadata = pageMetadata({
  title: `Mobile Homes for Sale in Albany, GA | ${site.fullName}`,
  description:
    "See the homes on our lot at 3006 Sylvester Rd, the Phenomenal Five Plantation Series and 50 Live Oak floor plans with photos, 3D tours and floor plans. Best prices. Guaranteed.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <OnTheLot />
        <PhenomenalFive />
        <MeetUs />
        <Specials />
        <Series />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
