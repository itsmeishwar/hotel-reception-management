export interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: 'none' | 'mild' | 'medium' | 'hot' | 'extra_hot';
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  rating?: number;
  popularity?: number;
}

export interface FoodStats {
  totalItems: number;
  categories: number;
  availableItems: number;
  vegetarianItems: number;
  averagePrice: number;
}

// Mock Data
let mockFoodItems: FoodItem[] = [
  {
    id: 'F001',
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 350,
    description: 'Cottage cheese cubes in rich tomato gravy',
    isAvailable: true,
    preparationTime: 20,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: 'mild',
    calories: 450
  },
  {
    id: 'F002',
    name: 'Chicken Biryani',
    category: 'Rice & Biryani',
    price: 450,
    description: 'Aromatic basmati rice cooked with spiced chicken',
    isAvailable: true,
    preparationTime: 30,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    spiceLevel: 'medium',
    calories: 650
  },
  {
    id: 'F003',
    name: 'Butter Naan',
    category: 'Breads',
    price: 60,
    description: 'Soft indian flatbread cooked in clay oven',
    isAvailable: true,
    preparationTime: 10,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'none',
    calories: 250
  },
   {
    id: 'F004',
    name: 'Gulab Jamun',
    category: 'Dessert',
    price: 120,
    description: 'Soft milk solids dumplings dipped in sugar syrup',
    isAvailable: false,
    preparationTime: 5,
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: 'none',
    calories: 300
  }
];

export const fetchFoodItems = async (): Promise<FoodItem[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockFoodItems]), 500);
  });
};

export const fetchFoodStats = async (): Promise<FoodStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const uniqueCategories = new Set(mockFoodItems.map(item => item.category)).size;
      const totalItems = mockFoodItems.length;
      const totalPrice = mockFoodItems.reduce((sum, item) => sum + item.price, 0);
      
      resolve({
        totalItems,
        categories: uniqueCategories,
        availableItems: mockFoodItems.filter(item => item.isAvailable).length,
        vegetarianItems: mockFoodItems.filter(item => item.isVegetarian).length,
        averagePrice: totalItems > 0 ? Math.round(totalPrice / totalItems) : 0
      });
    }, 500);
  });
};

export const createFoodItem = async (data: Omit<FoodItem, 'id'>): Promise<FoodItem> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      const newItem: FoodItem = {
        ...data,
        id: `F${String(mockFoodItems.length + 1).padStart(3, '0')}`
      };
      mockFoodItems = [newItem, ...mockFoodItems];
      resolve(newItem);
    }, 500);
  });
};

export const updateFoodItem = async (id: string, data: Partial<FoodItem>): Promise<FoodItem> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockFoodItems.findIndex(f => f.id === id);
      if (index === -1) {
        reject(new Error('Food item not found'));
        return;
      }
      const updatedItem = { ...mockFoodItems[index], ...data };
      mockFoodItems[index] = updatedItem;
      resolve(updatedItem);
    }, 500);
  });
};

export const deleteFoodItem = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
    setTimeout(() => {
      mockFoodItems = mockFoodItems.filter(f => f.id !== id);
      resolve();
    }, 500);
  });
};

export const toggleFoodAvailability = async (id: string, isAvailable: boolean): Promise<FoodItem> => {
  return updateFoodItem(id, { isAvailable });
};