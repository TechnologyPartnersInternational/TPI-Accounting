import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  clientName: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true, unique: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    industry: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
