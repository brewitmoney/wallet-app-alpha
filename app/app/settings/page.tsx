"use client";
import {
  findChainIndexByChainId,
  gasChainsTokens,
  getChainById,
  getTokenInfo,
} from "@/app/utils/tokens";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { BadgeDollarSign, CopyIcon, Plus } from "lucide-react";
import { useAccount, useLoginProvider } from "../../context/LoginProvider";
import Truncate from "@/app/utils/truncate";
import { CopytoClipboard } from "@/app/utils/copyclipboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { loadAccountInfo, storeAccountInfo } from "@/app/utils/storage";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LoadingIndicator from "@/components/ui/loader";
import { fixDecimal, getSpendableTokenInfo } from "@/app/logic/utils";
import { ZeroAddress } from "ethers";
import useAccountStore from "@/app/store/account/account.store";
import { buildEnableSmartSession, buildInstallModule, buildSmartSessionModule, passkeySessionValidator, sendTransaction, smartSession } from "@/app/logic/module";
import { connectPassKeyAuth, connectPasskeyValidator, connectPKeyValidator, getPassKeySessionValidator, getPKeySessionValidator } from "@/app/logic/auth";
import { Switch } from "@/components/ui/switch";
import { WebAuthnMode } from "@zerodev/webauthn-key";

const availableAccounts = [
  { type: "passkey", name: "Main Account", icon: "/icons/admin.svg" },
  { type: "ownable", name: "Spend Account (Burner)", icon: "/icons/send.svg" },
  { type: "passkey", name: "Spend Account (Passkey)", icon: "/icons/send.svg" },
  { type: "passkey", name: "Investment Account", icon: "/icons/investment.svg" },
];

