"use client";
import Image from "next/image";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { LogOut, Wallet } from "lucide-react";
import Truncate from "./utils/truncate";
import { connectPassKey } from "./logic/passkey";
import { WebAuthnMode } from "@zerodev/passkey-validator";
import { storePasskey } from "./utils/storage";
import { useState } from "react";
import {
  useLoginProvider,
  useWalletInfo,
  useAccount,
  useDisconnect,
} from "./context/LoginProvider";
import DotPattern from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";
import Footer from "./components/Footer/Footer";

export default function Home() {
  const { address, isConnecting, isDisconnected } = useAccount();
  const { setWalletInfo } = useLoginProvider();
  const { walletInfo } = useWalletInfo();

  const { disconnect } = useDisconnect();

  console.log();

  return (
    <div className="flex flex-col gap-12 md:gap-16 justify-center items-center h-full text-center pt-12 md:pt-0 px-6">
      <div className="flex flex-col gap-20 items-center max-w-2xl">
        <div className="flex flex-row justify-center items-center gap-4">
          <Image
            src={"/logo/icon.svg"}
            alt="Zero Logo"
            width={80}
            height={80}
          />
          <h1 className="font-black text-7xl md:block hidden">brewit</h1>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <h2 className="font-black text-5xl md:text-6xl tracking-tight !leading-[1.1] bg-clip-text title-gradient text-transparent">
            Personal Barista for Your Crypto Journey
          </h2>
        </div>
      </div>

      <div className=" flex flex-col gap-4 items-center justify-center w-full max-w-sm text-lg">
        {!walletInfo && (
          <h2 className="text-white text-sm font-medium">
            Login or Signup with your passkey
          </h2>
        )}
        <div className="flex flex-col gap-2 items-center justify-center w-full border border-accent rounded-md bg-black p-4">
          {walletInfo ? (
            <div className="grid grid-cols-5 gap-2 items-center justify-between px-6 bg-white text-black w-full py-2.5">
              <div></div>
              <div className="flex flex-row gap-2 items-center justify-center col-span-3 w-full">
                <Image
                  src={walletInfo.icon || "/icons/wallet.svg"}
                  alt="Wallet Icon"
                  width={25}
                  height={25}
                />
                <p className="">{Truncate(address, 12, "...")}</p>
              </div>
              <div className="flex justify-end items-center">
                <LogOut
                  onClick={() => {
                    disconnect();
                    setWalletInfo(undefined);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 items-center justify-center w-full">
              <button
                className="flex flex-row gap-2 items-center justify-center border border-accent px-6 py-2.5 w-full button-gradient rounded-md"
                onClick={async () => {
                  // Handle the passkey auth here
                  try {
                    const passkey = await connectPassKey(
                      "BrewitWallet",
                      WebAuthnMode.Login
                    );
                    storePasskey(passkey);
                    setWalletInfo({ name: "passkey", icon: "/icons/safe.svg" });
                  } catch (e) {
                    console.log(e);
                  }
                }}
              >
                <Image
                  src={"/icons/passkey.svg"}
                  alt="Wallet Icon"
                  width={30}
                  height={30}
                />
                <p className="font-bold text-black">Login Now </p>
              </button>
              <div>(OR)</div>
              <button
                className="py-2.5 text-lg text-white w-full border border-accent rounded-md"
                onClick={async () => {
                  try {
                    const passkey = await connectPassKey(
                      `Brew Wallet ${new Date().toLocaleDateString("en-GB")}`,
                      WebAuthnMode.Register
                    );
                    storePasskey(passkey);
                    setWalletInfo({ name: "passkey", icon: "/icons/safe.svg" });
                  } catch (e) {
                    console.log(e);
                  }
                }}
              >
                Create New
              </button>
            </div>
          )}
        </div>
      </div>
      <DotPattern
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] fill-neutral-400/80 z-0"
        )}
      />
      <Footer />
    </div>
  );
}
