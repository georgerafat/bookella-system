import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function Borrowing() {
  const [statusFilter, setStatusFilter] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    borrowerName: "",
    borrowerPhone: "",
    bookTitle: "",
    expectedReturnDate: "",
  });

  // Sample borrowing data
  const borrowings = [
    {
      id: 1,
      borrowId: "BOR-1704067200000",
      borrowerName: "أحمد محمد",
      borrowerPhone: "01012345678",
      bookTitle: "الحب في زمن الكوليرا",
      borrowDate: "2026-03-20",
      expectedReturnDate: "2026-04-03",
      actualReturnDate: null,
      status: "active",
      daysRemaining: 4,
    },
    {
      id: 2,
      borrowId: "BOR-1704153600000",
      borrowerName: "فاطمة علي",
      borrowerPhone: "01098765432",
      bookTitle: "مائة عام من العزلة",
      borrowDate: "2026-03-15",
      expectedReturnDate: "2026-03-29",
      actualReturnDate: null,
      status: "overdue",
      daysRemaining: -2,
    },
    {
      id: 3,
      borrowId: "BOR-1704240000000",
      borrowerName: "محمود حسن",
      borrowerPhone: "01055555555",
      bookTitle: "العادات الذرية",
      borrowDate: "2026-03-10",
      expectedReturnDate: "2026-03-24",
      actualReturnDate: "2026-03-23",
      status: "returned",
      daysRemaining: 0,
    },
  ];

  const overdueBorrowings = borrowings.filter((b) => b.status === "overdue");
  const activeBorrowings = borrowings.filter((b) => b.status === "active");
  const returnedBorrowings = borrowings.filter((b) => b.status === "returned");

  const filteredBorrowings = borrowings.filter((b) => {
    if (statusFilter === "all") return true;
    return b.status === statusFilter;
  });

  const handleCreateBorrowing = () => {
    if (!formData.borrowerName || !formData.borrowerPhone || !formData.bookTitle || !formData.expectedReturnDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    toast.success("تم تسجيل الإعارة بنجاح");
    setFormData({ borrowerName: "", borrowerPhone: "", bookTitle: "", expectedReturnDate: "" });
    setIsCreateDialogOpen(false);
  };

  const handleMarkAsReturned = (borrowId: string) => {
    toast.success("تم تسجيل إرجاع الكتاب");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "overdue":
        return "متأخر";
      case "returned":
        return "مرجع";
      default:
        return "غير محدد";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">نظام الإعارة</h1>
            <p className="text-muted-foreground">إدارة إعارة الكتب والتذكيرات التلقائية</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إعارة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تسجيل إعارة جديدة</DialogTitle>
                <DialogDescription>أدخل تفاصيل الإعارة</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">اسم المستعير</label>
                  <Input
                    value={formData.borrowerName}
                    onChange={(e) => setFormData({ ...formData, borrowerName: e.target.value })}
                    placeholder="أدخل الاسم"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    value={formData.borrowerPhone}
                    onChange={(e) => setFormData({ ...formData, borrowerPhone: e.target.value })}
                    placeholder="أدخل رقم الهاتف"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">عنوان الكتاب</label>
                  <Input
                    value={formData.bookTitle}
                    onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                    placeholder="أدخل عنوان الكتاب"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">تاريخ الإرجاع المتوقع</label>
                  <Input
                    type="date"
                    value={formData.expectedReturnDate}
                    onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateBorrowing} className="w-full">
                  تسجيل الإعارة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعارات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBorrowings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إعارات متأخرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueBorrowings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">كتب مرجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{returnedBorrowings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{borrowings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueBorrowings.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                تنبيه: إعارات متأخرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueBorrowings.map((borrow) => (
                  <p key={borrow.id} className="text-sm text-red-800">
                    <strong>{borrow.borrowerName}</strong> - {borrow.bookTitle} - متأخر بـ {Math.abs(borrow.daysRemaining)} أيام
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الفلاتر</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإعارات</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
                <SelectItem value="returned">مرجعة</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Borrowings Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الإعارات</CardTitle>
            <CardDescription>{filteredBorrowings.length} إعارة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الإعارة</TableHead>
                    <TableHead>اسم المستعير</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>عنوان الكتاب</TableHead>
                    <TableHead>تاريخ الإعارة</TableHead>
                    <TableHead>تاريخ الإرجاع المتوقع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBorrowings.length > 0 ? (
                    filteredBorrowings.map((borrow) => (
                      <TableRow key={borrow.id}>
                        <TableCell className="font-medium">{borrow.borrowId}</TableCell>
                        <TableCell>{borrow.borrowerName}</TableCell>
                        <TableCell>{borrow.borrowerPhone}</TableCell>
                        <TableCell>{borrow.bookTitle}</TableCell>
                        <TableCell>{borrow.borrowDate}</TableCell>
                        <TableCell>{borrow.expectedReturnDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadge(borrow.status)}`}>
                            {getStatusLabel(borrow.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {borrow.status !== "returned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsReturned(borrow.borrowId)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              مرجع
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        لا توجد إعارات
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
