import { Toaster, toast } from "sonner";
import { Link, animateScroll as scroll } from "react-scroll";
import image1 from "/src/assets/image1.jpg";
import image2 from "/src/assets/image2.jpg";
import image3 from "/src/assets/image3.jpg";
import previewImage from "/src/assets/previewImage.jpg";
import bgSVGInitial from "/src/assets/bg.svg";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  LinearScale,
  Chart,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function App() {
  const images = [image1, image2, image3];
  const profiles = [
    {
      image: "https://avatars.githubusercontent.com/u/91777330?v=4",
      fullName: "@tahamukhtar20",
      github: "https://github.com/tahamukhtar20",
    },
    {
      image: "https://avatars.githubusercontent.com/u/123298042?v=4",
      fullName: "@Musa-Ali-Kazmi",
      github: "https://github.com/Musa-Ali-Kazmi",
    },
    {
      image: "https://avatars.githubusercontent.com/u/121627606?v=4",
      fullName: "@roycett",
      github: "https://github.com/roycett",
    },
    {
      image: "https://avatars.githubusercontent.com/u/108514869?v=4",
      fullName: "@MehranZafar-1",
      github: "https://github.com/MehranZafar-1",
    },
  ];
  const [bgSVG, setBgSVG] = useState<string | undefined | null>(bgSVGInitial);

  useEffect(() => {
    const bgSVGWithCacheBust = `${bgSVG}?${Date.now()}`;

    setBgSVG(bgSVGWithCacheBust);
  }, []);

  return (
    <>
      <Toaster />
      <div className="container mx-auto min-h-screen flex flex-col px-2 border-dashed border-x-2 tracking-tighter border-quaternary">
        <Header />
        <div
          className="border-quaternary relative bg-cover bg-center overflow-hidden border-t-2 border-dashed min-h-[calc(100vh-2.5rem)] flex flex-col justify-center items-center"
          style={{
            backgroundImage: `url(${bgSVG})`,
          }}
        >
          <div className="absolute inset-0 w-full h-full gradient-ring z-0"></div>
          <Text />
          <div className="flex sm:flex-row gap-4 pt-8 z-50 flex-col">
            <button
              className="btn btn-primary animate-fade-up"
              style={{ animationDelay: "0.20s" }}
            >
              Documentation
            </button>
            <button
              className="btn btn-secondary animate-fade-up"
              style={{ animationDelay: "0.30s" }}
            >
              Github Repository
            </button>
          </div>
        </div>
        <div className="flex 2xl:flex-row flex-col pb-20 h-full w-full border-t-2 border-dashed border-quaternary">
          <div className="2xl:w-1/2 w-full">
            <CardWrapper className="!border-t-0">
              <div
                className="px-2 2xl:max-w-2xl gap-4 flex flex-col"
                id="introduction"
              >
                <h1 className="text-4xl font-bold text-start">Introduction</h1>
                <h2 className="text-md">
                  Welcome to our AI Art Classification platform, where
                  creativity meets cutting-edge technology! Our project is
                  designed to revolutionize the way art is experienced and
                  understood. Using advanced artificial intelligence algorithms,
                  we have developed a state-of-the-art classification system
                  capable of analyzing diverse art pieces. Whether you're an
                  artist looking to categorize your creations or an art
                  enthusiast eager to explore the intricacies of different
                  styles, our user-friendly website provides a seamless and
                  interactive experience. Simply upload your art, and our AI
                  model will provide insightful classifications, unlocking a new
                  dimension of understanding and appreciation. Join us on this
                  exciting journey at the intersection of art and AI, where
                  innovation meets imagination.
                </h2>
              </div>
            </CardWrapper>
          </div>
          <div className="2xl:w-1/2 w-full h-96 relative flex items-center justify-center pt-16 pb-8">
            {images.map((src, i) => (
              <div
                key={i}
                className="relative w-full h-full flex items-center justify-center hover:scale-105 transition-all duration-300 ease-in-out"
                style={{
                  rotate: `${-15 + i * 15}deg`,
                  zIndex: `${i % 2 === 0 ? 0 : 100}`,
                  top: `${i !== 1 ? 30 : 0}px`,
                  animationDelay: `${0.2 + i * 0.05}s`,
                }}
              >
                <ImageFrame
                  key={i}
                  className={`absolute ${
                    i === 1 ? "sm:w-80 w-64 shadow-2xl" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <CardWrapper>
          <DemoSection />
        </CardWrapper>
        <CardWrapper>
          <div className="flex flex-col gap-4 px-2">
            <h1 className="text-4xl font-bold text-start">
              Project Contributors
            </h1>
            <div
              className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4"
              id="contributors"
            >
              {profiles.map((item, i) => (
                <ProfileComponent
                  key={i}
                  image={item.image}
                  fullName={item.fullName}
                  github={item.github}
                />
              ))}
            </div>
          </div>
        </CardWrapper>
        <footer className="border-t-2 border-quaternary py-4 h-full w-full border-dashed mt-4 text-center">
          &copy; 2023 - The Art Genre Classifier - All Rights Reserved
        </footer>
      </div>
    </>
  );
}

// Backend address; set VITE_API_URL at build time (e.g. the Hugging Face Space URL).
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type ServerStatus = "waking" | "ready" | "error";

/**
 * Pings /health as soon as the page loads (which also wakes a sleeping server) and keeps
 * polling until the model reports "ready".
 */
const useServerStatus = (): ServerStatus => {
  const [status, setStatus] = useState<ServerStatus>("waking");
  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        const body = res.ok ? await res.json() : null;
        if (body?.status === "ready") return !stopped && setStatus("ready");
        if (body?.status === "error") return !stopped && setStatus("error");
      } catch {
        // server still starting: no answer yet
      }
      if (!stopped) timer = setTimeout(check, 2500);
    };
    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);
  return status;
};

const StatusPill = ({ status }: { status: ServerStatus }) => {
  const look = {
    waking: { text: "Please wait, waking up the model…", dot: "bg-amber-400 animate-pulse" },
    ready: { text: "Ready for inference", dot: "bg-green-600" },
    error: { text: "The model failed to load. Try again later.", dot: "bg-red-600" },
  }[status];
  return (
    <div
      className="flex items-center gap-2 w-fit px-3 py-1 border-2 border-dashed border-quaternary font-semibold text-sm"
      role="status"
      aria-live="polite"
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${look.dot}`} />
      {look.text}
    </div>
  );
};

const DemoSection = () => {
  const [image, setImage] = useState<string | null | undefined>(null);
  const [lookup, setLookup] = useState<{
    [key: string]: string;
  } | null>(null);
  const status = useServerStatus();
  // A click while the model is still waking up is remembered and runs once it is ready.
  const [queued, setQueued] = useState(false);
  const [busy, setBusy] = useState(false);
  const classify = () => {
    if (status !== "ready") {
      setQueued(true);
      return;
    }
    const base64Image = image?.split(",")[1];
    setBusy(true);
    fetch(`${API_URL}/classify/`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        setLookup(res);
      })
      .catch((error) => {
        toast(`An Error Occurred: ${error}`, {
          style: {
            backgroundColor: "#EF9FBC",
            borderRadius: "9999px",
            fontFamily: "Inter",
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "1rem",
            textAlign: "center",
          },
        });
      })
      .finally(() => setBusy(false));
  };
  useEffect(() => {
    if (queued && status === "ready") {
      setQueued(false);
      classify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queued, status]);
  return (
    <div className="flex flex-col gap-4 px-2 w-full" id="demo">
      <h1 className="text-4xl font-bold text-start">Demo</h1>
      <div className="border-b-2 border-dashed flex flex-col border-quaternary pb-4">
        <h2 className="text-2xl font-semibold">Instructions</h2>
        <ul className="list-disc list-inside text-md">
          <li>Upload an image</li>
          <li>Click on the classify button</li>
        </ul>
      </div>
      <div className="flex lg:flex-row flex-col gap-8">
        <div className="flex flex-col gap-4 lg:w-1/2 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  setImage(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
            className="file-input w-full max-w-2xl file-input-bordered"
          />
          <div className="relative max-w-2xl w-full h-full rounded-3xl">
            <img
              src={image ? image : previewImage}
              alt="image-preview"
              className="w-full max-w-2xl rounded-3xl h-full object-cover object-center"
            />
            <div className="absolute inset-0 w-full h-full max-w-2xl rounded-3xl bg-gradient-to-br from-black to-transparent opacity-50" />
            <p className="absolute inset-0 w-full h-full flex items-center justify-center lg:text-4xl text-2xl font-semibold text-white uppercase">
              Image Preview
            </p>
          </div>
          <div className="flex flex-row">
            <RadialPredictions lookup={lookup} />
          </div>
          <div className="flex justify-start flex-col-reverse gap-4">
            <button
              className="btn-primary btn w-fit"
              type="button"
              disabled={!image || busy || queued || status === "error"}
              onClick={classify}
            >
              {queued ? "Waiting for the model…" : busy ? "Classifying…" : "Classify"}
            </button>
            <StatusPill status={status} />
            <div className="p-2 border-2 border-dashed w-fit font-semibold flex justify-center items-center border-quaternary">
              The model has a validation accuracy of 87.19%
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 w-full h-full">
          <ChartComponent />
        </div>
      </div>
    </div>
  );
};

const CardWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`border-quaternary border-dashed border-t-2 w-full h-fit p-4 bg-white ${className}`}
  >
    {children}
  </div>
);

const Text = () => (
  <p
    className={`animate-fade-up justify-center bg-gradient-to-br from-black flex flex-wrap to-secondary bg-clip-text text-center font-display text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 drop-shadow-sm [text-wrap:balance] md:text-7xl md:leading-[5rem]`}
    style={{ animationDelay: "0.10s", animationFillMode: "forwards" }}
  >
    <span>The</span>&nbsp;
    <span>Art</span>&nbsp;
    <span>Genre</span>&nbsp;
    <span>Classifier</span>
  </p>
);
const ImageFrame = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    {...props}
    className={`sm:w-72 w-60 aspect-[3/4] border-slate-50 border-8 overflow-hidden drop-shadow-2xl ${className}`}
  />
);

