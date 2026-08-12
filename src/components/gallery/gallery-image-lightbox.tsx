"use client";

import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type LightboxImage = {
  src: string;
  alt: string;
};

type GalleryImageLightboxProps = {
  src: string;
  alt: string;

  images?: LightboxImage[];

  initialIndex?: number;

  buttonClassName?: string;

  imageClassName?: string;

  showHint?: boolean;
};

export default function GalleryImageLightbox({
  src,
  alt,
  images,
  initialIndex = 0,
  buttonClassName = "",
  imageClassName = "",
  showHint = true,
}: GalleryImageLightboxProps) {
  /*
   * =====================================
   * GALLERY
   * =====================================
   */

  const gallery =
    images &&
    images.length > 0
      ? images
      : [
          {
            src,
            alt,
          },
        ];

  /*
   * =====================================
   * STATE
   * =====================================
   */

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(
    initialIndex,
  );

  /*
   * =====================================
   * SAFE CURRENT IMAGE
   * =====================================
   */

  const currentImage =
    gallery[
      currentIndex
    ] || gallery[0];

  const hasMultiple =
    gallery.length > 1;

  /*
   * =====================================
   * OPEN
   * =====================================
   */

  function openLightbox() {
    const safeIndex =
      initialIndex >= 0 &&
      initialIndex <
        gallery.length
        ? initialIndex
        : 0;

    setCurrentIndex(
      safeIndex,
    );

    setOpen(true);
  }

  /*
   * =====================================
   * CLOSE
   * =====================================
   */

  function closeLightbox() {
    setOpen(false);
  }

  /*
   * =====================================
   * PREVIOUS
   * =====================================
   */

  function showPrevious() {
    setCurrentIndex(
      (current) => {
        if (
          current === 0
        ) {
          return (
            gallery.length -
            1
          );
        }

        return (
          current - 1
        );
      },
    );
  }

  /*
   * =====================================
   * NEXT
   * =====================================
   */

  function showNext() {
    setCurrentIndex(
      (current) => {
        if (
          current ===
          gallery.length - 1
        ) {
          return 0;
        }

        return (
          current + 1
        );
      },
    );
  }

  /*
   * =====================================
   * KEYBOARD + BODY SCROLL
   * =====================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    const previousPaddingRight =
      document.body.style
        .paddingRight;

    /*
     * Prevent page shifting
     * when scrollbar disappears.
     */

    const scrollbarWidth =
      window.innerWidth -
      document
        .documentElement
        .clientWidth;

    document.body.style
      .overflow = "hidden";

    if (
      scrollbarWidth > 0
    ) {
      document.body.style
        .paddingRight =
        `${scrollbarWidth}px`;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);

        return;
      }

      if (
        event.key ===
          "ArrowLeft" &&
        gallery.length > 1
      ) {
        setCurrentIndex(
          (current) =>
            current === 0
              ? gallery.length -
                1
              : current - 1,
        );

        return;
      }

      if (
        event.key ===
          "ArrowRight" &&
        gallery.length > 1
      ) {
        setCurrentIndex(
          (current) =>
            current ===
            gallery.length - 1
              ? 0
              : current + 1,
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style
        .overflow =
        previousOverflow;

      document.body.style
        .paddingRight =
        previousPaddingRight;
    };
  }, [
    open,
    gallery.length,
  ]);

  /*
   * =====================================
   * PRELOAD NEXT + PREVIOUS
   * =====================================
   */

  useEffect(() => {
    if (
      !open ||
      gallery.length <= 1
    ) {
      return;
    }

    const nextIndex =
      currentIndex ===
      gallery.length - 1
        ? 0
        : currentIndex + 1;

    const previousIndex =
      currentIndex === 0
        ? gallery.length - 1
        : currentIndex - 1;

    const nextImage =
      new window.Image();

    nextImage.src =
      gallery[
        nextIndex
      ].src;

    const previousImage =
      new window.Image();

    previousImage.src =
      gallery[
        previousIndex
      ].src;
  }, [
    open,
    currentIndex,
    gallery,
  ]);

  return (
    <>
      {/* ================================= */}
      {/* THUMBNAIL */}
      {/* ================================= */}

      <button
        type="button"
        onClick={
          openLightbox
        }
        aria-label={`View full image: ${alt}`}
        className={`group/lightbox relative block cursor-zoom-in overflow-hidden text-left ${buttonClassName}`}
      >
        <img
          src={src}
          alt={alt}
          className={
            imageClassName
          }
        />

        {showHint && (
          <div className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover/lightbox:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </div>
        )}
      </button>

      {/* ================================= */}
      {/* LIGHTBOX */}
      {/* ================================= */}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            currentImage.alt
          }
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLightbox();
            }
          }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 sm:p-8"
        >
          {/* ================================= */}
          {/* COUNTER */}
          {/* ================================= */}

          {hasMultiple && (
            <div className="absolute left-4 top-4 z-30 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-md sm:left-6 sm:top-6">
              {currentIndex +
                1}
              {" / "}
              {
                gallery.length
              }
            </div>
          )}

          {/* ================================= */}
          {/* CLOSE */}
          {/* ================================= */}

          <button
            type="button"
            onClick={
              closeLightbox
            }
            aria-label="Close image"
            className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ================================= */}
          {/* PREVIOUS */}
          {/* ================================= */}

          {hasMultiple && (
            <button
              type="button"
              onClick={
                showPrevious
              }
              aria-label="Previous image"
              className="absolute left-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:left-6 sm:h-14 sm:w-14"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* ================================= */}
          {/* FULL IMAGE */}
          {/* ================================= */}

          <div className="pointer-events-none flex h-full w-full items-center justify-center px-8 py-16 sm:px-20 sm:py-16">
            <img
              key={
                currentImage.src
              }
              src={
                currentImage.src
              }
              alt={
                currentImage.alt
              }
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* ================================= */}
          {/* NEXT */}
          {/* ================================= */}

          {hasMultiple && (
            <button
              type="button"
              onClick={
                showNext
              }
              aria-label="Next image"
              className="absolute right-3 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:right-6 sm:h-14 sm:w-14"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* ================================= */}
          {/* CAPTION */}
          {/* ================================= */}

          {currentImage.alt && (
            <div className="pointer-events-none absolute bottom-4 left-1/2 max-w-[80%] -translate-x-1/2 rounded-full bg-black/60 px-5 py-2 text-center text-xs text-white/90 backdrop-blur-md sm:bottom-6 sm:text-sm">
              {
                currentImage.alt
              }
            </div>
          )}
        </div>
      )}
    </>
  );
}