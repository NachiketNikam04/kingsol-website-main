// import React from 'react';

// const topPhrases = [
//   'Power of Solar Innovation',
//   '✶',
//   'Renewable Energy',
//   '✶',
//   'Future with the Sun',
//   '✶',
//   'Clean Energy Revolution',
//   '✶',
// ];

// const bottomPhrases = [
//   'Solar Solutions',
//   '✶',
//   'Bright Tomorrow',
//   '✶',
//   'Sun Energy',
//   '✶',
//   'Renewable Revolution',
//   '✶',
// ];

// export const AngledBanner: React.FC = () => {
//   return (
//     <section className="relative z-10 w-full min-h-[400px] md:min-h-[500px] overflow-hidden bg-transparent flex items-center justify-center border-y border-slate-200/50">
//       {/* Top Strip (White - Shifted Up to top-[40%]) */}
//       <div className="absolute w-[110%] top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[3deg] bg-white text-slate-900 py-6 sm:py-8 shadow-xl z-10 flex">
//         <div className="flex w-max animate-marquee gap-12 whitespace-nowrap pr-12">
//           {[...topPhrases, ...topPhrases].map((phrase, index) => (
//             <span
//               key={`top-${index}`}
//               className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-12 text-[#9beb46] whitespace-nowrap"
//             >
//               {phrase}
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Bottom Strip (Black - Shifted Down to top-[60%]) */}
//       <div className="absolute w-[110%] top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[3deg] bg-slate-950 text-brand-orange py-6 sm:py-8 shadow-2xl z-20 flex">
//         <div className="flex w-max animate-marquee-reverse gap-12 whitespace-nowrap pr-12">
//           {[...bottomPhrases, ...bottomPhrases].map((phrase, index) => (
//             <span
//               key={`bottom-${index}`}
//               className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-12 text-brand-orange whitespace-nowrap"
//             >
//               {phrase}
//             </span>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AngledBanner;
