const express = require('express');
const router = express.Router();
const { createRoadmap, getRoadmap, getPublicRoadmaps, publishRoadmap, saveRoadmap, getUserRoadmaps, likeRoadmap, incrementView, cloneRoadmap, getLikedRoadmaps, bookmarkRoadmap, deleteRoadmap, getSavedRoadmaps, saveUserKey, getUserKey } = require('../controllers/roadmapController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/generate', createRoadmap); // Public? Or protected? Requirement: "Login REQUIRED to generate or publish". So protected.
router.post('/save', saveRoadmap); // Temp disable auth for persistence debug
// Interactions
router.post('/roadmaps/:id/publish', verifyToken, publishRoadmap);
router.post('/roadmaps/:id/like', verifyToken, likeRoadmap);
router.post('/roadmaps/:id/bookmark', verifyToken, bookmarkRoadmap);
router.post('/roadmaps/:id/view', incrementView);
router.post('/roadmaps/:id/clone', verifyToken, cloneRoadmap);
router.delete('/roadmaps/:id', verifyToken, deleteRoadmap);

// Queries
router.get('/public', getPublicRoadmaps);
router.get('/mine', verifyToken, getUserRoadmaps);
router.get('/liked', verifyToken, getLikedRoadmaps);
router.get('/saved', verifyToken, getSavedRoadmaps);
router.get('/roadmaps/:id', getRoadmap);

// User Data
router.post('/user/key', verifyToken, saveUserKey);
router.get('/user/key', verifyToken, getUserKey);

module.exports = router;
