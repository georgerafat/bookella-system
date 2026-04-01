import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Download, FileText, BarChart3 } from 'lucide-react';

export default function Reports() {
  const [reportType, setReportType] = useState('monthly-profit');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch analytics data
  const { data: analytics = {} } = trpc.analytics.dashboard.useQuery();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('يرجى اختيار تاريخ البداية والنهاية');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }

    setIsGenerating(true);
    try {
      // Call the API to generate the report
      const response = await fetch('/api/trpc/reports.generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء التقرير');
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('تم تحميل التقرير بنجاح');
    } catch (error: any) {
      toast.error(`خطأ: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-right">التقارير والتحليلات</h1>

        {/* Report Generator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              إنشاء تقرير جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>نوع التقرير</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly-profit">تقرير الأرباح الشهري</SelectItem>
                    <SelectItem value="top-books">أكثر الكتب مبيعاً</SelectItem>
                    <SelectItem value="top-customers">أكثر العملاء شراءً</SelectItem>
                    <SelectItem value="financial-summary">الملخص المالي الشامل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>تاريخ البداية</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>تاريخ النهاية</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                  className="w-full gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'جاري الإنشاء...' : 'إنشاء وتحميل التقرير'}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>ملاحظة:</strong> التقارير تُنشأ بصيغة PDF وتتضمن رسوم بيانية وجداول شاملة.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRevenue?.toLocaleString('ar-EG')} ج.م</div>
              <p className="text-xs text-gray-500 mt-1">الفترة المختارة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ربح الكتب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.totalBooksProfit?.toLocaleString('ar-EG')} ج.م</div>
              <p className="text-xs text-gray-500 mt-1">صافي الربح من الكتب</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ربح الشحن</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.totalShippingProfit?.toLocaleString('ar-EG')} ج.م</div>
              <p className="text-xs text-gray-500 mt-1">صافي ربح الشحن</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">عدد الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalOrders || 0}</div>
              <p className="text-xs text-gray-500 mt-1">إجمالي الطلبات</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            التقارير المتاحة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقرير الأرباح الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  يتضمن ملخص شامل للأرباح الشهرية مع فصل أرباح الكتب عن أرباح الشحن، وأكثر الكتب والعملاء.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setReportType('monthly-profit');
                    handleGenerateReport();
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أكثر الكتب مبيعاً</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  قائمة بأكثر الكتب مبيعاً خلال الفترة المختارة مع عدد النسخ المباعة والإيرادات والأرباح.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setReportType('top-books');
                    handleGenerateReport();
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">أكثر العملاء شراءً</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  قائمة بأكثر العملاء شراءً مع عدد طلباتهم وإجمالي المشتريات والأرباح المحققة منهم.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setReportType('top-customers');
                    handleGenerateReport();
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الملخص المالي الشامل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  ملخص مالي شامل يتضمن جميع المؤشرات المالية وحالات الدفع والخصومات المطبقة.
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setReportType('financial-summary');
                    handleGenerateReport();
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
