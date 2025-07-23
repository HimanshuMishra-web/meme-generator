import React, { useRef } from 'react';
import { generateImageSource } from '../utils';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';

interface Testimonial {
  _id: string;
  name: string;
  profileImage?: string;
  rating: number;
  content: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const AVATAR_SIZE = 96; // Increased from 80
const SIDE_AVATAR_SIZE = 72; // Increased from 60

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const swiperRef = useRef<any>(null);
  if (testimonials.length === 0) {
    return <div className="text-gray-400">No testimonials yet.</div>;
  }

  // Helper to get circular avatar with rating badge
  const AvatarWithRating = ({ src, alt, rating, size }: { src: string; alt: string; rating: number; size: number }) => (
    <div className="relative flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover border-4 border-white shadow-lg"
        style={{ width: size, height: size }}
      />
      <span className="absolute -top-4 -right-4 bg-yellow-400 text-black rounded-full px-3 py-1 flex items-center shadow font-bold text-sm border-2 border-yellow-300">
        {rating}
        <span className="ml-0.5 text-xs text-yellow-700">★</span>
      </span>
    </div>
  );

  return (
    <div className="relative w-full flex flex-col items-center pt-28 pb-8 overflow-x-hidden"> {/* More top padding, hide overflow */}
      {/* Navigation arrows - fixed position, always visible */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30 flex gap-16">
        <button
          className="testimonial-prev bg-yellow-400 hover:bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow border-2 border-yellow-300 focus:outline-none transition-colors overflow-hidden"
          aria-label="Previous testimonial"
          style={{ aspectRatio: '1/1' }}
        >
          <MdArrowBack size={40} color="white" style={{ fontWeight: 900 }} />
        </button>
        <button
          className="testimonial-next bg-yellow-400 hover:bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow border-2 border-yellow-300 focus:outline-none transition-colors overflow-hidden"
          aria-label="Next testimonial"
          style={{ aspectRatio: '1/1' }}
        >
          <MdArrowForward size={40} color="white" style={{ fontWeight: 900 }} />
        </button>
      </div>
      <Swiper
        modules={[Navigation]}
        slidesPerView={1}
        loop={true}
        navigation={{
          nextEl: '.testimonial-next',
          prevEl: '.testimonial-prev',
        }}
        onSwiper={swiper => (swiperRef.current = swiper)}
        className="w-full overflow-visible"
      >
        {testimonials.map((t, idx) => {
          // Get previous and next testimonial for side avatars
          const prevIdx = (idx - 1 + testimonials.length) % testimonials.length;
          const nextIdx = (idx + 1) % testimonials.length;
          const prev = testimonials[prevIdx];
          const next = testimonials[nextIdx];
          return (
            <SwiperSlide key={t._id}>
              {({ isActive }) => (
                <div className="relative flex flex-col items-center justify-center min-h-[420px] w-full">
                  {/* Side avatars - only one on each side, not cut off */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:block">
                    <AvatarWithRating
                      src={prev.profileImage ? generateImageSource(prev.profileImage) : '/default-avatar.png'}
                      alt={prev.name}
                      rating={prev.rating}
                      size={SIDE_AVATAR_SIZE}
                    />
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden md:block">
                    <AvatarWithRating
                      src={next.profileImage ? generateImageSource(next.profileImage) : '/default-avatar.png'}
                      alt={next.name}
                      rating={next.rating}
                      size={SIDE_AVATAR_SIZE}
                    />
                  </div>
                  {/* Center card */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: isActive ? 1 : 0.5, y: isActive ? 0 : 40, scale: isActive ? 1 : 0.95 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    className="bg-white rounded-xl shadow-xl px-12 pt-20 pb-12 flex flex-col items-center w-full max-w-4xl relative z-20 min-h-[300px]"
                  >
                    {/* Overlapping avatar */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30">
                      <AvatarWithRating
                        src={t.profileImage ? generateImageSource(t.profileImage) : '/default-avatar.png'}
                        alt={t.name}
                        rating={t.rating}
                        size={AVATAR_SIZE}
                      />
                    </div>
                    <div className="mt-1 text-center">
                      <div className="font-semibold text-xl text-gray-800 mb-2">{t.name}</div>
                      <div className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">{t.content}</div>
                    </div>
                  </motion.div>
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default Testimonials; 