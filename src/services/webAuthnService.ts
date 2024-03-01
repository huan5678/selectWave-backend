import { User, Credential } from '@/models';
import { appError, successHandle } from "@/utils";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

import { AuthenticationResponseJSON } from '@simplewebauthn/server/script/deps';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';


export const config = {
  rpName: process.env.RP_NAME,
  rpID: process.env.RP_ID,
  origin: process.env.ORIGIN,
}

class WebAuthnService {
  static async generateWebAuthnRegistrationOptions(user) {
    const userCredentials = await Credential.find({ user: user._id });
    const excludeCredentials = userCredentials.map(cred => ({
      id: cred.externalId,
      type: 'public-key',
    }));

    const options = await generateRegistrationOptions({
      rpName: config.rpName,
      userID: user._id.toString(),
      userName: user.email, // 或者是 user.name，根據您的需求選擇
      userDisplayName: user.name, // 用戶顯示名稱，可以是 email 或其他
      excludeCredentials,
      attestationType: 'indirect',
      authenticatorSelection: { userVerification: 'preferred' },
    });

    return options;
  }

  static async verifyWebAuthnRegistrationResponse(body, user) {
    const expectedChallenge = body.challenge; // 從前端或會話中獲取
    const verification = await verifyRegistrationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
    });

    if (verification.verified) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      await Credential.create({
        user: user._id,
        externalId: credentialID,
        publicKey: credentialPublicKey,
        counter,
      });
    }

    return verification.verified;
  }

  static async generateWebAuthnAuthenticationOptions(user) {
    const userCredentials = await Credential.find({ user: user._id });
    const allowCredentials = userCredentials.map(cred => ({
      id: cred.externalId,
      type: 'public-key',
    }));

    const options = await generateAuthenticationOptions({
      allowCredentials,
      userVerification: 'preferred',
    });

    return options;
  }

  static async verifyWebAuthnAuthenticationResponse(body, user) {
    const credentialId = body.id; // 從前端傳來的 credential.id
    const credential = await Credential.findOne({ user: user._id, externalId: credentialId });

    if (!credential) {
      throw new Error('Credential not found');
    }

    const verification = await verifyAuthenticationResponse({
      credential: body,
      expectedChallenge: body.challenge, // 從前端或會話中獲取
      expectedOrigin: config.origin,
      expectedRPID: config.rpID,
      authenticator: {
        credentialID: credential.externalId,
        credentialPublicKey: credential.publicKey,
        counter: credential.counter,
      },
    });

    if (verification.verified) {
      credential.counter = verification.authenticationInfo.newCounter;
      await credential.save();
    }

    return verification.verified;
  }
}


export default WebAuthnService;
