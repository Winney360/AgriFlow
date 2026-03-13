import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import upload, { uploadToCloudinary } from '../middleware/cloudinaryUpload.js';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidCoordinate = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

const toRadians = (value) => (value * Math.PI) / 180;

const distanceInKm = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const parseIncomingImageUrls = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue.filter((value) => typeof value === 'string' && value.trim());
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((value) => typeof value === 'string' && value.trim());
        }
      } catch {
        return [];
      }
    }

    return [trimmed];
  }

  return [];
};


// Helper to upload all images to Cloudinary and return their URLs
const buildUploadedImageUrls = async (files = []) => {
  const urls = [];
  for (const file of files) {
    const url = await uploadToCloudinary(file.buffer, 'products');
    urls.push(url);
  }
  return urls;
};


const resolveProductImageUrls = async (req) => {
  const uploaded = req.files && req.files.length > 0 ? await buildUploadedImageUrls(req.files) : [];
  const existing = parseIncomingImageUrls(req.body.imageUrls || req.body.imageUrl);
  const merged = [...existing, ...uploaded]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .slice(0, 4);
  return {
    imageUrls: merged,
    primaryImageUrl: merged[0] || '',
  };
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      productType,
      quantity,
      price,
      latitude,
      longitude,
      locationName,
      pathAccessibility,
    } = req.body;

    const lat = Number(latitude);
    const lng = Number(longitude);
    const numericPrice = Number(price);

    if (!title || !productType || !quantity || !price) {
      const error = new Error('Title, product type, quantity, and price are required');
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      const error = new Error('Price must be a positive number');
      error.statusCode = 400;
      throw error;
    }

    if (!isValidCoordinate(lat, -90, 90) || !isValidCoordinate(lng, -180, 180)) {
      const error = new Error('A valid map location is required for each listing');
      error.statusCode = 400;
      throw error;
    }

    const { imageUrls, primaryImageUrl } = await resolveProductImageUrls(req);

    if (!primaryImageUrl) {
      const error = new Error('A product photo is mandatory');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.create({
      title,
      description,
      productType,
      quantity,
      price: numericPrice,
      imageUrl: primaryImageUrl,
      imageUrls,
      sellerId: req.user._id,
      location: {
        latitude: lat,
        longitude: lng,
        locationName: locationName || '',
      },
      pathAccessibility: pathAccessibility || 'open',
      status: 'active',
    });

    const subscribers = await User.find({
      _id: { $ne: req.user._id },
      notificationEnabled: true,
    }).select('_id');

    if (subscribers.length) {
      const message = `New ${product.productType} listed: ${product.title}`;
      const docs = subscribers.map((subscriber) => ({
        userId: subscriber._id,
        listingId: product._id,
        message,
      }));

      await Notification.insertMany(docs);
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (existingProduct.sellerId.toString() !== req.user._id.toString()) {
      const error = new Error('You can only edit your own products');
      error.statusCode = 403;
      throw error;
    }

    const { imageUrls, primaryImageUrl } = await resolveProductImageUrls(req);

    existingProduct.title = req.body.title || existingProduct.title;
    existingProduct.description = req.body.description ?? existingProduct.description;
    existingProduct.productType = req.body.productType || existingProduct.productType;
    existingProduct.quantity = req.body.quantity || existingProduct.quantity;
    if (req.body.price !== undefined) {
      const nextPrice = Number(req.body.price);
      if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
        const error = new Error('Price must be a positive number');
        error.statusCode = 400;
        throw error;
      }
      existingProduct.price = nextPrice;
    }
    if (primaryImageUrl) {
      existingProduct.imageUrl = primaryImageUrl;
      existingProduct.imageUrls = imageUrls;
    }

    if (req.body.latitude !== undefined) {
      const nextLat = Number(req.body.latitude);
      if (!isValidCoordinate(nextLat, -90, 90)) {
        const error = new Error('Latitude must be between -90 and 90');
        error.statusCode = 400;
        throw error;
      }
      existingProduct.location.latitude = nextLat;
    }

    if (req.body.longitude !== undefined) {
      const nextLng = Number(req.body.longitude);
      if (!isValidCoordinate(nextLng, -180, 180)) {
        const error = new Error('Longitude must be between -180 and 180');
        error.statusCode = 400;
        throw error;
      }
      existingProduct.location.longitude = nextLng;
    }
    existingProduct.location.locationName =
      req.body.locationName ?? existingProduct.location.locationName;
    if (req.body.pathAccessibility !== undefined) {
      if (['open', 'flooded', 'trucks_only'].includes(req.body.pathAccessibility)) {
        existingProduct.pathAccessibility = req.body.pathAccessibility;
      }
    }

    await existingProduct.save();

    res.json({ success: true, data: existingProduct });
  } catch (error) {
    next(error);
  }
};

