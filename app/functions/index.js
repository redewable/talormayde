// ============================================================================
// FIREBASE CLOUD FUNCTIONS
// functions/index.js
// ============================================================================

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all admin FCM tokens from Firestore
 * @returns {Promise<string[]>} Array of FCM tokens
 */
async function getAdminTokens() {
  try {
    const tokensSnapshot = await db.collection("fcmTokens").get();
    
    if (tokensSnapshot.empty) {
      console.log("No FCM tokens found");
      return [];
    }
    
    return tokensSnapshot.docs
      .map(doc => doc.data().token)
      .filter(token => token && typeof token === "string");
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    return [];
  }
}

/**
 * Send multicast notification to all admin devices
 * @param {Object} notification - Notification title and body
 * @param {Object} data - Additional data payload
 * @param {string[]} tokens - Array of FCM tokens
 * @returns {Promise<Object>} Send result
 */
async function sendNotification(notification, data, tokens) {
  if (!tokens || tokens.length === 0) {
    console.log("No tokens to send notification to");
    return null;
  }

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: {
      ...data,
      timestamp: new Date().toISOString(),
    },
    tokens,
    // Android specific options
    android: {
      priority: "high",
      notification: {
        sound: "default",
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
    },
    // Apple specific options
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
    // Web push options
    webpush: {
      notification: {
        icon: "/icon-192.png",
        badge: "/badge-72.png",
        requireInteraction: true,
      },
      fcmOptions: {
        link: data.url || "/admin",
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`Notifications sent: ${response.successCount}/${tokens.length} successful`);
    
    // Handle failed tokens (remove invalid ones)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // Remove tokens that are no longer valid
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx]);
          }
          console.error(`Failed to send to token ${idx}:`, resp.error?.message);
        }
      });
      
      // Clean up invalid tokens
      if (failedTokens.length > 0) {
        await cleanupInvalidTokens(failedTokens);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error sending multicast notification:", error);
    throw error;
  }
}

/**
 * Remove invalid FCM tokens from Firestore
 * @param {string[]} invalidTokens - Array of invalid tokens to remove
 */
