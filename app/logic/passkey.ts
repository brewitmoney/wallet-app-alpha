import { PasskeyValidatorContractVersion, toPasskeyValidator, toWebAuthnKey, WebAuthnMode  } from "@zerodev/passkey-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, http } from "viem";
import { getChain } from "./permissionless";
import { getChainId } from "viem/actions";
import { publicClient } from "./utils";



export async function connectValidator(chainId: string, webAuthnKey: any) {


  const chain = getChain(chainId);
  
  
  // const pimlicoEndpoint = `https://api.pimlico.io/v2/polygon/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
  const pimlicoEndpoint  = 'http://0.0.0.0:8545'
  
  
  // const client = createPublicClient({
  //   transport: http(publicClient(parseInt(chainId)))
  // })

  // console.log(await getChainId(publicClient))

    return  await toPasskeyValidator(publicClient(parseInt(chainId)), {
      webAuthnKey,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_1
    })
  
  }
  

export async function connectPassKey(passkeyName: string, type: WebAuthnMode ) {

return await toWebAuthnKey({
  passkeyName,
  passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
  mode: type,
  passkeyServerHeaders: {}
})


}
