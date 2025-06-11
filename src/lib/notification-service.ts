// Notification service for LeadFlow app
import { collection, getDocs, query, where, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Lead } from '@/types';
import { BadgeService } from './badge-service';

// Server-side function to send push notifications
// This would typically be in Firebase Functions for production
export async function sendPushNotification(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
  }
) {
  try {
    // Get FCM tokens for users
    const tokens: string[] = [];
    
    for (const userId of userIds) {
      const tokenQuery = query(
        collection(db, 'userTokens'), 
        where('userId', '==', userId),
        where('enabled', '==', true)
      );
      
      const tokenDocs = await getDocs(tokenQuery);
      tokenDocs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        if (data.fcmToken) {
          tokens.push(data.fcmToken);
        }
      });
    }

    if (tokens.length === 0) {
      console.log('No FCM tokens found for users:', userIds);
      return;
    }

    // Update badge count for mobile notifications
    await BadgeService.incrementBadge();

    // In production, this would use Firebase Admin SDK to send to FCM
    // For now, we'll log what would be sent
    console.log('Would send notification to tokens:', tokens.length);
    console.log('Notification:', notification);
    
    /* Example of what the server-side Firebase Function would look like:
    const admin = require('firebase-admin');
    
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/icon-192x192.png',
      },
      data: notification.data || {},
      android: {
        notification: {
          notificationCount: await BadgeService.getBadgeCount(),
        }
      },
      apns: {
        payload: {
          aps: {
            badge: await BadgeService.getBadgeCount(),
          }
        }
      },
      tokens: tokens
    };
    
    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent message:', response);
    */
    
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Notification triggers for different lead events
export const LeadNotifications = {
  // When a new lead is created
  newLead: async (lead: Lead, assignedUserId?: string) => {
    const userIds = assignedUserId ? [assignedUserId] : [];
    
    await sendPushNotification(userIds, {
      title: '🔥 New Lead!',
      body: `${lead.customerName} from ${lead.address} - ${lead.customerPhone}`,
      tag: `new-lead-${lead.id}`,
      data: {
        type: 'new_lead',
        leadId: lead.id,
        actionUrl: `/dashboard/leads/${lead.id}`
      }
    });
  },

  // When a lead is assigned to someone
  leadAssigned: async (lead: Lead, assignedUserId: string) => {
    await sendPushNotification([assignedUserId], {
      title: '📋 Lead Assigned to You',
      body: `${lead.customerName} has been assigned to you`,
      tag: `assigned-${lead.id}`,
      data: {
        type: 'lead_assigned',
        leadId: lead.id,
        actionUrl: `/dashboard/leads/${lead.id}`
      }
    });
  },

  // Appointment reminder (30 minutes before)
  appointmentReminder: async (lead: Lead, assignedUserId: string, appointmentTime: Date) => {
    const timeStr = appointmentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    await sendPushNotification([assignedUserId], {
      title: '📅 Appointment Reminder',
      body: `Meeting with ${lead.customerName} in 30 minutes (${timeStr})`,
      tag: `reminder-${lead.id}`,
      data: {
        type: 'appointment_reminder',
        leadId: lead.id,
        appointmentTime: appointmentTime.toISOString(),
        actionUrl: `/dashboard/schedule`
      }
    });
  },

  // When lead status changes
  leadUpdated: async (lead: Lead, assignedUserId: string, updateType: string) => {
    const messages = {
      'status_change': `Status changed to ${lead.status}`,
      'contact_attempt': 'New contact attempt logged',
      'notes_added': 'New notes added',
      'rescheduled': 'Appointment rescheduled'
    };

    await sendPushNotification([assignedUserId], {
      title: '📝 Lead Updated',
      body: `${lead.customerName}: ${messages[updateType as keyof typeof messages] || 'Lead information updated'}`,
      tag: `update-${lead.id}`,
      data: {
        type: 'lead_updated',
        leadId: lead.id,
        updateType,
        actionUrl: `/dashboard/leads/${lead.id}`
      }
    });
  },

  // Follow-up reminder
  followUpDue: async (lead: Lead, assignedUserId: string) => {
    await sendPushNotification([assignedUserId], {
      title: '⏰ Follow-up Due',
      body: `Time to follow up with ${lead.customerName}`,
      tag: `followup-${lead.id}`,
      data: {
        type: 'follow_up_due',
        leadId: lead.id,
        actionUrl: `/dashboard/leads/${lead.id}`
      }
    });
  }
};

// Helper to schedule notifications (would use a job queue in production)
export const scheduleNotification = (
  notificationFn: () => Promise<void>,
  delay: number
) => {
  setTimeout(notificationFn, delay);
};

// Example usage in your lead management code:
/*
// When creating a new lead:
await LeadNotifications.newLead(newLead, assignedUserId);

// When assigning a lead:
await LeadNotifications.leadAssigned(lead, newAssignedUserId);

// When scheduling an appointment:
const appointmentTime = new Date(scheduledTime);
const reminderTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000); // 30 minutes before
const delay = reminderTime.getTime() - Date.now();

if (delay > 0) {
  scheduleNotification(
    () => LeadNotifications.appointmentReminder(lead, assignedUserId, appointmentTime),
    delay
  );
}
*/
