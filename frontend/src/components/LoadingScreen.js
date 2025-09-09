import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Using the favicon from public folder
const favicon = '/favicon.ico';

const LoadingScreen = () => {
  // Show loader on every full page load (not on in-app route changes)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) return;

    const finish = () => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    };

    if (document.readyState === 'complete') {
      return finish();
    } else {
      window.addEventListener('load', finish);
      return () => window.removeEventListener('load', finish);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: 'easeInOut' }
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {/* Large falling and scaling favicon */}
            <motion.div
              initial={{ 
                y: '-100vh',
                scale: 0.15,
                opacity: 0,
                rotate: 0
              }}
              animate={{ 
                y: 0,
                scale: [0.15, 1.4, 1.1],
                opacity: 1,
                rotate: 0,
                transition: {
                  y: { 
                    duration: 0.9, 
                    ease: [0.175, 0.885, 0.32, 1.1],
                  },
                  scale: { 
                    duration: 1.2, 
                    times: [0, 0.7, 1],
                    ease: [0.34, 1.56, 0.64, 1]
                  },
                  opacity: { 
                    duration: 0.8,
                    ease: 'easeOut'
                  }
                }
              }}
              className="mb-8"
            >
              <motion.img
                src={favicon}
                alt="Loading..."
                className="w-48 h-32 md:w-64 md:h-40 lg:w-80 lg:h-48 object-contain"
                style={{
                  aspectRatio: '16/9',
                  minWidth: '18rem',
                  maxWidth: '100%',
                  height: 'auto',
                  backgroundColor: 'transparent',
                  background: 'transparent'
                }}
              />
            </motion.div>

            {/* Title with staggered animation */}
            <motion.h1 
              className="text-3xl md:text-4xl font-extrabold text-amber-800 mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: 0.6,
                  duration: 0.6,
                  ease: 'easeOut'
                }
              }}
            >
              Best Mandhi in Town
            </motion.h1>

            {/* Subtle loading indicator */}
            <motion.div 
              className="w-48 h-1.5 bg-amber-200 rounded-full overflow-hidden"
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: 1,
                width: '12rem',
                transition: { 
                  delay: 0.8,
                  duration: 0.6,
                  ease: 'easeOut'
                }
              }}
            >
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                initial={{ width: 0 }}
                animate={{
                  width: '100%',
                  transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut'
                  }
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
