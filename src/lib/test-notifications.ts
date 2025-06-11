// Test utilities for push notifications
import { requestNotificationPermission, sendLeadNotification, registerServiceWorker } from './firebase-messaging';

export const testPushNotifications = async () => {
  console.log('🧪 Testing Push Notifications...');
  
  try {
    // Step 1: Register service worker
    console.log('1. Registering service worker...');
    const swRegistration = await registerServiceWorker();
    if (swRegistration) {
      console.log('✅ Service worker registered successfully');
    } else {
      console.log('❌ Service worker registration failed');
      return;
    }

    // Step 2: Request notification permission and get FCM token
    console.log('2. Requesting notification permission...');
    const token = await requestNotificationPermission();
    if (token) {
      console.log('✅ Notification permission granted, FCM token:', token);
    } else {
      console.log('❌ Notification permission denied or token not received');
      return;
    }

    // Step 3: Test local notification
    console.log('3. Testing local notification...');
    setTimeout(() => {
      sendLeadNotification({
        type: 'new_lead',
        leadId: 'test-123',
        leadName: 'John Doe',
        message: 'Test notification: New lead "John Doe" has been created!',
        actionUrl: '/dashboard/all-leads'
      });
      console.log('✅ Local test notification sent');
    }, 2000);

    console.log('🎉 Push notification test completed successfully!');
    console.log('📝 Next steps:');
    console.log('   - Check browser notifications');
    console.log('   - Test Firebase Functions triggers');
    console.log('   - Verify appointment reminders');
    
    return {
      success: true,
      token,
      serviceWorkerRegistered: !!swRegistration
    };
    
  } catch (error) {
    console.error('❌ Push notification test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred'
    };
  }
};

// Test Firebase Functions notifications (requires backend trigger)
export const testFirebaseFunctionNotification = async (leadData: any) => {
  console.log('🔥 Testing Firebase Functions notification...');
  
  try {
    // This would normally be triggered by Firebase Functions
    // For testing, we'll simulate the notification payload
    const testPayload = {
      notification: {
        title: '🔥 New Lead Assigned!',
        body: `Lead "${leadData.name || 'Test Lead'}" has been assigned to you.`
      },
      data: {
        type: 'lead_assigned',
        leadId: leadData.id || 'test-lead-123',
        actionUrl: '/dashboard/all-leads'
      }
    };

    console.log('📨 Simulated Firebase notification payload:', testPayload);
    
    // Send local notification to simulate what Firebase would send
    sendLeadNotification({
      type: 'lead_assigned',
      leadId: testPayload.data.leadId,
      message: testPayload.notification.body,
      actionUrl: testPayload.data.actionUrl
    });
    
    console.log('✅ Firebase Functions notification test completed');
    
  } catch (error) {
    console.error('❌ Firebase Functions notification test failed:', error);
  }
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testPushNotifications = testPushNotifications;
  (window as any).testFirebaseFunctionNotification = testFirebaseFunctionNotification;
}
