"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Preloader from "../components/Preloader";
import NavBar from "../components/NavBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- DEV MODE: COMMENTED OUT TO FORCE ANIMATION EVERY TIME ---
    // const hasLoaded = sessionStorage.getItem("hasLoaded");
    // if (hasLoaded) {
    //   setIsLoading(false);
    // }
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
    // sessionStorage.setItem("hasLoaded", "true"); // Also commented out
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Preloader key="loader" onComplete={handleLoadComplete} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }} // Simple fade in
            animate={{ opacity: 1 }} 
            transition={{ duration: 1, delay: 0.2 }} // Small delay to let preloader finish exiting
          >
            <NavBar />
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}