const ProfileComponent = ({
  image,
  fullName,
  github,
}: {
  image: string;
  fullName: string;
  github: string;
}) => (
  <div className="flex flex-col items-center gap-2 border-2 border-dashed border-quaternary hover:scale-105 transition-all duration-200 p-4 bg-white">
    <div className="relative aspect-square w-40 rounded-full overflow-hidden border-quaternary border">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
    <div className="flex flex-col items-center gap-1">
      <p className="text-2xl font-semibold">{fullName}</p>
      <a
        href={`${github}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Github
      </a>
    </div>
  </div>
);

type HiddenStyleType = {
  opacity: number;
  visibility: "hidden" | "visible";
};
const Header = () => {
  const scrollToTop = () => {
    scroll.scrollToTop();
  };
  const [hiddenStyle, setHiddenStyle] = useState<HiddenStyleType>({
    opacity: 0,
    visibility: "hidden",
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHiddenStyle({
          opacity: 1,
          visibility: "visible",
        });
      } else {
        setHiddenStyle({
          opacity: 0,
          visibility: "hidden",
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="w-full h-10 flex flex-row items-center justify-start">
      <div
        className="border-2 border-dashed rounded-full border-quaternary w-14 aspect-square bg-white bottom-20 right-1/2 transition-all duration-300 translate-x-1/2 z-[999] fixed"
        onClick={scrollToTop}
        style={{ ...hiddenStyle }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 absolute inset-0 m-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#000"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </div>
      <ul className="flex flex-row justify-start lg:gap-x-8 md:gap-x-4 gap-x-2 items-center lg:text-xl md:text-md text-sm font-semibold text-quaternary">
        <li className="transition-all duration-100 ease-in-out hover:text-teritiary">
          <Link
            activeClass="active"
            to="introduction"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            Introduction
          </Link>
        </li>
        <li className="transition-all duration-100 ease-in-out hover:text-teritiary">
          <Link
            activeClass="active"
            to="demo"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            Demo
          </Link>
        </li>
        <li className="transition-all duration-100 ease-in-out hover:text-teritiary">
          <Link
            activeClass="active"
            to="contributors"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
          >
            Contributors
          </Link>
        </li>
      </ul>
    </header>
  );
};

const ChartComponent = () => {
  const labels = [
    "Epoch 1",
    "Epoch 2",
    "Epoch 3",
    "Epoch 4",
    "Epoch 5",
    "Epoch 6",
    "Epoch 7",
  ];
  const dataAccuracy = {
    labels,
    datasets: [
      {
        label: "Training Accuracy",
        data: [
          0.8040316700935364, 0.8525133728981018, 0.8609338998794556,
          0.8810921311378479, 0.8844093084335327, 0.8929573893547058,
        ],

        fill: false,
        backgroundColor: "#EF9FBC",
        borderColor: "#EF9FBC",
      },

      {
        data: [
          0.8382652997970581, 0.8525510430335999, 0.8719387650489807,
          0.8397959470748901, 0.8602041006088257, 0.8260204195976257,
        ],
        label: "Validation Accuracy",
        fill: false,
        backgroundColor: "#65C3C8",
        borderColor: "#65C3C8",
      },
    ],
  };
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };
  const dataLoss = {
    labels,
    datasets: [
      {
        label: "Training Loss",
        data: [
          6.156745910644531, 0.6843165159225464, 0.6017402410507202,
          0.5495574474334717, 0.5014736652374268, 0.48313888907432556,
        ],
        fill: false,
        backgroundColor: "#EF9FBC",
        borderColor: "#EF9FBC",
      },
      {
        label: "Validation Loss",
        data: [
          0.6931515336036682, 0.6588460206985474, 0.5478007197380066,
          0.6491521596908569, 0.5947186350822449, 0.8113216757774353,
        ],
        fill: false,
        backgroundColor: "#65C3C8",
        borderColor: "#65C3C8",
      },
    ],
  };
  return (
    <div className="w-full h-full flex flex-col gap-8 justify-center">
      <h2 className="text-2xl font-semibold">Accuracy & Loss of the Model</h2>
      <div className="min-h-[10rem]">
        <Line
          data={dataAccuracy}
          options={options}
          className="tracking-normal h-full"
        />
      </div>
      <div className="w-full h-full min-h-[10rem]">
        <Line
          data={dataLoss}
          options={options}
          className="tracking-normal h-full"
        />
      </div>
    </div>
  );
};

const RadialPredictions = ({
  lookup,
}: {
  lookup?: {
    [key: string]: string;
  } | null;
}) => {
  const [greenLabel, setGreenLabel] = useState<{
    [key: string]: number;
  }>({
    abstract: 0,
  });
  const [redLabels, setRedLabels] = useState<
    {
      [key: string]: number;
    }[]
  >([
    {
      "animal-painting": 0,
    },
    {
      cityscape: 0,
    },
    {
      landscape: 0,
    },
    {
      portrait: 0,
    },
  ]);

  useEffect(() => {
    if (
      lookup &&
      typeof lookup === "object" &&
      Object.keys(lookup).length > 0
    ) {
      const keys = Object.keys(lookup);
      const values = Object.values(lookup);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const numericLookup: any = {};
      keys.forEach((key, index) => {
        const parsedValue = parseFloat(values[index]);
        numericLookup[key] = isNaN(parsedValue) ? 0 : parsedValue;
      });

      let max = 0;
      let label = "";
      Object.entries(numericLookup).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (value > max) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          max = value;
          label = key;
        }
      });

      setGreenLabel({ [label]: max });

      const tempRedLabels = keys
        .filter((key) => key !== label)
        .map((key) => ({ [key]: numericLookup[key] }))
        .sort((a, b) => b[Object.keys(b)[0]] - a[Object.keys(a)[0]]);

      setRedLabels(tempRedLabels);
    }
  }, [lookup]);
  return (
    <div className="max-w-2xl w-full flex md:flex-row flex-col-reverse justify-between gap-4 p-6 border-2 rounded-3xl shadow-lg border-quaternary">
      <div className="flex flex-col justify-between items-center w-full">
        <div className="text-2xl md:block hidden font-semibold text-start w-full">
          Predictions
        </div>
        <div className="flex flex-row md:flex-nowrap flex-wrap justify-around w-full gap-2">
          {Object.keys(redLabels).map((_, i) => (
            <div
              className="flex flex-col items-center w-full justify-end gap-2"
              key={i}
            >
              <div
                className="radial-progress transition-all duration-300 text-red-800"
                style={{
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  "--value": `${Object.values(redLabels[i])[0] * 100}`,
                  "--size": "4rem",
                  "--thickness": "0.5rem",
                }}
                role="progressbar"
              >
                {`${Math.round(Object.values(redLabels[i])[0] * 100)}%`}
              </div>
              <span className="font-semibold text-sm text-center w-full">
                {Object.keys(redLabels[i])[0].charAt(0).toUpperCase() +
                  Object.keys(redLabels[i])[0].slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center md:pr-4 pt-4 gap-2">
        <div
          className="radial-progress transition-all duration-300 text-green-800"
          style={{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            "--value": `${Object.values(greenLabel)[0] * 100}`,
            "--size": "8rem",
            "--thickness": "1rem",
          }}
          role="progressbar"
        >
          {`${Math.round(Object.values(greenLabel)[0] * 100)}%`}
        </div>
        <span className="font-semibold text-2xl">
          {Object.keys(greenLabel)[0].charAt(0).toUpperCase() +
            Object.keys(greenLabel)[0].slice(1)}
        </span>
      </div>
      <div className="text-2xl md:hidden block font-semibold text-start w-full">
        Predictions
      </div>
    </div>
  );
};