export const setProductSold = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      const error = new Error('You can only update your own products');
      error.statusCode = 403;
      throw error;
    }

    product.status = 'sold';
    await product.save();

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      const error = new Error('You can only delete your own products');
      error.statusCode = 403;
      throw error;
    }

    product.status = 'inactive';
    await product.save();

    res.json({ success: true, message: 'Product moved to history as inactive' });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      const error = new Error('History record not found');
      error.statusCode = 404;
      throw error;
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      const error = new Error('You can only delete your own history records');
      error.statusCode = 403;
      throw error;
    }

    if (!['sold', 'inactive'].includes(product.status)) {
      const error = new Error('Only sold or archived records can be deleted from history');
      error.statusCode = 400;
      throw error;
    }

    await Product.findByIdAndDelete(product._id);

    res.json({ success: true, message: 'History record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getActiveProducts = async (req, res, next) => {
  try {
    const { search, productType, minPrice, maxPrice, locationName, lat, lng, radiusKm } = req.query;

    const query = { status: 'active' };

    if (productType && ['crop', 'livestock'].includes(productType)) {
      query.productType = productType;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (locationName) {
      query['location.locationName'] = { $regex: locationName, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = toNumber(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = toNumber(maxPrice);
      }
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name phoneNumber email')
      .sort({ createdAt: -1 });

    let filteredProducts = products;

    if (lat && lng && radiusKm) {
      const userLat = toNumber(lat);
      const userLng = toNumber(lng);
      const maxDistance = toNumber(radiusKm, 50);

      filteredProducts = products.filter((product) => {
        const d = distanceInKm(
          userLat,
          userLng,
          product.location.latitude,
          product.location.longitude,
        );
        return d <= maxDistance;
      });
    }

    res.json({ success: true, data: filteredProducts });
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name phoneNumber email',
    );

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const getSellerHistory = async (req, res, next) => {
  try {
    const { range = 'last30', startDate, endDate } = req.query;
    const now = new Date();
    const query = {
      sellerId: req.user._id,
      status: { $in: ['sold', 'inactive'] },
    };

    let fromDate;
    let toDate;

    switch (range) {
      case 'today': {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        toDate = now;
        break;
      }
      case 'last7': {
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 7);
        toDate = now;
        break;
      }
      case 'last14': {
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 14);
        toDate = now;
        break;
      }
      case 'last30': {
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 30);
        toDate = now;
        break;
      }
      case 'last90': {
        fromDate = new Date(now);
        fromDate.setDate(fromDate.getDate() - 90);
        toDate = now;
        break;
      }
      case 'thisMonth': {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = now;
        break;
      }
      case 'previousMonth': {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case 'ytd': {
        fromDate = new Date(now.getFullYear(), 0, 1);
        toDate = now;
        break;
      }
      case 'last12Months': {
        fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - 12);
        toDate = now;
        break;
      }
      case 'custom': {
        if (startDate || endDate) {
          fromDate = startDate ? new Date(startDate) : undefined;
          toDate = endDate ? new Date(endDate) : now;
        }
        break;
      }
      case 'all':
      default:
        break;
    }

    if (fromDate || toDate) {
      query.updatedAt = {};
      if (fromDate && !Number.isNaN(fromDate.getTime())) {
        query.updatedAt.$gte = fromDate;
      }
      if (toDate && !Number.isNaN(toDate.getTime())) {
        query.updatedAt.$lte = toDate;
      }

      if (Object.keys(query.updatedAt).length === 0) {
        delete query.updatedAt;
      }
    }

    const history = await Product.find(query).sort({ updatedAt: -1 });

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ sellerId: req.user._id, status: 'active' }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};
