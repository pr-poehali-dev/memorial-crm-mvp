import {
  LandingNav,
  LandingHero,
  LandingTrustedBy,
  LandingFeatures,
  LandingHowItWorks,
  LandingTestimonials,
  LandingPricing,
  LandingFAQ,
  LandingCTA,
  LandingFooter,
} from "./landing/LandingSections";

type Props = { onStart: () => void };

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f8]" style={{ fontFamily: "'Golos Text', 'Inter', sans-serif" }}>
      <LandingNav onStart={onStart} />
      <LandingHero onStart={onStart} />
      <LandingTrustedBy />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingPricing onStart={onStart} />
      <LandingFAQ />
      <LandingCTA onStart={onStart} />
      <LandingFooter />
    </div>
  );
}
