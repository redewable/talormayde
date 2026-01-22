// ============================================================================
// FIREBASE CLOUD FUNCTIONS (v2 SDK)
// functions/index.js
// ============================================================================

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const db = getFirestore();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all admin FCM tokens from Firestore
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
    android: {
      priority: "high",
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1,
        },
      },
    },
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
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`Notifications sent: ${response.successCount}/${tokens.length} successful`);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx]);
          }
          console.error(`Failed to send to token ${idx}:`, resp.error?.message);
        }
      });
      
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
 * Log notification to history
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
 * Get all admin user IDs
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
 */
exports.onNewLead = onDocumentCreated("leads/{leadId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  
  const lead = snapshot.data();
  const leadId = event.params.leadId;
  
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
 */
exports.onClientMessage = onDocumentUpdated("clients/{clientId}", async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  
  if (!beforeData || !afterData) return null;
  
  const clientId = event.params.clientId;
  
  const beforeMessages = beforeData.messages || [];
  const afterMessages = afterData.messages || [];
  
  if (afterMessages.length <= beforeMessages.length) {
    return null;
  }
  
  const lastMessage = afterMessages[afterMessages.length - 1];
  
  if (lastMessage.sender === "admin") {
    return null;
  }
  
  console.log(`New client message from: ${afterData.projectName}`);
  
  const tokens = await getAdminTokens();
  if (tokens.length === 0) return null;
  
  const notification = {
    title: `💬 ${afterData.projectName || "Client"}`,
    body: lastMessage.text?.substring(0, 100) || "Sent a message",
  };
  
  const data = {
    type: "clientMessage",
    clientId: clientId,
    projectName: afterData.projectName || "",
    url: "/admin",
    tag: `message-${clientId}`,
  };
  
  await sendNotification(notification, data, tokens);
  
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
 */
exports.onPhaseChange = onDocumentUpdated("clients/{clientId}", async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  
  if (!beforeData || !afterData) return null;
  
  const clientId = event.params.clientId;
  
  if (beforeData.status === afterData.status) {
    return null;
  }
  
  console.log(`Phase changed for ${afterData.projectName}: ${beforeData.status} -> ${afterData.status}`);
  
  const tokens = await getAdminTokens();
  if (tokens.length === 0) return null;
  
  const notification = {
    title: "📋 Phase Updated",
    body: `${afterData.projectName || "Project"} moved to ${afterData.status || "new phase"}`,
  };
  
  const data = {
    type: "phaseChange",
    clientId: clientId,
    projectName: afterData.projectName || "",
    oldPhase: beforeData.status || "",
    newPhase: afterData.status || "",
    url: "/admin",
    tag: `phase-${clientId}`,
  };
  
  await sendNotification(notification, data, tokens);
  
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
 */
exports.onInvoiceStatusChange = onDocumentUpdated("clients/{clientId}", async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  
  if (!beforeData || !afterData) return null;
  
  const clientId = event.params.clientId;
  
  if (beforeData.invoiceStatus === afterData.invoiceStatus) {
    return null;
  }
  
  console.log(`Invoice status changed for ${afterData.projectName}: ${beforeData.invoiceStatus} -> ${afterData.invoiceStatus}`);
  
  const importantStatuses = ["paid", "overdue", "partial"];
  if (!importantStatuses.includes(afterData.invoiceStatus)) {
    return null;
  }
  
  const tokens = await getAdminTokens();
  if (tokens.length === 0) return null;
  
  let emoji = "💰";
  let statusText = afterData.invoiceStatus;
  
  if (afterData.invoiceStatus === "paid") {
    emoji = "✅";
    statusText = "Paid";
  } else if (afterData.invoiceStatus === "overdue") {
    emoji = "⚠️";
    statusText = "Overdue";
  } else if (afterData.invoiceStatus === "partial") {
    emoji = "💵";
    statusText = "Partially Paid";
  }
  
  const notification = {
    title: `${emoji} Invoice ${statusText}`,
    body: `${afterData.projectName || "Client"} invoice is now ${statusText.toLowerCase()}`,
  };
  
  const data = {
    type: "invoiceUpdate",
    clientId: clientId,
    projectName: afterData.projectName || "",
    invoiceStatus: afterData.invoiceStatus || "",
    url: "/admin",
    tag: `invoice-${clientId}`,
  };
  
  await sendNotification(notification, data, tokens);
  
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
 */
exports.onClientFileUpload = onDocumentUpdated("clients/{clientId}", async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  
  if (!beforeData || !afterData) return null;
  
  const clientId = event.params.clientId;
  
  const beforeAssets = beforeData.assets || [];
  const afterAssets = afterData.assets || [];
  
  if (afterAssets.length <= beforeAssets.length) {
    return null;
  }
  
  const lastAsset = afterAssets[afterAssets.length - 1];
  
  if (lastAsset.uploader === "admin") {
    return null;
  }
  
  console.log(`New file uploaded by client: ${afterData.projectName}`);
  
  const tokens = await getAdminTokens();
  if (tokens.length === 0) return null;
  
  const notification = {
    title: "📎 New File Uploaded",
    body: `${afterData.projectName || "Client"} uploaded ${lastAsset.name || "a file"}`,
  };
  
  const data = {
    type: "fileUpload",
    clientId: clientId,
    projectName: afterData.projectName || "",
    fileName: lastAsset.name || "",
    url: "/admin",
    tag: `file-${clientId}`,
  };
  
  await sendNotification(notification, data, tokens);
  
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
 * DUE DATE REMINDER (Daily at 9 AM EST)
 * Note: Requires Blaze plan
 */
exports.dueDateReminder = onSchedule({
  schedule: "0 9 * * *",
  timeZone: "America/New_York",
}, async (event) => {
  console.log("Running due date reminder check...");
  
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  
  const todayStr = today.toISOString().split("T")[0];
  const threeDaysStr = threeDaysFromNow.toISOString().split("T")[0];
  
  try {
    const clientsSnapshot = await db.collection("clients").get();
    
    const upcomingDueDates = [];
    const overdueDates = [];
    
    clientsSnapshot.docs.forEach(doc => {
      const client = doc.data();
      const dueDate = client.dueDate;
      
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
 * CLEANUP OLD NOTIFICATIONS (Weekly on Sunday)
 * Note: Requires Blaze plan
 */
exports.cleanupNotificationHistory = onSchedule({
  schedule: "0 0 * * 0",
  timeZone: "America/New_York",
}, async (event) => {
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

/**
 * TEST NOTIFICATION ENDPOINT
 */
exports.testNotification = onRequest(async (req, res) => {
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