async function cleanupInvalidTokens(invalidTokens) {
  try {
    const tokensSnapshot = await db.collection("fcmTokens").get();
    const batch = db.batch();
    let deleteCount = 0;
    
    tokensSnapshot.docs.forEach(doc => {
      if (invalidTokens.includes(doc.data().token)) {
        batch.delete(doc.ref);
        deleteCount++;
      }
    });
    
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deleteCount} invalid FCM tokens`);
    }
  } catch (error) {
    console.error("Error cleaning up invalid tokens:", error);
  }
}

/**
 * Log notification to history for the user
 * @param {string} userId - User ID to log notification for
 * @param {Object} notification - Notification data
 */
async function logNotificationHistory(userId, notification) {
  try {
    const historyRef = db.collection("notificationHistory").doc(userId);
    const historyDoc = await historyRef.get();
    
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title,
      body: notification.body,
      type: notification.type,
      timestamp: new Date().toISOString(),
      read: false,
      url: notification.url,
    };
    
    if (historyDoc.exists) {
      const items = historyDoc.data().items || [];
      // Keep only last 50 notifications
      const updatedItems = [newNotification, ...items].slice(0, 50);
      await historyRef.update({ items: updatedItems });
    } else {
      await historyRef.set({ items: [newNotification] });
    }
  } catch (error) {
    console.error("Error logging notification history:", error);
  }
}

/**
 * Get all admin user IDs for notification history
 */
async function getAdminUserIds() {
  try {
    const tokensSnapshot = await db.collection("fcmTokens").get();
    return tokensSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error getting admin user IDs:", error);
    return [];
  }
}

// ============================================================================
// NOTIFICATION TRIGGERS
// ============================================================================

/**
 * NEW LEAD NOTIFICATION
 * Triggered when a new inquiry is submitted via contact form
 */
exports.onNewLead = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap, context) => {
    const lead = snap.data();
    const leadId = context.params.leadId;
    
    console.log(`New lead created: ${leadId}`);
    
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return null;
    
    const notification = {
      title: "🔔 New Inquiry",
      body: `${lead.name || "Someone"} submitted a contact form`,
    };
    
    const data = {
      type: "newLead",
      leadId: leadId,
      leadName: lead.name || "",
      leadEmail: lead.email || "",
      url: "/admin",
      tag: `lead-${leadId}`,
    };
    
    await sendNotification(notification, data, tokens);
    
    // Log to notification history for all admins
    const adminIds = await getAdminUserIds();
    for (const adminId of adminIds) {
      await logNotificationHistory(adminId, {
        ...notification,
        type: "newLead",
        url: "/admin",
      });
    }
    
    return null;
  });

/**
 * CLIENT MESSAGE NOTIFICATION
 * Triggered when a client sends a new message
 */
exports.onClientMessage = functions.firestore
  .document("clients/{clientId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const clientId = context.params.clientId;
    
    // Check if messages array exists and has grown
    const beforeMessages = before.messages || [];
    const afterMessages = after.messages || [];
    
    if (afterMessages.length <= beforeMessages.length) {
      return null;
    }
    
    // Get the new message
    const lastMessage = afterMessages[afterMessages.length - 1];
    
    // Only notify for client messages, not admin messages
    if (lastMessage.sender === "admin") {
      return null;
    }
    
    console.log(`New client message from: ${after.projectName}`);
    
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return null;
    
    const notification = {
      title: `💬 ${after.projectName || "Client"}`,
      body: lastMessage.text?.substring(0, 100) || "Sent a message",
    };
    
    const data = {
      type: "clientMessage",
      clientId: clientId,
      projectName: after.projectName || "",
      url: "/admin",
      tag: `message-${clientId}`,
    };
    
    await sendNotification(notification, data, tokens);
    
    // Log to notification history
    const adminIds = await getAdminUserIds();
    for (const adminId of adminIds) {
      await logNotificationHistory(adminId, {
        ...notification,
        type: "clientMessage",
        url: "/admin",
      });
    }
    
    return null;
  });

/**
 * PHASE CHANGE NOTIFICATION
 * Triggered when a client's project phase changes
 */
exports.onPhaseChange = functions.firestore
  .document("clients/{clientId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const clientId = context.params.clientId;
    
    // Check if status (phase) changed
    if (before.status === after.status) {
      return null;
    }
    
    console.log(`Phase changed for ${after.projectName}: ${before.status} -> ${after.status}`);
    
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return null;
    
    const notification = {
      title: `📋 Phase Updated`,
      body: `${after.projectName || "Project"} moved to ${after.status || "new phase"}`,
    };
    
    const data = {
      type: "phaseChange",
      clientId: clientId,
      projectName: after.projectName || "",
      oldPhase: before.status || "",
      newPhase: after.status || "",
      url: "/admin",
      tag: `phase-${clientId}`,
    };
    
    await sendNotification(notification, data, tokens);
    
    // Log to notification history
    const adminIds = await getAdminUserIds();
    for (const adminId of adminIds) {
      await logNotificationHistory(adminId, {
        ...notification,
        type: "phaseChange",
        url: "/admin",
      });
    }
    
    return null;
  });

/**
 * INVOICE STATUS NOTIFICATION
 * Triggered when invoice status changes (especially to paid or overdue)
 */
exports.onInvoiceStatusChange = functions.firestore
  .document("clients/{clientId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const clientId = context.params.clientId;
    
    // Check if invoice status changed
    if (before.invoiceStatus === after.invoiceStatus) {
      return null;
    }
    
    console.log(`Invoice status changed for ${after.projectName}: ${before.invoiceStatus} -> ${after.invoiceStatus}`);
    
    // Only notify for important status changes
    const importantStatuses = ["paid", "overdue", "partial"];
    if (!importantStatuses.includes(after.invoiceStatus)) {
      return null;
    }
    
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return null;
    
    let emoji = "💰";
    let statusText = after.invoiceStatus;
    
    if (after.invoiceStatus === "paid") {
      emoji = "✅";
      statusText = "Paid";
    } else if (after.invoiceStatus === "overdue") {
      emoji = "⚠️";
      statusText = "Overdue";
    } else if (after.invoiceStatus === "partial") {
      emoji = "💵";
      statusText = "Partially Paid";
    }
    
    const notification = {
      title: `${emoji} Invoice ${statusText}`,
      body: `${after.projectName || "Client"} invoice is now ${statusText.toLowerCase()}`,
    };
    
    const data = {
      type: "invoiceUpdate",
      clientId: clientId,
      projectName: after.projectName || "",
      invoiceStatus: after.invoiceStatus || "",
      url: "/admin",
      tag: `invoice-${clientId}`,
    };
    
    await sendNotification(notification, data, tokens);
    
    // Log to notification history
    const adminIds = await getAdminUserIds();
    for (const adminId of adminIds) {
      await logNotificationHistory(adminId, {
        ...notification,
        type: "invoiceUpdate",
        url: "/admin",
      });
    }
    
    return null;
  });

/**
 * FILE UPLOAD NOTIFICATION
 * Triggered when a client uploads a new file/asset
 */
exports.onClientFileUpload = functions.firestore
  .document("clients/{clientId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const clientId = context.params.clientId;
    
    // Check if assets array has grown
    const beforeAssets = before.assets || [];
    const afterAssets = after.assets || [];
    
    if (afterAssets.length <= beforeAssets.length) {
      return null;
    }
    
    // Get the new asset
    const lastAsset = afterAssets[afterAssets.length - 1];
    
    // Only notify for client uploads, not admin uploads
    if (lastAsset.uploader === "admin") {
      return null;
    }
    
    console.log(`New file uploaded by client: ${after.projectName}`);
    
    const tokens = await getAdminTokens();
    if (tokens.length === 0) return null;
    
    const notification = {
      title: `📎 New File Uploaded`,
      body: `${after.projectName || "Client"} uploaded ${lastAsset.name || "a file"}`,
    };
    
    const data = {
      type: "fileUpload",
      clientId: clientId,
      projectName: after.projectName || "",
      fileName: lastAsset.name || "",
      url: "/admin",
      tag: `file-${clientId}`,
    };
    
    await sendNotification(notification, data, tokens);
    
    // Log to notification history
    const adminIds = await getAdminUserIds();
    for (const adminId of adminIds) {
      await logNotificationHistory(adminId, {
        ...notification,
        type: "fileUpload",
        url: "/admin",
      });
    }
    
    return null;
  });

/**
 * DUE DATE REMINDER
 * Scheduled function to check for upcoming due dates (runs daily)
 */
exports.dueDateReminder = functions.pubsub
  .schedule("0 9 * * *") // Run at 9 AM every day
  .timeZone("America/New_York")
  .onRun(async (context) => {
    console.log("Running due date reminder check...");
    
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const todayStr = today.toISOString().split("T")[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split("T")[0];
    
    try {
      // Get all active clients
      const clientsSnapshot = await db.collection("clients").get();
      
      const upcomingDueDates = [];
      const overdueDates = [];
      
      clientsSnapshot.docs.forEach(doc => {
        const client = doc.data();
        const dueDate = client.dueDate;
        
        // Skip completed projects
        if (client.status === "live" || client.status === "maintenance") {
          return;
        }
        
        if (dueDate) {
          if (dueDate === todayStr) {
            upcomingDueDates.push({ id: doc.id, ...client, urgency: "today" });
          } else if (dueDate <= threeDaysStr && dueDate > todayStr) {
            upcomingDueDates.push({ id: doc.id, ...client, urgency: "soon" });
          } else if (dueDate < todayStr) {
            overdueDates.push({ id: doc.id, ...client });
          }
        }
      });
      
      const tokens = await getAdminTokens();
      if (tokens.length === 0) return null;
      
      // Send notification for due today
      const dueToday = upcomingDueDates.filter(c => c.urgency === "today");
      if (dueToday.length > 0) {
        const notification = {
          title: "📅 Due Today",
          body: dueToday.length === 1 
            ? `${dueToday[0].projectName} is due today`
            : `${dueToday.length} projects are due today`,
        };
        
        await sendNotification(notification, {
          type: "dueDate",
          urgency: "today",
          count: dueToday.length.toString(),
          url: "/admin",
          tag: "due-today",
        }, tokens);
      }
      
      // Send notification for overdue
      if (overdueDates.length > 0) {
        const notification = {
          title: "⚠️ Overdue Projects",
          body: overdueDates.length === 1
            ? `${overdueDates[0].projectName} is past due`
            : `${overdueDates.length} projects are past due`,
        };
        
        await sendNotification(notification, {
          type: "dueDate",
          urgency: "overdue",
          count: overdueDates.length.toString(),
          url: "/admin",
          tag: "overdue",
        }, tokens);
      }
      
      console.log(`Due date check complete. Today: ${dueToday.length}, Overdue: ${overdueDates.length}`);
      
    } catch (error) {
      console.error("Error in due date reminder:", error);
    }
    
    return null;
  });

/**
 * CLEANUP OLD NOTIFICATIONS
 * Scheduled function to clean up old notification history (runs weekly)
 */
exports.cleanupNotificationHistory = functions.pubsub
  .schedule("0 0 * * 0") // Run at midnight every Sunday
  .timeZone("America/New_York")
  .onRun(async (context) => {
    console.log("Cleaning up old notification history...");
    
    try {
      const historySnapshot = await db.collection("notificationHistory").get();
      const batch = db.batch();
      let updateCount = 0;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      historySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const items = data.items || [];
        
        // Filter out notifications older than 30 days
        const filteredItems = items.filter(item => {
          const itemDate = new Date(item.timestamp);
          return itemDate > thirtyDaysAgo;
        });
        
        if (filteredItems.length !== items.length) {
          batch.update(doc.ref, { items: filteredItems });
          updateCount++;
        }
      });
      
      if (updateCount > 0) {
        await batch.commit();
        console.log(`Cleaned up notification history for ${updateCount} users`);
      }
      
    } catch (error) {
      console.error("Error cleaning up notification history:", error);
    }
    
    return null;
  });

// ============================================================================
// HTTP ENDPOINTS (Optional - for manual testing)
// ============================================================================

/**
 * Test notification endpoint
 * Usage: https://your-region-your-project.cloudfunctions.net/testNotification
 */
exports.testNotification = functions.https.onRequest(async (req, res) => {
  // Add authentication check in production
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  
  try {
    const tokens = await getAdminTokens();
    
    if (tokens.length === 0) {
      res.status(400).json({ error: "No FCM tokens registered" });
      return;
    }
    
    const notification = {
      title: "🧪 Test Notification",
      body: "Push notifications are working correctly!",
    };
    
    const data = {
      type: "test",
      url: "/admin",
      tag: "test",
    };
    
    const result = await sendNotification(notification, data, tokens);
    
    res.status(200).json({
      success: true,
      successCount: result?.successCount || 0,
      failureCount: result?.failureCount || 0,
      totalTokens: tokens.length,
    });
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ error: error.message });
  }
});