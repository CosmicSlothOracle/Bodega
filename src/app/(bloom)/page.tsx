import { CinematicHero } from "@/components/hero/CinematicHero";
import { AtmosphereSection } from "@/components/home/AtmosphereSection";
import { SignatureFoodSection } from "@/components/home/SignatureFoodSection";
import { WineCocktailsSection } from "@/components/home/WineCocktailsSection";
import { EventNightsSection } from "@/components/home/EventNightsSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ReservationCtaSection } from "@/components/home/ReservationCtaSection";

export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <AtmosphereSection />
      <SignatureFoodSection />
      <WineCocktailsSection />
      <EventNightsSection />
      <GallerySection />
      <ReservationCtaSection />
    </>
  );
}
