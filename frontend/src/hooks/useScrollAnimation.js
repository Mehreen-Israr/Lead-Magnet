import { useEffect, useRef, useState } from 'react';

// Custom hook for scroll animations
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
    ...options
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (defaultOptions.triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!defaultOptions.triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: defaultOptions.threshold,
        rootMargin: defaultOptions.rootMargin
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [defaultOptions.threshold, defaultOptions.rootMargin, defaultOptions.triggerOnce]);

  return [elementRef, isVisible];
};

// Hook for staggered animations
export const useStaggeredAnimation = (itemCount, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setTimeout(() => {
              setVisibleItems(prev => new Set([...prev, index]));
            }, index * delay);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const items = container.querySelectorAll('[data-index]');
    items.forEach(item => observer.observe(item));

    return () => {
      items.forEach(item => observer.unobserve(item));
    };
  }, [itemCount, delay]);

  return [containerRef, visibleItems];
};

// Hook for scroll progress
export const useScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  return scrollProgress;
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      // Check if element is in viewport
      if (scrolled + windowHeight > elementTop && scrolled < elementTop + elementHeight) {
        const yPos = -(scrolled - elementTop) * speed;
        element.style.transform = `translateY(${yPos}px)`;
      }
    };

    window.addEventListener('scroll', updateParallax);
    return () => window.removeEventListener('scroll', updateParallax);
  }, [speed]);

  return elementRef;
};

// Animation utility functions
export const animationUtils = {
  // Add animation class to element
  addAnimation: (element, animationClass, delay = 0) => {
    setTimeout(() => {
      element.classList.add(animationClass);
    }, delay);
  },

  // Remove animation class from element
  removeAnimation: (element, animationClass) => {
    element.classList.remove(animationClass);
  },

  // Stagger animations for multiple elements
  staggerAnimations: (elements, animationClass, delay = 100) => {
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add(animationClass);
      }, index * delay);
    });
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Safe animation wrapper that respects user preferences
  safeAnimate: (callback) => {
    if (!animationUtils.prefersReducedMotion()) {
      callback();
    }
  }
};

// Animation component wrapper
export const AnimatedSection = ({ 
  children, 
  animation = 'fade-in', 
  delay = 0, 
  className = '',
  ...props 
}) => {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div 
      ref={ref} 
      className={`${animation} ${isVisible ? 'animate' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  );
};

export default useScrollAnimation;