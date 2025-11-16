<!-- Example: How to protect pages with authentication -->

<!-- Add this script tag to any page you want to protect -->
<script src="../../js/auth-check.js"></script>

<!-- EXAMPLE 1: Check authentication on page load -->
<script>
// At the top of your page, add this to require login
document.addEventListener('DOMContentLoaded', () => {
  checkAuth(); // Will redirect to login if not authenticated
});
</script>

<!-- EXAMPLE 2: Get current user data -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (user) {
    console.log('Logged in as:', user.firstName, user.lastName);
    console.log('Email:', user.email);
    console.log('User ID:', user.userId);
  }
});
</script>

<!-- EXAMPLE 3: Make authenticated API call -->
<script>
async function getCustomerOrders() {
  try {
    const response = await authenticatedFetch(
      'http://localhost:5000/api/orders/customer/list',
      {
        method: 'GET'
      }
    );
    
    const data = await response.json();
    console.log('Orders:', data);
    // Display orders on page
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

// Call when page loads
document.addEventListener('DOMContentLoaded', getCustomerOrders);
</script>

<!-- EXAMPLE 4: Update user name in navbar -->
<script>
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI(); // This function is in auth-check.js
  // It will automatically update navbar with user's name and logout button
});
</script>

<!-- EXAMPLE 5: Handle logout -->
<script>
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  logout(); // Clears tokens and redirects to home
});
</script>

<!-- ========================================== -->
<!-- HOW TO ADD TO EXISTING PAGES -->
<!-- ========================================== -->

<!-- STEP 1: Add this to your HTML page (before </body>) -->
<script src="../../js/auth-check.js"></script>

<!-- STEP 2: Add this script to check auth -->
<script>
// Require authentication
checkAuth();

// Initialize auth UI
initAuthUI();

// Optional: Get current user
const user = getCurrentUser();
console.log('Welcome:', user?.firstName);
</script>

<!-- STEP 3: Use authenticated fetch for API calls -->
<script>
async function loadData() {
  const response = await authenticatedFetch(
    'http://localhost:5000/api/orders/customer/list'
  );
  const data = await response.json();
  // Use data...
}

document.addEventListener('DOMContentLoaded', loadData);
</script>

<!-- ========================================== -->
<!-- COMPLETE EXAMPLE: Protected Customer Page -->
<!-- ========================================== -->

<!DOCTYPE html>
<html>
<head>
    <title>My Orders - TasteNow</title>
    <link rel="stylesheet" href="../../assets/css/base.css">
</head>
<body>
    <header class="header">
        <nav class="navbar container">
            <a href="../../index.html" class="navbar-brand">TasteNow</a>
            <div class="navbar-menu">
                <a href="../../index.html" class="navbar-link">Home</a>
                <a href="restaurants.html" class="navbar-link">Restaurants</a>
                <a href="foods.html" class="navbar-link">Foods</a>
            </div>
            <div class="navbar-actions">
                <a href="cart.html" class="navbar-icon">
                    <i class="fas fa-shopping-cart"></i>
                </a>
                <!-- Auth UI will update here -->
            </div>
        </nav>
    </header>

    <main>
        <h1>My Orders</h1>
        <div id="ordersList"></div>
    </main>

    <!-- Include auth check script -->
    <script src="../../js/auth-check.js"></script>

    <!-- Protect page and load orders -->
    <script>
        // Step 1: Check if user is logged in (redirect if not)
        document.addEventListener('DOMContentLoaded', () => {
            checkAuth(); // This will redirect to login if not authenticated
            initAuthUI(); // Update navbar with user info
            loadOrders(); // Load user's orders
        });

        // Step 2: Function to load orders from API
        async function loadOrders() {
            try {
                const response = await authenticatedFetch(
                    'http://localhost:5000/api/orders/customer/list',
                    { method: 'GET' }
                );

                const orders = await response.json();
                displayOrders(orders);
            } catch (error) {
                console.error('Error loading orders:', error);
                document.getElementById('ordersList').innerHTML = 
                    '<p>Error loading orders. Please try again.</p>';
            }
        }

        // Step 3: Function to display orders
        function displayOrders(orders) {
            const container = document.getElementById('ordersList');
            
            if (orders.length === 0) {
                container.innerHTML = '<p>No orders yet. Start ordering!</p>';
                return;
            }

            let html = '<ul>';
            orders.forEach(order => {
                html += `
                    <li>
                        <strong>Order #${order.order_number}</strong><br>
                        Restaurant: ${order.restaurant_name}<br>
                        Status: ${order.status}<br>
                        Total: $${order.total_amount}
                    </li>
                `;
            });
            html += '</ul>';
            
            container.innerHTML = html;
        }

        // Step 4: Handle logout
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn') {
                logout();
            }
        });
    </script>
</body>
</html>

<!-- ========================================== -->
<!-- AVAILABLE FUNCTIONS -->
<!-- ========================================== -->

/*
From auth-check.js, these functions are available:

1. checkAuth(redirectToLogin = true)
   - Checks if user is logged in
   - Returns boolean
   - Optionally redirects to login

2. getCurrentUser()
   - Returns user object: { userId, firstName, lastName, email, userType, phone, city }
   - Returns null if not logged in

3. getAuthToken()
   - Returns JWT token string
   - Returns null if not logged in

4. authenticatedFetch(url, options = {})
   - Makes API call with auth headers
   - Auto-adds Authorization header
   - Auto-redirects to login on 401

5. logout()
   - Clears all auth data
   - Redirects to home page

6. initAuthUI()
   - Updates navbar with user name and logout button
   - Call on every page you want auth UI
*/
