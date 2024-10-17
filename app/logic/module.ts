import { Contract, formatUnits, getBytes, Interface, parseUnits } from "ethers";
import { getJsonRpcProvider } from "./web3";
import TokenVault from "./TokenVault.json";
import {  Address, Hex, SendTransactionParameters, createPublicClient, encodeAbiParameters, pad, http } from "viem";
import {
    getClient,
    getModule,
    getAccount,
    installModule,
    isModuleInstalled,
    ModuleType,
  } from "@rhinestone/module-sdk";
import { NetworkUtil } from "./networks";
import AutoDCAExecutor from "./AutoDCAExecutor.json";
import SessionValidator from "./SessionValidator.json";
import OFT from "./OFT.json";
import EntryPoint from "./EntryPoint.json"


import { SafeSmartAccountClient, getChain, getSmartAccountClient } from "./permissionless";
import { buildTransferToken, getRedeemBalance, getTokenDecimals, getVaultBalance, getVaultRedeemBalance, publicClient } from "./utils";
import { getDetails } from "./jobsAPI";
import { ENTRYPOINT_ADDRESS_V07, getPackedUserOperation, UserOperation } from "permissionless";


const webAuthnModule = "0xD990393C670dCcE8b4d8F858FB98c9912dBFAa06"
const autoDCAExecutor = "0x588532f232ED5E9e24B48116CA18AEca347E80e2"
const sessionValidator = "0xa128f9A221c8A0fC13eC23525511ee1448402eBf"
import { getChainId, signMessage } from "viem/actions"



export interface Transaction {
  to: Hex;
  value: bigint;
  data: Hex;
}

export const getModules = async (validator: any) => {

  
  const validators = [{ address: validator.address,
     context: await validator.getEnableData()}, 
     { address: sessionValidator,
      context: '0x' as Hex}]

    const executors = 
      [
     { address: autoDCAExecutor as Hex,
      context: '0x' as Hex}]

      return { validators, executors }
}

export const getSessionData = async (chainId: string, sessionId: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)
  const  { address} = await getDetails()


  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const sesionData = await autoDCA.getJobData(address);
  return sesionData;
}


export const getAllJobs = async (chainId: string, safeAccount: string): Promise<any> => {


  const provider = await getJsonRpcProvider(chainId)

  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  const jobData = await autoDCA.getJobData(safeAccount);
  return jobData;
}




export const sendTransaction = async (chainId: string, calls: Transaction[], walletProvider: any, safeAccount: Hex): Promise<any> => {

    // const call = { to: to as Hex, value: value, data: data }


    const bProvider = await getJsonRpcProvider(chainId)
    console.log(await bProvider.getBlock('latest'))


    const key = BigInt(pad(webAuthnModule as Hex, {
        dir: "right",
        size: 24,
      }) || 0
    )

    const signUserOperation = async function signUserOperation(userOperation: UserOperation<"v0.7">) {
      

      const provider = await getJsonRpcProvider(chainId)
  
      const entryPoint = new Contract(
          ENTRYPOINT_ADDRESS_V07,
          EntryPoint.abi,
          provider
      )
      
      let typedDataHash = getBytes(await entryPoint.getUserOpHash(getPackedUserOperation(userOperation)))

      console.log(await entryPoint.getUserOpHash(getPackedUserOperation(userOperation)))


      const client =  publicClient(parseInt(chainId))
      return await signMessage(client, { account: walletProvider, message:  {  raw: await entryPoint.getUserOpHash(getPackedUserOperation(userOperation)) } }) 
      }


    const smartAccount = await getSmartAccountClient( { chainId, nonceKey: key, address: safeAccount, signUserOperation: walletProvider.signUserOperation, getDummySignature: walletProvider.getDummySignature, 
      validators: (await getModules( walletProvider)).validators, executors: (await getModules( walletProvider)).executors })

    return await smartAccount.sendTransactions({ transactions: calls, account: smartAccount.account!});
}


export const buildVaultRedeem = async (chainId: string,  safeAccount: string, vault: Hex): Promise<Transaction> => {

    
  const provider = await getJsonRpcProvider(chainId);

  const vaultContract = new Contract(
      vault,
      TokenVault,
      provider
  )

  const vaultBalance = await getVaultRedeemBalance(vault, safeAccount, provider)

  return {
      to: vault,
      value: BigInt(0),
      data: (await vaultContract.redeem.populateTransaction(vaultBalance, safeAccount, safeAccount)).data as Hex
  }
}

