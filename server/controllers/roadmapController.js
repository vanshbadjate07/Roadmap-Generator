const { db } = require('../config/firebase');
const { generateRoadmapContent } = require('../services/gemini');
const fs = require('fs');
const path = require('path');

const logDebug = (msg) => {
    const logPath = path.join(__dirname, '../debug_output.txt');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        console.error("Error writing to debug log", e);
    }
};

// Helper for date sorting
const getDate = (item) => {
    if (!item.createdAt) return 0;
    // Handle Firestore Timestamp or standard Date string/object
    return item.createdAt.toDate ? item.createdAt.toDate().getTime() : new Date(item.createdAt).getTime();
};

// POST /api/generate
const createRoadmap = async (req, res) => {
    try {
        const { topic, level, skills, goal, duration, hoursPerDay } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const roadmapContent = await generateRoadmapContent(topic, level, skills, goal, duration, hoursPerDay);

        // Return generated content directly (client can review before saving)
        res.json(roadmapContent);
    } catch (error) {
        logDebug(`Error generating: ${error.message}`);
        console.error("Error generating roadmap:", error);
        res.status(500).json({ error: error.message || "Failed to generate roadmap" });
    }
};

// POST /api/save
const saveRoadmap = async (req, res) => {
    try {
        const { roadmap, userId } = req.body;

        if (!roadmap || !userId) {
            logDebug("Missing roadmap or userId in save request");
            return res.status(400).json({ error: "Missing roadmap data or user ID" });
        }

        const newRoadmap = {
            ...roadmap,
            authorId: userId,
            createdAt: new Date(),
            views: 0,
            likes: 0,
            savedBy: [userId], // Auto-save for author
            isPublic: false,
            _debug_projectId: db.settings.projectId || 'unknown'
        };

        // Sanitize undefined values
        Object.keys(newRoadmap).forEach(key => newRoadmap[key] === undefined && delete newRoadmap[key]);

        logDebug(`Saving to Project: ${db.settings.projectId}`);
        const docRef = await db.collection('roadmaps').add(newRoadmap);
        logDebug(`Saved Roadmap ID: ${docRef.id}`);

        res.json({ id: docRef.id, ...newRoadmap });
    } catch (error) {
        logDebug(`Error saving: ${error.message}`);
        console.error("Error saving roadmap:", error);
        res.status(500).json({ error: "Failed to save roadmap" });
    }
};

// POST /api/roadmaps/:id/publish
const publishRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('roadmaps').doc(id).update({ isPublic: true });

        // Invalidate Cache
        publicRoadmapsCache = { data: [], lastFetch: 0 };

        res.json({ success: true, message: "Roadmap published" });
    } catch (error) {
        console.error("Error publishing roadmap:", error);
        res.status(500).json({ error: "Failed to publish roadmap" });
    }
};

// Simple In-Memory Cache
let publicRoadmapsCache = {
    data: [],
    lastFetch: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// GET /api/public
const getPublicRoadmaps = async (req, res) => {
    try {
        const now = Date.now();
        if (publicRoadmapsCache.data.length > 0 && (now - publicRoadmapsCache.lastFetch < CACHE_DURATION)) {
            logDebug("Returning cached public roadmaps");
            return res.json(publicRoadmapsCache.data);
        }

        logDebug("Fetching public roadmaps from DB...");
        // Fetch more to sort in memory (since we avoid composite index for now)
        const snapshot = await db.collection('roadmaps')
            .where('isPublic', '==', true)
            .limit(100)
            .get();

        if (snapshot.empty) {
            logDebug("No public roadmaps found");
            return res.json([]);
        }

        let roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by Date Descending (Newest First)
        roadmaps.sort((a, b) => getDate(b) - getDate(a));

        // Update Cache
        publicRoadmapsCache = {
            data: roadmaps,
            lastFetch: now
        };

        logDebug(`Found ${roadmaps.length} public roadmaps`);
        res.json(roadmaps);
    } catch (error) {
        logDebug(`Error fetching public: ${error.message}`);
        console.error("Error fetching public roadmaps:", error);
        res.json([]);
    }
};

// GET /api/roadmaps/:id
const getRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        logDebug(`Fetching ID: ${id} from Project: ${db.settings.projectId}`);
        const doc = await db.collection('roadmaps').doc(id).get();

        if (!doc.exists) {
            logDebug(`ID ${id} NOT FOUND in Project: ${db.settings.projectId}`);
            return res.status(404).json({ error: "Roadmap not found" });
        }

        logDebug(`ID ${id} FOUND`);
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        logDebug(`Error fetching: ${error.message}`);
        console.error("Error fetching roadmap:", error);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
};

// GET /api/mine
const getUserRoadmaps = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('roadmaps')
            .where('authorId', '==', userId)
            .get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        roadmaps.sort((a, b) => getDate(b) - getDate(a)); // Sort Newest First

        res.json(roadmaps);
    } catch (error) {
        console.error("Error fetching user roadmaps:", error);
        res.status(500).json({ error: "Failed to fetch your roadmaps" });
    }
};

