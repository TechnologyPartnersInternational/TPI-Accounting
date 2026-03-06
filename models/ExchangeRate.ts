import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRate extends Document {
  ngnPerUsd: number;
  previousRate: number | null;
  changedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRateSchema: Schema<IExchangeRate> = new Schema(
  {
    ngnPerUsd: {
      type: Number,
      required: true,
      min: 0,
    },
    previousRate: {
      type: Number,
      default: null,
    },
    changedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically provides createdAt and updatedAt
  }
);

// We need to query this collection frequently, usually just sorting by date descending
ExchangeRateSchema.index({ createdAt: -1 });

// Prevent mongoose from compiling the model multiple times in development
const ExchangeRate: Model<IExchangeRate> = 
  mongoose.models.ExchangeRate || mongoose.model<IExchangeRate>("ExchangeRate", ExchangeRateSchema);

export default ExchangeRate;
