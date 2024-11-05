import { WebAuthnKey  } from "@zerodev/webauthn-key";


export const storeAccountInfo = (accountInfo: Object) => {

    localStorage.setItem('subaccounts', JSON.stringify(accountInfo));
}


export const loadAccountInfo = (): any => {

    const accountInfo = localStorage.getItem('subaccounts');
    return accountInfo ? JSON.parse(accountInfo) : {};
}


export const storePasskey = (passkey: WebAuthnKey) => {
    
    localStorage.setItem('passkey', JSON.stringify({authenticatorId: passkey.authenticatorId,
         authenticatorIdHash: passkey.authenticatorIdHash ,
          pubX: passkey.pubX.toString(), pubY: passkey.pubY.toString()}));
}

export const removePasskey = () => {
    
    localStorage.removeItem('passkey');
}


export const loadPasskey = (): any => {

    const accountInfo = localStorage.getItem('passkey');
    return accountInfo ? JSON.parse(accountInfo) : undefined;
}