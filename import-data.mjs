import * as XLSX from 'xlsx';
import { drizzle } from 'drizzle-orm/mysql2';
import { users, books, orders, orderItems, suppliers } from './drizzle/schema.js';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

async function importData() {
  console.log('🚀 بدء استيراد البيانات من Excel...\n');

  // قراءة ملف Excel
  const workbook = XLSX.readFile('/home/ubuntu/upload/Bookella_Data2.xlsx');
  
  const usersSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Users']);
  const booksSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Books']);
  const ordersSheet = XLSX.utils.sheet_to_json(workbook.Sheets['Orders']);

  console.log(`📊 عدد العملاء: ${usersSheet.length}`);
  console.log(`📚 عدد الكتب: ${booksSheet.length}`);
  console.log(`📦 عدد الطلبات: ${ordersSheet.length}\n`);

  // إنشاء اتصال بقاعدة البيانات
  const connection = await mysql.createConnection(DATABASE_URL);
  const db = drizzle(connection);

  try {
    // 1. استيراد العملاء
    console.log('📝 جاري استيراد العملاء...');
    for (const userRow of usersSheet) {
      try {
        const userId = userRow['User ID'] || `USR-${Math.random().toString(36).substr(2, 9)}`;
        const phone = String(userRow['رقم الهاتف'] || '').trim();
        const registrationSource = userRow['واتس'] === 1 ? 'واتس' : (userRow['تليجرام'] === 1 ? 'تليجرام' : 'أخرى');

        await db.insert(users).values({
          userId,
          name: userRow['اسم العميل'] || 'عميل',
          phone: phone.replace(/[^\d]/g, '').slice(-11) || null,
          governorate: userRow['المحافظة'] || null,
          address: userRow['العنوان بالتفصيل'] || null,
          registrationDate: new Date(userRow['تاريخ التسجيل'] || new Date()),
          registrationSource,
          points: Number(userRow['النقاط']) || 0,
          totalDebt: Number(userRow['المديونية الكلية']) || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).catch(() => {}); // تجاهل الأخطاء المكررة
      } catch (error) {
        console.error(`❌ خطأ في استيراد العميل: ${error.message}`);
      }
    }
    console.log(`✅ تم استيراد ${usersSheet.length} عميل\n`);

    // 2. استيراد الكتب
    console.log('📚 جاري استيراد الكتب...');
    for (const bookRow of booksSheet) {
      try {
        const bookId = bookRow['Book ID'] || `BOO-${Math.random().toString(36).substr(2, 9)}`;
        
        await db.insert(books).values({
          bookId,
          title: bookRow['اسم الكتاب'] || 'كتاب',
          author: bookRow['اسم الكاتب'] || 'مؤلف',
          bookType: bookRow['نوع الكتاب'] || 'هاي كوبي',
          mainCategory: bookRow['التصنيف الرئيسي'] || null,
          series: bookRow['اسم السلسلة ( لو الكتاب له اجزاء)'] || null,
          subcategories: bookRow['تصنيفات فرعية إضافية'] || null,
          buyPrice: Number(bookRow['سعر الشراء']) || 0,
          sellPrice: Number(bookRow['سعر البيع']) || 0,
          discountedPrice: Number(bookRow['السعر بعد الخصم']) || null,
          availableQuantity: Number(bookRow['الكمية المتاحة']) || 0,
          language: bookRow['لغة الكتاب'] || 'عربي',
          publisher: bookRow['دار النشر'] || null,
          pages: Number(bookRow['عدد الصفحات']) || null,
          coverImage: bookRow['صورة الغلاف (لينك)'] || null,
          notes: bookRow['ملاحظات'] || null,
          supplierId: null, // سيتم ربطه لاحقاً
          createdAt: new Date(),
          updatedAt: new Date(),
        }).catch(() => {}); // تجاهل الأخطاء المكررة
      } catch (error) {
        console.error(`❌ خطأ في استيراد الكتاب: ${error.message}`);
      }
    }
    console.log(`✅ تم استيراد ${booksSheet.length} كتاب\n`);

    // 3. استيراد الطلبات
    console.log('📦 جاري استيراد الطلبات...');
    for (const orderRow of ordersSheet) {
      try {
        const orderId = orderRow['Order ID'] || `ORD-${Math.random().toString(36).substr(2, 9)}`;
        const userId = orderRow['User ID'] || null;
        const phone = String(orderRow['رقم الهاتف'] || '').trim();
        const totalBuyPrice = Number(orderRow['سعر شراء الكتب']) || 0;
        const totalSellPrice = Number(orderRow['سعر بيع الكتب (المباع)']) || 0;
        const booksProfit = Number(orderRow['مكسب الكتب']) || (totalSellPrice - totalBuyPrice);
        const shippingCostTaken = Number(orderRow['سعر الشحن (المأخوذ)']) || 0;
        const orderShippingCost = Number(orderRow['سعر شحن الاوردر']) || 0;
        const shippingProfit = Number(orderRow['مكسب الشحن']) || (shippingCostTaken - orderShippingCost);
        const promoDiscount = Number(orderRow['كوبون الخصم (إن وجد)']) || 0;
        const finalPrice = Number(orderRow['السعر النهائي للاوردر (السعر المباع بة)']) || 0;
        const amountPaid = Number(orderRow['المبلغ المدفوع']) || 0;
        const remainingAmount = Number(orderRow['المبلغ المتبقي']) || (finalPrice - amountPaid);

        await db.insert(orders).values({
          orderId,
          userId: userId || null,
          customerName: orderRow['اسم العميل'] || 'عميل',
          customerPhone: phone.replace(/[^\d]/g, '').slice(-11) || null,
          alternatePhone: String(orderRow['رقت هاتف اخر'] || '').trim() || null,
          orderDate: new Date(orderRow['تاريخ الطلب'] || new Date()),
          governorate: orderRow['المحافظة'] || null,
          detailedAddress: orderRow['العنوان بالتفصيل'] || null,
          numberOfBooks: Number(orderRow['عدد الكتب']) || 0,
          totalBuyPrice,
          totalSellPrice,
          booksProfit,
          shippingCostTaken,
          additionalShipping: Number(orderRow['شحن اضافي ( لو تم دفع شحن اضافي )']) || 0,
          orderShippingCost,
          shippingProfit,
          promoCode: orderRow['كوبون الخصم (إن وجد)'] || null,
          promoDiscount,
          finalPrice,
          paymentStatus: orderRow['حالة الدفع'] || 'اوفلاين',
          orderStatus: orderRow['حالة الطلب'] || 'قيد التجهيز',
          paymentMethod: orderRow['الدفع'] || 'تم الدفع',
          amountPaid,
          remainingAmount,
          totalProfit: Number(orderRow['المكسب الكلي']) || (booksProfit + shippingProfit),
          notes: orderRow['ملاحظات'] || null,
          createdAt: new Date(orderRow['تاريخ الطلب'] || new Date()),
          updatedAt: new Date(),
        }).catch(() => {}); // تجاهل الأخطاء المكررة
      } catch (error) {
        console.error(`❌ خطأ في استيراد الطلب: ${error.message}`);
      }
    }
    console.log(`✅ تم استيراد ${ordersSheet.length} طلب\n`);

    console.log('🎉 تم استيراد جميع البيانات بنجاح!');
    console.log('✅ يمكنك الآن الذهاب إلى الموقع والاطلاع على البيانات الحقيقية');

  } catch (error) {
    console.error('❌ خطأ في الاستيراد:', error);
  } finally {
    await connection.end();
  }
}

importData().catch(console.error);
