/* eslint-disable @next/next/no-img-element */
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginContext, useAccount } from "../context/LoginProvider";
import Truncate from "../utils/truncate";
import {
  Copy,
  PiggyBank,
  RefreshCcw,
  RefreshCcwIcon,
  SendHorizonal,
} from "lucide-react";
import { CopytoClipboard } from "../utils/copyclipboard";
import { useContext, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import ShowQR from "../components/QR/ShowQR";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { ZapperContext } from "../context/ZapperProvider";
import { Networks } from "../utils/Zapper";
import useAccountStore from "../store/account/account.store";
import { getJsonRpcProvider } from "../logic/web3";
import { gasChainsTokens, getChainById } from "../utils/tokens";
import { fixDecimal, getTokenBalance, getVaultBalance } from "../logic/utils";
import { formatEther, ZeroAddress } from "ethers";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function App() {
  const { chainId } = useAccountStore();
  const router = useRouter();
  const [tokenDetails, setTokenDetails]: any = useState([]);
  const [tokenVaultDetails, setTokenVaultDetails]: any = useState([]);

  const { toast } = useToast();
  const [openShowQR, setOpenShowQR] = useState(false);
  const { address } = useAccount();
  const { ensname, ensavatar } = useContext(LoginContext);
  const [openClaim, setOpenClaim] = useState(false);
  //Zapper Data

  const {
    NFTData,
    isZapperLoading,
    selectedNetworks,
    setSelectedNetworks,
    refresh,
    setRefresh,
    tokenDataError,
    DeFiDataError,
    setIsZapperLoading,
  } = useContext(ZapperContext);

  useEffect(() => {
    addAllNetworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      const provider = await getJsonRpcProvider(chainId.toString());
      let tokens = getChainById(Number(chainId))?.tokens;

      let updatedTokens = [];

      if (address) {
        updatedTokens = await Promise.all(
          tokens!.map(async (token) => {
            const balance =
              token.address == ZeroAddress
                ? formatEther(await provider.getBalance(address))
                : await getTokenBalance(token.address!, address, provider);

            return {
              ...token,
              balance, // Add the balance to each token
            };
          })
        );

        setTokenDetails(updatedTokens);

        let tokensWithVault = updatedTokens?.filter(
          (token: any) => token.vault != undefined
        );

        if (tokensWithVault) {
          updatedTokens = await Promise.all(
            tokensWithVault.map(async (token) => {
              const vaultBalance = await getVaultBalance(
                token.vault!,
                address,
                provider
              );
              return {
                ...token,
                vaultBalance, // Add the vault balance to each token
              };
            })
          );
          console.log(updatedTokens);
          setTokenVaultDetails(updatedTokens); // Tokens now contain their respective vault balances
        }
      }
    })();
  }, [chainId, address]);

  function addAllNetworks() {
    setSelectedNetworks((prevSelectedNetworks) => {
      const newSelectedNetworks = [...prevSelectedNetworks];

      Networks.forEach((network) => {
        if (!newSelectedNetworks.some((item) => item.name === network.name)) {
          newSelectedNetworks.push(network);
        }
      });

      return newSelectedNetworks;
    });
  }

  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const handleCelebrate = () => {
    setOpenClaim(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 20000); // Stop after 5 seconds
  };
  return (
    <div className=" flex flex-col items-start justify-center gap-6 w-full h-full">
      <div className="w-full border border-accent flex flex-col gap-6 px-4 py-4 md:py-6">
        <div className="w-full flex flex-col md:flex-row gap-4 justify-between items-center relative">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center w-full">
            {ensavatar ? (
              <img
                className="rounded-full"
                src={ensavatar}
                width={120}
                height={120}
                alt={ensname}
              />
            ) : (
              ensname && (
                <div className=" h-32 w-32 rounded-full bg-black uppercase flex justify-center items-center text-7xl font-bold text-white border border-accent">
                  {ensname.slice(0, 1)}
                </div>
              )
            )}

            <div className="flex flex-col justify-start items-start ml-0 gap-1">
              <div className="flex flex-col-reverse justify-start items-start gap-1">
                <div className="flex flex-row justify-center items-start gap-2">
                  <h1 className="text-4xl font-black text-white">
                    {tokenDetails[0]
                      ? `${fixDecimal(tokenDetails[0]?.balance, 2)} ${
                          tokenDetails[0]?.name
                        }`
                      : null}
                  </h1>
                  <button
                    className="mt-1"
                    onClick={() => {
                      setIsZapperLoading(true);
                      setRefresh(!refresh);
                    }}
                  >
                    <RefreshCcwIcon
                      size={16}
                      className={`text-accent hover:text-white ${
                        isZapperLoading && !tokenDataError ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <span className="text-accent text-sm">Networth</span>
              </div>
              <div className="flex flex-col">
                {ensname && (
                  <div className="text-lg font-medium">{ensname}</div>
                )}
                <div className="flex flex-row justify-center items-center gap-2 text-sm">
                  <div>{Truncate(address, 20, "...")}</div>
                  <div
                    onClick={() => {
                      CopytoClipboard(address || "");
                      toast({
                        success: true,
                        title: "Copy Address",
                        description:
                          "Adderess copied to clipboard successfully!",
                      });
                    }}
                  >
                    <Copy size={18} />
                  </div>

                  <div>
                    <ShowQR
                      open={openShowQR}
                      setOpen={setOpenShowQR}
                      address={address}
                      ensname={ensname}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* <button
              onClick={() => setOpenClaim(true)}
              className="flex flex-row justify-center items-center gap-2 bg-gradient text-black px-6 py-2 font-bold rounded-full"
            >
              Claim Badge
            </button> */}
            <Dialog open={openClaim} onOpenChange={setOpenClaim}>
              <DialogContent className="bg-black text-white dark:bg-white flex flex-col justify-start items-start gap-4 rounded-none sm:rounded-none max-w-lg mx-auto border border-accent">
                <DialogHeader>
                  <DialogTitle>Early Adoptor Badge</DialogTitle>
                  <DialogDescription>
                    You are eligible for an early adopter badge. Will
                    distinguish you from others.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col justify-center items-center w-full gap-4">
                  <Image
                    src={"/badges/Brewit - Early Adaptor.png"}
                    width={400}
                    height={400}
                    alt="Brewit - Early Adaptor"
                  />
                  <button
                    onClick={handleCelebrate}
                    className="bg-transparent py-3 w-full text-white font-semibold border border-accent bg-gradient hover:bg-transparent hover:text-white text-lg"
                  >
                    Claim
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      {showConfetti && <Confetti width={width} height={height} />}
      <Tabs defaultValue="Tokens" className="w-full flex flex-col gap-4 h-full">
        <div className="flex flex-col-reverse md:flex-row md:justify-between items-end md:items-center gap-2">
          <TabsList className="rounded-none h-fit p-0 divide-x divide-accent border border-accent grid grid-cols-3 md:max-w-md w-full gap-0 bg-black  text-white data-[state=active]:bg-gradient data-[state=active]:text-black data-[state=active]:font-bold">
            <TabsTrigger
              className="py-3 text-sm rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:font-bold"
              value="Tokens"
            >
              Tokens
            </TabsTrigger>
            <TabsTrigger
              className="py-3 text-sm rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:font-bold"
              value="Defi"
            >
              DeFi
            </TabsTrigger>
            <TabsTrigger
              className="py-3 text-sm rounded-none data-[state=active]:bg-secondary data-[state=active]:text-black data-[state=active]:font-bold"
              value="NFTs"
            >
              NFTs
            </TabsTrigger>
            {/* <TabsTrigger
              className="py-2.5 text-sm rounded-none data-[state=active]:bg-gradient data-[state=active]:text-black"
              value="Transactions"
            >
              Transactions
            </TabsTrigger> */}
          </TabsList>
          <div className="flex flex-row justify-start items-center gap-3">
            <div className="flex flex-row justify-start items-center">
              {/* {getChainById(chainId).map((snetwork, s) => {
                return ( */}
              <div
                className=" w-7 h-7 bg-white rounded-full -ml-2.5"
                // key={s}
              >
                <Image
                  className=" rounded-full p-px"
                  src={getChainById(chainId)?.icon!}
                  width={30}
                  height={30}
                  alt={getChainById(chainId)?.name!}
                />
              </div>
              {/* ); */}
              {/* })} */}
              {/* {selectedNetworks.length > 5 && (
                <span className="w-7 h-7 cursor-default -ml-2.5 p-px flex justify-center items-center text-sm bg-black rounded-full text-white text-center">
                  {selectedNetworks.length - 5}
                </span>
              )} */}
            </div>
            <Popover>
              <PopoverTrigger className="px-4 py-2.5 border border-accent bg-white text-black text-sm font-bold">
                Networks
              </PopoverTrigger>
              <PopoverContent className="flex flex-col justify-start gap-0 w-60 p-0 rounded-none max-w-lg mr-8">
                <div className="flex flex-row justify-between items-center py-2 px-4 border-b border-accent">
                  <h3 className="font-bold">All Networks</h3>
                  <div className="text-sm">
                    {selectedNetworks.length === 0 ? (
                      <button onClick={() => addAllNetworks()}>
                        Select all
                      </button>
                    ) : (
                      <button onClick={() => setSelectedNetworks([])}>
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-scroll px-4 py-0 h-60">
                  {gasChainsTokens.map((network, c) => {
                    return (
                      <button
                        key={c}
                        className="flex flex-row justify-between items-center gap-2 py-2 w-full"
                        // onClick={() =>
                        //   setSelectedNetworks((prevSelectedNetworks) =>
                        //     prevSelectedNetworks.some(
                        //       (item) => item.name === network.name
                        //     )
                        //       ? prevSelectedNetworks.filter(
                        //           (item) => item.name !== network.name
                        //         )
                        //       : [...prevSelectedNetworks, network]
                        //   )
                        // }
                      >
                        <div className="flex flex-row justify-start items-center gap-2">
                          <Image
                            className="rounded-full bg-white p-px"
                            src={network.icon}
                            width={25}
                            height={25}
                            alt={network.name}
                          />
                          <div className="grid gap-1.5">
                            <h3 className="text-sm truncate w-full capitalize font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {network.name.replaceAll("-", " ")}
                            </h3>
                          </div>
                        </div>
                        <Checkbox
                          className="rounded-full h-5 w-5"
                          checked={selectedNetworks.some(
                            (item) => item.name === network.name
                          )}
                          id={network.name.toString()}
                        />
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="border border-accent flex flex-col gap-2 w-full max-h-full h-24 px-2 md:px-4 pb-4 overflow-y-scroll flex-grow">
          <TabsContent value="Tokens" className="p-0 mt-0 flex flex-col gap-4">
            <div className="flex flex-col">
              {tokenDetails.length === 0 && (
                <div className="flex flex-col justify-center items-center gap-2 py-4 md:h-[55vh] text-3xl">
                  <div className="flex flex-col gap-4 justify-center items-center font-bold">
                    <h2>
                      {tokenDataError
                        ? "Error Fetching Tokens"
                        : isZapperLoading
                        ? "Loading..."
                        : selectedNetworks.length === 0
                        ? "No Networks Selected"
                        : "No Tokens Found"}
                    </h2>
                    {selectedNetworks.length > 0 &&
                      isZapperLoading === false && (
                        <div className="flex flex-col gap-2 justify-center items-center text-sm">
                          <div>On following chains</div>
                          <div className="flex flex-row flex-wrap max-w-md justify-center items-center gap-2.5 mt-2">
                            {selectedNetworks.map((network) => {
                              return (
                                <Image
                                  className="rounded-full bg-white p-px"
                                  key={network.name}
                                  src={network.logo}
                                  width={30}
                                  height={30}
                                  alt={network.name}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
              {tokenDetails?.map((token: any, t: number) => {
                return (
                  <div
                    key={t}
                    className="grid grid-cols-3 md:flex flex-row justify-between items-center gap-4 md:gap-8 py-5 border-b border-accent"
                  >
                    <div className="flex flex-row justify-start items-center gap-3 md:w-48">
                      <div className="bg-black rounded-full p-1 relative">
                        <img
                          className="rounded-full bg-white"
                          src={token.icon || "/tokens/default.png"}
                          width={30}
                          height={30}
                          alt={token.name}
                        />
                        <div className="absolute right-0 top-0 text-white text-sm">
                          <Image
                            className="rounded-full bg-white p-px shadow-md"
                            src={getChainById(Number(chainId))?.icon!}
                            width={15}
                            height={15}
                            alt={token.name}
                          />
                        </div>
                      </div>
                      <div className="font-semibold w-full truncate">
                        {token.fullname}
                      </div>
                    </div>
                    {/* <div className="md:col-span-1 text-right">
                      $
                      {(
                        Number(token.token.price) * token.token.balance
                      ).toFixed(2)}
                    </div> */}
                    <div className="text-left md:text-right uppercase md:w-32">
                      {<span>{fixDecimal(token.balance, 6)}</span>} {token.name}
                    </div>
                    <div className="md:w-36">
                      <div className="grid grid-cols-3 place-items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {" "}
                              <SendHorizonal
                                size={25}
                                onClick={() => router.push("/app/send")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Send</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {" "}
                              <RefreshCcw
                                size={25}
                                onClick={() => router.push("/app/swap")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Swap</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              {" "}
                              <PiggyBank
                                size={25}
                                onClick={() => router.push("/app/investments")}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Investments</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent
            value="Defi"
            className="p-0 mt-0  justify-between items-start gap-4"
          >
            <div className="flex flex-col ">
              {tokenVaultDetails.length === 0 && (
                <div className="flex flex-col justify-center items-center gap-2 py-4 md:h-[55vh] text-3xl">
                  <div className="flex flex-col gap-4 justify-center items-center font-bold">
                    <h2>
                      {" "}
                      {DeFiDataError
                        ? "Error Fetching DeFi Data"
                        : isZapperLoading
                        ? "Loading..."
                        : selectedNetworks.length === 0
                        ? "No Networks Selected"
                        : "No Positions Found"}
                    </h2>
                  </div>
                </div>
              )}
              {tokenVaultDetails.length > 0 &&
                tokenVaultDetails?.map((vault: any, t: number) => {
                  return (
                    <div
                      key={t}
                      className="flex flex-row justify-between items-center gap-4 gap-y-4 md:gap-8 py-3.5 border-b border-accent first:pt-1"
                    >
                      <div className="flex flex-row justify-start items-center gap-3">
                        <div className="bg-black rounded-full p-1 relative">
                          <img
                            className="rounded-full bg-white"
                            src={vault.icon || "/defi/default.png"}
                            width={30}
                            height={30}
                            alt={vault.name}
                          />
                        </div>
                        <div className="flex flex-row justify-start items-center gap-3 w-full">
                          <div className="font-semibold truncate">
                            {vault.fullname} Vault
                          </div>
                          {/* <div className="flex flex-row flex-wrap gap-2 justify-start items-center text-xs">
                            {defi.products.slice(0, 2).map((product, p) => {
                              return (
                                <div
                                  className="bg-white px-1.5 py-0.5 rounded-full truncate text-black"
                                  key={p}
                                >
                                  {product.label}
                                </div>
                              );
                            })}
                          </div> */}
                        </div>
                      </div>
                      <div className=" text-right">
                        {fixDecimal(vault.vaultBalance, 4)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
          <TabsContent value="NFTs" className="p-0 mt-0">
            {NFTData.length <= 0 && (
              <div className="flex flex-row justify-center items-center h-[55vh]">
                <div className="flex flex-col gap-4 justify-center items-center font-bold text-2xl">
                  {DeFiDataError ? "Error Fetching NFT Data" : "No NFTs Found"}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-4">
              {NFTData.map((nft, n) => {
                return (
                  <div
                    className="flex flex-col justify-between items-center gap-2"
                    key={n}
                  >
                    <Image
                      className="w-full h-full"
                      src={
                        nft.token.medias[0]?.originalUrl ||
                        "/nfts/NFT-Default.png"
                      }
                      width={30}
                      height={30}
                      alt={nft.token.name}
                      unoptimized={true}
                    />

                    <div className="flex flex-row flex-wrap justify-between items-center w-full text-base md:text-lg">
                      <div className="flex flex-row gap-2 justify-start items-center">
                        <div className=" line-clamp- w-24 truncate">
                          #{nft.token.tokenId}
                        </div>
                      </div>
                      <div className="text-base md:text-lg font-bold">
                        {nft.token.collection.floorPriceEth || 0} ETH
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="Transactions" className="p-0 mt-0">
            <div className="flex flex-col justify-center items-center gap-4 text-sm h-[55vh]">
              {/* {Transactions.map((transaction, t) => {
                return (
                  <div
                    className="flex flex-col gap-1 bg-white text-black"
                    key={t}
                  >
                    <div className="flex flex-col gap-1 bg-white text-black px-4 pt-4">
                      <div className="flex flex-row justify-between items-center w-full">
                        <div className="flex flex-row gap-2 justify-start items-center">
                          <div>{Truncate(transaction.from, 12, "...")}</div>
                          <div>{">"}</div>
                          <div>{Truncate(transaction.to, 12, "...")}</div>
                        </div>
                        <div className="text-lg font-bold text-right">
                          {(Math.random() * 10).toFixed(2)} ETH
                        </div>
                      </div>

                      <div className="flex flex-row justify-between items-center w-full">
                        <div>Date & Time:</div>
                        <div>
                          {moment(transaction["date&time"]).format("LLL")}
                        </div>
                      </div>
                      <div className="flex flex-row justify-between items-center w-full">
                        <div>Chain:</div>
                        <div>
                          <img
                            src={getChain(parseInt(transaction.chainId))?.icon}
                            width={20}
                            height={20}
                            alt={getChain(parseInt(transaction.chainId))?.name}
                          />
                        </div>
                      </div>

                      <div className="flex flex-row justify-between items-center w-full">
                        <div>Value:</div>
                        <div>{transaction.value}ETH</div>
                      </div>
                    </div>
                    <div className="flex flex-row justify-end items-end">
                      <div className="flex flex-row justify-end items-end border-l border-black border-t gap-2 px-2 py-2 w-fit">
                        <div>
                          <Fuel size={20} />
                        </div>
                        <div>{transaction.gas}</div>
                      </div>
                    </div>
                  </div>
                );
              })} */}
              <h3 className="font-bold text-2xl">No Transactions Found</h3>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
