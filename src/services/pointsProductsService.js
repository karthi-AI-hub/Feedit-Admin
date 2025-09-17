import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy,
  query 
} from 'firebase/firestore';

const COLLECTION_NAME = 'rewards';
export const checkDuplicates = async (coins, productId, excludeId = null) => {
  try {
    const coinsValue = parseInt(coins);
    if (isNaN(coinsValue) || coinsValue <= 0) {
      return { success: false, error: 'Invalid coins value' };
    }

    if (!productId || typeof productId !== 'string') {
      return { success: false, error: 'Invalid product ID' };
    }

    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const existingEntries = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Exclude the current item when updating
      if (excludeId && doc.id === excludeId) return;
      
      existingEntries.push({
        id: doc.id,
        coins: data.coins,
        productId: data.productId,
        productName: data.productName
      });
    });

    const coinsExists = existingEntries.find(entry => {
      const entryCoins = typeof entry.coins === 'number' ? entry.coins : parseInt(entry.coins);
      return entryCoins === coinsValue;
    });
    
    const productExists = existingEntries.find(entry => 
      entry.productId && entry.productId.toString() === productId.toString()
    );

    return {
      success: true,
      coinsExists,
      productExists,
      duplicates: { coinsExists: !!coinsExists, productExists: !!productExists }
    };
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return { success: false, error: error.message };
  }
};

export const addPointsProduct = async (pointsProductData) => {
  try {
    const duplicateCheck = await checkDuplicates(pointsProductData.coins, pointsProductData.productId);
    
    if (!duplicateCheck.success) {
      return { success: false, error: 'Failed to check duplicates' };
    }

    if (duplicateCheck.coinsExists) {
      return { 
        success: false, 
        error: `${pointsProductData.coins} coins are already assigned to "${duplicateCheck.coinsExists.productName}"` 
      };
    }

    if (duplicateCheck.productExists) {
      return { 
        success: false, 
        error: `Product "${pointsProductData.productName}" is already assigned to ${duplicateCheck.productExists.coins} coins` 
      };
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...pointsProductData,
      coins: parseInt(pointsProductData.coins),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding points-product:', error);
    return { success: false, error: error.message };
  }
};

export const getPointsProducts = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const pointsProducts = [];
    querySnapshot.forEach((doc) => {
      pointsProducts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return { success: true, data: pointsProducts };
  } catch (error) {
    console.error('Error getting points-products:', error);
    return { success: false, error: error.message };
  }
};

export const updatePointsProduct = async (id, updateData) => {
  try {
    const duplicateCheck = await checkDuplicates(updateData.coins, updateData.productId, id);
    
    if (!duplicateCheck.success) {
      return { success: false, error: 'Failed to check duplicates' };
    }

    if (duplicateCheck.coinsExists) {
      return { 
        success: false, 
        error: `${updateData.coins} coins are already assigned to "${duplicateCheck.coinsExists.productName}"` 
      };
    }

    if (duplicateCheck.productExists) {
      return { 
        success: false, 
        error: `Product "${updateData.productName}" is already assigned to ${duplicateCheck.productExists.coins} coins` 
      };
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updateData,
      coins: parseInt(updateData.coins),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating points-product:', error);
    return { success: false, error: error.message };
  }
};

export const deletePointsProduct = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting points-product:', error);
    return { success: false, error: error.message };
  }
};