export const buildTokenBridge = async (chainId: string,  safeAccount: string, oftAddress: Hex, _sendParam: any, _fee: any): Promise<Transaction> => {

    
  const provider = await getJsonRpcProvider(chainId);

  const oftContract = new Contract(
      oftAddress,
      OFT,
      provider
  )

  return {
      to: oftAddress,
      value: _fee.nativeFee,
      data: (await oftContract.send.populateTransaction(_sendParam, _fee, safeAccount)).data as Hex
  }
}

export const buildAddSessionKey = async (chainId: string): Promise<Transaction> => {

  const  { address } = await getDetails()
  const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [0])
  const currentTime = Math.floor(Date.now()/1000)
  const sessionKeyData = { target: autoDCAExecutor as Hex, funcSelector: execCallData.slice(0, 10) as Hex, validAfter: 0, validUntil: currentTime + 86400, active: true }


  const provider = await getJsonRpcProvider(chainId);

  const sessionKeyValidator = new Contract(
       sessionValidator,
       SessionValidator.abi,
      provider
  )

  return {
      to: sessionValidator,
      value: BigInt(0),
      data: (await sessionKeyValidator.enableSessionKey.populateTransaction(address, sessionKeyData)).data as Hex
  }
}

export const buildDCAJob = async (chainId: string,  safeAccount: string, amount: string, validAfter: number, validUntil: number, refreshInterval: number, fromToken: string, targetToken: string, vault: string): Promise<Transaction> => {

    
  const provider = await getJsonRpcProvider(chainId);

  console.log(await getTokenDecimals(fromToken, provider))

  const parsedAmount = parseUnits(amount, await  getTokenDecimals(fromToken, provider))

  // NOTE: ValidAfter is 0 because of forked time issue
  const sessionData = { vault: vault, token: fromToken, targetToken: targetToken,  account: safeAccount, validAfter: 0, validUntil: validUntil, limitAmount: parsedAmount, refreshInterval: refreshInterval }

  console.log(sessionData)
  const autoDCA = new Contract(
      autoDCAExecutor,
      AutoDCAExecutor.abi,
      provider
  )

  return {
      to: autoDCAExecutor,
      value: BigInt(0),
      data: (await autoDCA.createJob.populateTransaction(sessionData)).data as Hex
  }
}


export const buildScheduleData = async (chainId: string,  jobId: number): Promise<Transaction> => {

    
  console.log(jobId)
  const provider = await getJsonRpcProvider(chainId);

    const execCallData = new Interface(AutoDCAExecutor.abi).encodeFunctionData('executeJob', [jobId])



  return {
      to: autoDCAExecutor,
      value: BigInt(0),
      data: execCallData as Hex
  }
}



//     const call = { to: autoDCAModule as Hex, value: 0n, data: execCallData as Hex }




const buildInstallModule = async (chainId: number, safeAccount: Address, address: Address, type: ModuleType, initData: Hex): Promise<any> => {


    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});

    // Create the account object
    const account = getAccount({
            address: safeAccount,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: initData,
        type:  type,
      });

    const executions = await installModule({
        client,
        account,
        module: accountModule,
      });


      return {to: executions[0].target, value: executions[0].value.toString() , data: executions[0].callData}

}



export const isInstalled = async (chainId: number, safeAddress: Address, address: Address, type: ModuleType): Promise<boolean> => {



    const client = getClient({ rpcUrl: NetworkUtil.getNetworkById(chainId)?.url!});


    // Create the account object
    const account = getAccount({
            address: safeAddress,
            type: "safe",
        });


    const accountModule = getModule({
        module: address,
        initData: '0x',
        type:  type ,
      });

     
    try {  
    return await isModuleInstalled({
        client,
        account,
        module: accountModule,
      });
    }
    catch {
        return false;
    }

}


// export const addWebAuthnModule = async (safeClient: SafeSmartAccountClient, passKeyValidator: KernelValidator<ENTRYPOINT_ADDRESS_V07_TYPE>) => {


//     const buildWebAuthnModule = await buildInstallModule(safeClient.chain.id, safeClient.account.address, webAuthnModule, 'validator', await passKeyValidator.getEnableData() )

//     await safeClient.sendTransactions({ transactions:[{to: buildWebAuthnModule.to as Hex, value: BigInt(buildWebAuthnModule.value), data: buildWebAuthnModule.data as Hex}]})
    
// }
