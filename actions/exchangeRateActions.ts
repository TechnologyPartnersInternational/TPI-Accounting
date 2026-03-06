'use server';

import connectToDatabase from '@/lib/db';
import ExchangeRate from '@/models/ExchangeRate';
import { revalidatePath } from 'next/cache';

export interface ActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Returns the currently active exchange rate (the most recently created record).
 * Returns null if no rate has ever been set.
 */
export async function getCurrentRate(): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    // Fetch the single newest document
    const latestRate = await ExchangeRate.findOne().sort({ createdAt: -1 }).lean();
    
    if (!latestRate) {
      return { success: true, message: "No active rate found.", data: null };
    }
    
    // Convert to plain object to pass over Server Action boundary
    return {
      success: true,
      message: "Current rate fetched successfully",
      data: JSON.parse(JSON.stringify(latestRate))
    };
  } catch (error) {
    console.error("Error fetching current exchange rate:", error);
    return { success: false, message: "Failed to fetch current exchange rate." };
  }
}

/**
 * Returns the paginated history of all exchange rate changes.
 */
export async function getRateHistory(page: number = 1, limit: number = 10): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    const skip = (page - 1) * limit;
    
    const history = await ExchangeRate.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    const totalCount = await ExchangeRate.countDocuments();
      
    return {
      success: true,
      message: "Rate history fetched successfully",
      data: {
        history: JSON.parse(JSON.stringify(history)),
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        totalRecords: totalCount
      }
    };
  } catch (error) {
    console.error("Error fetching rate history:", error);
    return { success: false, message: "Failed to fetch rate history." };
  }
}

/**
 * Inserts a new exchange rate into the log, effectively making it the new active rate.
 */
export async function updateRate(newRate: number, adminName: string): Promise<ActionResponse> {
  try {
    await connectToDatabase();
    
    if (!newRate || newRate <= 0) {
      return { success: false, message: "Exchange rate must be greater than zero." };
    }
    if (!adminName) {
      return { success: false, message: "An admin author name is required to update rates." };
    }

    // Capture the existing rate so we immediately log it into the `previousRate` field
    // without having to compute rolling windows later
    const currentActive = await ExchangeRate.findOne().sort({ createdAt: -1 });
    
    const newRecord = new ExchangeRate({
      ngnPerUsd: newRate,
      previousRate: currentActive ? currentActive.ngnPerUsd : null,
      changedBy: adminName
    });
    
    const savedRecord = await newRecord.save();
    
    // Purge caches on dashboards displaying rates or reliant components
    revalidatePath('/settings/currency');
    revalidatePath('/', 'layout'); // Purge anything potentially doing live NGN computations
    
    return {
      success: true,
      message: "Exchange rate successfully updated.",
      data: JSON.parse(JSON.stringify(savedRecord))
    };
    
  } catch (error) {
    console.error("Error updating exchange rate:", error);
    return { success: false, message: "Failed to record new exchange rate." };
  }
}
