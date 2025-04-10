import {
  BasePriceRecord,
  PriceRecord,
  BaseUserProduct,
  UserProduct,
} from "../types";
import { db } from "../services/firebase/firebaseConfig";
import { COLLECTIONS } from "../constants/firebase";
import { doc, getDoc } from "firebase/firestore";

export class PriceRecordService {
  // async createRecord(userId: string, data: BasePriceRecord): Promise<string>;
  // async updateRecord(
  //   userId: string,
  //   recordId: string,
  //   data: Partial<BasePriceRecord>
  // ): Promise<void>;
  async getRecord(
    userId: string,
    recordId: string
  ): Promise<PriceRecord | null> {
    try {
      const recordPath = `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUB_COLLECTIONS.PRICE_RECORDS}`;
      const recordRef = doc(db, recordPath, recordId);
      const recordSnap = await getDoc(recordRef);

      if (!recordSnap.exists()) {
        return null;
      }

      return {
        id: recordSnap.id,
        ...recordSnap.data(),
      } as PriceRecord;
    } catch (error) {
      console.error("Error getting price record:", error);
      throw error;
    }
  }
}
