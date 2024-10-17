import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center w-full max-w-md gap-8">
        <div className="flex flex-col items-center justify-center gap-1">
          <h1 className="font-black text-8xl md:text-9xl tracking-tight !leading-[1.1] bg-clip-text title-gradient text-transparent">
            404
          </h1>
          <h2 className="font-black text-4xl md:text-2xl tracking-tight !leading-[1.1] bg-clip-text title-gradient text-transparent">
            Page Not Found
          </h2>
        </div>
        <Link
          href={"/"}
          className=" bg-white text-black text-lg px-6 py-2.5 flex flex-row justify-center items-center gap-2 button-gradient"
        >
          <Home />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
