'use client'

import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import StarryBackground from '@/components/StarryBackground'
import React, { useEffect, useState, useRef } from 'react'

// --- Carousel Slide Data ---
const CAROUSEL_SLIDES = [
  {
    img: "/carousel1.png",
    alt: "Testimonial Image 1",
    colorClass: "text-blue-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"We booked 30+ calls our first week!"`}</span>
    ),
    text: (
      <span className="block text-center">
        The AI agents handled our WhatsApp leads and scheduled appointments automatically. We're closing more deals, faster.
        <span className="font-semibold block mt-2 text-center">– Elena S., Real Estate Agency</span>
      </span>
    ),
  },
  {
    img: "/carousel2.png",
    alt: "Testimonial Image 2",
    colorClass: "text-green-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"Never miss a lead again."`}</span>
    ),
    text: (
      <span className="block text-center">
        Our response rate jumped to 63%. The AI follows up 24/7 on WhatsApp, Email, and SMS.
        <span className="font-semibold block mt-2 text-center">– Marcus L., SaaS Founder</span>
      </span>
    ),
  },
  {
    img: "/carousel3.png",
    alt: "Testimonial Image 3",
    colorClass: "text-purple-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"Game-changer for our sales funnel."`}</span>
    ),
    text: (
      <span className="block text-center">
        The analytics are easy to understand. We optimize each stage in real time—the dashboard is fantastic!
        <span className="font-semibold block mt-2 text-center">– Brian W., Marketing Lead</span>
      </span>
    ),
  },
  {
    img: "/carousel4.png",
    alt: "Testimonial Image 4",
    colorClass: "text-pink-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"Set up in minutes and already seeing results."`}</span>
    ),
    text: (
      <span className="block text-center">
        Setup was a breeze and the support team helped us fine-tune the AI scripts. We've converted leads we would've missed before.
        <span className="font-semibold block mt-2 text-center">– Sarah M., Insurance Brokerage</span>
      </span>
    ),
  },
  {
    img: "/carousel5.png",
    alt: "Testimonial Image 5",
    colorClass: "text-yellow-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"Our sales team loves their new AI assistant."`}</span>
    ),
    text: (
      <span className="block text-center">
        The AI qualifies leads before our reps get involved, saving us hours. Productivity is way up and prospects are impressed!
        <span className="font-semibold block mt-2 text-center">– David K., B2B Software Sales</span>
      </span>
    ),
  },
  {
    img: "/carousel6.png",
    alt: "Testimonial Image 6",
    colorClass: "text-cyan-700",
    imgClass: "w-40 h-40 md:w-56 md:h-56 mx-auto object-contain", // removed shadow class if present
    heading: (
      <span className="block text-center">{`"AI handles thousands of messages per week."`}</span>
    ),
    text: (
      <span className="block text-center">
        I thought chatbots would sound robotic, but this is next-level. The AI holds real conversations and even handles objections.
        <span className="font-semibold block mt-2 text-center">– Priya T., E-commerce Manager</span>
      </span>
    ),
  },
];

function AnimatedRotatingText({
  texts,
  interval = 2000,
  animationClass = '',
  render,
}: {
  texts: string[],
  interval?: number,
  animationClass?: string,
  render?: (opts: { current: string, prev?: string, transitioning: boolean }) => React.ReactNode
}) {
  const [idx, setIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setPrevIdx(idx);
      setTimeout(() => {
        setIdx(i => (i + 1) % texts.length);
        setTransitioning(false);
      }, 500);
    }, interval);
    return () => clearInterval(timer);
  }, [texts, interval, idx]);

  const current = texts[idx];
  const prev = prevIdx !== null ? texts[prevIdx] : undefined;

  if (render) {
    return <>{render({ current, prev, transitioning })}</>;
  }

  return (
    <span className={animationClass}>
      {current}
    </span>
  );
}

