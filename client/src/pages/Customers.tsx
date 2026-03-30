import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, AlertTriangle, User, Phone, MapPin, Search, Star, CreditCard, History, Wallet, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const customersQuery = (trpc as any).customers.list.useQuery({
    query: searchQuery || undefined,
  });

  const customers = customersQuery.data || [];
  const isLoading = customersQuery.isLoading;

  const totalDebt = (customers || []).reduce((sum: number, c: any) => sum + Number(c.remainingDebt), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة العملاء</h1>
          <p className="text-muted-foreground">بيانات العملاء، المديونيات، ونقاط الولاء.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border px-6 h-14">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">إجمالي المديونيات</span>
            <span className="text-xl font-bold text-red-600">{totalDebt.toLocaleString()} ج.م</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-bold flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              البحث عن عميل
            </label>
            <Input
              placeholder="ابحث بالاسم، رقم الهاتف، أو المحافظة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl h-11 border-slate-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg">قائمة العملاء</CardTitle>
          <CardDescription>إجمالي العملاء: {customers.length}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="text-right py-4 font-bold">العميل</TableHead>
                  <TableHead className="text-right py-4 font-bold">المحافظة</TableHead>
                  <TableHead className="text-right py-4 font-bold">إجمالي المشتريات</TableHead>
                  <TableHead className="text-right py-4 font-bold">المدفوع</TableHead>
                  <TableHead className="text-right py-4 font-bold">المتبقي</TableHead>
                  <TableHead className="text-right py-4 font-bold">النقاط</TableHead>
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
                ) : customers.length > 0 ? (
                  customers.map((customer: any) => {
                    const hasDebt = Number(customer.remainingDebt) > 0;
                    return (
                      <TableRow key={customer.id} className="hover:bg-slate-50 transition-colors group">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold">{customer.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                            <MapPin className="h-3 w-3 text-primary" />
                            {customer.governorate || "غير محدد"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-slate-900">{Number(customer.totalSpent).toFixed(2)} ج.م</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600">{Number(customer.totalPaid).toFixed(2)} ج.م</span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${hasDebt ? "text-red-600" : "text-slate-400"}`}>
                            {Number(customer.remainingDebt).toFixed(2)} ج.م
                            {hasDebt && <AlertTriangle className="h-3 w-3 mr-1 inline" />}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-100 gap-1 font-bold">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {customer.points}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="rounded-lg h-8 px-2">
                            التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      لم يتم العثور على عملاء مطابقين.
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
