import { KernelValidator, PasskeyValidatorContractVersion, toPasskeyValidator, toWebAuthnKey, WebAuthnMode  } from "@zerodev/passkey-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants"
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { publicClient } from "./utils";
import { LocalAccount, privateKeyToAccount } from "viem/accounts";
import { encodeValidationData, OWNABLE_VALIDATOR_ADDRESS } from "@rhinestone/module-sdk";
import { passkeySessionValidator } from "./module";
import { Hex} from "viem";
import { ENTRYPOINT_ADDRESS_V07_TYPE } from "permissionless/types";
import { randomBytes } from "crypto";
import { loadPkey, storePkey } from "../utils/storage";



export async function connectPasskeyValidator(chainId: string, webAuthnKey: any) {

    return  await toPasskeyValidator(publicClient(parseInt(chainId)), {
      webAuthnKey,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_1
    })
  
}
  

export async function connectPassKeyAuth(passkeyName: string, type: WebAuthnMode ) {

return await toWebAuthnKey({
  passkeyName,
  passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
  mode: type,
  passkeyServerHeaders: {}
})

}



export function connectPKeyValidator() {

  let sessionPk = loadPkey()
  if(!sessionPk) {
     sessionPk = '0x' + randomBytes(32).toString('hex') as Hex;
     console.log(sessionPk)
     storePkey(sessionPk);
  }
  return privateKeyToAccount(sessionPk)

}


export async function connectPKeyAuth(passkeyName: string, type: WebAuthnMode ) {

  return await toWebAuthnKey({
    passkeyName,
    passkeyServerUrl: process.env.NEXT_PUBLIC_PASSKEY_SERVER_URL!,
    mode: type,
    passkeyServerHeaders: {}
  })
  
  }



  export async function getPKeySessionValidator(validator: LocalAccount) {
   
    return { address: OWNABLE_VALIDATOR_ADDRESS, initData: encodeValidationData({
  threshold: 1,
  owners: [validator.address],
})}
  }


  export async function  getPassKeySessionValidator(validator:  KernelValidator<ENTRYPOINT_ADDRESS_V07_TYPE>) {

   return { address: passkeySessionValidator as Hex, initData: await validator.getEnableData() as Hex}

  }


