import { Schema, model } from 'mongoose';
import { ICredential } from '@/types';

const credentialSchema = new Schema<ICredential>({
  name: {
    type: String,
    required: [true, '名稱為必要資訊'],
  },
  externalId: {
    type: String,
    required: [ true, '外部 ID 為必要資訊' ],
    unique: true,
  },
  publicKey: {
    type: String,
    required: [true, '公鑰為必要資訊'],
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
});

export default model<ICredential>('Credential', credentialSchema);