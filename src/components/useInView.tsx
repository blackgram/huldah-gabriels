import { useEffect, useState } from 'react';

const useInView = (refs: React.RefObject<HTMLElement>[], threshold: number = 0.1) => {
  const [inView, setInView] = useState<Map<React.RefObject<HTMLElement>, boolean>>(
    new Map(refs.map((ref) => [ref, false]))
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const newInView = new Map(inView);
        entries.forEach((entry) => {
          // Find the ref that matches the observed element
          const ref = refs.find((r) => r.current === entry.target);
          if (ref) {
            newInView.set(ref, entry.isIntersecting);
          }
        });
        setInView(newInView);
      },
      { threshold }
    );

    refs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      refs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [refs, threshold, inView]);

  return inView;
};

export default useInView;
