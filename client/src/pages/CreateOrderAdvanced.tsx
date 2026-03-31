import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  bookId: string;
  bookName: string;
  bookType: string; // هاي كوبي، أصلي، إلخ
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function CreateOrderAdvanced() {
  // معلومات العميل
  const [customerName, setCustomerName] = useState("");
  const [userId, setUserId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  // معلومات الشحن والعنوان
  const [governorate, setGovernorate] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");

  // معلومات الكتب والأسعار
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [bookQuantity, setBookQuantity] = useState("1");

  // معلومات الشحن والخصومات
  const [shippingCostTaken, setShippingCostTaken] = useState(""); // سعر الشحن المأخوذ من العميل
  const [additionalShipping, setAdditionalShipping] = useState(""); // شحن إضافي
  const [orderShippingCost, setOrderShippingCost] = useState(""); // سعر شحن الأوردر الفعلي
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("0");

  // حالات الطلب والدفع
  const [paymentStatus, setPaymentStatus] = useState("اوفلاين"); // اوفلاين، أونلاين
  const [orderStatus, setOrderStatus] = useState("قيد التجهيز"); // قيد التجهيز، مع المندوب، تم الاستلام
  const [paymentMethod, setPaymentMethod] = useState("تم الدفع"); // تم الدفع، دفع جزئي
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");

  // البيانات المتاحة
  const availableBooks = [
    { id: "BOO-31", name: "ابابيل", type: "هاي كوبي", author: "أحمد آل حمدان", buyPrice: 40, sellPrice: 55 },
    { id: "BOO-41", name: "أحببت وغدا", type: "هاي كوبي", author: "عماد رشاد عثمان", buyPrice: 40, sellPrice: 55 },
    { id: "BOO-1", name: "ارض زيكولا", type: "هاي كوبي", author: "عمرو عبد الحميد", buyPrice: 40, sellPrice: 55 },
    { id: "BOO-2", name: "يوتوبيا", type: "هاي كوبي", author: "مؤلف", buyPrice: 65, sellPrice: 65 },
    { id: "BOO-3", name: "في ممر الفئران", type: "هاي كوبي", author: "مؤلف", buyPrice: 75, sellPrice: 75 },
  ];

  const governorates = [
    "القاهرة", "الجيزة", "الإسكندرية", "الشرقية", "الدقهلية", "البحيرة",
    "الغربية", "المنوفية", "القليوبية", "بني سويف", "الفيوم", "المنيا",
    "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
  ];

  // الحسابات
  const totalBuyPrice = orderItems.reduce((sum, item) => sum + (item.quantity * (availableBooks.find(b => b.id === item.bookId)?.buyPrice || 0)), 0);
  const totalSellPrice = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const booksProfit = totalSellPrice - totalBuyPrice;

  const shippingCostTakenNum = Number(shippingCostTaken) || 0;
  const additionalShippingNum = Number(additionalShipping) || 0;
  const orderShippingCostNum = Number(orderShippingCost) || 0;
  const shippingProfit = shippingCostTakenNum - orderShippingCostNum;

  const promoDis = Number(promoDiscount) || 0;
  const finalPrice = totalSellPrice + shippingCostTakenNum - promoDis;
  const amountPaidNum = Number(amountPaid) || 0;
  const remainingAmount = finalPrice - amountPaidNum;
  const totalProfit = booksProfit + shippingProfit;

  const handleAddBook = () => {
    if (!selectedBook || !bookQuantity) {
      toast.error("اختر كتاب وأدخل الكمية");
      return;
    }

    const book = availableBooks.find((b) => b.id === selectedBook);
    if (!book) {
      toast.error("الكتاب غير موجود");
      return;
    }

    const qty = Number(bookQuantity);
    if (qty <= 0) {
      toast.error("الكمية يجب أن تكون أكبر من 0");
      return;
    }

    if (orderItems.some((item) => item.bookId === selectedBook)) {
      toast.error("هذا الكتاب موجود بالفعل في الطلب");
      return;
    }

    const newItem: OrderItem = {
      bookId: book.id,
      bookName: book.name,
      bookType: book.type,
      quantity: qty,
      unitPrice: book.sellPrice,
      totalPrice: qty * book.sellPrice,
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedBook("");
    setBookQuantity("1");
    toast.success("تم إضافة الكتاب");
  };

  const handleRemoveBook = (bookId: string) => {
    setOrderItems(orderItems.filter((item) => item.bookId !== bookId));
    toast.success("تم حذف الكتاب من الطلب");
  };

  const handleCreateOrder = async () => {
    if (!customerName || !customerPhone || !governorate || orderItems.length === 0) {
      toast.error("يرجى ملء جميع البيانات المطلوبة");
      return;
    }

    try {
      // هنا يتم إرسال البيانات إلى API
      const orderData = {
        customerName,
        userId,
        customerPhone,
        alternatePhone,
        orderDate,
        governorate,
        detailedAddress,
        items: orderItems,
        totalBuyPrice,
        totalSellPrice,
        booksProfit,
        shippingCostTaken: shippingCostTakenNum,
        additionalShipping: additionalShippingNum,
        orderShippingCost: orderShippingCostNum,
        shippingProfit,
        promoCode,
        promoDiscount: promoDis,
        finalPrice,
        paymentStatus,
        orderStatus,
        paymentMethod,
        amountPaid: amountPaidNum,
        remainingAmount,
        totalProfit,
        notes,
      };

      console.log("Order Data:", orderData);
      toast.success("تم إنشاء الطلب بنجاح!");

      // إعادة تعيين النموذج
      setCustomerName("");
      setUserId("");
      setCustomerPhone("");
      setAlternatePhone("");
      setGovernorate("");
      setDetailedAddress("");
      setOrderItems([]);
      setShippingCostTaken("");
      setAdditionalShipping("");
      setOrderShippingCost("");
      setPromoCode("");
      setPromoDiscount("0");
      setAmountPaid("");
      setNotes("");
    } catch (error: any) {
      toast.error(`خطأ: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">إنشاء طلب جديد - نسخة متقدمة</h1>
          <p className="text-muted-foreground">نفس نموذج الـ Excel مع حسابات الأرباح التفصيلية</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">اسم العميل *</label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="أندرو القمص ابرام"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <Input
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="USR-1"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">رقم الهاتف *</label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="201012345678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">رقم هاتف آخر</label>
                    <Input
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      placeholder="201098765432"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">تاريخ الطلب</label>
                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشحن والعنوان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">المحافظة *</label>
                  <Select value={governorate} onValueChange={setGovernorate}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">العنوان بالتفصيل</label>
                  <Textarea
                    value={detailedAddress}
                    onChange={(e) => setDetailedAddress(e.target.value)}
                    placeholder="جرجا الحوزه بجوار السيد صابر"
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Costs */}
            <Card>
              <CardHeader>
                <CardTitle>تكاليف الشحن</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">سعر الشحن (المأخوذ)</label>
                    <Input
                      type="number"
                      value={shippingCostTaken}
                      onChange={(e) => setShippingCostTaken(e.target.value)}
                      placeholder="70"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">شحن إضافي</label>
                    <Input
                      type="number"
                      value={additionalShipping}
                      onChange={(e) => setAdditionalShipping(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">سعر شحن الأوردر</label>
                    <Input
                      type="number"
                      value={orderShippingCost}
                      onChange={(e) => setOrderShippingCost(e.target.value)}
                      placeholder="75"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo & Payment */}
            <Card>
              <CardHeader>
                <CardTitle>الخصومات وحالة الدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">كود الخصم</label>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="SUMMER20"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">قيمة الخصم</label>
                    <Input
                      type="number"
                      value={promoDiscount}
                      onChange={(e) => setPromoDiscount(e.target.value)}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">حالة الدفع</label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="اوفلاين">اوفلاين</SelectItem>
                        <SelectItem value="أونلاين">أونلاين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">حالة الطلب</label>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                        <SelectItem value="مع المندوب">مع المندوب</SelectItem>
                        <SelectItem value="تم الاستلام">تم الاستلام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">طريقة الدفع</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="تم الدفع">تم الدفع</SelectItem>
                        <SelectItem value="دفع جزئي">دفع جزئي</SelectItem>
                        <SelectItem value="لم يتم الدفع">لم يتم الدفع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">المبلغ المدفوع</label>
                    <Input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="210"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">المبلغ المتبقي</label>
                    <Input
                      type="number"
                      value={remainingAmount}
                      disabled
                      className="mt-1 bg-gray-100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات إضافية</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Add Books */}
            <Card>
              <CardHeader>
                <CardTitle>إضافة كتب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">اختر كتاب</label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر كتاب" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.name} ({book.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">الكمية</label>
                  <Input
                    type="number"
                    value={bookQuantity}
                    onChange={(e) => setBookQuantity(e.target.value)}
                    placeholder="1"
                    className="mt-1"
                    min="1"
                  />
                </div>
                <Button onClick={handleAddBook} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة للطلب
                </Button>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>عناصر الطلب</CardTitle>
                <CardDescription>{orderItems.length} كتاب</CardDescription>
              </CardHeader>
              <CardContent>
                {orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                      <div key={item.bookId} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.bookName}</p>
                          <p className="text-xs text-muted-foreground">{item.bookType}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {item.unitPrice} = {item.totalPrice} ج.م
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBook(item.bookId)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد كتب</p>
                )}
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  ملخص مالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between">
                    <span>سعر الشراء الكلي:</span>
                    <span className="font-medium">{totalBuyPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سعر البيع الكلي:</span>
                    <span className="font-medium">{totalSellPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>ربح الكتب:</span>
                    <span>{booksProfit.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between">
                    <span>الشحن المأخوذ:</span>
                    <span className="font-medium">{shippingCostTakenNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكلفة الشحن:</span>
                    <span className="font-medium">{orderShippingCostNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>ربح الشحن:</span>
                    <span>{shippingProfit.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="space-y-2 pb-3 border-b">
                  <div className="flex justify-between">
                    <span>إجمالي الكتب + الشحن:</span>
                    <span className="font-medium">{(totalSellPrice + shippingCostTakenNum).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span className="font-medium">-{promoDis.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>السعر النهائي:</span>
                    <span>{finalPrice.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>صافي الربح:</span>
                    <span>{totalProfit.toFixed(2)} ج.م</span>
                  </div>
                </div>

                {remainingAmount > 0 && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-3">
                    <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      متبقي: {remainingAmount.toFixed(2)} ج.م
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCreateOrder}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  disabled={orderItems.length === 0}
                >
                  إنشاء الطلب
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
