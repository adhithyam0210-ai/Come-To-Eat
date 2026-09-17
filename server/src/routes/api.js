const express = require('express');
const router = express.Router();

const { verifyToken, requireAdmin, requireStaff, requireEmployee, optionalToken } = require('../middleware/auth');
const { AuthController } = require('../controllers/authController');
const { FoodController } = require('../controllers/foodController');
const { OrderController } = require('../controllers/orderController');
const { AdminController } = require('../controllers/adminController');
const { CouponController } = require('../controllers/couponController');
const { ReviewController } = require('../controllers/reviewController');
const { HeroController } = require('../controllers/heroController');
const { UploadController } = require('../controllers/uploadController');
const { SettingsController } = require('../controllers/settingsController');
const { BranchController } = require('../controllers/branchController');
const StaffController = require('../controllers/staffController');
const { OfferController } = require('../controllers/offerController');
const { registerSseClient } = require('../supabase');

// =================== REALTIME STREAM (Supabase / SSE live reflection) ===================
router.get('/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write('data: {"type":"CONNECTED","timestamp":"' + new Date().toISOString() + '"}\n\n');
  registerSseClient(res);
});

// =================== AUTHENTICATION ===================
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.get('/auth/me', verifyToken, AuthController.me);
router.get('/auth/addresses', verifyToken, AuthController.getAddresses);
router.post('/auth/addresses', verifyToken, AuthController.addAddress);
router.delete('/auth/addresses/:id', verifyToken, AuthController.deleteAddress);

// =================== CATEGORIES ===================
router.get('/categories', FoodController.getCategories);
router.get('/categories/admin', requireAdmin, FoodController.getAllCategoriesAdmin);
router.post('/categories', requireAdmin, FoodController.createCategory);
router.put('/categories/:id', requireAdmin, FoodController.updateCategory);
router.delete('/categories/:id', requireAdmin, FoodController.deleteCategory);

// =================== FOOD ITEMS ===================
router.get('/foods', FoodController.getFoods);
router.get('/foods/:id', FoodController.getFoodById);
router.post('/foods', requireAdmin, FoodController.createFood);
router.put('/foods/:id', requireAdmin, FoodController.updateFood);
router.patch('/foods/:id/availability', requireStaff, FoodController.toggleAvailability);
router.delete('/foods/:id', requireAdmin, FoodController.deleteFood);

// =================== HERO BANNER SLIDES ===================
router.get('/hero-slides', HeroController.getHeroSlides);
router.get('/hero-slides/admin', requireAdmin, HeroController.getAllHeroSlidesAdmin);
router.post('/hero-slides', requireAdmin, HeroController.createHeroSlide);
router.put('/hero-slides/:id', requireAdmin, HeroController.updateHeroSlide);
router.delete('/hero-slides/:id', requireAdmin, HeroController.deleteHeroSlide);

// =================== ORDERS ===================
router.post('/orders', optionalToken, OrderController.createOrder);
router.get('/orders/user', verifyToken, OrderController.getUserOrders);
router.get('/orders/:id', optionalToken, OrderController.getOrderDetails);
router.post('/orders/:id/cancel', verifyToken, OrderController.cancelOrder);

// Staff Order Management (Employee advances statuses; Admin is view-only)
router.get('/orders/admin/all', requireStaff, OrderController.getAllOrdersAdmin);
router.patch('/orders/:id/status', requireStaff, OrderController.updateOrderStatus);

// =================== ADMIN & STAFF METRICS ===================
router.get('/admin/dashboard', requireStaff, AdminController.getDashboardStats);
router.get('/admin/customers', requireAdmin, AdminController.getCustomers);
router.patch('/admin/customers/:id/block', requireAdmin, AdminController.toggleCustomerBlock);
router.get('/admin/payments', requireAdmin, AdminController.getPayments);
router.post('/admin/payments/:orderId/refund', requireAdmin, AdminController.refundPayment);
router.get('/admin/deliveries', requireStaff, AdminController.getDeliveries);

// =================== COUPONS & OFFERS ===================
router.get('/coupons/active', CouponController.getActiveCoupons);
router.post('/coupons/validate', CouponController.validateCoupon);
router.get('/coupons/admin', requireAdmin, CouponController.getAllCouponsAdmin);
router.post('/coupons', requireAdmin, CouponController.createCoupon);
router.put('/coupons/:id', requireAdmin, CouponController.updateCoupon);
router.delete('/coupons/:id', requireAdmin, CouponController.deleteCoupon);

router.get('/offers', OfferController.getOffers);
router.get('/offers/admin', requireAdmin, OfferController.getAllOffersAdmin);
router.post('/offers', requireAdmin, OfferController.createOffer);
router.put('/offers/:id', requireAdmin, OfferController.updateOffer);
router.delete('/offers/:id', requireAdmin, OfferController.deleteOffer);

// =================== REVIEWS ===================
router.get('/reviews', ReviewController.getAllPublicReviews);
router.get('/reviews/food/:foodId', ReviewController.getFoodReviews);
router.post('/reviews', optionalToken, ReviewController.addReview);
router.get('/reviews/admin', requireAdmin, ReviewController.getAllReviewsAdmin);

// =================== FILE UPLOADS ===================
router.post('/upload', requireStaff, UploadController.uploadImage);

// =================== STORE SETTINGS & TIMINGS ===================
router.get('/settings', SettingsController.getSettings);
router.put('/settings', requireAdmin, SettingsController.updateSettings);

// =================== BRANCHES ===================
router.get('/branches', BranchController.getBranches);
router.get('/branches/:id', BranchController.getBranchById);
router.post('/branches', requireAdmin, BranchController.createBranch);
router.put('/branches/:id', requireAdmin, BranchController.updateBranch);
router.delete('/branches/:id', requireAdmin, BranchController.deleteBranch);

// =================== STAFF & EMPLOYEES ===================
router.get('/admin/employees', requireAdmin, StaffController.getEmployees);
router.post('/admin/employees', requireAdmin, StaffController.createEmployee);
router.post('/admin/employees/:id/transfer', requireAdmin, StaffController.initiateTransfer);
router.post('/admin/employees/:id/cancel-transfer', requireAdmin, StaffController.cancelTransfer);
router.post('/employee/confirm-transfer', requireEmployee, StaffController.confirmTransfer);
router.post('/employee/decline-transfer', requireEmployee, StaffController.declineTransfer);

module.exports = router;
