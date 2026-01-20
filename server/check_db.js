const { db } = require('./config/firebase');

async function testFirestore() {
    console.log("Testing Firestore connection...");
    try {
        const testData = {
            title: "Test Roadmap",
            createdAt: new Date()
        };

        console.log("Attempting to write to 'roadmaps' collection...");
        const docRef = await db.collection('roadmaps').add(testData);
        console.log("Write successful! ID:", docRef.id);

        console.log("Attempting to read back...");
        const doc = await db.collection('roadmaps').doc(docRef.id).get();
        if (doc.exists) {
            console.log("Read successful! Data:", doc.data());
        } else {
            console.error("Read failed! Document not found.");
        }
    } catch (error) {
        console.error("Firestore Test Failed:", error);
    }
}

testFirestore();