// POST /api/roadmaps/:id/view
const incrementView = async (req, res) => {
    try {
        const { id } = req.params;
        const admin = require('firebase-admin');
        await db.collection('roadmaps').doc(id).update({
            views: admin.firestore.FieldValue.increment(1)
        });
        res.json({ success: true });
    } catch (error) {
        console.error("Error incrementing view:", error);
        res.status(500).json({ error: "Failed to track view" });
    }
};

// POST /api/roadmaps/:id/clone
const cloneRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        logDebug(`[Clone] Request for ID: ${id} by User: ${userId}`);

        const doc = await db.collection('roadmaps').doc(id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Original roadmap not found" });
        }

        const originalData = doc.data();
        const newRoadmap = {
            ...originalData,
            authorId: userId,
            createdAt: new Date(),
            views: 0,
            likes: 0,
            likedBy: [],
            isPublic: false,
            originalId: id,
            _debug_projectId: db.settings.projectId || 'unknown'
        };

        delete newRoadmap.id;

        const docRef = await db.collection('roadmaps').add(newRoadmap);
        logDebug(`[Clone] Success. New ID: ${docRef.id}`);
        res.json({ id: docRef.id, ...newRoadmap });
    } catch (error) {
        console.error("Error cloning roadmap:", error);
        res.status(500).json({ error: "Failed to clone roadmap" });
    }
};

// POST /api/roadmaps/:id/like
const likeRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const roadmapRef = db.collection('roadmaps').doc(id);
        const admin = require('firebase-admin');

        const doc = await roadmapRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const data = doc.data();
        const likedBy = data.likedBy || [];
        const isLiked = likedBy.includes(userId);

        if (isLiked) {
            await roadmapRef.update({
                likes: admin.firestore.FieldValue.increment(-1),
                likedBy: admin.firestore.FieldValue.arrayRemove(userId)
            });
            res.json({ success: true, message: "Unliked", liked: false });
        } else {
            await roadmapRef.update({
                likes: admin.firestore.FieldValue.increment(1),
                likedBy: admin.firestore.FieldValue.arrayUnion(userId)
            });
            res.json({ success: true, message: "Liked", liked: true });
        }
    } catch (error) {
        console.error("Error liking roadmap:", error);
        res.status(500).json({ error: "Failed to like roadmap" });
    }
};

// GET /api/liked
const getLikedRoadmaps = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('roadmaps')
            .where('likedBy', 'array-contains', userId)
            .get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(roadmaps);
    } catch (error) {
        console.error("Error fetching liked roadmaps:", error);
        res.status(500).json({ error: "Failed to fetch liked roadmaps" });
    }
};

// POST /api/roadmaps/:id/bookmark
const bookmarkRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        const roadmapRef = db.collection('roadmaps').doc(id);
        const admin = require('firebase-admin');

        const doc = await roadmapRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        const data = doc.data();
        const savedBy = data.savedBy || [];
        const isSaved = savedBy.includes(userId);

        if (isSaved) {
            await roadmapRef.update({
                savedBy: admin.firestore.FieldValue.arrayRemove(userId)
            });
            res.json({ success: true, message: "Removed from saved", saved: false });
        } else {
            await roadmapRef.update({
                savedBy: admin.firestore.FieldValue.arrayUnion(userId)
            });
            res.json({ success: true, message: "Saved to profile", saved: true });
        }
    } catch (error) {
        console.error("Error bookmarking roadmap:", error);
        res.status(500).json({ error: "Failed to bookmark roadmap" });
    }
};

// DELETE /api/roadmaps/:id
const deleteRoadmap = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const docRef = db.collection('roadmaps').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Roadmap not found" });
        }

        if (doc.data().authorId !== userId) {
            return res.status(403).json({ error: "Unauthorized to delete this roadmap" });
        }

        await docRef.delete();
        res.json({ success: true, message: "Roadmap deleted" });
    } catch (error) {
        console.error("Error deleting roadmap:", error);
        res.status(500).json({ error: "Failed to delete roadmap" });
    }
};

// GET /api/saved (Bookmarked)
const getSavedRoadmaps = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('roadmaps')
            .where('savedBy', 'array-contains', userId)
            .get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const roadmaps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        roadmaps.sort((a, b) => getDate(b) - getDate(a)); // Sort Newest First

        res.json(roadmaps);
    } catch (error) {
        console.error("Error fetching saved roadmaps:", error);
        res.status(500).json({ error: "Failed to fetch saved roadmaps" });
    }
};

module.exports = {
    createRoadmap,
    saveRoadmap,
    publishRoadmap,
    likeRoadmap,
    incrementView,
    cloneRoadmap,
    bookmarkRoadmap,
    deleteRoadmap,
    getLikedRoadmaps,
    getSavedRoadmaps,
    getPublicRoadmaps,
    getRoadmap,
    getUserRoadmaps
};
