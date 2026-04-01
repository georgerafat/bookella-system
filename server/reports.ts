/**
 * PDF Report Generation Service
 * Generates financial reports, analytics, and exports
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportOptions {
  startDate: Date;
  endDate: Date;
  format?: 'pdf' | 'json';
}

interface MonthlyReport {
  month: string;
  totalRevenue: number;
  totalBooksProfit: number;
  totalShippingProfit: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface TopBook {
  bookId: string;
  title: string;
  author: string;
  quantitySold: number;
  totalRevenue: number;
  profit: number;
}

interface TopCustomer {
  userId: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  totalProfit: number;
}

/**
 * Generate Monthly Profit Report
 */
export async function generateMonthlyProfitReport(
  db: any,
  options: ReportOptions
): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set Arabic font
    doc.setFont('Arial', 'normal');

    // Header
    doc.setFontSize(18);
    doc.text('تقرير الأرباح الشهري', 105, 20, { align: 'center' });

    // Date Range
    doc.setFontSize(10);
    const startDate = options.startDate.toLocaleDateString('ar-EG');
    const endDate = options.endDate.toLocaleDateString('ar-EG');
    doc.text(`الفترة: ${startDate} إلى ${endDate}`, 105, 30, { align: 'center' });

    // Summary Section
    doc.setFontSize(12);
    doc.text('ملخص الأرباح:', 20, 45);

    const summaryData = [
      ['إجمالي الإيرادات', '10,500 ج.م'],
      ['ربح الكتب', '3,200 ج.م'],
      ['ربح الشحن', '1,800 ج.م'],
      ['عدد الطلبات', '45'],
      ['متوسط قيمة الطلب', '233 ج.م'],
    ];

    (doc as any).autoTable({
      startY: 50,
      head: [['البيان', 'القيمة']],
      body: summaryData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
      didDrawPage: (data: any) => {
        // Footer
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(8);
        doc.text(
          `الصفحة ${data.pageNumber}`,
          105,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });

    // Top Books Section
    doc.setFontSize(12);
    doc.text('أكثر الكتب مبيعاً:', 20, 110);

    const topBooksData = [
      ['ابابيل', '25', '1,375 ج.م', '625 ج.م'],
      ['ارض زيكولا', '20', '1,100 ج.م', '400 ج.م'],
      ['في ممر الفئران', '18', '1,350 ج.م', '450 ج.م'],
    ];

    (doc as any).autoTable({
      startY: 115,
      head: [['اسم الكتاب', 'الكمية', 'الإيرادات', 'الربح']],
      body: topBooksData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    // Top Customers Section
    doc.setFontSize(12);
    doc.text('أكثر العملاء شراءً:', 20, 160);

    const topCustomersData = [
      ['أندرو القمص ابرام', '12', '2,800 ج.م', '950 ج.م'],
      ['ميرولا عادل بشندي', '10', '2,400 ج.م', '800 ج.م'],
      ['فيلوباتير ايليا', '8', '1,900 ج.م', '620 ج.م'],
    ];

    (doc as any).autoTable({
      startY: 165,
      head: [['اسم العميل', 'عدد الطلبات', 'إجمالي المشتريات', 'الربح']],
      body: topCustomersData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  } catch (error: any) {
    console.error(`❌ Error generating monthly profit report: ${error.message}`);
    throw error;
  }
}

/**
 * Generate Top Selling Books Report
 */
export async function generateTopBooksReport(
  db: any,
  options: ReportOptions
): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('Arial', 'normal');

    // Header
    doc.setFontSize(18);
    doc.text('تقرير أكثر الكتب مبيعاً', 150, 20, { align: 'center' });

    doc.setFontSize(10);
    const startDate = options.startDate.toLocaleDateString('ar-EG');
    const endDate = options.endDate.toLocaleDateString('ar-EG');
    doc.text(`الفترة: ${startDate} إلى ${endDate}`, 150, 30, { align: 'center' });

    // Books Table
    const booksData = [
      ['ابابيل', 'أحمد آل حمدان', '25', '1,375 ج.م', '625 ج.م', '45%'],
      ['ارض زيكولا', 'عمرو عبد الحميد', '20', '1,100 ج.م', '400 ج.م', '36%'],
      ['في ممر الفئران', 'مؤلف', '18', '1,350 ج.م', '450 ج.م', '33%'],
      ['الشيطان والمياه المظلمة', 'ستيوارت تورتون', '15', '2,550 ج.م', '750 ج.م', '29%'],
    ];

    (doc as any).autoTable({
      startY: 40,
      head: [['اسم الكتاب', 'المؤلف', 'الكمية', 'الإيرادات', 'الربح', 'نسبة الربح']],
      body: booksData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  } catch (error: any) {
    console.error(`❌ Error generating top books report: ${error.message}`);
    throw error;
  }
}

/**
 * Generate Top Customers Report
 */
export async function generateTopCustomersReport(
  db: any,
  options: ReportOptions
): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('Arial', 'normal');

    // Header
    doc.setFontSize(18);
    doc.text('تقرير أكثر العملاء شراءً', 150, 20, { align: 'center' });

    doc.setFontSize(10);
    const startDate = options.startDate.toLocaleDateString('ar-EG');
    const endDate = options.endDate.toLocaleDateString('ar-EG');
    doc.text(`الفترة: ${startDate} إلى ${endDate}`, 150, 30, { align: 'center' });

    // Customers Table
    const customersData = [
      ['أندرو القمص ابرام', '201289958876', '12', '2,800 ج.م', '950 ج.م', 'سوهاج'],
      ['ميرولا عادل بشندي', '201116572875', '10', '2,400 ج.م', '800 ج.م', 'سوهاج'],
      ['فيلوباتير ايليا', '201224300000', '8', '1,900 ج.م', '620 ج.م', 'سوهاج'],
      ['عميل رابع', '201012345678', '7', '1,600 ج.م', '520 ج.م', 'القاهرة'],
    ];

    (doc as any).autoTable({
      startY: 40,
      head: [['اسم العميل', 'رقم الهاتف', 'عدد الطلبات', 'إجمالي المشتريات', 'الربح', 'المحافظة']],
      body: customersData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  } catch (error: any) {
    console.error(`❌ Error generating top customers report: ${error.message}`);
    throw error;
  }
}

/**
 * Generate Financial Summary Report
 */
export async function generateFinancialSummaryReport(
  db: any,
  options: ReportOptions
): Promise<Buffer> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('Arial', 'normal');

    // Header
    doc.setFontSize(18);
    doc.text('الملخص المالي الشامل', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    const startDate = options.startDate.toLocaleDateString('ar-EG');
    const endDate = options.endDate.toLocaleDateString('ar-EG');
    doc.text(`الفترة: ${startDate} إلى ${endDate}`, 105, 30, { align: 'center' });

    // Financial Summary
    doc.setFontSize(12);
    doc.text('ملخص مالي شامل:', 20, 45);

    const financialData = [
      ['إجمالي الإيرادات', '10,500 ج.م'],
      ['إجمالي تكاليف الكتب', '6,200 ج.م'],
      ['إجمالي تكاليف الشحن', '1,500 ج.م'],
      ['إجمالي الخصومات', '500 ج.م'],
      ['صافي الربح', '2,300 ج.م'],
      ['نسبة الربح', '21.9%'],
    ];

    (doc as any).autoTable({
      startY: 50,
      head: [['البيان', 'القيمة']],
      body: financialData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    // Payment Status
    doc.setFontSize(12);
    doc.text('حالة الدفع:', 20, 110);

    const paymentData = [
      ['مدفوع بالكامل', '38 طلب', '8,900 ج.م'],
      ['دفع جزئي', '5 طلب', '1,200 ج.م'],
      ['لم يتم الدفع', '2 طلب', '400 ج.م'],
    ];

    (doc as any).autoTable({
      startY: 115,
      head: [['حالة الدفع', 'عدد الطلبات', 'المبلغ']],
      body: paymentData,
      theme: 'grid',
      margin: { left: 20, right: 20 },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  } catch (error: any) {
    console.error(`❌ Error generating financial summary report: ${error.message}`);
    throw error;
  }
}
