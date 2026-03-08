import { ReactNode } from "react";

interface AnimatedBackgroundProps {
  children: ReactNode;
}

export default function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      <div className="animated-bg fixed inset-0 -z-10" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