// ---- Carousel With Animation ----
function AnimatedCarousel() {
  const slides = CAROUSEL_SLIDES;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [transitioning, setTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Slide Animation Duration
  const ANIMATION_TIME = 500;

  // Auto-advance
  useEffect(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      goTo(current + 1, 'right');
    }, 4000);

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [current]);

  // Go to slide (with direction)
  function goTo(nextIdx: number, dir: 'left' | 'right') {
    if (transitioning) return;
    setDirection(dir);
    setTransitioning(true);

    setTimeout(() => {
      setCurrent((nextIdx + slides.length) % slides.length);
      setTransitioning(false);
    }, ANIMATION_TIME);
  }

  const handlePrev = () => goTo(current - 1, 'left');
  const handleNext = () => goTo(current + 1, 'right');
  const handleDot = (idx: number) => {
    if (idx === current || transitioning) return;
    goTo(idx, idx < current ? 'left' : 'right');
  }

  // For sliding animation, keep track of leaving and entering slides
  const prev = (current - 1 + slides.length) % slides.length;
  const next = (current + 1) % slides.length;

  // Animate only between current and next
  return (
    <div id="homepage-carousel" className="relative select-none mb-16 overflow-hidden rounded-2xl bg-white" style={{ minHeight: 340 }}>
      {/* Slides: absolute layer, use translateX for animation */}
      <div className="w-full h-full relative" style={{ height: 655 }}>
        {slides.map((slide, idx) => {
          // Which state for this slide
          let state: 'active' | 'inactiveLeft' | 'inactiveRight' | 'hidden' = 'hidden';
          if (!transitioning && idx === current) state = 'active';
          else if (transitioning) {
            if (direction === 'right') {
              if (idx === current) state = 'inactiveLeft';
              else if (idx === next) state = 'active';
            } else {
              if (idx === current) state = 'inactiveRight';
              else if (idx === prev) state = 'active';
            }
          }

          // Animate using translateX
          const base =
            "absolute top-0 left-0 w-full h-full flex flex-col items-center px-0 md:px-12 py-12 md:py-16 transition-transform duration-500 ease-[cubic-bezier(0.6,0.01,0.44,1)]";
          let style: any = { zIndex: 1 }; // default

          if (state === 'active') {
            style.transform = 'translateX(0)';
            style.opacity = 1;
            style.zIndex = 2;
          } else if (state === 'inactiveLeft') {
            style.transform = 'translateX(-100%)';
            style.opacity = 0.8;
            style.zIndex = 1;
          } else if (state === 'inactiveRight') {
            style.transform = 'translateX(100%)';
            style.opacity = 0.8;
            style.zIndex = 1;
          } else {
            // Hidden slides are shunted out of view
            style.transform = `translateX(${direction === 'right' ? '100%' : '-100%'})`;
            style.opacity = 0;
            style.zIndex = 0;
            style.pointerEvents = "none";
          }

          return (
            <div
              key={slide.img}
              className={`${base} ${state === 'active' ? '' : ''}`}
              style={style}
              aria-hidden={state !== "active"}
            >
              <img
                src={slide.img}
                alt={slide.alt}
                className="mx-auto mb-8 rounded-2xl w-full max-w-[600px] object-cover transform transition-transform duration-500 hover:scale-105"
                style={{ height: 330 }}
                draggable={false}
              />
              <h4 className={`text-2xl font-bold ${slide.colorClass} mb-2 animate-slideUp`}>
                {slide.heading}
              </h4>
              <p className="text-gray-600 mb-4 max-w-2xl mx-auto animate-slideUp delay-100">
                {slide.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <button
        type="button"
        aria-label="Previous"
        onClick={handlePrev}
        disabled={transitioning}
        className="carousel-prev absolute left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition transform hover:-translate-x-1 animate-bounceX z-10"
      >
        <span className="sr-only">Previous</span>
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={handleNext}
        disabled={transitioning}
        className="carousel-next absolute right-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition transform hover:translate-x-1 animate-bounceX z-10"
      >
        <span className="sr-only">Next</span>
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots */}
      <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot w-4 h-4 rounded-full ${current === i ? 'bg-blue-600' : 'bg-gray-300'} hover:bg-blue-600 transition`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => handleDot(i)}
            disabled={transitioning}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ----- PART 1: NAVBAR + HERO (with background2.png and more height) ----- */}
      <div
        className="relative w-full min-h-screen flex flex-col"
        style={{
          backgroundImage: "url('/background2.png')",
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll',
          backgroundPositionY: '6rem' // Move bg down (~navbar height)
        }}>
        <div className="relative z-10 min-h-[150vh] flex flex-col">
          {/* Navbar */}
          <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
              {/* Logo Area */}
              <div className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="AI Sales Agents Logo"
                  className="w-30 h-20 object-contain"
                />
                <img
                  src="/logo3.png"
                  alt="AI Sales Agents Logo"
                  className="w-30 h-20 object-contain"
                />
              </div>

              {/* Center Controls: Search + Language + High Contrast */}
              <div className="flex items-center space-x-4">
                {/* Search box */}
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border border-gray-300 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    aria-label="Search"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1 rounded"
                    tabIndex={-1}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </button>
                </div>

                {/* Language Toggle */}
                <div className="relative">
                  <select
                    className="border border-gray-300 rounded-full px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    aria-label="Select Language"
                    defaultValue="en"
                    onChange={e => {
                      // Replace with actual i18n switch logic
                      alert('Language switched to ' + e.target.value);
                    }}
                  >
                    <option value="en">EN</option>
                    <option value="es">ES</option>
                    <option value="fr">FR</option>
                    <option value="de">DE</option>
                  </select>
                </div>

                {/* High Contrast Toggle */}
                <button
                  aria-label="Toggle High Contrast"
                  className="border border-gray-300 rounded-full px-3 py-1 bg-white text-gray-700 text-xs font-medium hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  onClick={() => {
                    // Simple high contrast toggle for demonstration
                    const root = document.documentElement;
                    if (root.classList.contains('hc')) {
                      root.classList.remove('hc');
                    } else {
                      root.classList.add('hc');
                    }
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="inline-block mr-1 -mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12h20M12 2a10 10 0 000 20z" fill="currentColor"/>
                  </svg>
                  HC
                </button>
              </div>

              {/* Auth Links */}
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 px-5 py-2 hover:text-blue-600 font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Get a Demo
                </Link>
              </div>
            </div>
            {/* Simple high contrast styles - must be expanded in global CSS for full support */}
            <style jsx global>{`
              .hc {
                filter: invert(1) grayscale(1) !important;
                background: #111 !important;
                color: #fff !important;
              }
              .hc img { filter: invert(1) grayscale(0) !important; }
              .hc input, .hc select, .hc button { background: #222 !important; color: #fff !important; border-color: #fff !important; }
              .hc svg { color: #fff !important; }
            `}</style>
          </nav>
          {/* Hero Section */}
          <main className="flex flex-col items-center justify-center max-w-7xl mx-auto px-6 py-36 flex-grow text-center">
            {/* Animation (left) */}

            {/* Text (full width, centered) */}
            <div className="w-full">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight text-center">
                Automate Your Sales with{' '}
                <span className="relative inline-block h-[1.25em] bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-pink-700 font-bold">
                  <AnimatedRotatingText
                    texts={[
                      "AI Agents",
                      "Smart Sales",
                      "24/7 Closers",
                      "Lead Experts",
                      "Follow-ups"
                    ]}
                    interval={2000}
                    render={({ current, prev, transitioning }) => {
                      if (!current) return null;
                      const prevFirst = prev ? prev[0] : "";
                      const currFirst = current[0];
                      const currRest = current.slice(1);
                      return (
                        <span className="relative min-w-[3em] inline-block h-[1.25em]">
                          {/* Previous word first letter moves up+fade out */}
                          {transitioning && prev && (
                            <span
                              className="absolute left-0 top-0"
                              style={{
                                zIndex: 20,
                                transition: 'all 0.5s cubic-bezier(0.6,0.01,0.44,1)',
                                transform: 'translateY(-100%)',
                                opacity: 0,
                              }}
                            >
                              <span>{prevFirst}</span>
                            </span>
                          )}
                          {/* Current word first letter appears from below */}
                          <span
                            className="inline-block"
                            style={{
                              transition: 'all 0.5s cubic-bezier(0.6,0.01,0.44,1)',
                              transform: transitioning ? 'translateY(100%)' : 'translateY(0)',
                              opacity: transitioning ? 0 : 1,
                            }}
                          >
                            {currFirst}
                          </span>
                          {/* Animate rest of word from below */}
                          <span
                            className="inline-block"
                            style={{
                              transition: 'all 0.5s cubic-bezier(0.6,0.01,0.44,1)',
                              transform: transitioning ? 'translateY(100%)' : 'translateY(0)',
                              opacity: transitioning ? 0 : 1,
                            }}
                          >
                            {currRest}
                          </span>
                        </span>
                      );
                    }}
                  />
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto text-center">
                Deploy intelligent AI sales agents that engage leads, qualify prospects,
                and book meetings automatically across WhatsApp, Email, and SMS —
                <span className="font-medium text-gray-800"> 24/7.</span>
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg hover:bg-blue-700 transition"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition"
                >
                  Demo Login
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* ----- END PART 1 ----- */}

      {/* ----- PART 2: FEATURES ----- */}
      <section className="max-w-7xl mx-auto px-6 pb-24 pt-16 h-250">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Lottie Animation */}
          <div className="flex-1 flex justify-center items-center mb-10 md:mb-0">
            <div className="w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] md:w-[560px] md:h-[560px] rounded-3xl  overflow-hidden from-blue-50 via-indigo-50 to-white">
              <DotLottieReact
                src="https://lottie.host/25cb95ed-b8ec-4f93-8338-7dffc4fb5ff4/x7F4Il0bA2.lottie"
                loop
                autoplay
              />
            </div>
          </div>
          {/* Features */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <img src="/icons/ai.png" alt="AI Icon" className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">AI-Powered Conversations</h3>
              <p className="text-gray-700 text-base">Intelligent, human-like chats that convert leads into clients.</p>
            </div>
            <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition flex flex-col items-center">
              <div className="w-20 h-20 bg-green-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <span className="text-green-700 text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Always On</h3>
              <p className="text-gray-700 text-base">Your AI agents work nonstop — even when you sleep.</p>
            </div>
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition flex flex-col items-center col-span-1 sm:col-span-2">
              <div className="w-20 h-20 bg-purple-200 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <img src="/icons/chart.png" alt="Chart Icon" className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Live Analytics</h3>
              <p className="text-gray-700 text-base">See performance in real time and optimize your sales funnel.</p>
            </div>
          </div>
        </div>
      </section>
      {/* ----- END PART 2 ----- */}

      {/* ----- PART 3: CAROUSEL (with animated transitions) ----- */}
      <section
        className="w-full mb-20 py-16"
        style={{
          background: "linear-gradient(135deg, #FFE5B4 0%, #F3D5A7FF 60%, #EB74D1FF 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8 text-black drop-shadow">
            What Our Clients Are Saying
          </h2>
          <p className="text-center mb-6 drop-shadow text-black">
            Connected data and tools make it easier to know, do, and connect everything across your business.
          </p>
          <AnimatedCarousel />
        </div>
      </section>
    
      <section className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row gap-10">
        {/* Left Side: Lottie + Text */}
        <div className="md:w-2/5 w-full flex flex-col items-start sticky top-28 self-start">
          <div className="w-full flex flex-col gap-6">
            <div className="w-28 mb-2">
              {/* Optional: Powered by or similar small label */}
              <span className="inline-flex items-center bg-orange-50 text-orange-500 rounded-full px-6 py-1 text-xs font-semibold whitespace-nowrap">
                <svg width="20" height="20" fill="none" className="mr-2" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#FF7A59"/></svg>Powered by AI
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              Growing a business is hard.<br />
              <span className="text-orange-500">AI Sales Agents</span> make it easier.
            </h2>
            <p className="text-gray-700 mb-4">
              Our connected tools and AI sales agents drive growth.<br />
              Multi-channel outreach, smart analytics, and always-on nurturing make growing your revenue easier than ever.
            </p>
            
          </div>
          {/* Lottie Animation (Sticky) */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-64 h-64 md:w-80 md:h-80">
              <DotLottieReact
                src="https://lottie.host/3fa7c7ce-2d46-458f-a619-1491308f9e52/ZBaDtASLz5.lottie"
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            
          </div>
          <div className="w-full flex justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition mb-6 text-center">
              Get a demo
            </button>
          </div>
        </div>
        {/* Right Side: Product/Hub Cards */}
        <div className="md:w-3/5 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/marketing.png" alt="Marketing icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-orange-500">Lead Nurturing</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>Automated responses for new leads 24/7</li>
              <li>Timely follow-ups across channels</li>
              <li>Book more qualified calls</li>
            </ul>
            <a href="#" className="text-orange-500 hover:underline text-xs font-semibold mt-2 ml-auto">Learn more &rarr;</a>
          </div>

          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/analytics.png" alt="Analytics icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-blue-600">Smart Analytics</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>Track engagement and conversion rates</li>
              <li>Identify bottlenecks in your sales funnel</li>
              <li>Custom, actionable reports</li>
            </ul>
            <a href="#" className="text-blue-600 hover:underline text-xs font-semibold mt-2 ml-auto">Learn more &rarr;</a>
          </div>

          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/automation.png" alt="Automation icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-violet-600">Workflow Automation</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>Automate repetitive sales tasks</li>
              <li>Integrate with your CRM & tools</li>
              <li>Free up time for your best closers</li>
            </ul>
            <a href="#" className="text-violet-600 hover:underline text-xs font-semibold mt-2 ml-auto">Learn more &rarr;</a>
          </div>

          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/conversation.png" alt="Conversation icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-fuchsia-600">Omnichannel Outreach</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>Connect with leads via SMS, WhatsApp, & Email</li>
              <li>Consistent messaging across all channels</li>
              <li>Maximize your reach automatically</li>
            </ul>
            <a href="#" className="text-fuchsia-600 hover:underline text-xs font-semibold mt-2 ml-auto">Learn more &rarr;</a>
          </div>
          {/* Card 2 */}
          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/sales.png" alt="Sales icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-green-500">Sales Automation</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>AI agents qualify, schedule, and follow up</li>
              <li>Never let a hot lead go cold</li>
              <li>CRM integration for streamlined pipeline</li>
            </ul>
            <a href="#" className="text-green-600 hover:underline text-xs font-semibold mt-2 ml-auto">Learn more &rarr;</a>
          </div>
          {/* Card 3 */}
          <div className="border rounded-xl p-6 shadow hover:shadow-lg bg-white transition flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-1">
              <img src="/icons/support.png" alt="Support icon" className="w-10 h-10"/>
              <span className="text-lg font-semibold text-orange-500">AI Support Agents</span>
            </div>
            <ul className="text-gray-700 text-sm pl-5 list-disc">
              <li>24/7 instant responses for your customers</li>
              <li>Automated FAQs and troubleshooting</li>
              <li>Reduce response times and workload</li>
            </ul>
            <a href="#" className="text-orange-600 hover:underline text-xs font-semibold mt-2 ml-auto">See AI Support in Action &rarr;</a>
          </div>
{/* Card 4 */}
          
          </div>
          </section>
                 
      {/* ----- PART 4: FOOTER ----- */}
      <footer className="bg-[#23272a] text-gray-200 pt-14 pb-7 px-5 mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 pb-8 text-xs">
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">Popular Features</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">AI-Powered Conversations</a></li>
                <li><a href="#" className="hover:underline">24/7 Lead Nurturing</a></li>
                <li><a href="#" className="hover:underline">Smart Follow Ups</a></li>
                <li><a href="#" className="hover:underline">Multi-Channel Outreach</a></li>
                <li><a href="#" className="hover:underline">Live Analytics</a></li>
                <li><a href="#" className="hover:underline">CRM Integration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">Use Cases</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Real Estate</a></li>
                <li><a href="#" className="hover:underline">SaaS & Tech</a></li>
                <li><a href="#" className="hover:underline">E-commerce</a></li>
                <li><a href="#" className="hover:underline">Insurance</a></li>
                <li><a href="#" className="hover:underline">Agencies</a></li>
                <li><a href="#" className="hover:underline">Demo Booking</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">First Time?</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Get a Free Demo</a></li>
                <li><a href="#" className="hover:underline">AI Sales Guide</a></li>
                <li><a href="#" className="hover:underline">Product Tour</a></li>
                <li><a href="#" className="hover:underline">Pricing</a></li>
                <li><a href="#" className="hover:underline">How it Works</a></li>
                <li><a href="#" className="hover:underline">AI Agent Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">Customers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Customer Logins</a></li>
                <li><a href="#" className="hover:underline">AI Sales Agent Login</a></li>
                <li><a href="#" className="hover:underline">Affiliate Login</a></li>
                <li><a href="#" className="hover:underline">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-100 mb-3 uppercase tracking-wide">Partners</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Partner Program</a></li>
                <li><a href="#" className="hover:underline">Apply to Reseller</a></li>
                <li><a href="#" className="hover:underline">Affiliate Program</a></li>
                <li><a href="#" className="hover:underline">Integrations</a></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-center mt-7 mb-5 w-full">
            <hr className="flex-grow border-t border-gray-600 mx-4" />
            <div className="flex space-x-3 text-gray-400 text-sm">
                <a href="#" className="hover:text-white">
                  <i className="fab fa-facebook-f text-2xl"></i>
                </a>
                <a href="#" className="hover:text-white">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="#" className="hover:text-white">
                  <i className="fab fa-github text-2xl"></i>
                </a>
                <a href="#" className="hover:text-white">
                  <i className="fab fa-x-twitter text-2xl"></i>
                </a>
                <a href="#" className="hover:text-white">
                  <i className="fab fa-linkedin-in text-2xl"></i>
                </a>
                <a href="#" className="hover:text-white">
                  <i className="fas fa-globe text-2xl"></i>
                </a>
              </div>
            <hr className="flex-grow border-t border-gray-600 mx-4" />
          </div>
          <div className="flex flex-col items-center pt-4 text-xs">
            {/* Logo Centered */}
            <div className="mb-2 flex justify-center">
              <img
                src="/logo23.png"
                alt="Sales Agents Logo"
                className="h-50 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <div className="flex items-center justify-center my-6">
              <hr className="flex-grow border-t border-gray-600 mx-4" />
              
              <hr className="flex-grow border-t border-gray-600 mx-4" />
            </div>
            {/* Copyright */}
            <div className="text-gray-400 mb-3 text-center">
              © {new Date().getFullYear()} Sales Agents. All rights reserved.
            </div>
            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 text-gray-400 mb-2">
              <a href="#" className="hover:text-gray-200">Legal</a>
              <a href="#" className="hover:text-gray-200">Privacy Policy</a>
              <a href="#" className="hover:text-gray-200">Accessibility</a>
              <a href="#" className="hover:text-gray-200">Status</a>
              <a href="#" className="hover:text-gray-200">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
      {/* ----- END PART 4 ----- */}
    </div>
  )
}
