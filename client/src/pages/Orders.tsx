import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Orders() {
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [governorateFilter, setGovernorateFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Fetch orders
  const ordersQuery = (trpc as any).orders?.list?.useQuery({
    limit,
    offset,
    status: statusFilter || undefined,
    governorate: governorateFilter || undefined,
  }) || { data: [], isLoading: false, refetch: () => {} };

  const updateStatusMutation = (trpc as any).orders?.updateStatus?.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب");
      ordersQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const recordPaymentMutation = (trpc as any).orders?.recordPayment?.useMutation({
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

  const orders: any[] = ordersQuery.data || [];

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleRecordPayment = (orderId: number, userId: number) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    recordPaymentMutation.mutate({
      orderId,
      userId,
      amount: Number(paymentAmount),
      paymentMethod: "نقدي",
    });
  };

  const statusOptions = [
    { value: "pending", label: "قيد الانتظار" },
    { value: "processing", label: "قيد المعالجة" },
    { value: "shipped", label: "مع المندوب" },
    { value: "delivered", label: "تم الاستلام" },
    { value: "cancelled", label: "ملغي" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "لم يتم الدفع" },
    { value: "partial", label: "دفع جزئي" },
    { value: "paid", label: "مدفوع بالكامل" },
    { value: "overdue", label: "متأخر" },
  ];

  const governorates = ["القاهرة", "الجيزة", "الإسكندرية", "سوهاج", "أسيوط", "المنيا", "بني سويف", "الفيوم", "الدقهلية", "الشرقية", "الغربية", "المنوفية", "كفر الشيخ", "دمياط", "بورسعيد", "السويس", "الإسماعيلية", "مطروح", "الوادي الجديد", "البحر الأحمر", "جنوب سيناء", "شمال سيناء"];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">إدارة الطلبات</h1>
            <p className="text-muted-foreground">إنشاء وتتبع وإدارة جميع الطلبات</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                طلب جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء طلب جديد</DialogTitle>
                <DialogDescription>سيتم إضافة هذه الميزة قريباً</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الفلاتر</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="حالة الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={governorateFilter} onValueChange={setGovernorateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="المحافظة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع المحافظات</SelectItem>
                {governorates.map((gov) => (
                  <SelectItem key={gov} value={gov}>
                    {gov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
            <CardDescription>{orders.length} طلب</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersQuery.isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المحافظة</TableHead>
                      <TableHead>السعر النهائي</TableHead>
                      <TableHead>حالة الطلب</TableHead>
                      <TableHead>حالة الدفع</TableHead>
                      <TableHead>المتبقي</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length > 0 ? (
                      orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderId}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.governorate}</TableCell>
                          <TableCell>{Number(order.finalPrice).toFixed(2)} ج.م</TableCell>
                          <TableCell>
                            <Select value={order.orderStatus} onValueChange={(val) => handleUpdateStatus(order.id, val)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-sm font-medium ${
                              order.paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                              order.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {paymentStatusOptions.find(o => o.value === order.paymentStatus)?.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-red-600 font-bold">{Number(order.remainingAmount).toFixed(2)} ج.م</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog open={isPaymentDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                                setIsPaymentDialogOpen(open);
                                if (open) setSelectedOrder(order);
                              }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                    دفع
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>تسجيل دفعة</DialogTitle>
                                    <DialogDescription>أدخل المبلغ المدفوع</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">المبلغ المتبقي: {Number((selectedOrder as any)?.remainingAmount).toFixed(2)} ج.م</label>
                                      <Input
                                        type="number"
                                        placeholder="المبلغ المدفوع"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="mt-2"
                                      />
                                    </div>
                                    <Button
                                      onClick={() => handleRecordPayment(selectedOrder.id, selectedOrder.userId)}
                                      disabled={recordPaymentMutation.isPending}
                                    >
                                      {recordPaymentMutation.isPending ? "جاري..." : "تسجيل الدفعة"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          لا توجد طلبات
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
