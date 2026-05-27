import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import ReturnsPage from "./pages/ReturnsPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import OrderDetailsPage from "./pages/OrderDetailsPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import ElectronicsPage from "./pages/ElectronicsPage.tsx";
import FashionPage from "./pages/FashionPage.tsx";
import FurniturePage from "./pages/FurniturePage.tsx";
import MobilesPage from "./pages/MobilesPage.tsx";
import CustomerDashboard from "./pages/CustomerDashboard.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import DeliveryDashboard from "./pages/DeliveryDashboard.tsx";
import CategoryManagement from "./pages/CategoryManagement.tsx";
import ProductManagement from "./pages/ProductManagement.tsx";
import AddProductPage from "./pages/AddProductPage.tsx";
import EditProductPage from "./pages/EditProductPage.tsx";
import CategoryProductsPage from "./pages/CategoryProductsPage.tsx";
import ProductDetailsPage from "./pages/ProductDetailsPage.tsx";
import BrandPartnerships from "./pages/BrandPartnerships.tsx";
import BrandManagement from "./pages/BrandManagement.tsx";
import WishlistPage from "./pages/WishlistPage.tsx";
import DealsPage from "./pages/DealsPage.tsx";
import RecommendedPage from "./pages/RecommendedPage.tsx";
import SponsoredPage from "./pages/SponsoredPage.tsx";
import ExploreProductsPage from "./pages/ExploreProductsPage.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { CategoryProvider } from "./context/CategoryContext.tsx";
import { BrandProvider } from "./context/BrandContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { NotificationProvider } from "./context/NotificationContext.tsx";
import { UserNotificationsProvider } from "./context/UserNotificationsContext.tsx";
import { WishlistProvider } from "./context/WishlistContext.tsx";
import { SearchProvider } from "./context/SearchContext.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthProvider>
        <CategoryProvider>
          <BrandProvider>
            <CartProvider>
              <NotificationProvider>
                <UserNotificationsProvider>
                  <WishlistProvider>
                    <SearchProvider>
                      <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/returns" element={<ReturnsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/recommended" element={<RecommendedPage />} />
                <Route path="/sponsored" element={<SponsoredPage />} />
                <Route path="/explore" element={<ExploreProductsPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Brand Partnership Pages */}
                <Route path="/brand-partnerships" element={<BrandPartnerships />} />
                <Route path="/admin/brands" element={<BrandManagement />} />
                
                {/* Category Pages */}
                <Route path="/category/:categoryId" element={<CategoryProductsPage />} />
                <Route path="/product/:productId" element={<ProductDetailsPage />} />
                <Route path="/electronics" element={<ElectronicsPage />} />
                <Route path="/fashion" element={<FashionPage />} />
                <Route path="/furniture" element={<FurniturePage />} />
                <Route path="/mobiles" element={<MobilesPage />} />
                
                {/* Protected routes by role */}
                <Route
                  path="/customer-dashboard"
                  element={
                    <ProtectedRoute roles={["CUSTOMER"]}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seller-dashboard"
                  element={
                    <ProtectedRoute roles={["SELLER"]}>
                      <SellerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery-dashboard"
                  element={
                    <ProtectedRoute roles={["DELIVERY_PARTNER"]}>
                      <DeliveryDashboard />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute roles={["ADMIN"]}>
                      <CategoryManagement />
                    </ProtectedRoute>
                  }
                />
                
                {/* Seller Routes */}
                <Route
                  path="/seller/products/add"
                  element={<AddProductPage />}
                />
                <Route
                  path="/seller/products/edit/:id"
                  element={<EditProductPage />}
                />
                <Route
                  path="/seller/products"
                  element={<ProductManagement />}
                />
              </Routes>
                    </SearchProvider>
                  </WishlistProvider>
                </UserNotificationsProvider>
              </NotificationProvider>
            </CartProvider>
          </BrandProvider>
        </CategoryProvider>
      </AuthProvider>
    </div>
  );
}
