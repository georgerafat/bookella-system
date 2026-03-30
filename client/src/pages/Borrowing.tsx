import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, AlertTriangle, CheckCircle, Search, Calendar, Phone, BookOpen, Clock, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Borrowing() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: 0,
    bookId: 0,
    expectedReturnDate: new Date(),
  });

  const borrowingsQuery = (trpc as any).borrowing.list.useQuery({
    status: statusFilter || undefined,
  });

  const createBorrowingMutation = (trpc as any).borrowing.create.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الإعارة بنجاح");
      borrowingsQuery.refetch();
      setIsCreateDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(`خطأ: ${err.message}`);
    },
  });

  const borrowings = borrowingsQuery.data || [];
  const isLoading = borrowingsQuery.isLoading;

  const handleCreateBorrowing = () => {
    if (!formData.customerId || !formData.bookId) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    createBorrowingMutation.mutate(formData);
  };

  const statusOptions = [
    { value: "active", label: "نشطة", color: "bg-blue-100 text-blue-800" },
    { value: "overdue", label: "متأخرة", color: "bg-red-100 text-red-800" },
    { value: "returned", label: "مرجعة", color: "bg-green-100 text-green-800" },
  ];

  const overdueCount = (borrowings || []).filter((b: any) => b.status === "overdue").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">نظام الإعارة</h1>
          <p className="text-muted-foreground">تتبع الكتب المعارة، التواريخ، وتنبيهات الواتساب.</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl shadow-sm h-11 px-6">
                <Plus className="h-5 w-5" />
                إعارة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader className="text-right">
                <DialogTitle className="text-xl font-bold">تسجيل إعارة جديدة</DialogTitle>
                <DialogDescription>أدخل تفاصيل العميل والكتاب المعار.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Form fields will go here */}
                <p className="text-sm text-muted-foreground bg-slate-50 p-4 rounded-xl border border-dashed">
                  هذه الميزة تتطلب اختيار العميل والكتاب من القوائم المسجلة مسبقاً.
                </p>
                <Button className="w-full rounded-xl h-12 text-lg font-bold" onClick={handleCreateBorrowing} disabled={createBorrowingMutation.isPending}>
                  {createBorrowingMutation.isPending ? <Loader2 className="animate-spin" /> : "تسجيل الإعارة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats & Overdue Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <History className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">إجمالي الإعارات</p>
                <p className="text-2xl font-bold">{borrowings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {overdueCount > 0 && (
          <Card className="border-none shadow-sm bg-red-50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">متأخر بـ</p>
                  <p className="text-2xl font-bold text-red-800">{overdueCount} كتب</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                ابحث عن مستعير أو كتاب
              </label>
              <Input
                placeholder="ابحث بالاسم، الهاتف، أو العنوان..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="w-full md:w-64 space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                الحالة
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Borrowings Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">قائمة الإعارات</CardTitle>
          <CardDescription>إدارة تتبع الكتب المعارة وتنبيهات الإرجاع.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-right py-4 font-bold">المستعير</TableHead>
                  <TableHead className="text-right py-4 font-bold">الكتاب المعار</TableHead>
                  <TableHead className="text-right py-4 font-bold">تاريخ الإعارة</TableHead>
                  <TableHead className="text-right py-4 font-bold">الموعد المتوقع</TableHead>
                  <TableHead className="text-right py-4 font-bold">الحالة</TableHead>
                  <TableHead className="text-right py-4 font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="p-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : borrowings.length > 0 ? (
                  borrowings.map((borrow: any) => {
                    const status = statusOptions.find(o => o.value === borrow.status);
                    const isOverdue = borrow.status === "overdue";
                    return (
                      <TableRow key={borrow.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{borrow.customerName || "أحمد محمد"}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              01012345678
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{borrow.bookTitle || "رواية 1984"}</span>
                            <span className="text-[10px] text-muted-foreground">كود: BK-001</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-slate-600">
                            {new Date(borrow.borrowDate).toLocaleDateString('ar-EG')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-bold ${isOverdue ? "text-red-600" : "text-slate-600"}`}>
                            {new Date(borrow.expectedReturnDate).toLocaleDateString('ar-EG')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${status?.color} border-none font-bold`}>
                            {status?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-lg h-8 px-2 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-100">
                              <CheckCircle className="h-3.5 w-3.5" />
                              مرجع
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-lg h-8 px-2 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100">
                              <Send className="h-3.5 w-3.5" />
                              واتساب
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      لا توجد عمليات إعارة مسجلة.
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
