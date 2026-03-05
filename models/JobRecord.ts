import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobRecord extends Document {
  clientName: string;
  jobDescription: string;
  category: string;
  agreedPrice: number;
  amountPaid: number;
  outstandingBalance: number;
  currency: 'NGN' | 'USD';
  dueDate: Date;
  startDate: Date;
  completionDate?: Date;
  internalNotes?: string;
  status: 'Ongoing' | 'Completed' | 'Pending' | 'Overdue';
  createdAt: Date;
  updatedAt: Date;
}

const JobRecordSchema: Schema = new Schema(
  {
    clientName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    category: { type: String, required: true },
    agreedPrice: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number },
    currency: { type: String, enum: ['NGN', 'USD'], required: true },
    dueDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    completionDate: { type: Date },
    internalNotes: { type: String },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'Pending', 'Overdue'],
      required: true,
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate outstanding balance before saving
JobRecordSchema.pre('save', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = this as any;
  if (doc.isModified('agreedPrice') || doc.isModified('amountPaid')) {
    doc.outstandingBalance = doc.agreedPrice - (doc.amountPaid || 0);
  }
  if (typeof next === 'function') {
    (next as () => void)();
  }
});

export const JobRecord: Model<IJobRecord> =
  mongoose.models.JobRecord || mongoose.model<IJobRecord>('JobRecord', JobRecordSchema);
