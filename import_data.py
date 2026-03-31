#!/usr/bin/env python3
"""
استيراد بيانات Excel إلى قاعدة البيانات
"""

import pandas as pd
import mysql.connector
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# قراءة بيانات الاتصال من متغيرات البيئة
DATABASE_URL = os.getenv('DATABASE_URL')

# تحليل DATABASE_URL
# mysql://user:password@host:port/database
if DATABASE_URL:
    # تحليل الـ URL - إزالة المعاملات الإضافية
    url_clean = DATABASE_URL.replace('mysql://', '')
    # إزالة SSL وغيرها من المعاملات
    url_clean = url_clean.split('?')[0]
    
    db_parts = url_clean.split('@')
    user_pass = db_parts[0].split(':')
    host_port_db = db_parts[1].split('/')
    host_port = host_port_db[0].split(':')
    
    user = user_pass[0]
    password = user_pass[1] if len(user_pass) > 1 else ''
    host = host_port[0]
    port = int(host_port[1]) if len(host_port) > 1 else 4000
    database = host_port_db[1] if len(host_port_db) > 1 else 'bookella'
else:
    # قيم افتراضية للاختبار
    user = 'root'
    password = 'password'
    host = 'localhost'
    port = 3306
    database = 'bookella'

print(f"🔌 الاتصال بقاعدة البيانات: {host}:{port}/{database}")

# الاتصال بقاعدة البيانات
try:
    connection = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        ssl_disabled=False
    )
    cursor = connection.cursor()
    print("✅ تم الاتصال بنجاح\n")
except Exception as e:
    print(f"❌ خطأ في الاتصال: {e}")
    exit(1)

# قراءة ملف Excel
excel_file = '/home/ubuntu/upload/Bookella_Data2.xlsx'
print(f"📂 قراءة الملف: {excel_file}\n")

try:
    users_df = pd.read_excel(excel_file, sheet_name='Users')
    books_df = pd.read_excel(excel_file, sheet_name='Books')
    orders_df = pd.read_excel(excel_file, sheet_name='Orders')
except Exception as e:
    print(f"❌ خطأ في قراءة الملف: {e}")
    exit(1)

print(f"📊 عدد العملاء: {len(users_df)}")
print(f"📚 عدد الكتب: {len(books_df)}")
print(f"📦 عدد الطلبات: {len(orders_df)}\n")

# 1. استيراد العملاء
print("📝 جاري استيراد العملاء...")
users_imported = 0
for idx, row in users_df.iterrows():
    try:
        user_id = str(row.get('User ID', f'USR-{idx+1}')).strip()
        name = str(row.get('اسم العميل', 'عميل')).strip()
        phone = str(row.get('رقم الهاتف', '')).strip()
        phone = ''.join(filter(str.isdigit, phone))[-11:] if phone else None
        governorate = str(row.get('المحافظة', '')).strip() or None
        address = str(row.get('العنوان بالتفصيل', '')).strip() or None
        registration_source = 'واتس' if row.get('واتس') == 1 else ('تليجرام' if row.get('تليجرام') == 1 else 'أخرى')
        points = int(row.get('النقاط', 0)) if pd.notna(row.get('النقاط')) else 0
        total_debt = float(row.get('المديونية الكلية', 0)) if pd.notna(row.get('المديونية الكلية')) else 0
        
        sql = """
        INSERT IGNORE INTO users 
        (userId, name, phone, governorate, address, registrationSource, points, totalDebt, createdAt, updatedAt)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(sql, (user_id, name, phone, governorate, address, registration_source, points, total_debt))
        users_imported += 1
    except Exception as e:
        print(f"⚠️  خطأ في صف العميل {idx+1}: {e}")

connection.commit()
print(f"✅ تم استيراد {users_imported} عميل\n")

# 2. استيراد الكتب
print("📚 جاري استيراد الكتب...")
books_imported = 0
for idx, row in books_df.iterrows():
    try:
        book_id = str(row.get('Book ID', f'BOO-{idx+1}')).strip()
        title = str(row.get('اسم الكتاب', 'كتاب')).strip()
        author = str(row.get('اسم الكاتب', 'مؤلف')).strip()
        book_type = str(row.get('نوع الكتاب', 'هاي كوبي')).strip()
        main_category = str(row.get('التصنيف الرئيسي', '')).strip() or None
        series = str(row.get('اسم السلسلة ( لو الكتاب له اجزاء)', '')).strip() or None
        subcategories = str(row.get('تصنيفات فرعية إضافية', '')).strip() or None
        buy_price = float(row.get('سعر الشراء', 0)) if pd.notna(row.get('سعر الشراء')) else 0
        sell_price = float(row.get('سعر البيع', 0)) if pd.notna(row.get('سعر البيع')) else 0
        discounted_price = float(row.get('السعر بعد الخصم', 0)) if pd.notna(row.get('السعر بعد الخصم')) else None
        available_quantity = int(row.get('الكمية المتاحة', 0)) if pd.notna(row.get('الكمية المتاحة')) else 0
        language = str(row.get('لغة الكتاب', 'عربي')).strip()
        publisher = str(row.get('دار النشر', '')).strip() or None
        pages = int(row.get('عدد الصفحات', 0)) if pd.notna(row.get('عدد الصفحات')) else None
        cover_image = str(row.get('صورة الغلاف (لينك)', '')).strip() or None
        notes = str(row.get('ملاحظات', '')).strip() or None
        
        sql = """
        INSERT IGNORE INTO books 
        (bookId, title, author, bookType, mainCategory, series, subcategories, 
         buyPrice, sellPrice, discountedPrice, availableQuantity, language, 
         publisher, pages, coverImage, notes, createdAt, updatedAt)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(sql, (book_id, title, author, book_type, main_category, series, 
                            subcategories, buy_price, sell_price, discounted_price, 
                            available_quantity, language, publisher, pages, cover_image, notes))
        books_imported += 1
    except Exception as e:
        print(f"⚠️  خطأ في صف الكتاب {idx+1}: {e}")

