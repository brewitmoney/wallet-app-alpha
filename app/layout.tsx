import type { Metadata } from "next";

import "./styles/globals.css";
import { headers } from "next/headers";
import localFont from "next/font/local";
import { cookieToInitialState } from "wagmi";
import { config } from "@/app/wallet-connect/config";
import Web3ModalProvider from "@/app/wallet-connect/context";
import { LoginProvider } from "./context/LoginProvider";
import { Toaster } from "@/components/ui/toaster";
import ShineBorder from "@/components/ui/shine-border";

const human_sans = localFont({
  src: [
    {
      path: "./font/HumanSans Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "./font/HumanSans ExtraLight.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "./font/HumanSans Light.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "./font/HumanSans Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./font/HumanSans Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./font/HumanSans Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./font/HumanSans Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Brewit Wallet - Personal Barista for Your Crypto Journey",
  description: "Brewit Wallet - Personal Barista for Your Crypto Journey",
  openGraph: {
    title: "Brewit Wallet - Personal Barista for Your Crypto Journey",
    url: "https://wallet.usezero.xyz/",
    description: "Brewit Wallet - Personal Barista for Your Crypto Journey",
    images: [
      {
        url: "https://wallet.usezero.xyz/og/home.png",
        secureUrl: "https://wallet.usezero.xyz/og/home.png",
        alt: "Brewit Wallet - Personal Barista for Your Crypto Journey",
        width: 1200,
        height: 630,
        type: "image/png",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  alternates: {
    canonical: "https://wallet.usezero.xyz/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brewit Wallet - Personal Barista for Your Crypto Journey",
    description: "Brewit Wallet - Personal Barista for Your Crypto Journey",
    creator: "@ZeroWallet",
    images: ["https://wallet.usezero.xyz/og/home.png"],
  },
  robots: {
    index: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <html lang="en">
      <body
        className={`${human_sans.className} antialiased bg-black min-h-dvh h-dvh`}
      >
        <ShineBorder
          className="relative flex  w-full flex-col items-center justify-center bg-transparent h-full rounded-none px-4 md:px-8 p-0 z-10"
          color={["#E10558", "#FF8408"]}
          borderRadius={0}
          borderWidth={4}
        >
          <div className=" text-white max-w-screen-2xl w-full mx-auto z-50">
            <div className=" flex flex-col items-center justify-center w-full">
              <Web3ModalProvider initialState={initialState}>
                <LoginProvider>{children}</LoginProvider>
              </Web3ModalProvider>
            </div>
          </div>
        </ShineBorder>

        <Toaster />
      </body>
    </html>
  );
}
