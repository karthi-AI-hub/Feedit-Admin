import { db, database } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ref, get } from 'firebase/database';

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

// Helper function to parse order date consistently with other pages
const parseOrderDate = (orderDate) => {
  if (!orderDate) return new Date(0);
  
  if (typeof orderDate === 'object' && orderDate.seconds) {
    // Firestore Timestamp object
    return new Date(orderDate.seconds * 1000);
  } else if (!isNaN(orderDate)) {
    // Numeric timestamp
    return new Date(Number(orderDate));
  } else {
    // String date
    return new Date(orderDate);
  }
};

// Fetch all orders for dashboard analytics
export const fetchDashboardOrders = async () => {
  try {
    const ordersCollection = collection(db, 'ORDERS');
    const ordersSnapshot = await getDocs(ordersCollection);
    return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching orders for dashboard:', error);
    return [];
  }
};

// Fetch all products for dashboard analytics
export const fetchDashboardProducts = async () => {
  try {
    const productsCollection = collection(db, 'products');
    const productsSnapshot = await getDocs(productsCollection);
    return productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products for dashboard:', error);
    return [];
  }
};

// Fetch all customers for dashboard analytics
export const fetchDashboardCustomers = async () => {
  try {
    const customersCollection = collection(db, 'USER');
    const customersSnapshot = await getDocs(customersCollection);
    return customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching customers for dashboard:', error);
    return [];
  }
};

// Calculate order statistics
export const calculateOrderStats = async () => {
  try {
    const orders = await fetchDashboardOrders();
    
    // Calculate total orders
    const totalOrders = orders.length;
    
    // Calculate active orders (PLACED, CONFIRMED)
    const activeOrders = orders.filter(order => 
      ['PLACED', 'CONFIRMED'].includes(order.orderStatus)
    ).length;
    
    // Calculate completed orders (DELIVERED)
    const completedOrders = orders.filter(order => 
      order.orderStatus === 'DELIVERED'
    ).length;
    
    // Calculate cancelled orders
    const cancelledOrders = orders.filter(order => 
      order.orderStatus === 'CANCELLED'
    ).length;
    
    // Calculate total revenue from delivered orders
    const totalRevenue = orders
      .filter(order => order.orderStatus === 'DELIVERED')
      .reduce((sum, order) => {
        // Use finalPrice if available, otherwise calculate from product data
        if (order.finalPrice) {
          return sum + (typeof order.finalPrice === 'number' ? order.finalPrice : parseFloat(order.finalPrice) || 0);
        } else if (order.totalSubPrice) {
          return sum + (typeof order.totalSubPrice === 'number' ? order.totalSubPrice : parseFloat(order.totalSubPrice) || 0);
        } else if (order.product?.salePrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.salePrice) || 0;
          return sum + (quantity * price);
        } else if (order.product?.regularPrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.regularPrice) || 0;
          return sum + (quantity * price);
        }
        return sum;
      }, 0);
    
    // Calculate previous month data for comparison
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthOrders = orders.filter(order => {
      const orderDate = parseOrderDate(order.orderDate);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const previousMonthOrders = orders.filter(order => {
      const orderDate = parseOrderDate(order.orderDate);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return orderDate.getMonth() === prevMonth && orderDate.getFullYear() === prevYear;
    });
    
    const currentMonthRevenue = currentMonthOrders
      .filter(order => order.orderStatus === 'DELIVERED')
      .reduce((sum, order) => {
        if (order.finalPrice) {
          return sum + (typeof order.finalPrice === 'number' ? order.finalPrice : parseFloat(order.finalPrice) || 0);
        } else if (order.totalSubPrice) {
          return sum + (typeof order.totalSubPrice === 'number' ? order.totalSubPrice : parseFloat(order.totalSubPrice) || 0);
        } else if (order.product?.salePrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.salePrice) || 0;
          return sum + (quantity * price);
        } else if (order.product?.regularPrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.regularPrice) || 0;
          return sum + (quantity * price);
        }
        return sum;
      }, 0);
    
    const previousMonthRevenue = previousMonthOrders
      .filter(order => order.orderStatus === 'DELIVERED')
      .reduce((sum, order) => {
        if (order.finalPrice) {
          return sum + (typeof order.finalPrice === 'number' ? order.finalPrice : parseFloat(order.finalPrice) || 0);
        } else if (order.totalSubPrice) {
          return sum + (typeof order.totalSubPrice === 'number' ? order.totalSubPrice : parseFloat(order.totalSubPrice) || 0);
        } else if (order.product?.salePrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.salePrice) || 0;
          return sum + (quantity * price);
        } else if (order.product?.regularPrice) {
          const quantity = order.product?.cartQuantity || 1;
          const price = parseFloat(order.product.regularPrice) || 0;
          return sum + (quantity * price);
        }
        return sum;
      }, 0);
    
    // Calculate percentage changes
    const totalOrdersChange = calculatePercentageChange(totalOrders, previousMonthOrders.length);
    const activeOrdersChange = calculatePercentageChange(activeOrders, previousMonthOrders.filter(o => 
      ['PLACED', 'CONFIRMED'].includes(o.orderStatus)
    ).length);
    const completedOrdersChange = calculatePercentageChange(completedOrders, previousMonthOrders.filter(o => 
      o.orderStatus === 'DELIVERED'
    ).length);
    const revenueChange = calculatePercentageChange(currentMonthRevenue, previousMonthRevenue);
    
    return [
      {
        title: "Total Orders",
        amount: totalOrders.toString(),
        change: `${totalOrdersChange >= 0 ? '+' : ''}${totalOrdersChange.toFixed(1)}%`,
        icon: "shopping-bag",
      },
      {
        title: "Active Orders",
        amount: activeOrders.toString(),
        change: `${activeOrdersChange >= 0 ? '+' : ''}${activeOrdersChange.toFixed(1)}%`,
        icon: "clock",
      },
      {
        title: "Completed Orders",
        amount: completedOrders.toString(),
        change: `${completedOrdersChange >= 0 ? '+' : ''}${completedOrdersChange.toFixed(1)}%`,
        icon: "check-circle",
      },
      {
        title: "Total Revenue",
        amount: formatCurrency(totalRevenue),
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        icon: "dollar-sign",
      },
    ];
  } catch (error) {
    console.error('Error calculating order stats:', error);
    return [
      { title: "Total Orders", amount: "0", change: "0%", icon: "shopping-bag" },
      { title: "Active Orders", amount: "0", change: "0%", icon: "clock" },
      { title: "Completed Orders", amount: "0", change: "0%", icon: "check-circle" },
      { title: "Total Revenue", amount: "₹0.00", change: "0%", icon: "dollar-sign" },
    ];
  }
};

