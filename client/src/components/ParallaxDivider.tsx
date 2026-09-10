import React from 'react';

export const ParallaxDivider: React.FC = () => {
  return (
    <section
      className="relative w-full h-[50vh] min-h-[400px] bg-fixed bg-center bg-cover bg-no-repeat z-0"
      style={{
        backgroundImage: "url('/solar-parallax.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
    </section>
  );
};

export default ParallaxDivider;
