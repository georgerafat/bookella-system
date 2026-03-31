import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface OrderItem {
  bookId: string;
  bookTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function CreateOrder() {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [notes, setNotes] = useState("");

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [bookQuantity, setBookQuantity] = useState("1");
  const [isAddingBook, setIsAddingBook] = useState(false);

  // Sample books data - في الواقع ستأتي من قاعدة البيانات
  const availableBooks = [
    { id: "BK001", title: "الحب في زمن الكوليرا", price: 80, quantity: 15 },
    { id: "BK002", title: "مائة عام من العزلة", price: 100, quantity: 8 },
    { id: "BK003", title: "العادات الذرية", price: 75, quantity: 3 },
    { id: "BK004", title: "الأب الغني والأب الفقير", price: 65, quantity: 20 },
    { id: "BK005", title: "قواعد العقل", price: 85, quantity: 12 },
  ];

  const governorates = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الشرقية",
    "الدقهلية",
    "البحيرة",
    "الغربية",
    "المنوفية",
    "القليوبية",
    "بني سويف",
    "الفيوم",
    "المنيا",
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
  ];

  // حساب الإجمالي
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const shippingCostNum = Number(shippingCost) || 0;
  const promoDiscount = 0; // سيتم حسابها من API
  const total = subtotal + shippingCostNum - promoDiscount;
  const booksProfit = orderItems.reduce((sum, item) => sum + (item.totalPrice * 0.3), 0); // مثال: 30% ربح
  const shippingProfit = shippingCostNum * 0.2; // مثال: 20% ربح من الشحن

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
    if (qty <= 0 || qty > book.quantity) {
      toast.error(`الكمية يجب أن تكون بين 1 و ${book.quantity}`);
      return;
    }

    // تحقق من عدم إضافة نفس الكتاب مرتين
    if (orderItems.some((item) => item.bookId === selectedBook)) {
      toast.error("هذا الكتاب موجود بالفعل في الطلب");
      return;
    }

    const newItem: OrderItem = {
      bookId: book.id,
      bookTitle: book.title,
      quantity: qty,
      unitPrice: book.price,
      totalPrice: qty * book.price,
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
    // التحقق من البيانات
    if (!customerName || !customerPhone || !governorate || orderItems.length === 0) {
      toast.error("يرجى ملء جميع البيانات المطلوبة واختيار كتب");
      return;
    }

    try {
      // هنا يتم إرسال الطلب إلى API
      // const result = await trpc.orders.create.mutate({...})
      
      toast.success("تم إنشاء الطلب بنجاح!");
      
      // إعادة تعيين النموذج
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setGovernorate("");
      setShippingAddress("");
      setShippingCost("");
      setPromoCode("");
      setNotes("");
      setOrderItems([]);
    } catch (error: any) {
      toast.error(`خطأ: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">إنشاء طلب جديد</h1>
          <p className="text-muted-foreground">أضف كتب وحدد تفاصيل العميل والشحن</p>
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
                <div>
                  <label className="text-sm font-medium">اسم العميل *</label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسم العميل"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">رقم الهاتف *</label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="01012345678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشحن</CardTitle>
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
                  <label className="text-sm font-medium">عنوان الشحن</label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="أدخل عنوان الشحن التفصيلي"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">تكلفة الشحن (ج.م)</label>
                  <Input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>كود الخصم</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="أدخل كود الخصم (اختياري)"
                />
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
                  placeholder="أي ملاحظات إضافية عن الطلب..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
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
                          {book.title} ({book.quantity} متاح)
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
                          <p className="font-medium text-sm">{item.bookTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {item.unitPrice.toFixed(2)} = {item.totalPrice.toFixed(2)} ج.م
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBook(item.bookId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">لا توجد كتب مضافة</p>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  ملخص الطلب
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>إجمالي الكتب:</span>
                  <span className="font-medium">{subtotal.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>تكلفة الشحن:</span>
                  <span className="font-medium">{shippingCostNum.toFixed(2)} ج.م</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>الخصم:</span>
                    <span className="font-medium">-{promoDiscount.toFixed(2)} ج.م</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>الإجمالي النهائي:</span>
                  <span className="text-lg text-blue-600">{total.toFixed(2)} ج.م</span>
                </div>

                {/* Profit Breakdown */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-gray-700">توزيع الأرباح:</p>
                  <div className="flex justify-between text-xs">
                    <span>ربح الكتب:</span>
                    <span className="text-green-600 font-medium">{booksProfit.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>ربح الشحن:</span>
                    <span className="text-green-600 font-medium">{shippingProfit.toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-2 border-t">
                    <span>إجمالي الربح:</span>
                    <span className="text-green-700">{(booksProfit + shippingProfit).toFixed(2)} ج.م</span>
                  </div>
                </div>

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
