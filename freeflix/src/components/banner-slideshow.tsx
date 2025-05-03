"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type BannerImage = {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

const defaultBanners: BannerImage[] = [
  {
    id: "banner-1",
    src: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
    alt: "Movie banner 1",
    title: "New Releases",
    description: "Watch the latest movies and TV shows"
  },
  {
    id: "banner-2",
    src: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1470&auto=format&fit=crop",
    alt: "Movie banner 2",
    title: "Trending Now",
    description: "See what everyone is watching"
  },
  {
    id: "banner-3",
    src: "https://images.unsplash.com/photo-1518930259200-3e5b29f42096?q=80&w=1974&auto=format&fit=crop",
    alt: "Movie banner 3",
    title: "Coming Soon",
    description: "Stay updated with upcoming releases"
  }
];

interface BannerSlideshowProps {
  banners?: BannerImage[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export function BannerSlideshow({
  banners = defaultBanners,
  autoSlide = true,
  autoSlideInterval = 5000
}: BannerSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide) return;

    const slideInterval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrent((curr) => (curr === banners.length - 1 ? 0 : curr + 1));
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 300);
    }, autoSlideInterval);

    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, banners.length]);

  const handleSlideChange = (index: number) => {
    if (current === index) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 300);
  };

  const goToNext = () => {
    handleSlideChange(current === banners.length - 1 ? 0 : current + 1);
  };

  const goToPrev = () => {
    handleSlideChange(current === 0 ? banners.length - 1 : current - 1);
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="w-full">
        <div className="relative overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`relative w-full h-[500px] transition-opacity duration-700 ${
                current === index
                  ? "opacity-100 z-10"
                  : "opacity-0 absolute inset-0 z-0"
              } ${isAnimating ? "scale-[1.02] blur-sm" : "scale-100 blur-0"}`}
              style={{ transition: "all 0.5s ease" }}
            >
              <img
                src={banner.src}
                alt={banner.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                {banner.title && (
                  <h2
                    className={`text-white text-3xl font-bold mb-2 transition-all duration-700 ${
                      current === index && !isAnimating
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: "0.3s" }}
                  >
                    {banner.title}
                  </h2>
                )}
                {banner.description && (
                  <p
                    className={`text-white/90 text-xl mb-6 transition-all duration-700 ${
                      current === index && !isAnimating
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    }`}
                    style={{ transitionDelay: "0.4s" }}
                  >
                    {banner.description}
                  </p>
                )}

                <Button
                  variant="default"
                  size="lg"
                  className={`mt-4 bg-red-600 hover:bg-red-700 text-white rounded-full w-40 transition-all duration-700 ${
                    current === index && !isAnimating
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: "0.5s" }}
                >
                  <Play className="mr-2 h-4 w-4" /> Watch Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom dot navigation buttons */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-center gap-3 mb-6 z-10">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => handleSlideChange(index)}
              className="transition-all duration-300 group relative"
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className={`block w-3 h-3 rounded-full ${
                  current === index
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
              <span
                className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none px-2 py-1 bg-black/60 rounded-md ${
                  current === index ? "!opacity-100" : ""
                }`}
              >
                {banner.title ?? `Slide ${index + 1}`}
              </span>
            </button>
          ))}
        </div>

        {/* Side navigation buttons */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white border-none flex items-center justify-center transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white border-none flex items-center justify-center transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
