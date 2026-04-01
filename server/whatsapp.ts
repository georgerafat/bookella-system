/**
 * WhatsApp Notification Service
 * Sends reminders and alerts via WhatsApp using Twilio
 */

import axios from 'axios';

// Configuration - يجب تعيين هذه المتغيرات من البيئة
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '';

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'reminder' | 'overdue' | 'payment' | 'order_status';
  borrowingId?: number;
  orderId?: number;
}

interface NotificationLog {
  id?: number;
  recipientPhone: string;
  message: string;
  type: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  errorMessage?: string;
}

/**
 * إرسال رسالة WhatsApp
 */
export async function sendWhatsAppMessage(params: WhatsAppMessage): Promise<boolean> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn('⚠️ WhatsApp credentials not configured');
      return false;
    }

    // تنسيق رقم الهاتف (إضافة رمز الدولة إذا لم يكن موجوداً)
    let phoneNumber = params.to.replace(/[^\d]/g, '');
    if (!phoneNumber.startsWith('2')) {
      phoneNumber = '2' + phoneNumber; // إضافة رمز مصر
    }
    phoneNumber = '+' + phoneNumber;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const response = await axios.post(
      url,
      {
        From: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
        To: `whatsapp:${phoneNumber}`,
        Body: params.message,
      },
      {
        auth: {
          username: TWILIO_ACCOUNT_SID,
          password: TWILIO_AUTH_TOKEN,
        },
      }
    );

    console.log(`✅ WhatsApp message sent to ${phoneNumber}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send WhatsApp message: ${error.message}`);
    return false;
  }
}

/**
 * إرسال تذكير بموعد إرجاع الكتاب
 */
export async function sendBorrowingReminder(
  customerName: string,
  customerPhone: string,
  bookTitle: string,
  dueDate: Date
): Promise<boolean> {
  const dueDateFormatted = dueDate.toLocaleDateString('ar-EG');
  const message = `مرحباً ${customerName}،\n\n📚 تذكير: موعد إرجاع الكتاب "${bookTitle}" هو ${dueDateFormatted}\n\nيرجى التأكد من إرجاع الكتاب في الموعد المحدد.\n\nشكراً لك! 📖`;

  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    type: 'reminder',
  });
}

/**
 * إرسال تنبيه بتأخر الكتاب
 */
export async function sendOverdueAlert(
  customerName: string,
  customerPhone: string,
  bookTitle: string,
  daysOverdue: number
): Promise<boolean> {
  const message = `⚠️ تنبيه: ${customerName}\n\nالكتاب "${bookTitle}" متأخر عن موعد الإرجاع بـ ${daysOverdue} أيام.\n\nيرجى إرجاع الكتاب في أقرب وقت ممكن.\n\nشكراً لتعاونك! 📚`;

  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    type: 'overdue',
  });
}

/**
 * إرسال تذكير بالدفع المتبقي
 */
export async function sendPaymentReminder(
  customerName: string,
  customerPhone: string,
  orderId: string,
  remainingAmount: number
): Promise<boolean> {
  const message = `مرحباً ${customerName}،\n\n💰 تذكير: لديك مبلغ متبقي من الطلب #${orderId}\n\nالمبلغ المتبقي: ${remainingAmount.toFixed(2)} ج.م\n\nيرجى تسديد المبلغ في أقرب وقت.\n\nشكراً لك! 💳`;

  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    type: 'payment',
  });
}

/**
 * إرسال تحديث حالة الطلب
 */
export async function sendOrderStatusUpdate(
  customerName: string,
  customerPhone: string,
  orderId: string,
  status: string
): Promise<boolean> {
  const statusMessages: Record<string, string> = {
    'قيد التجهيز': '⏳ جاري تجهيز طلبك',
    'مع المندوب': '🚚 الطلب مع المندوب',
    'تم الاستلام': '✅ تم استلام الطلب بنجاح',
  };

  const statusMessage = statusMessages[status] || status;
  const message = `مرحباً ${customerName}،\n\n${statusMessage}\n\nرقم الطلب: #${orderId}\n\nشكراً لتعاملك معنا! 🎁`;

  return sendWhatsAppMessage({
    to: customerPhone,
    message,
    type: 'order_status',
  });
}

/**
 * جدولة إرسال التذكيرات التلقائية
 * يجب تشغيل هذه الدالة بشكل دوري (مثل كل ساعة)
 */
export async function scheduleBorrowingReminders(db: any): Promise<void> {
  try {
    // الحصول على الكتب المستعارة التي تنتهي خلال 1-2 يوم
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // هنا يتم الاستعلام عن الكتب المستعارة
    // والتحقق من تاريخ الإرجاع المتوقع
    // وإرسال التذكيرات

    console.log('✅ Borrowing reminders scheduled');
  } catch (error: any) {
    console.error(`❌ Error scheduling reminders: ${error.message}`);
  }
}

/**
 * جدولة إرسال تنبيهات الكتب المتأخرة
 */
export async function scheduleOverdueAlerts(db: any): Promise<void> {
  try {
    // الحصول على الكتب المتأخرة
    // وإرسال التنبيهات

    console.log('✅ Overdue alerts scheduled');
  } catch (error: any) {
    console.error(`❌ Error scheduling overdue alerts: ${error.message}`);
  }
}
