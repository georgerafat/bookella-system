import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Books() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookId: "",
    title: "",
    author: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    quantity: "",
  });

  const categories = [
    "أدب عربي",
    "أدب أجنبي",
    "تنمية ذاتية",
    "علوم",
    "تاريخ",
    "جغرافيا",
    "دين",
    "فلسفة",
    "أطفال",
    "روايات",
    "شعر",
    "قصص قصيرة",
  ];

  // Sample books data for demonstration
  const books = [
    {
      id: 1,
      bookId: "BK001",
      title: "الحب في زمن الكوليرا",
      author: "جابرييل جارسيا ماركيز",
      category: "روايات",
      purchasePrice: "50",
      sellingPrice: "80",
      quantity: 15,
    },
    {
      id: 2,
      bookId: "BK002",
      title: "مائة عام من العزلة",
      author: "جابرييل جارسيا ماركيز",
      category: "روايات",
      purchasePrice: "60",
      sellingPrice: "100",
      quantity: 8,
    },
    {
      id: 3,
      bookId: "BK003",
      title: "العادات الذرية",
      author: "جيمس كلير",
      category: "تنمية ذاتية",
      purchasePrice: "45",
      sellingPrice: "75",
      quantity: 3,
    },
  ];

  const lowStockBooks = books.filter((b) => Number(b.quantity) <= 5);
  const filteredBooks = books.filter((b) =>
    (b.title.includes(searchQuery) || b.author.includes(searchQuery)) &&
    (!categoryFilter || b.category === categoryFilter)
  );

  const handleCreateBook = () => {
    if (!formData.title || !formData.author || !formData.sellingPrice) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    toast.success("تم إضافة الكتاب بنجاح");
    setFormData({ bookId: "", title: "", author: "", category: "", purchasePrice: "", sellingPrice: "", quantity: "" });
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">إدارة الكتب</h1>
            <p className="text-muted-foreground">إضافة وتحديث وإدارة مخزون الكتب</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                كتاب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة كتاب جديد</DialogTitle>
                <DialogDescription>أدخل تفاصيل الكتاب الجديد</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">عنوان الكتاب</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="أدخل عنوان الكتاب"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">المؤلف</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="أدخل اسم المؤلف"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الفئة</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">سعر الشراء</label>
                    <Input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">سعر البيع</label>
                    <Input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">الكمية</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateBook} className="w-full">
                  إضافة الكتاب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Low Stock Alert */}
        {lowStockBooks.length > 0 && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertTriangle className="h-5 w-5" />
                تنبيه: كتب بمخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockBooks.map((book) => (
                  <p key={book.id} className="text-sm text-yellow-800">
                    <strong>{book.title}</strong> - المتبقي: {book.quantity} نسخة
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>البحث والفلاتر</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Input
              placeholder="ابحث عن كتاب أو مؤلف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-64"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الكتب</CardTitle>
            <CardDescription>{filteredBooks.length} كتاب</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الكتاب</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المؤلف</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>سعر الشراء</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>المخزون</TableHead>
                    <TableHead>الربح لكل نسخة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.length > 0 ? (
                    filteredBooks.map((book) => {
                      const profit = Number(book.sellingPrice) - Number(book.purchasePrice);
                      return (
                        <TableRow key={book.id}>
                          <TableCell className="font-medium">{book.bookId}</TableCell>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>{Number(book.purchasePrice).toFixed(2)} ج.م</TableCell>
                          <TableCell>{Number(book.sellingPrice).toFixed(2)} ج.م</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              Number(book.quantity) <= 5
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {book.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-green-600 font-bold">{profit.toFixed(2)} ج.م</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              تحديث
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        لا توجد كتب
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
