import EmergencyRequest from '../models/EmergencyRequest.js';
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

export const createEmergencyRequest = async (req, res, next) => {
  try {
    const {
      title,
      description,
      productType,
      quantity,
      latitude,
      longitude,
      radius,
    } = req.body;

    const lat = toNumber(latitude);
    const lng = toNumber(longitude);
    const searchRadius = toNumber(radius, 50);

    if (!title || !productType || !quantity) {
      const error = new Error('Title, product type, and quantity are required');
      error.statusCode = 400;
      throw error;
    }

    if (!isValidCoordinate(lat, -90, 90) || !isValidCoordinate(lng, -180, 180)) {
      const error = new Error('Valid latitude and longitude are required');
      error.statusCode = 400;
      throw error;
    }

    const emergencyRequest = await EmergencyRequest.create({
      title,
      description: description || '',
      productType,
      quantity,
      location: {
        latitude: lat,
        longitude: lng,
      },
      radius: searchRadius,
      buyerId: req.user._id,
      priority: 'high',
    });

    // Find nearby sellers and notify them
    const sellers = await User.find({
      role: 'seller',
      notificationEnabled: true,
    }).select('_id');

    if (sellers.length) {
      const message = `🚨 EMERGENCY REQUEST: ${title} - ${quantity} needed urgently!`;
      const docs = sellers.map((seller) => ({
        userId: seller._id,
        listingId: emergencyRequest._id,
        message,
        isEmergency: true,
      }));

      await Notification.insertMany(docs);
    }

    res.status(201).json({ success: true, data: emergencyRequest });
  } catch (error) {
    next(error);
  }
};

export const listEmergencyRequests = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, status } = req.query;

    let filter = { status: { $ne: 'closed' } };

    if (status) {
      filter.status = status;
    }

    const requests = await EmergencyRequest.find(filter)
      .populate('buyerId', 'name phoneNumber')
      .populate('claimedBy.sellerId', 'name phoneNumber')
      .sort({ createdAt: -1 });

    // If user provided location, calculate distance and filter
    if (latitude && longitude) {
      const lat = toNumber(latitude);
      const lng = toNumber(longitude);
      const maxRadius = toNumber(radius, 50);

      const filteredRequests = requests.filter((req) => {
        const distance = distanceInKm(lat, lng, req.location.latitude, req.location.longitude);
        return distance <= maxRadius;
      });

      return res.json({
        success: true,
        data: filteredRequests.map((req) => ({
          ...req.toObject(),
          distance: distanceInKm(lat, lng, req.location.latitude, req.location.longitude),
        })),
      });
    }

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await EmergencyRequest.findById(id)
      .populate('buyerId', 'name phoneNumber email')
      .populate('claimedBy.sellerId', 'name phoneNumber email');

    if (!request) {
      const error = new Error('Emergency request not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const claimEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      const error = new Error('Quantity is required to claim a request');
      error.statusCode = 400;
      throw error;
    }

    const request = await EmergencyRequest.findById(id);

    if (!request) {
      const error = new Error('Emergency request not found');
      error.statusCode = 404;
      throw error;
    }

    if (request.status === 'fulfilled') {
      const error = new Error('This request is already fulfilled');
      error.statusCode = 400;
      throw error;
    }

    // Check if seller already claimed this request
    const alreadyClaimed = request.claimedBy.find(
      (claim) => claim.sellerId.toString() === req.user._id.toString(),
    );

    if (alreadyClaimed) {
      const error = new Error('You have already claimed this emergency request');
      error.statusCode = 400;
      throw error;
    }

    // Add to claimedBy array
    request.claimedBy.push({
      sellerId: req.user._id,
      quantity,
      status: 'pending',
    });

    // Update request status
    if (request.status === 'open') {
      request.status = 'partially_fulfilled';
    }

    await request.save();

    // Notify buyer about the claim
    const buyer = await User.findById(request.buyerId);
    const seller = await User.findById(req.user._id);

    if (buyer && buyer.notificationEnabled) {
      await Notification.create({
        userId: buyer._id,
        listingId: request._id,
        message: `🟢 ${seller.name} claimed ${quantity} for your emergency request: ${request.title}`,
      });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const updateClaimStatus = async (req, res, next) => {
  try {
    const { id, claimIndex } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed'].includes(status)) {
      const error = new Error('Invalid status provided');
      error.statusCode = 400;
      throw error;
    }

    const request = await EmergencyRequest.findById(id);

    if (!request) {
      const error = new Error('Emergency request not found');
      error.statusCode = 404;
      throw error;
    }

    const claimIdx = parseInt(claimIndex, 10);
    if (isNaN(claimIdx) || claimIdx < 0 || claimIdx >= request.claimedBy.length) {
      const error = new Error('Invalid claim index');
      error.statusCode = 400;
      throw error;
    }

    // Check authorization - only buyer or claimer can update
    const claim = request.claimedBy[claimIdx];
    if (
      request.buyerId.toString() !== req.user._id.toString() &&
      claim.sellerId.toString() !== req.user._id.toString()
    ) {
      const error = new Error('You are not authorized to update this claim');
      error.statusCode = 403;
      throw error;
    }

    request.claimedBy[claimIdx].status = status;

    // Check if all claims are completed
    const allCompleted = request.claimedBy.every((c) => c.status === 'completed');
    if (allCompleted) {
      request.status = 'fulfilled';
    }

    await request.save();

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const closeEmergencyRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await EmergencyRequest.findById(id);

    if (!request) {
      const error = new Error('Emergency request not found');
      error.statusCode = 404;
      throw error;
    }

    // Only buyer can close the request
    if (request.buyerId.toString() !== req.user._id.toString()) {
      const error = new Error('Only the buyer can close this request');
      error.statusCode = 403;
      throw error;
    }

    request.status = 'closed';
    await request.save();

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const myEmergencyRequests = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find({ buyerId: req.user._id })
      .populate('claimedBy.sellerId', 'name phoneNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const myEmergencyClaims = async (req, res, next) => {
  try {
    const requests = await EmergencyRequest.find({
      'claimedBy.sellerId': req.user._id,
    })
      .populate('buyerId', 'name phoneNumber')
      .populate('claimedBy.sellerId', 'name phoneNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};
