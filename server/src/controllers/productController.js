import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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

const mapImageUrl = (req, file, imageUrl) => {
  if (file) {
    return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  }

  return imageUrl;
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
      imageUrl,
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

    if (!req.file && !imageUrl) {
      const error = new Error('A product photo is mandatory');
      error.statusCode = 400;
      throw error;
    }

    const resolvedImageUrl = mapImageUrl(req, req.file, imageUrl);

    const product = await Product.create({
      title,
      description,
      productType,
      quantity,
      price: numericPrice,
      imageUrl: resolvedImageUrl,
      sellerId: req.user._id,
      location: {
        latitude: lat,
        longitude: lng,
        locationName: locationName || '',
      },
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

    const updatedImage = mapImageUrl(req, req.file, req.body.imageUrl) || existingProduct.imageUrl;

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
    existingProduct.imageUrl = updatedImage;

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
    const history = await Product.find({
      sellerId: req.user._id,
      status: { $in: ['sold', 'inactive'] },
    }).sort({ updatedAt: -1 });

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