export default function Settings() {
  

  const { validator, pKeyValidator } = useLoginProvider();
  const { chainId } = useAccountStore();

  const [ sessionValidator, setSessionValidator ] = useState<any>();
  const [gasChain, setGasChain] = useState<number>(0);
  const [ spendToken, setSpendToken ] = useState<number>(1);
  const [ spendAmount, setSpendAmount ] = useState<string>("0");
  const [ updating, setUpdating ] = useState(false);
  const [tokenDetails, setTokenDetails]: any = useState([]);
  const [selectedAccount, setSelectedAccount] = useState<number>(1);
  const [accountInfo, setAccountInfo] = useState<any>();

  const { address, isConnecting, isDisconnected } = useAccount();

  async function activateAccount() {

    let sessionValidator;
    if(selectedAccount ==1) {
      sessionValidator = await getPKeySessionValidator(pKeyValidator);
    }
    else {

      const passkey = await connectPassKeyAuth(
        `Brew Wallet (Spend Account)${new Date().toLocaleDateString("en-GB")}`,
        WebAuthnMode.Register
      );
      const validator = await connectPasskeyValidator(chainId.toString(), passkey)
      sessionValidator = await getPassKeySessionValidator(validator);

    }
    accountInfo.accounts[selectedAccount-1].validatorInitData = sessionValidator.initData;
    setAccountInfo(accountInfo)
    storeAccountInfo(accountInfo)
    setSessionValidator(sessionValidator)


    toast({
      success: true,
      title: "Subaccount activated!",
    });
  }

  useEffect(() => {

  (async () => {  

    const accountInfo = loadAccountInfo();
    console.log(accountInfo)
    setAccountInfo(accountInfo)

    try {
    console.log(pKeyValidator)
    if(accountInfo.accounts[selectedAccount-1].validatorInitData) {
    const sessionValidator = await getPKeySessionValidator(pKeyValidator)
    setSessionValidator(sessionValidator)
    }

}
catch(e) {

}


  })();

  }, [address, chainId, validator, pKeyValidator]);


  useEffect(() => {

    (async () => {  
  
      let tokens = getChainById(Number(chainId))?.tokens;
      let updatedTokens = [];
  
      try {
      if(address) {
      updatedTokens = await Promise.all(
        tokens!.map(async (token) => {
          const spendlimit =
            token.address == ZeroAddress ?
              {} : (await getSpendableTokenInfo(chainId.toString(), token.address!, address, sessionValidator));
  
          return {
            ...token,
            spendlimit, // Add the balance to each token
          };
        })
      );
      console.log(updatedTokens)
      setTokenDetails(updatedTokens)
    }
  }
  catch(e) {
  
  }
  
  
    })();
  
    }, [address, chainId, sessionValidator]);
  

  const FaqsData = [
    {
      question: "What is ZeroWallet?",
      answer:
        "ZeroWallet is a next-generation, omnichain wallet powered by LayerZero, enabling users to manage their crypto portfolios and interact with decentralized applications (dApps) across multiple blockchain networks. With smart features and gas-efficient cross-chain transactions, ZeroWallet offers a seamless user experience.",
    },
    {
      question: "What chains does ZeroWallet support?",
      answer:
        "ZeroWallet is designed to work across multiple chains, including Ethereum, Polygon, Binance Smart Chain, Arbitrum, Optimism, and more. It supports an omnichain environment, allowing seamless interaction with dApps on various networks.",
    },
    {
      question: "How does ZeroWallet handle gas fees?",
      answer:
        "ZeroWallet uses LayerZero’s technology to enable users to interact with any chain without needing to hold gas tokens for each specific network. You can pay transaction fees using the native tokens of the chains, eliminating the complexity of managing multiple gas tokens.",
    },
    {
      question: "Does ZeroWallet support NFTs?",
      answer:
        "Yes, ZeroWallet supports NFTs (Non-Fungible Tokens) across multiple chains. You can manage, trade, and interact with NFT collections directly from your wallet.",
    },
    {
      question: "Is ZeroWallet secure?",
      answer:
        "Yes, ZeroWallet prioritizes security, utilizing advanced cryptographic techniques and LayerZero’s secure messaging to ensure safe transactions across chains. Your private keys and assets are always under your control.",
    },
  ];
  return (
    <div className="border border-accent w-full h-full text-white p-4">
      <Tabs defaultValue="account" className="w-full h-full bg-transparent">
        <div className="flex flex-col md:flex-row gap-6 w-full h-full">
          <TabsList className="flex flex-row md:flex-col justify-start items-start h-fit w-full md:w-96 rounded-none bg-transparent text-xl border border-accent p-0 text-white divide-x md:divide-y divide-accent">
            <TabsTrigger
              className="py-3 w-full text-lg rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              value="account"
            >
              Accounts
            </TabsTrigger>
            <TabsTrigger
              className="py-3 w-full text-lg rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              value="chain"
            >
              Chain
            </TabsTrigger>
            <TabsTrigger
              className="py-3 w-full text-lg rounded-none data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              value="faqs"
            >
              FAQ{"'"}s
            </TabsTrigger>
          </TabsList>
          <div className=" flex flex-col gap-2 w-full h-fit border border-accent">
            <TabsContent className="mt-0" value="account">
              <div className="flex flex-col justify-between items-center gap-0 w-full">
                <div className="flex flex-row justify-between items-center w-full border-b border-accent px-4 py-3">
                  <h2 className="text-xl font-bold">Available Accounts</h2>

                  <Dialog>
                    <DialogTrigger
                      onClick={() => {}}
                      className="border border-accent px-6 py-2.5 bg-black text-white text-sm hover:border-white hover:text-white"
                    >
                      Manage Account
                    </DialogTrigger>
                    <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-black text-white dark:bg-white flex flex-col justify-start items-start gap-4 rounded-none sm:rounded-none max-w-lg w-[90vw] border border-accent">
                      <DialogHeader>
                        <DialogTitle>Manage your Sub Accounts</DialogTitle>
                        <DialogDescription>
                          Set limits and conditions for different accounts that are available.
                        </DialogDescription>
                        <div className="flex flex-col gap-0 justify-start items-start pt-4">
                          <DialogDescription className="font-semibold text-center w-full text-white">
                            Choose your account type and add spend limits/ actions limits etc.
                          </DialogDescription>


                          <div className="flex flex-col border border-accent w-full divide-y divide-accent gap-px">
                              <div className="grid grid-cols-1 md:grid-cols-2 w-full divide-y md:divide-x divide-accent">
                                <div className=" px-4 py-3 flex  flex-col justify-start items-start gap-2 w-full text-base">
                                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                                    <div className="text-accent">Spend Limit</div>
                                    <BadgeDollarSign size={14} />
                                  </div>

                        <div className="flex flex-row justify-center items-center gap-2">
                      <Select
                        defaultValue={selectedAccount.toString()}
                        value={selectedAccount.toString()}
                        onValueChange={async (e) => {
                          setSelectedAccount(parseInt(e));
                          let sessionValidator = {};
                          if(parseInt(e) == 1) {
                            sessionValidator = await getPKeySessionValidator(pKeyValidator);
                          }
                          else if(parseInt(e) == 2) {
                            sessionValidator = { address: (await getPassKeySessionValidator(validator)).address, initData: accountInfo.accounts[parseInt(e)-1].validatorInitData }                      
                          }
                          setSessionValidator(sessionValidator)
                        }}
                      >
                        <SelectTrigger className="w-full text-black h-full py-2.5 focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent border border-accent">
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAccounts.map((account, c) => {
                            if (c!=0) { return (
                              <SelectItem value={c.toString()} key={c}>
                                <div className="flex flex-row justify-start px-0 items-center gap-2">
                                  <Image
                                    src={account.icon}
                                    alt={account.name}
                                    width="20"
                                    style={{ color: "orange" }}
                                    height="20"
                                  />
                                  <h4>{account.name}</h4>
                                </div>
                              </SelectItem>
                            ); }
                          })}
                        </SelectContent>
                      </Select>
                    </div>        
                      </div>
                       <div className=" px-4 py-3 flex  flex-col justify-start items-start gap-2 w-full text-base">
                                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                                    <div className="text-accent">Setup Account</div>
                                    <BadgeDollarSign size={14} />
                                  </div>
                      <div className="flex flex-row justify-center items-center gap-2">
                      <div className="flex flex-row justify-center items-center gap-2 text-accent mt-2">
                    <h5>Activate Status </h5>
                    <Switch
                      className="bg-accent rounded-full data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-accent border border-accent"
                      checked={accountInfo && accountInfo.accounts && accountInfo.accounts[selectedAccount - 1] ? accountInfo.accounts[selectedAccount - 1].validatorInitData : false}               
                      onCheckedChange={(checked) => {
                        activateAccount();
                        // setEarnInterest(checked);
                      }}
                    />
                  </div>
                     
                              </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col border border-accent  divide-y divide-accent gap-px">
                              <div className="grid grid-cols-1  w-full divide-y md:divide-x divide-accent">
                                <div className=" px-4 py-3 flex  flex-col justify-start items-start gap-2 w-full text-base">
                                  <div className="flex flex-row justify-start items-center gap-1 text-accent text-sm">
                                    <div className="text-accent">Spend Limit</div>
                                    <BadgeDollarSign size={14} />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 w-full">
                                    <div className="flex flex-col">
                                      <input
                                        type="text"
                                        value={tokenDetails[spendToken]?.spendlimit?.limit}
                                        className="bg-transparent focus:outline-none w-full text-white text-4xl"
                                        onChange={async (e) => {
                                          const updatedTokenDetails = [...tokenDetails];
                                          // Update the limit for the specific token
                                          updatedTokenDetails[spendToken].spendlimit.limit = e.target.value;                                    
                                          console.log(updatedTokenDetails);
                                          // Set the updated token details
                                          setTokenDetails(updatedTokenDetails);
                                        }}
                                      />
                                    </div>

                                    <div className="flex flex-row justify-end items-center gap-2">
                                      <Select
                                        value={spendToken.toString()}
                                        onValueChange={async (e) => {
                                          setSpendToken(parseInt(e));
                                        }}
                                      >
                                        <SelectTrigger className=" w-[70%] h-35 bg-white px-2 py-2 border border-accent text-black flex flex-row gap-2 items-center justify-center text-sm rounded-full focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent">
                                          <SelectValue placeholder="From Token" />
                                        </SelectTrigger>

                                        <SelectContent>
                                          {tokenDetails.map(
                                            (token: any, f: number ) =>
                                              token.address != ZeroAddress && (
                                                <SelectItem
                                                  key={f}
                                                  value={f.toString()}
                                                >
                                                  <div className="flex flex-row justify-center items-center gap-2">
                                                    <Image
                                                      className="bg-white rounded-full"
                                                      src={token.icon}
                                                      alt={token.name}
                                                      width={25}
                                                      height={25}
                                                    />
                                                    <h3 className="truncate uppercase">
                                                      {token.name}
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
                            </div>
                          </div>

                          <div className="flex flex-row justify-between items-center w-full mt-5">
                            <h4 className="font-semibold">                             
                              
                              Current Spend Limits
                            </h4>
                          </div>


                          { tokenDetails.filter((token: any) => token.spendlimit?.limit > 0).map( ( token: any, key: number ) => 
                          
                          <div className="flex flex-row justify-between items-center w-full mt-5" key={key}>
                        <div className="flex flex-row justify-start items-center gap-2">

                            <Image
                                      src={
                                        token.icon!
                                      }
                                      alt="From Token"
                                      width={30}
                                      height={30}
                                    />
                            <h4 className="font-semibold">                             
                              
                            { token.fullname! }
                            </h4>
                            </div>
                            <div className="flex flex-row justify-start items-center gap-2">
                                 
                                    <div className="font-semibold text-green-500">
                                      
                                      { `${token.spendlimit?.limit}` }
                                    </div>
                                    <div className="text-red-500">
                                      
                                      { `(Spent: ${token.spendlimit?.spent})` }
                                    </div>
                                  
                                  <div className="font-semibold">
                                      {
                                  token.name!
                                      }
                                    </div>
                                </div> 
                          </div>
                        )}
                          <button
                            className="bg-white border border-accent hover:bg-transparent hover:text-white text-black w-full px-6 py-3 text-lg mt-8"
                            onClick={async () => {
                              try {

                                setUpdating(true);  
                                const enableTransactions = await buildSmartSessionModule(chainId.toString(), address)

                                const SpendLimits = tokenDetails
                                .filter((token: any) => token.spendlimit?.limit > 0)
                                .map( (token: any) => ({
                                  amount: token.spendlimit.limit,
                                  token: token.address,
                                }));
                            
                                // const sessionValidator = { address: passkeySessionValidator as Hex, initData: await validator.getEnableData() as Hex}

                                enableTransactions.push(await buildEnableSmartSession(chainId.toString(), SpendLimits, sessionValidator ))
                                await sendTransaction(chainId.toString(), enableTransactions, validator, address) 

                              } catch (e) {
                                console.log("Failed to withdraw", e);
                              }
                              setUpdating(false);  
                            }}
                          >
                            { updating ? <LoadingIndicator text="Updating ..." color="#000"/> : <>Update Account </> }
                          </button>
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex flex-col w-full  px-4 py-4">
                  <div className="flex flex-row justify-between items-start">
                    <h3>Safe Account Address</h3>
                    <div className="flex flex-row justify-center items-center gap-2">
                      <h4>{Truncate(address, 24, "...")}</h4>
                      <button
                        onClick={() => {
                          CopytoClipboard(address || "");
                          toast({
                            success: true,
                            title: "Copy Address",
                            description:
                              "Adderess copied to clipboard successfully!",
                          });
                        }}
                        className="flex flex-row"
                      >
                        <CopyIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full  px-4 py-4">
                  <div className="flex flex-row justify-between items-start">
                    <h3>Selected Account</h3>

                    <div className="flex flex-row justify-center items-center gap-2">
                    <Select
                        defaultValue={accountInfo?.selected?.toString()} // Use accountInfo.selected for defaultValue
                        value={accountInfo?.selected?.toString()} // Ensure the Select reflects accountInfo.selected
                        onValueChange={(e) => {
                          const newSelectedAccount = parseInt(e);
                          accountInfo.selected = newSelectedAccount; // Update accountInfo.selected
                          setAccountInfo({ ...accountInfo }); // Trigger re-render by creating a new object
                          storeAccountInfo(accountInfo);
                        }}
                      >
                        <SelectTrigger className="w-full text-black h-full py-2.5 focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent border border-accent">
                          <SelectValue placeholder="Select chain" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAccounts.map((account, c) => {
                            return (
                              <SelectItem value={c.toString()} key={c}>
                                <div className="flex flex-row justify-start px-0 items-center gap-2">
                                  <Image
                                    src={account.icon}
                                    alt={account.name}
                                    width="20"
                                    style={{ color: "orange" }}
                                    height="20"
                                  />
                                  <h4>{account.name}</h4>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="chain">
              <div className="flex flex-col justify-between items-center gap-0 w-full">
                <div className="flex flex-row justify-between items-center w-full border-b border-accent px-4 py-3">
                  <h2 className="text-xl font-bold">Set Chain</h2>
                  <div className="flex flex-row justify-center items-center gap-4">
                    <h3 className="text-sm hidden md:block">
                      Supported Chains
                    </h3>
                    <div className="flex flex-row justify-center items-center">
                      {gasChainsTokens.map((show, s) => {
                        return (
                          <Image
                            className="-ml-2"
                            src={show.icon}
                            width={25}
                            height={25}
                            alt={show.name}
                            key={s}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2 py-8 w-80 px-4">
                <Select
                  defaultValue={gasChain.toString()}
                  value={gasChain.toString()}
                  onValueChange={(e) => setGasChain(parseInt(e))}
                >
                  <SelectTrigger className="w-full text-black h-full py-2.5 focus:outline-none focus:ring-offset-0 focus:ring-0 focus:ring-accent border border-accent">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {gasChainsTokens.map((chain, c) => {
                      return (
                        <SelectItem value={c.toString()} key={c}>
                          <div className="flex flex-row justify-start px-0 items-center gap-2">
                            <Image
                              src={chain.icon}
                              alt={chain.name}
                              width="20"
                              height="20"
                            />
                            <h4>{chain.name}</h4>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <div className="flex flex-row justify-end items-center">
                  <button
                    className="bg-black text-white border border-accent hover:bg-white hover:text-black px-4 py-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </TabsContent>
            <TabsContent className="mt-0" value="faqs">
              <div className="flex flex-row justify-between items-center w-full border-b border-accent px-4 py-3">
                <h2 className="text-xl font-bold">
                  Frequently Asked Questions
                </h2>
                <div className="flex flex-row justify-center items-center gap-4"></div>
              </div>
              <div className="px-4 py-0">
                <Accordion
                  className=" divide-y divide-accent text-left"
                  type="single"
                >
                  {FaqsData.map((faq, f) => {
                    return (
                      <AccordionItem
                        className="border-b-0 py-1 text-left"
                        value={f.toString()}
                        key={f}
                      >
                        <AccordionTrigger className=" hover:no-underline text-base font-bold text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
