"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWalletInfo as useDefaultWalletInfo } from "@web3modal/wagmi/react";
import {
  useAccount as useDefaultAccount,
  useDisconnect as useDefaultDisconnect,
  useEnsName,
  useEnsAvatar,
} from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import { loadAccountInfo, loadPasskey, removePasskey, storeAccountInfo } from "../utils/storage";
import { connectPKeyValidator, connectPasskeyValidator } from "../logic/auth";
import { getSmartAccountClient } from "../logic/permissionless";
import { normalize } from "viem/ens";
import useAccountStore from "../store/account/account.store";
import { getWebAuthnModule } from "../logic/module";
interface LoginContextProps {
  status: "loading"| "ready" | "notready",
  walletInfo: any;
  accountInfo: any;
  setWalletInfo: (info: any) => void;
  setAccountInfo: (info: any) => void;
  ensname: any;
  ensavatar: any;
  validator: any;
  pKeyValidator: any;
}
// Create the context
export const LoginContext = createContext<LoginContextProps>({
  status:  "loading",
  walletInfo: undefined,
  accountInfo: undefined,
  setWalletInfo: () => {},
  setAccountInfo: () => {},
  ensname: undefined,
  ensavatar: undefined,
  validator: undefined,
  pKeyValidator: undefined,
});

// Create the provider component
export const LoginProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const router = useRouter();

  const { chainId } = useAccountStore();
  const wallet = useDefaultWalletInfo();
  const account = useDefaultAccount();
  const [walletInfo, setWalletInfo] = useState<any>(wallet.walletInfo);
  const [walletStatus, setWalletStatus]= useState<"loading" | "ready" | "notready"> ("loading");
  const [accountInfo, setAccountInfo] = useState<any>(account);
  const [ensname, setEnsname] = useState<any>(undefined);
  const [ensavatar, setEnsavatar] = useState<any>(undefined);
  const [ validator, setValidator] = useState<any>(undefined);
  const [ pKeyValidator, setPKeyValidator] = useState<any>(undefined);


  const { data: _ensname } = useEnsName({ address: accountInfo?.address });
  const { data: _ensavatar } = useEnsAvatar({ name: normalize(_ensname!) });

  useEffect(() => {
    setEnsname(_ensname);
    setEnsavatar(_ensavatar);
  }, [_ensavatar, _ensname]);


  useEffect(() => {
    (async () => {
    // ..
    const _validator = connectPKeyValidator(); 
    setPKeyValidator(_validator);


    })();
  }, [  chainId ]);


  useEffect(() => {

    (async () => {
      const passkey = loadPasskey();
      if (passkey) {
        const _validator = await connectPasskeyValidator(chainId.toString(), passkey);

        setValidator(_validator);
      }
    })();
  }, [  chainId ]);

  useEffect(() => {

    (async () => {
      const passkey = loadPasskey();
      if (passkey) {
        const _validator = await connectPasskeyValidator(chainId.toString(), passkey);
        const accountClient = await getSmartAccountClient({
          chainId: chainId.toString(),
          validators: [ await getWebAuthnModule(_validator) ],
        });
        if (!accountInfo?.address) {
          setValidator(_validator);
          setWalletInfo({ name: "passkey", icon: "/icons/safe.svg" });
          setWalletStatus("ready");
          if (Object.keys(loadAccountInfo()).length === 0) {
      
            const initAccountInfo = {
                selected: 0,
                address: accountClient.account,
                accounts: [
                    { validator: "ownable", validatorInitData: "", salt: "0" },
                    { validator: "passkey", validatorInitData: "", salt: "0" },
                    { validator: "passkey", validatorInitData: "", salt: "0" }
                ]
            };
            storeAccountInfo(initAccountInfo); // Store the initial account info
        }
        const subAccountInfo = loadAccountInfo()
        if(subAccountInfo.accounts[1].validatorInitData == await _validator.getEnableData()) { 
          setAccountInfo(subAccountInfo.address);
          subAccountInfo.selected = 2

        }
        else{
          setAccountInfo(accountClient.account);
          subAccountInfo.selected = 0
        }
        storeAccountInfo(subAccountInfo)
        }
      } else {
        setWalletStatus("notready");
        setWalletInfo(wallet.walletInfo);
        if (account?.address && account?.address !== accountInfo?.address) {
          setAccountInfo(account);
        }
      }
    })();
  }, [wallet, account, accountInfo?.address]);

  useEffect(() => {
    if (!walletInfo && !loadPasskey()) {
      router.push("/");
    }
    if (walletInfo && pathname === "/") {
      router.push("/app");
    }
  }, [pathname, router, walletInfo, accountInfo]);

  return (
    <LoginContext.Provider
      value={{
        status: walletStatus,
        walletInfo,
        accountInfo,
        setWalletInfo,
        setAccountInfo,
        ensname,
        ensavatar,
        validator,
        pKeyValidator,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

// Custom hook to use the login context
export const useLoginProvider = () => {
  return useContext(LoginContext);
};

export const useWalletInfo = () => {
  return useContext(LoginContext);
};

export const useAccount = () => {
  return useContext(LoginContext).accountInfo;
};

export const useDisconnect = () => {
  const { disconnect: defaultDisconnect } = useDefaultDisconnect();
  const { setWalletInfo, setAccountInfo } = useContext(LoginContext);

  const disconnect = () => {
    defaultDisconnect();
    removePasskey();
    setWalletInfo(undefined);
    setAccountInfo({});
  };

  return { disconnect };
};