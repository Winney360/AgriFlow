import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createEmergencyRequest,
  listEmergencyRequests,
  getEmergencyRequest,
  claimEmergencyRequest,
  updateClaimStatus,
  closeEmergencyRequest,
  myEmergencyRequests,
  myEmergencyClaims,
} from '../controllers/emergencyRequestController.js';

const router = express.Router();

// All emergency request endpoints require authentication
router.use(protect);

// Create a new emergency request
router.post('/', createEmergencyRequest);

// List all open emergency requests (with optional location filtering)
router.get('/', listEmergencyRequests);

// Get my emergency requests (as buyer)
router.get('/mine/requests', myEmergencyRequests);

// Get my claimed emergency requests (as seller)
router.get('/mine/claims', myEmergencyClaims);

// Get specific emergency request details
router.get('/:id', getEmergencyRequest);

// Claim an emergency request
router.post('/:id/claim', claimEmergencyRequest);

// Update claim status
router.patch('/:id/claim/:claimIndex', updateClaimStatus);

// Close an emergency request
router.patch('/:id/close', closeEmergencyRequest);

export default router;