connection.commit()
print(f"✅ تم استيراد {books_imported} كتاب\n")

# 3. استيراد الطلبات
print("📦 جاري استيراد الطلبات...")
orders_imported = 0
for idx, row in orders_df.iterrows():
    try:
        order_id = str(row.get('Order ID', f'ORD-{idx+1}')).strip()
        user_id = str(row.get('User ID', '')).strip() or None
        customer_name = str(row.get('اسم العميل', 'عميل')).strip()
        customer_phone = str(row.get('رقم الهاتف', '')).strip()
        customer_phone = ''.join(filter(str.isdigit, customer_phone))[-11:] if customer_phone else None
        alternate_phone = str(row.get('رقت هاتف اخر', '')).strip() or None
        order_date = pd.to_datetime(row.get('تاريخ الطلب'), errors='coerce') or datetime.now()
        governorate = str(row.get('المحافظة', '')).strip() or None
        detailed_address = str(row.get('العنوان بالتفصيل', '')).strip() or None
        num_books = int(row.get('عدد الكتب', 0)) if pd.notna(row.get('عدد الكتب')) else 0
        
        total_buy_price = float(row.get('سعر شراء الكتب', 0)) if pd.notna(row.get('سعر شراء الكتب')) else 0
        total_sell_price = float(row.get('سعر بيع الكتب (المباع)', 0)) if pd.notna(row.get('سعر بيع الكتب (المباع)')) else 0
        books_profit = float(row.get('مكسب الكتب', 0)) if pd.notna(row.get('مكسب الكتب')) else (total_sell_price - total_buy_price)
        
        shipping_cost_taken = float(row.get('سعر الشحن (المأخوذ)', 0)) if pd.notna(row.get('سعر الشحن (المأخوذ)')) else 0
        additional_shipping = float(row.get('شحن اضافي ( لو تم دفع شحن اضافي )', 0)) if pd.notna(row.get('شحن اضافي ( لو تم دفع شحن اضافي )')) else 0
        order_shipping_cost = float(row.get('سعر شحن الاوردر', 0)) if pd.notna(row.get('سعر شحن الاوردر')) else 0
        shipping_profit = float(row.get('مكسب الشحن', 0)) if pd.notna(row.get('مكسب الشحن')) else (shipping_cost_taken - order_shipping_cost)
        
        promo_code = str(row.get('كوبون الخصم (إن وجد)', '')).strip() or None
        promo_discount = float(row.get('كوبون الخصم (إن وجد)', 0)) if pd.notna(row.get('كوبون الخصم (إن وجد)')) and isinstance(row.get('كوبون الخصم (إن وجد)'), (int, float)) else 0
        final_price = float(row.get('السعر النهائي للاوردر (السعر المباع بة)', 0)) if pd.notna(row.get('السعر النهائي للاوردر (السعر المباع بة)')) else 0
        
        payment_status = str(row.get('حالة الدفع', 'اوفلاين')).strip()
        order_status = str(row.get('حالة الطلب', 'قيد التجهيز')).strip()
        payment_method = str(row.get('الدفع', 'تم الدفع')).strip()
        amount_paid = float(row.get('المبلغ المدفوع', 0)) if pd.notna(row.get('المبلغ المدفوع')) else 0
        remaining_amount = float(row.get('المبلغ المتبقي', 0)) if pd.notna(row.get('المبلغ المتبقي')) else (final_price - amount_paid)
        total_profit = float(row.get('المكسب الكلي', 0)) if pd.notna(row.get('المكسب الكلي')) else (books_profit + shipping_profit)
        
        notes = str(row.get('ملاحظات', '')).strip() or None
        
        sql = """
        INSERT IGNORE INTO orders 
        (orderId, userId, customerName, customerPhone, alternatePhone, orderDate, 
         governorate, detailedAddress, numberOfBooks, totalBuyPrice, totalSellPrice, 
         booksProfit, shippingCostTaken, additionalShipping, orderShippingCost, 
         shippingProfit, promoCode, promoDiscount, finalPrice, paymentStatus, 
         orderStatus, paymentMethod, amountPaid, remainingAmount, totalProfit, 
         notes, createdAt, updatedAt)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        cursor.execute(sql, (order_id, user_id, customer_name, customer_phone, alternate_phone, 
                            order_date, governorate, detailed_address, num_books, total_buy_price, 
                            total_sell_price, books_profit, shipping_cost_taken, additional_shipping, 
                            order_shipping_cost, shipping_profit, promo_code, promo_discount, 
                            final_price, payment_status, order_status, payment_method, amount_paid, 
                            remaining_amount, total_profit, notes))
        orders_imported += 1
    except Exception as e:
        print(f"⚠️  خطأ في صف الطلب {idx+1}: {e}")

connection.commit()
print(f"✅ تم استيراد {orders_imported} طلب\n")

# إغلاق الاتصال
cursor.close()
connection.close()

print("=" * 60)
print("🎉 تم استيراد جميع البيانات بنجاح!")
print("=" * 60)
print(f"✅ {users_imported} عميل")
print(f"✅ {books_imported} كتاب")
print(f"✅ {orders_imported} طلب")
print("\n🚀 يمكنك الآن الذهاب إلى الموقع والاطلاع على البيانات الحقيقية")
