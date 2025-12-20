import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { restaurantDashboardAPI, restaurantMenuAPI, restaurantOrderAPI } from '../utils/api';

// Initial state
const initialState = {
  restaurant: null,
  stats: {
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    avgRating: 0
  },
  orders: [],
  menuItems: [],
  categories: [],
  recentOrders: [],
  loading: false,
  error: null,
  lastUpdated: null
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_RESTAURANT: 'SET_RESTAURANT',
  SET_STATS: 'SET_STATS',
  SET_ORDERS: 'SET_ORDERS',
  SET_MENU_ITEMS: 'SET_MENU_ITEMS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_RECENT_ORDERS: 'SET_RECENT_ORDERS',
  UPDATE_ORDER_STATUS: 'UPDATE_ORDER_STATUS',
  ADD_MENU_ITEM: 'ADD_MENU_ITEM',
  UPDATE_MENU_ITEM: 'UPDATE_MENU_ITEM',
  DELETE_MENU_ITEM: 'DELETE_MENU_ITEM',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_RESTAURANT_STATUS: 'UPDATE_RESTAURANT_STATUS',
  SET_LAST_UPDATED: 'SET_LAST_UPDATED'
};

// Reducer
const restaurantReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_RESTAURANT:
      return { ...state, restaurant: action.payload };
    
    case ActionTypes.SET_STATS:
      return { ...state, stats: action.payload };
    
    case ActionTypes.SET_ORDERS:
      return { ...state, orders: action.payload };
    
    case ActionTypes.SET_MENU_ITEMS:
      return { ...state, menuItems: action.payload };
    
    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    
    case ActionTypes.SET_RECENT_ORDERS:
      return { ...state, recentOrders: action.payload };
    
    case ActionTypes.UPDATE_ORDER_STATUS:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.order_id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        ),
        recentOrders: state.recentOrders.map(order =>
          order.order_id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    
    case ActionTypes.ADD_MENU_ITEM:
      return {
        ...state,
        menuItems: [...state.menuItems, action.payload]
      };
    
    case ActionTypes.UPDATE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case ActionTypes.DELETE_MENU_ITEM:
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.payload)
      };
    
    case ActionTypes.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    
    case ActionTypes.UPDATE_RESTAURANT_STATUS:
      return {
        ...state,
        restaurant: { ...state.restaurant, is_open: action.payload }
      };
    
    case ActionTypes.SET_LAST_UPDATED:
      return { ...state, lastUpdated: action.payload };
    
    default:
      return state;
  }
};

// Context
const RestaurantContext = createContext();

// Provider component
export const RestaurantProvider = ({ children }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ActionTypes.SET_ERROR, payload: error }),

    // Dashboard actions
    fetchDashboardData: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await restaurantDashboardAPI.getDashboard();
        
        if (response.data && response.data.success) {
          const payload = response.data.data || {};
          dispatch({ type: ActionTypes.SET_RESTAURANT, payload: payload.restaurant || {} });
          dispatch({ type: ActionTypes.SET_STATS, payload: {
            todayOrders: payload.statistics?.todayOrders || 0,
            todayRevenue: payload.statistics?.todayRevenue || 0,
            pendingOrders: payload.statistics?.pendingOrders || 0,
            avgRating: payload.statistics?.averageRating || 0
          }});
          dispatch({ type: ActionTypes.SET_RECENT_ORDERS, payload: payload.recentOrders || [] });
        }
        dispatch({ type: ActionTypes.SET_LAST_UPDATED, payload: new Date() });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    refreshDashboardData: async () => {
      try {
        const response = await restaurantDashboardAPI.getDashboard();
        if (response.data && response.data.success) {
          const payload = response.data.data || {};
          dispatch({ type: ActionTypes.SET_STATS, payload: {
            todayOrders: payload.statistics?.todayOrders || 0,
            todayRevenue: payload.statistics?.todayRevenue || 0,
            pendingOrders: payload.statistics?.pendingOrders || 0,
            avgRating: payload.statistics?.averageRating || 0
          }});
          dispatch({ type: ActionTypes.SET_RECENT_ORDERS, payload: payload.recentOrders || [] });
        }
      } catch (error) {
        console.error('Error refreshing dashboard data:', error);
      }
    },

    // Order actions
    fetchOrders: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await restaurantOrderAPI.getOrders();
        dispatch({ type: ActionTypes.SET_ORDERS, payload: response.data.orders || [] });
      } catch (error) {
        console.error('Error fetching orders:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    refreshOrders: async () => {
      try {
        const response = await restaurantOrderAPI.getOrders();
        dispatch({ type: ActionTypes.SET_ORDERS, payload: response.data.orders || [] });
      } catch (error) {
        console.error('Error refreshing orders:', error);
      }
    },

    updateOrderStatus: async (orderId, status) => {
      try {
        await restaurantOrderAPI.updateOrderStatus(orderId, status);
        dispatch({ type: ActionTypes.UPDATE_ORDER_STATUS, payload: { orderId, status } });
        // Refresh stats after order status change
        actions.refreshDashboardData();
        return { success: true };
      } catch (error) {
        console.error('Error updating order status:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    // Menu actions
    fetchMenuData: async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const [itemsRes, categoriesRes] = await Promise.all([
          restaurantMenuAPI.getItems(),
          restaurantMenuAPI.getCategories()
        ]);
        dispatch({ type: ActionTypes.SET_MENU_ITEMS, payload: itemsRes.data.items || [] });
        dispatch({ type: ActionTypes.SET_CATEGORIES, payload: categoriesRes.data.categories || [] });
      } catch (error) {
        console.error('Error fetching menu data:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    addMenuItem: async (itemData) => {
      try {
        const response = await restaurantMenuAPI.createItem(itemData);
        if (response.data.success) {
          // Refresh menu data to get the new item with proper ID
          actions.fetchMenuData();
          return { success: true };
        }
      } catch (error) {
        console.error('Error adding menu item:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    updateMenuItem: async (id, itemData) => {
      try {
        const response = await restaurantMenuAPI.updateItem(id, itemData);
        if (response.data.success) {
          // Refresh menu data to get updated item
          actions.fetchMenuData();
          return { success: true };
        }
      } catch (error) {
        console.error('Error updating menu item:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    deleteMenuItem: async (id) => {
      try {
        const response = await restaurantMenuAPI.deleteItem(id);
        if (response.data.success) {
          dispatch({ type: ActionTypes.DELETE_MENU_ITEM, payload: id });
          return { success: true };
        }
      } catch (error) {
        console.error('Error deleting menu item:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    addCategory: async (categoryData) => {
      try {
        const response = await restaurantMenuAPI.createCategory(categoryData);
        if (response.data.success) {
          // Refresh categories to get the new category with proper ID
          const categoriesRes = await restaurantMenuAPI.getCategories();
          dispatch({ type: ActionTypes.SET_CATEGORIES, payload: categoriesRes.data.categories || [] });
          return { success: true };
        }
      } catch (error) {
        console.error('Error adding category:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    updateRestaurantStatus: (isOpen) => {
      dispatch({ type: ActionTypes.UPDATE_RESTAURANT_STATUS, payload: isOpen });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.loading) {
        actions.refreshDashboardData();
        actions.refreshOrders();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.loading]);

  return (
    <RestaurantContext.Provider value={{ state, actions }}>
      {children}
    </RestaurantContext.Provider>
  );
};

// Custom hook to use the context
export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export default RestaurantContext;