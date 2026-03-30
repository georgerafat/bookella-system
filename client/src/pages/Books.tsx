import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertTriangle, Search, Filter, BookOpen, Layers, Printer, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
    quantity: 0,
    printType: "original" as "original" | "high_copy",
  });

  const booksQuery = (trpc as any).books.list.useQuery({
    query: searchQuery || undefined,
    category: categoryFilter || undefined,
  });

  const createBookMutation = (trpc as any).books.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الكتاب بنجاح");
      booksQuery.refetch();
      setIsCreateDialogOpen(false);
      setFormData({
        bookId: "",
        title: "",
        author: "",
        category: "",
        purchasePrice: "",
        sellingPrice: "",
        quantity: 0,
        printType: "original",
      });
    },
    onError: (err: any) => {
      toast.error(`حدث خطأ: ${err.message}`);
    },
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

  const books = booksQuery.data || [];
  const isLoading = booksQuery.isLoading;

  const handleCreateBook = () => {
    if (!formData.title || !formData.purchasePrice || !formData.sellingPrice) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createBookMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الكتب</h1>
          <p className="text-muted-foreground">إضافة وتحديث وإدارة مخزون الكتب في المكتبة.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-sm h-11 px-6">
              <Plus className="h-5 w-5" />
              إضافة كتاب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-xl font-bold">إضافة كتاب جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل الكتاب الجديد لإضافته للمخزون.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">عنوان الكتاب *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان الكتاب"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">المؤلف</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="اسم المؤلف"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">الفئة</label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-right">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">سعر الشراء *</label>
                  <Input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0.00"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">سعر البيع *</label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className="rounded-xl h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">الكمية</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">نوع الطبعة</label>
                  <Select
                    value={formData.printType}
                    onValueChange={(val: any) => setFormData({ ...formData, printType: val })}
                  >
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">أصلي</SelectItem>
                      <SelectItem value="high_copy">هاي كوبي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleCreateBook}
                className="w-full rounded-xl h-12 text-lg font-bold mt-4"
                disabled={createBookMutation.isPending}
              >
                {createBookMutation.isPending ? <Loader2 className="animate-spin" /> : "إضافة الكتاب"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                البحث عن كتاب
              </label>
              <Input
                placeholder="ابحث بالعنوان، المؤلف، أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="w-full md:w-64 space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                تصفية حسب الفئة
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">قائمة الكتب</CardTitle>
              <CardDescription>إجمالي الكتب المتاحة: {books.length}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg">
                تصدير Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-right py-4 font-bold">الكتاب</TableHead>
                  <TableHead className="text-right py-4 font-bold">الفئة</TableHead>
                  <TableHead className="text-right py-4 font-bold">السعر</TableHead>
                  <TableHead className="text-right py-4 font-bold">المخزون</TableHead>
                  <TableHead className="text-right py-4 font-bold">الطبعة</TableHead>
                  <TableHead className="text-right py-4 font-bold">الربح</TableHead>
                  <TableHead className="text-right py-4 font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="p-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : books.length > 0 ? (
                  books.map((book: any) => {
                    const profit = Number(book.sellingPrice) - Number(book.purchasePrice);
                    const isLowStock = book.quantity <= 5;
                    return (
                      <TableRow key={book.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold">{book.title}</p>
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {book.category || "غير مصنف"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{Number(book.sellingPrice).toFixed(2)} ج.م</span>
                            <span className="text-[10px] text-muted-foreground">شراء: {Number(book.purchasePrice).toFixed(2)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {book.quantity} قطعة
                            {isLowStock && <AlertTriangle className="h-3 w-3 mr-1" />}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs font-medium flex items-center gap-1 ${
                            book.printType === "original" ? "text-blue-600" : "text-amber-600"
                          }`}>
                            <Printer className="h-3 w-3" />
                            {book.printType === "original" ? "أصلي" : "هاي كوبي"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-green-600">+{profit.toFixed(2)} ج.م</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="rounded-lg group-hover:bg-white border-transparent hover:border-slate-200">
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      لا توجد كتب مطابقة للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
