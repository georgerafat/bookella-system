import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Eye, ShoppingBag, Truck, MapPin, Search, Calendar, Landmark, CreditCard, Receipt, FileText, CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [governorateFilter, setGovernorateFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const ordersQuery = (trpc as any).orders.list.useQuery({
    status: statusFilter || undefined,
    governorate: governorateFilter || undefined,
  });

  const updateStatusMutation = (trpc as any).orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      ordersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const recordPaymentMutation = (trpc as any).orders.recordPayment.useMutation({
    onSuccess: (data: any) => {
      toast.success(`تم تسجيل الدفعة. المبلغ المتبقي: ${data.remainingAmount.toFixed(2)} ج.م`);
      setPaymentAmount("");
      setIsPaymentDialogOpen(false);
      ordersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const orders = ordersQuery.data || [];
  const isLoading = ordersQuery.isLoading;

  const handleUpdateStatus = (orderId: number, newStatus: any) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    recordPaymentMutation.mutate({
      orderId: selectedOrder.id,
      userId: selectedOrder.customerId,
      amount: Number(paymentAmount),
      paymentMethod: "نقدي",
    });
  };

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار", color: "bg-slate-100 text-slate-800" },
    { value: "processing", label: "قيد التجهيز", color: "bg-blue-100 text-blue-800" },
    { value: "shipped", label: "مع المندوب", color: "bg-amber-100 text-amber-800" },
    { value: "delivered", label: "تم الاستلام", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "ملغي", color: "bg-red-100 text-red-800" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "لم يتم الدفع", color: "bg-red-100 text-red-800" },
    { value: "partial", label: "دفع جزئي", color: "bg-amber-100 text-amber-800" },
    { value: "paid", label: "مدفوع بالكامل", color: "bg-green-100 text-green-800" },
  ];

  const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "سوهاج", "أسيوط", "المنيا", "بني سويف", "الفيوم", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "كفر الشيخ", "دمياط", "بورسعيد", "السويس", "الإسماعيلية", "مطروح", "الوادي الجديد", "البحر الأحمر", "جنوب سيناء", "شمال سيناء"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الطلبات</h1>
          <p className="text-muted-foreground">تتبع وحالات الشحن والمدفوعات لجميع العملاء.</p>
        </div>
        <Button className="gap-2 rounded-xl shadow-sm h-11 px-6">
          <Plus className="h-5 w-5" />
          طلب جديد (سوبر)
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                رقم الطلب أو العميل
              </label>
              <Input placeholder="بحث..." className="rounded-xl h-11" />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                حالة الطلب
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl h-11">
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
            <div className="w-full md:w-48 space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                المحافظة
              </label>
              <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="جميع المحافظات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المحافظات</SelectItem>
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">قائمة الطلبات</CardTitle>
          <CardDescription>إدارة تتبع الشحن والمبالغ المتبقية.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-right py-4 font-bold">الطلب</TableHead>
                  <TableHead className="text-right py-4 font-bold">العميل</TableHead>
                  <TableHead className="text-right py-4 font-bold">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right py-4 font-bold">حالة الطلب</TableHead>
                  <TableHead className="text-right py-4 font-bold">حالة الدفع</TableHead>
                  <TableHead className="text-right py-4 font-bold">المتبقي</TableHead>
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
                ) : orders.length > 0 ? (
                  orders.map((order: any) => {
                    const status = statusOptions.find(o => o.value === order.orderStatus);
                    const payment = paymentStatusOptions.find(o => o.value === order.paymentStatus);
                    return (
                      <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold">{order.orderId}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{order.customerName || "عميل غير معروف"}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.governorate || "غير محدد"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-900">{Number(order.finalPrice).toFixed(2)} ج.م</span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.orderStatus}
                            onValueChange={(val: any) => handleUpdateStatus(order.id, val)}
                          >
                            <SelectTrigger className={`h-8 rounded-lg text-xs font-bold w-32 border-none ${status?.color}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-right">
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`${payment?.color} border-none font-bold`}>
                            {payment?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${Number(order.remainingAmount) > 0 ? "text-red-600" : "text-green-600"}`}>
                            {Number(order.remainingAmount).toFixed(2)} ج.م
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {Number(order.remainingAmount) > 0 && (
                              <Dialog open={isPaymentDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                                setIsPaymentDialogOpen(open);
                                if (open) setSelectedOrder(order);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 gap-1">
                                    <Landmark className="h-3.5 w-3.5" />
                                    تحصيل
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm rounded-2xl">
                                  <DialogHeader className="text-right">
                                    <DialogTitle className="text-lg font-bold">تحصيل دفعة مالية</DialogTitle>
                                    <DialogDescription>
                                      الطلب: {selectedOrder?.orderId}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="p-4 rounded-xl bg-slate-50 space-y-2 border">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                                        <span className="font-bold">{Number(selectedOrder?.finalPrice).toFixed(2)} ج.م</span>
                                      </div>
                                      <div className="flex justify-between text-sm text-red-600 font-bold">
                                        <span>المبلغ المتبقي:</span>
                                        <span>{Number(selectedOrder?.remainingAmount).toFixed(2)} ج.م</span>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-bold">المبلغ المدفوع حالياً *</label>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          placeholder="0.00"
                                          value={paymentAmount}
                                          onChange={(e) => setPaymentAmount(e.target.value)}
                                          className="rounded-xl h-11 pl-12"
                                        />
                                        <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      </div>
                                    </div>
                                    <Button
                                      onClick={handleRecordPayment}
                                      className="w-full rounded-xl h-12 text-lg font-bold"
                                      disabled={recordPaymentMutation.isPending}
                                    >
                                      {recordPaymentMutation.isPending ? <Loader2 className="animate-spin" /> : "تأكيد التحصيل"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button variant="ghost" size="sm" className="rounded-lg h-8 px-2 hover:bg-slate-100">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      لا توجد طلبات مسجلة حالياً.
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
