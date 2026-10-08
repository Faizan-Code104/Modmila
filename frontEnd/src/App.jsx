import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import storeInfo from "./storeInfo";

import { CartProvider } from "./component/CartContext";
import ScrollToTop from "./component/ScrollToTop";
import AdminRoute from "./component/AdminRoute";

import Layout from "./component/Layout";
import Home from "./component/Home";
import Shop from "./component/Shop";
import Category from "./component/Category";
import Contact from "./component/Contact";
import About from "./component/About";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Cart from "./component/Cart";
import ShopDetails from "./component/ShopDetails";
import Checkout from "./component/Checkout";
import OrderTracking from "./component/OrderTracking";
import ShippingPolicy from "./component/ShippingPolicy";
import ReturnPolicy from "./component/ReturnPolicy";
import PrivacyPolicy from "./component/PrivacyPolicy";
import FAQs from "./component/FAQs";
import TermsAndConditions from "./component/TermsAndConditions";
import PaymentPolicy from "./component/PaymentPolicy";
import OrderCancellationPolicy from "./component/OrderCancellationPolicy";
import CookiePolicy from "./component/CookiePolicy";

import AdminLayout from "./component/Admin/AdminLayout";
import Dashboard from "./component/Admin/Dashboard";
import Products from "./component/Admin/Products";
import Orders from "./component/Admin/Orders";
import Users from "./component/Admin/Users";

const NotFound = () => (
  <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-chalk px-4 py-12 text-ink sm:px-6">
    {/* Soft background fabric fold */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-wine-soft blur-3xl sm:size-[560px]"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-40 -left-24 size-[360px] rounded-full bg-linen blur-3xl"
    />

    <div className="relative w-full max-w-2xl perspective-distant">
      <div className="animate-fold-in border border-line bg-paper shadow-[0_30px_80px_-40px_rgba(36,34,35,0.45)]">
        {/* Care-label style header */}
        <div className="flex items-center justify-between gap-4 border-b border-dashed border-line px-5 py-4 sm:px-10 sm:py-5">
          <Link
            to="/"
            className="font-serif text-2xl lowercase leading-none tracking-tight transition-colors hover:text-wine"
          >
            {storeInfo.businessName}
            <span className="text-wine">✳</span>
          </Link>

          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
            Page unavailable
          </span>
        </div>

        <div className="px-5 py-10 sm:px-10 sm:py-14">
          <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-wine sm:text-xs">
            <span className="h-px w-8 bg-wine" aria-hidden="true" />
            Lost between the layers
          </p>

          <h1 className="mt-5 font-serif text-[96px] leading-none tracking-tight sm:text-[150px]">
            4
            <em className="inline-block animate-spin-y text-wine [animation-delay:300ms]">
              0
            </em>
            4
          </h1>

          <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
            This page has been <em className="text-wine">folded away.</em>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-muted sm:text-base">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved. Let&apos;s take you somewhere more comfortable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="group inline-flex min-h-12 items-center justify-between gap-8 bg-ink px-6 py-4 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-wine"
            >
              Back to home
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </Link>

            <Link
              to="/shop"
              className="inline-flex min-h-12 items-center justify-center border border-ink px-6 py-4 text-sm font-semibold transition-colors duration-300 hover:border-wine hover:text-wine"
            >
              Shop bedding
            </Link>
          </div>
        </div>

        <div className="border-t border-dashed border-line bg-linen px-5 py-4 sm:px-10">
          <p className="text-xs text-ink-soft">{storeInfo.tagline}</p>
        </div>
      </div>
    </div>
  </main>
);

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <CartProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />

          <Route
            path="/shop"
            element={
              <Layout>
                <Shop />
              </Layout>
            }
          />

          <Route
            path="/shop/:id"
            element={
              <Layout>
                <ShopDetails />
              </Layout>
            }
          />

          <Route
            path="/categories"
            element={
              <Layout>
                <Category />
              </Layout>
            }
          />

          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />

          <Route
            path="/contact"
            element={
              <Layout>
                <Contact />
              </Layout>
            }
          />

          <Route
            path="/cart"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />

          <Route
            path="/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />

          <Route
            path="/track-order"
            element={
              <Layout>
                <OrderTracking />
              </Layout>
            }
          />

          <Route
            path="/shipping-policy"
            element={
              <Layout>
                <ShippingPolicy />
              </Layout>
            }
          />

          <Route
            path="/return-policy"
            element={
              <Layout>
                <ReturnPolicy />
              </Layout>
            }
          />

          <Route
            path="/privacy-policy"
            element={
              <Layout>
                <PrivacyPolicy />
              </Layout>
            }
          />

          <Route
            path="/payment-policy"
            element={
              <Layout>
                <PaymentPolicy />
              </Layout>
            }
          />

          <Route
            path="/order-cancellation-policy"
            element={
              <Layout>
                <OrderCancellationPolicy />
              </Layout>
            }
          />

          <Route
            path="/cookie-policy"
            element={
              <Layout>
                <CookiePolicy />
              </Layout>
            }
          />

          <Route
            path="/faqs"
            element={
              <Layout>
                <FAQs />
              </Layout>
            }
          />

          <Route
            path="/terms-and-conditions"
            element={
              <Layout>
                <TermsAndConditions />
              </Layout>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;