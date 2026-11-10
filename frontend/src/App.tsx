import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUp, CodeXml, ImageUp } from "lucide-react";
import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import bgSVG from "./assets/bg.svg";
import { Demo } from "./components/Demo";
import { perGenreAccuracy, pct, results } from "./lib/genres";

const REPO = "https://github.com/tahamukhtar20/Art-Genre-Classifier";

export default function App() {
  return (
    <>
      <div className="container mx-auto min-h-screen flex flex-col px-2 border-dashed border-x-2 tracking-tighter border-quaternary">
        <Header />
        <Hero />
        <div className="flex 2xl:flex-row flex-col pb-20 h-full w-full border-t-2 border-dashed border-quaternary">
          <div className="2xl:w-1/2 w-full">
            <CardWrapper className="!border-t-0">
              <Introduction />
            </CardWrapper>
          </div>
          <PaintingStack />
        </div>
        <CardWrapper>
          <Demo />
        </CardWrapper>
        <footer className="border-t-2 border-quaternary py-4 w-full border-dashed mt-4 text-center font-semibold">
          Built by{" "}
          <a href="https://github.com/tahamukhtar20" className="underline underline-offset-4 hover:text-teritiary">
            @tahamukhtar20
          </a>
        </footer>
      </div>
      <ScrollTopButton />
    </>
  );
}

const CardWrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`border-quaternary border-dashed border-t-2 w-full h-fit p-4 bg-white ${className}`}>{children}</div>
);

const Header = () => (
  <header className="w-full h-10 flex flex-row items-center justify-between">
    <nav className="flex flex-row lg:gap-x-8 md:gap-x-4 gap-x-3 items-center lg:text-xl md:text-md text-sm font-semibold text-quaternary">
      {[
        ["introduction", "Introduction"],
        ["demo", "Demo"],
        ["training", "Training"],
      ].map(([id, label]) => (
        <a key={id} href={`#${id}`} className="transition-colors hover:text-teritiary">
          {label}
        </a>
      ))}
    </nav>
    <a
      href={REPO}
      className="flex items-center gap-1.5 text-sm font-semibold text-quaternary hover:text-teritiary"
      aria-label="Source code on GitHub"
    >
      <CodeXml className="w-5 h-5" />
      <span className="sm:inline hidden">Source</span>
    </a>
  </header>
);

const Hero = () => {
  // A fresh URL on each load restarts the SVG's line-drawing animation.
  const bg = useMemo(() => `${bgSVG}?${Date.now()}`, []);
  return (
    <div
      className="border-quaternary relative bg-cover bg-center overflow-hidden border-t-2 border-dashed min-h-[calc(100vh-2.5rem)] flex flex-col justify-center items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 w-full h-full gradient-ring z-0" />
      <h1
        className="animate-fade-up justify-center bg-gradient-to-br from-black to-secondary bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-7xl md:leading-[5rem] z-10 px-4"
        style={{ animationDelay: "0.10s", animationFillMode: "forwards" }}
      >
        The Art Genre Classifier
      </h1>
      <div className="flex sm:flex-row gap-4 pt-8 z-10 flex-col">
        <a href="#demo" className="btn btn-primary animate-fade-up" style={{ animationDelay: "0.20s" }}>
          <ImageUp className="w-4 h-4" />
          Try the demo
        </a>
        <a href={REPO} className="btn btn-secondary animate-fade-up" style={{ animationDelay: "0.30s" }}>
          <CodeXml className="w-4 h-4" />
          Source code
        </a>
      </div>
    </div>
  );
};

const Introduction = () => {
  const byAccuracy = [...perGenreAccuracy].sort((a, b) => b.accuracy - a.accuracy);
  const n = results.split.train + results.split.val + results.split.test;
  return (
    <div className="px-2 2xl:max-w-2xl gap-4 flex flex-col scroll-mt-4" id="introduction">
      <h1 className="text-4xl font-bold text-start">Introduction</h1>
      <p className="text-md">
        Upload a painting and the model tells you which of five genres it belongs to: abstract, cityscape, portrait,
        landscape or animal painting.
      </p>
      <p className="text-md">
        It is ResNet152, pre-trained on ImageNet, fine-tuned on {n.toLocaleString()} paintings from WikiArt (up to 2,000 per
        genre, split 70/15/15 into training, validation and test sets). A new classification head is trained first with
        the network frozen; then the last 30 layers are unfrozen and trained at a lower learning rate, with early
        stopping on validation loss.
      </p>
      <p className="text-md">
        On the {results.split.test.toLocaleString()} test paintings it never saw during training it gets{" "}
        {pct(results.test_accuracy)} right. Portraits ({pct(byAccuracy[0].accuracy)}) are the easiest; cityscapes (
        {pct(byAccuracy[byAccuracy.length - 1].accuracy)}) are the hardest, most often taken for landscapes.
      </p>
    </div>
  );
};

const PaintingStack = () => (
  <div className="2xl:w-1/2 w-full h-96 relative flex items-center justify-center pt-16 pb-8 overflow-hidden" aria-hidden>
    {[image1, image2, image3].map((src, i) => (
      <div
        key={i}
        className="relative w-full h-full flex items-center justify-center hover:scale-105 transition-all duration-300 ease-in-out"
        style={{ rotate: `${-15 + i * 15}deg`, zIndex: i === 1 ? 10 : 0, top: i === 1 ? 0 : 30 }}
      >
        <div
          className={`absolute aspect-[3/4] border-slate-50 border-8 overflow-hidden drop-shadow-2xl bg-cover bg-center ${
            i === 1 ? "sm:w-80 w-64 shadow-2xl" : "sm:w-72 w-60"
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      </div>
    ))}
  </div>
);

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-4 right-4 z-50 w-11 aspect-square grid place-items-center rounded-full border-2 border-dashed border-quaternary bg-white transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
