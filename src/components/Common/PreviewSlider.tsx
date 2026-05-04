"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useRef, useState } from "react";
import "swiper/css/navigation";
import "swiper/css";
import Image from "next/image";

import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";

const PreviewSliderModal = () => {
  const { closePreviewModal, isModalPreviewOpen, initialIndex } =
    usePreviewSlider();

  const data = useAppSelector((state) => state.productDetailsReducer.value);
  const previews: string[] = data?.imgs?.previews ?? [];
  const title = data?.title ?? "product image";

  const sliderRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Sync swiper to initialIndex when modal opens
  useEffect(() => {
    if (isModalPreviewOpen) {
      setActiveIndex(initialIndex);
      if (sliderRef.current?.swiper) {
        sliderRef.current.swiper.slideTo(initialIndex, 0);
      }
    }
  }, [isModalPreviewOpen, initialIndex]);

  // Esc to close, arrows to navigate
  useEffect(() => {
    if (!isModalPreviewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreviewModal();
      if (e.key === "ArrowLeft") sliderRef.current?.swiper?.slidePrev();
      if (e.key === "ArrowRight") sliderRef.current?.swiper?.slideNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalPreviewOpen, closePreviewModal]);

  const handlePrev = useCallback(() => {
    sliderRef.current?.swiper?.slidePrev();
  }, []);
  const handleNext = useCallback(() => {
    sliderRef.current?.swiper?.slideNext();
  }, []);

  return (
    <div
      className={`preview-slider w-full h-screen z-[99999] inset-0 flex flex-col justify-center items-center bg-black/80 ${
        isModalPreviewOpen ? "fixed" : "hidden"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePreviewModal();
      }}
    >
      <button
        onClick={() => closePreviewModal()}
        aria-label="close preview"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
      >
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {previews.length > 1 && (
        <>
          <button
            type="button"
            aria-label="previous"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
            onClick={handlePrev}
          >
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none" className="rotate-180">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5918 5.92548C14.9091 5.60817 15.4236 5.60817 15.7409 5.92548L22.2409 12.4255C22.5582 12.7428 22.5582 13.2572 22.2409 13.5745L15.7409 20.0745C15.4236 20.3918 14.9091 20.3918 14.5918 20.0745C14.2745 19.7572 14.2745 19.2428 14.5918 18.9255L19.7048 13.8125H4.33301C3.88428 13.8125 3.52051 13.4487 3.52051 13C3.52051 12.5513 3.88428 12.1875 4.33301 12.1875H19.7048L14.5918 7.07452C14.2745 6.75722 14.2745 6.24278 14.5918 5.92548Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="next"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white z-20"
            onClick={handleNext}
          >
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5918 5.92548C14.9091 5.60817 15.4236 5.60817 15.7409 5.92548L22.2409 12.4255C22.5582 12.7428 22.5582 13.2572 22.2409 13.5745L15.7409 20.0745C15.4236 20.3918 14.9091 20.3918 14.5918 20.0745C14.2745 19.7572 14.2745 19.2428 14.5918 18.9255L19.7048 13.8125H4.33301C3.88428 13.8125 3.52051 13.4487 3.52051 13C3.52051 12.5513 3.88428 12.1875 4.33301 12.1875H19.7048L14.5918 7.07452C14.2745 6.75722 14.2745 6.24278 14.5918 5.92548Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </>
      )}

      <div className="w-full max-w-[900px] px-4">
        <Swiper
          ref={sliderRef}
          slidesPerView={1}
          spaceBetween={20}
          initialSlide={initialIndex}
          onSlideChange={(s) => setActiveIndex(s.activeIndex)}
        >
          {previews.map((src, i) => (
            <SwiperSlide key={`${src}-${i}`}>
              <div className="flex justify-center items-center">
                <Image
                  src={src}
                  alt={title}
                  width={700}
                  height={700}
                  unoptimized
                  className="max-h-[80vh] w-auto h-auto"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {previews.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {previews.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`go to image ${i + 1}`}
              onClick={() => sliderRef.current?.swiper?.slideTo(i)}
              className={`overflow-hidden rounded-md ring-2 transition-all ${
                activeIndex === i
                  ? "ring-white scale-110"
                  : "ring-white/30 hover:ring-white/60"
              }`}
            >
              <Image
                src={src}
                alt=""
                width={56}
                height={56}
                unoptimized
                className="block w-14 h-14 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviewSliderModal;
