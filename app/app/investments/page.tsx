"use client";
import {
  gasChainsTokens,
  getChainById,
  getTokenInfo,
} from "@/app/utils/tokens";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEventHandler, useEffect, useState } from "react";
import {
  BadgeInfo,
  CalendarIcon,
  ChevronsRight,
  CircleArrowUp,
  Loader2,
  PlusSquareIcon,
  Wallet2,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import {
  buildAddSessionKey,
  buildDCAJob,
  buildScheduleData,
  buildTokenBridge,
  buildVaultRedeem,
  getAllJobs,
  sendTransaction,
} from "@/app/logic/module";
import { useAccount, useLoginProvider } from "../../context/LoginProvider";
import useAccountStore from "@/app/store/account/account.store";
import {
  convertToSeconds,
  createJobId,
  fixDecimal,
  formatTime,
  getRedeemBalance,
  getSendQuote,
  getTokenBalance,
  getVaultBalance,
} from "@/app/logic/utils";
import { cancelJob, scheduleJob } from "@/app/logic/jobsAPI";
import { WaitForUserOperationReceiptTimeoutError } from "permissionless";
import { ZeroAddress, formatEther, formatUnits, parseUnits } from "ethers";
import { getJsonRpcProvider } from "@/app/logic/web3";
import { setHours, setMinutes } from "date-fns";
import moment from "moment";
import { waitForExecution } from "@/app/logic/permissionless";
import { Switch } from "@/components/ui/switch";
import { Transaction, zeroAddress } from "viem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentCard } from "./InvestmentCard";

type Investment = {
  token: string;
  targetToken: string;
  vault: string;
  validAfter: number;
  validUntil: number;
  limitAmount: bigint;
  refreshInterval: bigint;
};

type JobExecution = {
  active: boolean;
  lastUsed: number;
  totalExecutions: number;
  totalTargetToken: bigint;
};

export default function Investments() {
  const { chainId, setChainId } = useAccountStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [investValue, setInvestValue] = useState<string>("0");
  const [investmentAdded, setInvestmentAdded] = useState(false);
  const [toChain, setToChain] = useState<number>(chainId);
  const [fromToken, setFromToken] = useState<number>(0);
  const [balance, setBalance] = useState<string>("0");
  const [layerZeroHash, setLayerZeroHash] = useState<string>("");
  const [targetToken, setTargetToken] = useState<number>(0);
  const [selectedVault, setSelectedVault] = useState<any>();
  const [frequency, setFrequency] = useState<number>(0);
  const [refreshInterval, setRefreshInterval] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now()));
  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date(Date.now());
    end.setMinutes(end.getMinutes() + 5);
    return end;
  });

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [jobExecutions, setJobExecutions] = useState<JobExecution[]>([]);

  const [tokenVaultDetails, setTokenVaultDetails] = useState<any[]>([]);
  const [nextSessionId, setNextSessionId] = useState<number>(0);

  const { address } = useAccount();
  const { validator } = useLoginProvider();

  useEffect(() => {
    (async () => {
      const provider = await getJsonRpcProvider(chainId.toString());
      const token = getChainById(Number(chainId))?.tokens[fromToken].address;
      if (token == ZeroAddress) {
        setBalance(formatEther(await provider.getBalance(address)));
      } else {
        setBalance(await getTokenBalance(token!, address, provider));
      }
    })();
  }, [chainId, fromToken]);

  useEffect(() => {
    (async () => {
      console.log(investmentAdded)
      if (!investmentAdded) {
        const provider = await getJsonRpcProvider(chainId.toString());
        let tokensWithVault = getChainById(Number(chainId))?.tokens.filter(
          (token: any) => token.vault != undefined
        );
        let updatedTokens = []

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

          setTokenVaultDetails(updatedTokens); // Tokens now contain their respective vault balances
        }
        }

        let investments = [[],[]]
        try {        
        investments = await getAllJobs(chainId.toString(), address);
        } catch(e) {
          //pass
        }
        setNextSessionId(investments[0].length);
        setInvestments(investments[0]);
        setJobExecutions(investments[1]);

        setInvestmentAdded(false);
        setToChain(chainId);
      
    })();
  }, [chainId, address, investmentAdded]);

  const Frequency = [
    {
      label: "minutes",
    },
    {
      label: "hours",
    },
    {
      label: "days",
    },
  ];

  const getCurrentTime = (offset = 0) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + offset); // Add offset to the current minutes
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [startTimeValue, setStartTimeValue] = useState<string>(
    getCurrentTime()
  );
  const [endTimeValue, setEndTimeValue] = useState<string>(getCurrentTime(5));

  const handleStartTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!startDate) {
      setStartTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(startDate, minutes), hours);
    setStartDate(newSelectedDate);
    setStartTimeValue(time);
  };

  const handleEndTimeChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const time = e.target.value;
    if (!endDate) {
      setEndTimeValue(time);
      return;
    }
    const [hours, minutes] = time.split(":").map((str) => parseInt(str, 10));
    const newSelectedDate = setHours(setMinutes(endDate, minutes), hours);
    setEndDate(newSelectedDate);
    setEndTimeValue(time);
  };

  const handleStartDaySelect = (date: Date | undefined) => {
    if (!startTimeValue || !date) {
      setStartDate(date!);
      return;
    }
    const [hours, minutes] = startTimeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setStartDate(newDate);
  };

  const handleEndDaySelect = (date: Date | undefined) => {
    if (!endTimeValue || !date) {
      setEndDate(date!);
      return;
    }
    const [hours, minutes] = endTimeValue
      .split(":")
      .map((str) => parseInt(str, 10));
    const newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes
    );
    setEndDate(newDate);
  };

  return (
    <div className="flex flex-col gap-6 justify-start p-4 items-start border border-accent w-full h-full">

      { Boolean(tokenVaultDetails.filter(tokenVault => tokenVault.vaultBalance > 0).length) && <h3 className="font-bold text-2xl mt-6">Interest bearing investements</h3> }

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-white w-full">
        {tokenVaultDetails.filter(tokenVault => tokenVault.vaultBalance > 0).map((tokenVault, index) => (
          <div
            key={index}
            className="border-accent rounded-lg  w-full flex flex-col gap-0 border border-accent"
          >
            <div className="flex flex-row justify-between items-center px-4 py-3 border-b border-accent">
              <div className="flex flex-row justify-start items-center gap-2">
                <Image
                  src={tokenVault.icon!}
                  alt="From Token"
                  width={30}
                  height={30}
                />
                <div className="font-semibold">{tokenVault.name!}</div>
              </div>
              <div>
                <Image
                  className="bg-white rounded-full"
                  src={getChainById(Number(chainId))?.icon!}
                  alt="Wallet Icon"
                  width={30}
                  height={30}
                />
              </div>
            </div>
            <div className="px-4 py-3 flex flex-col justify-start items-start">
              <div className="flex flex-col justify-between items-start gap-4 w-full">
                <div className="flex flex-row justify-between items-center w-full">
                  <h4 className="font-semibold">Balance</h4>
                  <h5>
                    {fixDecimal(
                      tokenVault.vaultBalance,
                      parseInt(tokenVault.vaultBalance) ? 4 : 6
                    )}
                  </h5>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Dialog>
                    <DialogTrigger
                      onClick={() => setSelectedVault(tokenVault)}
                      className="border border-accent px-6 py-2.5 bg-black text-white text-sm hover:border-white hover:text-white"
                    >
                      Withdraw
                    </DialogTrigger>
                    <DialogContent className="bg-black text-white dark:bg-white flex flex-col justify-start items-start gap-4 rounded-none sm:rounded-none max-w-lg mx-auto border border-accent">
                      <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>
                          Withdraw your funds from the vault to your wallet on
                          desired chain.
                        </DialogDescription>
                        <div className="flex flex-col gap-0 justify-start items-start pt-4">
                          {/* <div className="grid grid-cols-5 justify-center items-center gap-4 w-full "> */}

                          <DialogDescription className="font-semibold text-center w-full text-white">You are about to withdraw interest bearing token from the vault to your account</DialogDescription>

                          <div className="w-full border-t border-accent my-4"></div>

                                            <div className="flex flex-row justify-between items-center w-full">
                                              <h4 className="font-semibold">Withdraw Amount</h4>
                                              <div className="flex flex-row justify-start items-center gap-2">
                                                <Image
                                                  src={getTokenInfo(Number(chainId), selectedVault?.address)?.icon!}
                                                  alt="From Token"
                                                  width={30}
                                                  height={30}
                                                />
                                                <div className="font-semibold text-red-500">
                                                  - 
                                                                    {fixDecimal(
                                                    selectedVault?.vaultBalance,
                                                    parseInt(tokenVault.vaultBalance) ? 4 : 6
                                                  )}
                                                </div>
                                                <div className="font-semibold">
                                                  {getTokenInfo(Number(chainId), selectedVault?.token)?.name}
                                                </div>
                                              </div>
                                            </div>
                          <button
                            className="bg-white border border-accent hover:bg-transparent hover:text-white text-black w-full px-6 py-3 text-lg mt-8"
                            onClick={async () => {
                              setWithdrawing(true);
                              try {
                                const provider = await getJsonRpcProvider(
                                  chainId.toString()
                                );
                                const buildVault = await buildVaultRedeem(
                                  chainId.toString(),
                                  address,
                                  tokenVault.vault
                                );
 
                                let calls =  [ buildVault ]

                                await sendTransaction(
                                  chainId.toString(),
                                  calls,
                                  validator,
                                  address
                                );
                                setInvestmentAdded(true);

                              } catch (e) {
                                console.log("Failed to withdraw", e);
                              }
                              setWithdrawing(false);
                            }}
                          >
                            {withdrawing ? (
                              <span className="flex items-center justify-center">
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Withdrawing funds to account...
                              </span>
                            ) : (
                              "Withdraw"
                            )}
                          </button>
                        </div>

                        {investmentAdded && (
                          <>
                            <span className="flex items-center justify-center">
                              Funds withdrew successfully 🚀✅
                            </span>
                          </>
                        )}
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 flex-grow w-full">
      
          <h3 className="font-bold text-2xl mb-4">Investment Plans</h3>
        

    <Tabs defaultValue="active" className="w-full flex flex-col gap-4 h-full">
    <div className="flex gap-x-6 items-center">
          <TabsList className="rounded-none h-fit p-0 divide-x divide-accent border border-accent grid grid-cols-2 md:max-w-md w-full gap-0 bg-black  text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold">
            <TabsTrigger
              className="py-3 text-sm rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              value="active"
            >
              Active Plans
            </TabsTrigger>
            <TabsTrigger
              className="py-3 text-sm rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              value="history"
            >
              History
            </TabsTrigger>
            
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <button className="bg-black text-white py-2 px-2 md:px-6 font-medium text-lg flex flex-row justify-center items-center gap-2 border border-accent hover:border-white hover:bg-transparent hover:text-white">
              <PlusSquareIcon />{" "}
              <span className="hidden md:block">Create a Plan</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black dark:bg-white flex flex-col justify-start items-start gap-4 rounded-none sm:rounded-none max-w-lg mx-auto border border-accent">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-white text-xl">
                Create a Investment
              </DialogTitle>
              <DialogDescription className="text-base text-accent mt-0">
                Create a new investment plan to store your assets and earn
                yield.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col border border-accent  divide-y divide-accent gap-px">
              <div className="flex flex-row divide-x divide-accent">
                <div className=" px-4 py-3 flex flex-col justify-start items-start gap-2 w-full text-base">
                  
                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                    <div className="text-accent">Invest</div>
                    <BadgeInfo size={14} />
                  </div>

                  <div className="flex flex-row justify-between  gap-2 w-full">
                    <div className="flex flex-col" >
                  <input
                    type="text"
                    // placeholder={0.01}
                    value={investValue}
                    className="bg-transparent focus:outline-none w-full text-white text-4xl"
                    onChange={(e) => setInvestValue(e.target.value)}
                  />
                   <div className="flex flex-row justify-center items-center gap-2 text-accent">
                    <Wallet2 size={16} />
                    <h5>{Number(balance).toFixed(4)}</h5>
                    </div>
                  </div>
                  <div className="flex flex-row justify-center gap-2">
                    <Select
                      value={fromToken.toString()}
                      onValueChange={(e) => {
                        setFromToken(parseInt(e));
                      }}
                    >
                      <SelectTrigger className=" w-24 bg-white px-2 py-2 border border-accent text-black flex flex-row gap-2 items-center justify-center text-sm rounded-full focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent">
                        <SelectValue placeholder="From Token" />
                      </SelectTrigger>

                      <SelectContent>
                        {getChainById(Number(chainId))?.tokens.map(
                          (from, f) => (
                            <SelectItem key={f} value={f.toString()}>
                              <div className="flex flex-row justify-center items-center gap-2">
                                <Image
                                  className="bg-white rounded-full"
                                  src={from.icon}
                                  alt={from.name}
                                  width={25}
                                  height={25}
                                />
                                <h3 className="truncate uppercase">
                                  {from.name}
                                </h3>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                </div>
                <div className=" px-4 py-3 flex flex-col justify-start items-start gap-2 w-full text-base">
                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                    <div className="text-accent">Buy</div>
                    <BadgeInfo size={14} />
                  </div>
                  <div className="flex flex-row justify-between items-center gap-2 w-full">
                  <input
                    type="number"
                    disabled
                    placeholder=""
                    className="bg-transparent focus:outline-none w-full text-white text-4xl"
                  />
                  <div className="flex flex-row justify-center items-center gap-2">
                    <Select
                      value={targetToken.toString()}
                      onValueChange={(e) => {
                        setTargetToken(parseInt(e));
                      }}
                    >
                      <SelectTrigger className=" w-24 bg-white px-2 py-2 border border-accent text-black flex flex-row gap-2 items-center justify-center text-sm rounded-full focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent">
                        <SelectValue placeholder="From Chain" />
                      </SelectTrigger>
                      <SelectContent>
                        {getChainById(Number(chainId))?.tokens.map((from, f) => (
                          <SelectItem key={f} value={f.toString()}>
                            <div className="flex flex-row justify-center items-center gap-2">
                              <Image
                                className="bg-white rounded-full"
                                src={from.icon}
                                alt={from.name}
                                width={25}
                                height={25}
                              />
                              <h3 className="truncate">{from.name}</h3>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                  </div>
                </div>
              </div>

              <div className=" px-4 py-3 flex flex-col gap-2 w-full text-base">
                <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                  <div className="text-accent">Every</div>
                  <BadgeInfo size={14} />
                </div>
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                  <input
                    type="number"
                    value={refreshInterval}
                    onChange={(e) =>
                      setRefreshInterval(parseInt(e.target.value))
                    }
                    className="bg-transparent focus:outline-none w-full text-white text-4xl"
                  />
                  <div className="flex flex-row justify-center items-center gap-2">
                    <Select
                      value={frequency.toString()}
                      onValueChange={(e) => {
                        console.log(e);
                        setFrequency(parseInt(e));
                      }}
                    >
                      <SelectTrigger className=" w-24 bg-white px-2 py-2 border border-accent text-black flex flex-row gap-2 items-center justify-center text-sm rounded-full focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {Frequency.map((frequency, fre) => {
                          return (
                            <SelectItem key={fre} value={fre.toString()}>
                              {frequency.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row divide-x divide-accent">
                <div className=" px-4 py-3 flex flex-col justify-start items-start gap-2 w-full text-base">
                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                    <div className="text-accent">Start Date</div>
                    <BadgeInfo size={14} />
                  </div>
                  <div className="flex flex-row justify-between items-center gap-2 w-full mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-fit justify-start text-left font-normal flex flex-row items-center border-accent text-white border-0"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                          {startDate ? (
                            format(startDate, "PPP") +
                            " " +
                            moment(startTimeValue, "HH:mm:ss").format("hh:mm A")
                          ) : (
                            <span className="text-white">Pick start date</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="w-full flex flex-row justify-center items-center mt-4">
                          <input
                            className="focus:outline-none text-black bg-transparent w-28"
                            type="time"
                            value={startTimeValue}
                            onChange={handleStartTimeChange}
                          />
                        </div>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={handleStartDaySelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className=" px-4 py-3 flex flex-col justify-start items-start gap-2 w-full text-base">
                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                    <div className="text-accent">End Date</div>
                    <BadgeInfo size={14} />
                  </div>
                  <div className="flex flex-row justify-between items-center gap-2 w-full mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "w-fit justify-start text-left font-normal flex flex-row items-center border-accent text-white border-0"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-white" />
                          {endDate ? (
                            format(endDate, "PPP") +
                            " " +
                            moment(endTimeValue, "HH:mm:ss").format("hh:mm A")
                          ) : (
                            <span className="text-white">Pick end date</span>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="w-full flex flex-row justify-center items-center mt-4">
                          <input
                            className="focus:outline-none text-black bg-transparent w-28"
                            type="time"
                            value={endTimeValue}
                            onChange={handleEndTimeChange}
                          />
                        </div>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={handleEndDaySelect}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="bg-transparent py-3 w-full bg-white text-black border border-accent hover:bg-transparent hover:text-white text-lg"
              disabled={isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const sessionKeyCall = await buildAddSessionKey(
                    chainId.toString()
                  );
                  const createJobCall = await buildDCAJob(
                    chainId.toString(),
                    address,
                    investValue,
                    Math.floor(startDate.getTime() / 1000),
                    Math.floor(endDate.getTime() / 1000),
                    convertToSeconds(
                      refreshInterval,
                      Frequency[frequency].label as any
                    ),
                    getChainById(Number(chainId))?.tokens[fromToken].address!,
                    getChainById(Number(chainId))?.tokens[targetToken].address!,
                    getChainById(Number(chainId))?.tokens[targetToken].vault ?? ZeroAddress
                  );
                  await sendTransaction(
                    chainId.toString(),
                    [sessionKeyCall, createJobCall],
                    validator,
                    address
                  );
                
                } catch (error) {
                  console.log(error)
                  if (
                    error instanceof WaitForUserOperationReceiptTimeoutError
                  ) {
                    const hashPattern = /hash\s"([^"]+)"/;
                    const match = error.message.match(hashPattern);

                    if (match && match[1]) {
                      const transactionHash = match[1];
                      console.log("Transaction hash:", transactionHash);
                      await waitForExecution(
                        chainId.toString(),
                        transactionHash
                      );
                    } else {
                      console.error(
                        "No transaction hash found in the error message."
                      );
                    }
                    // console.error("User operation timed out:", error.message);
                  } else {
                    console.log("Something went bad");
                  }
                }
                try {
                  const scheduleData = await buildScheduleData(chainId.toString(), nextSessionId)
                  await scheduleJob({ trigger: { startTime: Math.floor(startDate.getTime() / 1000), endTime: Math.floor(endDate.getTime() / 1000), interval: convertToSeconds(
                    refreshInterval,
                    Frequency[frequency].label as any
                  ) }, data: { call: { to: scheduleData.to, value: Number(scheduleData.value), data: scheduleData.data }, chainId: chainId.toString(), account: address }});

                  setDialogOpen(false);
                } catch (e) {
                  console.log("Schedule failed");
                }
                setInvestmentAdded(true);
                setIsLoading(false);
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your investement plan...
                </span>
              ) : (
                "Create Plan"
              )}
            </button>
          </DialogContent>
        </Dialog>
        </div>

          

          <div className="flex flex-col gap-2 w-full max-h-full h-24 px-4 pb-4 overflow-y-scroll flex-grow">
            

        <TabsContent  value="active" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-8 text-white w-full  max-h-full h-24 overflow-y-scroll flex-grow pt-5">

        {investments.filter(investment => investment.validUntil > Math.floor(Date.now() / 1000)).length > 0 ? (
    investments.filter(investment => investment.validUntil > Math.floor(Date.now() / 1000)).map((investment, index) => {
      const originalIndex = investments.findIndex(inv => inv === investment);
      return (
        <InvestmentCard
          key={index}
          investment={investment}
          jobExecution={jobExecutions[originalIndex]}
          chainId={chainId}
          address={address}
        />
      );
    })
  ) : (
    <div className="col-span-full flex flex-col items-center justify-center text-center p-8">
      <Image
        src="/icons/empty.png"
        alt="No active investments"
        width={75}
        height={75}
        className="mb-6"
      />
      <h3 className="text-2xl font-bold mb-2">No Active Investment Plans</h3>
      <p className="text-accent mb-4">You do not have any active investment plans at the moment.</p>
      <button 
        onClick={() => setDialogOpen(true)}
        className="bg-white text-black px-6 py-2  hover:bg-accent transition-colors hover:bg-transparent hover:text-white"
      >
        Create Your Plan
      </button>
    </div>
  )}
        </TabsContent>


      <TabsContent  value="history" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-x-12 gap-y-8" >

      {investments.filter( investment =>investment.validUntil < Math.floor(Date.now() / 1000)).map((investment, index) => {

        const originalIndex = investments.findIndex(inv => inv === investment);
        return (
          <InvestmentCard
          key={index}
          investment={investment}
          jobExecution={jobExecutions[originalIndex]}
          chainId={chainId}
          address={address}
        />
          )}
          )}
{/* </div> */}
</TabsContent>
</div>

        </Tabs>
        
      </div>
    </div>
  );
}