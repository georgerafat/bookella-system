import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function PromoAndBundles() {
  const [activeTab, setActiveTab] = useState('promo-codes');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Promo Codes State
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountType: 'percentage', // percentage or fixed
    discountValue: 0,
    maxUsage: 0,
    expiryDate: '',
    description: '',
  });

  // Bundles State
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    bundleType: 'discount', // discount or gift
    discountValue: 0,
    selectedBooks: [] as string[],
    giftBooks: [] as string[],
  });

  // Fetch promo codes
  const { data: promoCodes = [], isLoading: promoLoading } = trpc.promoCodes.list.useQuery();
  const { data: bundles = [], isLoading: bundleLoading } = trpc.bundles.list.useQuery();
  const { data: books = [] } = trpc.books.list.useQuery({ limit: 1000 });

  // Mutations
  const createPromoMutation = trpc.promoCodes.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء الكوبون بنجاح');
      setPromoForm({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        maxUsage: 0,
        expiryDate: '',
        description: '',
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const createBundleMutation = trpc.bundles.create.useMutation({
    onSuccess: () => {
      toast.success('تم إنشاء العرض بنجاح');
      setBundleForm({
        name: '',
        description: '',
        bundleType: 'discount',
        discountValue: 0,
        selectedBooks: [],
        giftBooks: [],
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const handleCreatePromo = () => {
    if (!promoForm.code || promoForm.discountValue <= 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    createPromoMutation.mutate(promoForm);
  };

  const handleCreateBundle = () => {
    if (!bundleForm.name || bundleForm.selectedBooks.length === 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    createBundleMutation.mutate(bundleForm);
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-right">العروض والكوبونات</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="promo-codes">كوبونات الخصم</TabsTrigger>
            <TabsTrigger value="bundles">العروض المجمعة</TabsTrigger>
          </TabsList>

          {/* Promo Codes Tab */}
          <TabsContent value="promo-codes" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة كوبونات الخصم</h2>
              <Dialog open={isDialogOpen && activeTab === 'promo-codes'} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    كوبون جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء كوبون خصم جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>رمز الكوبون</Label>
                      <Input
                        placeholder="مثال: SUMMER2024"
                        value={promoForm.code}
                        onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>نوع الخصم</Label>
                      <Select value={promoForm.discountType} onValueChange={(value) =>
                        setPromoForm({ ...promoForm, discountType: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                          <SelectItem value="fixed">مبلغ ثابت (ج.م)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>قيمة الخصم</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={promoForm.discountValue}
                        onChange={(e) => setPromoForm({ ...promoForm, discountValue: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label>عدد الاستخدامات المسموحة</Label>
                      <Input
                        type="number"
                        placeholder="0 = غير محدود"
                        value={promoForm.maxUsage}
                        onChange={(e) => setPromoForm({ ...promoForm, maxUsage: parseInt(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label>تاريخ انتهاء الصلاحية</Label>
                      <Input
                        type="date"
                        value={promoForm.expiryDate}
                        onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>الوصف</Label>
                      <Input
                        placeholder="وصف الكوبون"
                        value={promoForm.description}
                        onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleCreatePromo} className="w-full">
                      إنشاء الكوبون
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {promoLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : promoCodes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">لا توجد كوبونات خصم حالياً</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {promoCodes.map((promo: any) => (
                  <Card key={promo.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{promo.code}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{promo.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">نوع الخصم:</span>
                          <p className="font-semibold">
                            {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue} ج.م`}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">الاستخدامات:</span>
                          <p className="font-semibold">{promo.usageCount || 0} / {promo.maxUsage || 'غير محدود'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">الحالة:</span>
                          <p className="font-semibold">{promo.isActive ? '✅ نشط' : '❌ معطل'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">تاريخ الانتهاء:</span>
                          <p className="font-semibold">{new Date(promo.expiryDate).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">إدارة العروض المجمعة</h2>
              <Dialog open={isDialogOpen && activeTab === 'bundles'} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    عرض جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء عرض مجمع جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>اسم العرض</Label>
                      <Input
                        placeholder="مثال: عرض 3 كتب"
                        value={bundleForm.name}
                        onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>نوع العرض</Label>
                      <Select value={bundleForm.bundleType} onValueChange={(value) =>
                        setBundleForm({ ...bundleForm, bundleType: value })
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">خصم على المجموع</SelectItem>
                          <SelectItem value="gift">كتب هدية مجانية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {bundleForm.bundleType === 'discount' && (
                      <div>
                        <Label>قيمة الخصم</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={bundleForm.discountValue}
                          onChange={(e) => setBundleForm({ ...bundleForm, discountValue: parseFloat(e.target.value) })}
                        />
                      </div>
                    )}

                    <div>
                      <Label>الكتب المضمنة في العرض</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الكتب" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map((book: any) => (
                            <SelectItem key={book.id} value={book.id.toString()}>
                              {book.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>الوصف</Label>
                      <Input
                        placeholder="وصف العرض"
                        value={bundleForm.description}
                        onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleCreateBundle} className="w-full">
                      إنشاء العرض
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {bundleLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : bundles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500">لا توجد عروض مجمعة حالياً</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bundles.map((bundle: any) => (
                  <Card key={bundle.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{bundle.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{bundle.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">نوع العرض:</span>
                          <p className="font-semibold">{bundle.bundleType === 'discount' ? 'خصم' : 'هدية'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">القيمة:</span>
                          <p className="font-semibold">
                            {bundle.bundleType === 'discount' ? `${bundle.discountValue} ج.م` : 'كتب مجانية'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
