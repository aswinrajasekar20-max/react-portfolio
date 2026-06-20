import { useEffect, useState } from "react";
import { SmoothScroll } from "./lib/SmoothScroll";
import { CosmicBackground } from "./components/CosmicBackground";
import { CustomCursor } from "./components/CustomCursor";
import { Preloader } from "./components/Preloader";
import { Navbar } from "./components/Navbar";
import { ScrollProgress } from "./components/ScrollProgress";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Skills } from "./components/Skills";
import { Marquee } from "./components/Marquee";
import { Projects } from "./components/Projects";
import { Stats } from "./components/Stats";
import { Journey } from "./components/Journey";
import { Contact } from "./components/Contact";

export default function App() {
  const [loaded, setLoaded] = useState(false);

  // Lock scroll while the preloader plays.
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
  }, [loaded]);

  return (
    <SmoothScroll>
      <CosmicBackground />
      <CustomCursor />
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      <div className="app-shell">
        <ScrollProgress />
        <Navbar />
        <main>
          <Hero started={loaded} />
          <About />
          <Skills />
          <Marquee />
          <Projects />
          <Stats />
          <Journey />
          <Contact />
        </main>
      </div>
    </SmoothScroll>
  );
}
