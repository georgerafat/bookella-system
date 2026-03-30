import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  governorate: string;
  totalSpent: string;
  totalPaid: string;
  remainingDebt: string;
  points: number;
  registrationSource: string;
  registrationDate: string;
  orders: number;
}

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Sample customers data
  const customers: Customer[] = [
    {
      id: 1,
      name: "أحمد محمد",
      phone: "01012345678",
      email: "ahmed@example.com",
      governorate: "القاهرة",
      totalSpent: "2500",
      totalPaid: "2000",
      remainingDebt: "500",
      points: 250,
      registrationSource: "موقع الويب",
      registrationDate: "2026-01-15",
      orders: 5,
    },
    {
      id: 2,
      name: "فاطمة علي",
      phone: "01098765432",
      email: "fatima@example.com",
      governorate: "الجيزة",
      totalSpent: "1800",
      totalPaid: "1800",
      remainingDebt: "0",
      points: 180,
      registrationSource: "فيسبوك",
      registrationDate: "2026-02-01",
      orders: 3,
    },
    {
      id: 3,
      name: "محمود حسن",
      phone: "01055555555",
      email: "mahmoud@example.com",
      governorate: "الإسكندرية",
      totalSpent: "3200",
      totalPaid: "2500",
      remainingDebt: "700",
      points: 320,
      registrationSource: "إنستجرام",
      registrationDate: "2025-12-10",
      orders: 8,
    },
    {
      id: 4,
      name: "سارة يوسف",
      phone: "01077777777",
      email: "sarah@example.com",
      governorate: "القاهرة",
      totalSpent: "1200",
      totalPaid: "600",
      remainingDebt: "600",
      points: 120,
      registrationSource: "توصية",
      registrationDate: "2026-03-01",
      orders: 2,
    },
  ];

  const customersWithDebt = customers.filter((c) => Number(c.remainingDebt) > 0);
  const filteredCustomers = customers.filter((c) =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery) || c.email.includes(searchQuery)
  );

  const handleRecordPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }
    toast.success(`تم تسجيل دفعة بقيمة ${paymentAmount} ج.م`);
    setPaymentAmount("");
    setIsDetailsDialogOpen(false);
  };

  const totalDebt = customersWithDebt.reduce((sum, c) => sum + Number(c.remainingDebt), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">إدارة العملاء</h1>
          <p className="text-muted-foreground">إدارة بيانات العملاء والمديونيات والنقاط</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">عملاء بمديونيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{customersWithDebt.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المديونيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{totalDebt.toFixed(2)} ج.م</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي النقاط الموزعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.points, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Debt Alert */}
        {customersWithDebt.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                تنبيه: عملاء بمديونيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customersWithDebt.slice(0, 5).map((customer) => (
                  <p key={customer.id} className="text-sm text-red-800">
                    <strong>{customer.name}</strong> - {customer.phone} - متبقي: {Number(customer.remainingDebt).toFixed(2)} ج.م
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>البحث</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="ابحث بالاسم أو الهاتف أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
            <CardDescription>{filteredCustomers.length} عميل</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المحافظة</TableHead>
                    <TableHead>إجمالي الشراء</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>النقاط</TableHead>
                    <TableHead>الطلبات</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.governorate}</TableCell>
                        <TableCell>{Number(customer.totalSpent).toFixed(2)} ج.م</TableCell>
                        <TableCell>{Number(customer.totalPaid).toFixed(2)} ج.م</TableCell>
                        <TableCell className={Number(customer.remainingDebt) > 0 ? "text-red-600 font-bold" : ""}>
                          {Number(customer.remainingDebt).toFixed(2)} ج.م
                        </TableCell>
                        <TableCell>{customer.points}</TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>
                          <Dialog open={isDetailsDialogOpen && selectedCustomer?.id === customer.id} onOpenChange={setIsDetailsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>تفاصيل العميل</DialogTitle>
                              </DialogHeader>
                              {selectedCustomer && (
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">الاسم</p>
                                    <p className="font-medium">{selectedCustomer.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">الهاتف</p>
                                    <p className="font-medium">{selectedCustomer.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">المحافظة</p>
                                    <p className="font-medium">{selectedCustomer.governorate}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">إجمالي الشراء</p>
                                      <p className="font-medium">{Number(selectedCustomer.totalSpent).toFixed(2)} ج.م</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">المدفوع</p>
                                      <p className="font-medium">{Number(selectedCustomer.totalPaid).toFixed(2)} ج.م</p>
                                    </div>
                                  </div>
                                  {Number(selectedCustomer.remainingDebt) > 0 && (
                                    <>
                                      <div>
                                        <p className="text-sm text-muted-foreground">المتبقي</p>
                                        <p className="font-bold text-red-600">{Number(selectedCustomer.remainingDebt).toFixed(2)} ج.م</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">تسجيل دفعة</label>
                                        <Input
                                          type="number"
                                          placeholder="المبلغ"
                                          value={paymentAmount}
                                          onChange={(e) => setPaymentAmount(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      <Button onClick={handleRecordPayment} className="w-full">
                                        تسجيل الدفعة
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        لا توجد عملاء
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
