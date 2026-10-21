import OnboardingCarousel from 'components/Onboarding/OnboardingCarousel';
import { useAppStore } from 'stores/useAppStore';

export default function OnboardingRoute() {
  const setUserType = useAppStore((state) => state.setUserType);
  const setOnboardingComplete = useAppStore((state) => state.setOnboardingComplete);

  return (
    <OnboardingCarousel
      onComplete={(type) => {
        setUserType(type);
        setOnboardingComplete(true);
      }}
    />
  );
}
