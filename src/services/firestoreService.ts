import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Campaign type from App.tsx
export interface Campaign {
  id: string;
  name: string;
  campaignType: string;
  difficulty: string;
  createdAt: number;
  updatedAt: number;
  tokenCounts: any;
  currentScenarioIndex: number;
  scenarios: any[];
  investigators: any[];
  statistics: any;
  notes: string;
  chaosBagModifications: string[];
}

const CAMPAIGNS_COLLECTION = 'campaigns';

/**
 * Get the campaigns collection path for a user
 */
const getUserCampaignsPath = (userId: string) => {
  return collection(db, 'users', userId, CAMPAIGNS_COLLECTION);
};

/**
 * Load all campaigns for a user
 */
export const loadCampaigns = async (userId: string): Promise<Campaign[]> => {
  try {
    const campaignsRef = getUserCampaignsPath(userId);
    const querySnapshot = await getDocs(campaignsRef);

    const campaigns: Campaign[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });

    return campaigns;
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return [];
  }
};

/**
 * Save a single campaign
 */
export const saveCampaign = async (userId: string, campaign: Campaign): Promise<void> => {
  try {
    const campaignRef = doc(db, 'users', userId, CAMPAIGNS_COLLECTION, campaign.id);
    await setDoc(campaignRef, {
      ...campaign,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error saving campaign:', error);
    throw error;
  }
};

/**
 * Save multiple campaigns (for initial migration)
 */
export const saveCampaigns = async (userId: string, campaigns: Campaign[]): Promise<void> => {
  try {
    const batch = writeBatch(db);

    campaigns.forEach((campaign) => {
      const campaignRef = doc(db, 'users', userId, CAMPAIGNS_COLLECTION, campaign.id);
      batch.set(campaignRef, {
        ...campaign,
        updatedAt: Date.now()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error saving campaigns:', error);
    throw error;
  }
};

/**
 * Update a campaign
 */
export const updateCampaign = async (
  userId: string,
  campaignId: string,
  updates: Partial<Campaign>
): Promise<void> => {
  try {
    const campaignRef = doc(db, 'users', userId, CAMPAIGNS_COLLECTION, campaignId);
    await updateDoc(campaignRef, {
      ...updates,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    throw error;
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (userId: string, campaignId: string): Promise<void> => {
  try {
    const campaignRef = doc(db, 'users', userId, CAMPAIGNS_COLLECTION, campaignId);
    await deleteDoc(campaignRef);
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time campaign updates
 */
export const subscribeToCampaigns = (
  userId: string,
  callback: (campaigns: Campaign[]) => void
): Unsubscribe => {
  const campaignsRef = getUserCampaignsPath(userId);

  return onSnapshot(campaignsRef, (snapshot) => {
    const campaigns: Campaign[] = [];
    snapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() } as Campaign);
    });
    callback(campaigns);
  }, (error) => {
    console.error('Error in campaigns subscription:', error);
  });
};

/**
 * Migrate campaigns from localStorage to Firestore
 */
export const migrateFromLocalStorage = async (userId: string): Promise<number> => {
  try {
    const STORAGE_KEY = 'arkham-chaos-bag';
    const localData = localStorage.getItem(STORAGE_KEY);

    if (!localData) {
      return 0;
    }

    const campaigns: Campaign[] = JSON.parse(localData);

    if (campaigns.length === 0) {
      return 0;
    }

    // Save all campaigns to Firestore
    await saveCampaigns(userId, campaigns);

    // Clear localStorage after successful migration
    localStorage.removeItem(STORAGE_KEY);

    console.log(`Migrated ${campaigns.length} campaigns to Firestore`);
    return campaigns.length;
  } catch (error) {
    console.error('Error migrating from localStorage:', error);
    throw error;
  }
};