// Get best selling products
export const getBestSellingProducts = async () => {
  try {
    const orders = await fetchDashboardOrders();
    const products = await fetchDashboardProducts();
    
    // Create a map of product sales
    const productSales = {};
    
    orders.forEach(order => {
      if (order.orderStatus === 'DELIVERED') {
        // Handle single product orders (like in Orders.jsx)
        if (order.product) {
          const productId = order.product.id || order.product.name;
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                id: productId,
                name: order.product.name || 'Unknown Product',
                sales: 0,
                revenue: 0,
                image: order.product.image || '/logo.svg',
                category: order.product.category || 'Feed'
              };
            }
            const quantity = parseInt(order.product.cartQuantity) || 1;
            const price = parseFloat(order.product.salePrice || order.product.regularPrice) || 0;
            productSales[productId].sales += quantity;
            productSales[productId].revenue += (quantity * price);
          }
        }
        
        // Handle orderItems array (like in OrderDetails.jsx)
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            if (!item) return; // Skip null/undefined items
            
            const productId = item.productId || item.id || item.name;
            if (productId) {
              if (!productSales[productId]) {
                productSales[productId] = {
                  id: productId,
                  name: item.productName || item.name || 'Unknown Product',
                  sales: 0,
                  revenue: 0,
                  image: item.productImage || item.image || '/logo.svg',
                  category: item.category || 'Feed'
                };
              }
              const quantity = parseInt(item.quantity) || 1;
              const price = parseFloat(item.price) || 0;
              productSales[productId].sales += quantity;
              productSales[productId].revenue += (quantity * price);
            }
          });
        }
      }
    });
    
    // Convert to array and sort by revenue
    const bestSelling = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        price: formatCurrency(product.revenue),
        sales: product.sales.toString(),
        image: product.image,
        category: product.category
      }));
    
    return bestSelling;
  } catch (error) {
    console.error('Error getting best selling products:', error);
    return [
      {
        name: "No products found",
        price: "₹0.00",
        sales: "0",
        image: "/logo.svg",
        category: "Feed"
      }
    ];
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
  try {
    const orders = await fetchDashboardOrders();
    
    // Sort orders by date (most recent first) and take the limit
    const recentOrders = orders
      .sort((a, b) => {
        const dateA = parseOrderDate(a.orderDate);
        const dateB = parseOrderDate(b.orderDate);
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(order => {
        // Calculate total items and price based on actual data structure
        let totalItems = 0;
        let totalPrice = 0;
        let productName = 'Unknown Product';
        
        // Handle single product orders (like in Orders.jsx)
        if (order.product) {
          totalItems = parseInt(order.product.cartQuantity) || 1;
          const price = parseFloat(order.product.salePrice || order.product.regularPrice) || 0;
          totalPrice = totalItems * price;
          productName = order.product.name || 'Unknown Product';
        }
        
        // Handle orderItems array (like in OrderDetails.jsx)
        if (order.orderItems && Array.isArray(order.orderItems)) {
          order.orderItems.forEach(item => {
            if (!item) return; // Skip null/undefined items
            const quantity = parseInt(item.quantity) || 1;
            const price = parseFloat(item.price) || 0;
            totalItems += quantity;
            totalPrice += quantity * price;
            if (!productName || productName === 'Unknown Product') {
              productName = item.productName || item.name || 'Multiple Products';
            }
          });
        }
        
        // Get customer name from address structure (like in OrderDetails.jsx)
        let customerName = 'Unknown Customer';
        if (order.address) {
          customerName = `${order.address.firstName || ''} ${order.address.lastName || ''}`.trim();
          if (!customerName) {
            customerName = order.address.email || 'Unknown Customer';
          }
        } else if (order.customerName) {
          customerName = order.customerName;
        } else if (order.customerId) {
          customerName = order.customerId;
        }
        
        return {
          id: `#${order.id}`,
          product: productName,
          date: formatDate(order.orderDate),
          items: totalItems,
          price: formatCurrency(totalPrice),
          customer: customerName,
          status: order.orderStatus || 'PLACED',
        };
      });
    
    return recentOrders;
  } catch (error) {
    console.error('Error getting recent orders:', error);
    return [];
  }
};

// Get dashboard summary data
export const getDashboardSummary = async () => {
  try {
    const [orderStats, bestSelling, recentOrders] = await Promise.all([
      calculateOrderStats(),
      getBestSellingProducts(),
      getRecentOrders(5)
    ]);
    
    return {
      orderStats,
      bestSelling,
      recentOrders
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return {
      orderStats: [],
      bestSelling: [],
      recentOrders: []
    };
  }
};

// Get sales data for charts
export const getSalesChartData = async (timeFrame = 'MONTHLY') => {
  try {
    const orders = await fetchDashboardOrders();
    
    // Filter delivered orders only
    const deliveredOrders = orders.filter(order => order.orderStatus === 'DELIVERED');
    
    // Group by time period based on timeFrame
    const salesData = {};
    
    deliveredOrders.forEach(order => {
      const orderDate = parseOrderDate(order.orderDate);
      let key;
      let displayName;
      
      switch (timeFrame) {
        case 'WEEKLY':
          const weekStart = new Date(orderDate);
          weekStart.setDate(orderDate.getDate() - orderDate.getDay());
          key = weekStart.toISOString().split('T')[0];
          displayName = `Week ${Math.ceil((orderDate.getDate() + weekStart.getDay()) / 7)}`;
          break;
        case 'MONTHLY':
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          displayName = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        case 'YEARLY':
          key = orderDate.getFullYear().toString();
          displayName = orderDate.getFullYear().toString();
          break;
        default:
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
          displayName = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!salesData[key]) {
        salesData[key] = { revenue: 0, displayName };
      }
      
      // Calculate revenue based on actual data structure
      let orderRevenue = 0;
      if (order.finalPrice) {
        orderRevenue = typeof order.finalPrice === 'number' ? order.finalPrice : parseFloat(order.finalPrice) || 0;
      } else if (order.totalSubPrice) {
        orderRevenue = typeof order.totalSubPrice === 'number' ? order.totalSubPrice : parseFloat(order.totalSubPrice) || 0;
      } else if (order.product?.salePrice) {
        const quantity = order.product?.cartQuantity || 1;
        const price = parseFloat(order.product.salePrice) || 0;
        orderRevenue = quantity * price;
      } else if (order.product?.regularPrice) {
        const quantity = order.product?.cartQuantity || 1;
        const price = parseFloat(order.product.regularPrice) || 0;
        orderRevenue = quantity * price;
      } else if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          if (!item) return;
          const quantity = parseInt(item.quantity) || 1;
          const price = parseFloat(item.price) || 0;
          orderRevenue += quantity * price;
        });
      }
      
      salesData[key].revenue += orderRevenue;
    });
    
    // Convert to array format for charts and sort by period
    return Object.entries(salesData)
      .map(([period, data]) => ({ 
        period: data.displayName, 
        revenue: Math.round(data.revenue * 100) / 100 // Round to 2 decimal places
      }))
      .sort((a, b) => {
        // Sort by actual period for proper chronological order
        const aPeriod = a.period;
        const bPeriod = b.period;
        return aPeriod.localeCompare(bPeriod);
      })
      .slice(-12); // Show last 12 periods for better visualization
  } catch (error) {
    console.error('Error getting sales chart data:', error);
    return [];
  }
};
