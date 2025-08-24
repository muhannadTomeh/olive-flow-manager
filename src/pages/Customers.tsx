import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, FileText, Download, Phone, Calendar } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalInvoices: number;
  lastVisit: Date;
  totalOilProduced: number;
  preferredPayment: 'oil' | 'cash' | 'mixed';
}

interface Invoice {
  id: string;
  customerId: string;
  date: Date;
  oilProduced: number;
  paymentType: 'oil' | 'cash' | 'mixed';
  totalAmount: string;
}

const Customers = () => {
  const [customers] = useState<Customer[]>([
    {
      id: "1",
      name: "أحمد محمد",
      phone: "+970599123456",
      totalInvoices: 5,
      lastVisit: new Date("2024-01-15"),
      totalOilProduced: 250,
      preferredPayment: 'oil'
    },
    {
      id: "2", 
      name: "فاطمة أحمد",
      phone: "+970599987654",
      totalInvoices: 3,
      lastVisit: new Date("2024-01-10"),
      totalOilProduced: 180,
      preferredPayment: 'mixed'
    },
    {
      id: "3",
      name: "محمود عبدالله",
      totalInvoices: 8,
      lastVisit: new Date("2024-01-20"),
      totalOilProduced: 420,
      preferredPayment: 'cash'
    }
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: "inv1",
      customerId: "1",
      date: new Date("2024-01-15"),
      oilProduced: 50,
      paymentType: 'oil',
      totalAmount: "5.2 كغم زيت"
    },
    {
      id: "inv2",
      customerId: "2", 
      date: new Date("2024-01-10"),
      oilProduced: 75,
      paymentType: 'mixed',
      totalAmount: "4.5 كغم زيت + 60 شيكل"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const getCustomerInvoices = (customerId: string) => {
    return invoices.filter(inv => inv.customerId === customerId);
  };

  const getPaymentBadgeVariant = (payment: string) => {
    switch (payment) {
      case 'oil': return 'default';
      case 'cash': return 'secondary'; 
      case 'mixed': return 'outline';
      default: return 'secondary';
    }
  };

  const getPaymentText = (payment: string) => {
    switch (payment) {
      case 'oil': return 'زيت فقط';
      case 'cash': return 'نقدي فقط';
      case 'mixed': return 'مختلط';
      default: return payment;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">إدارة الزبائن</h1>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">قائمة الزبائن</TabsTrigger>
          <TabsTrigger value="details">تفاصيل الزبون</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الزبائن ({customers.length})</CardTitle>
              <CardDescription>
                عرض وإدارة جميع الزبائن المسجلين في النظام
              </CardDescription>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث باسم الزبون أو رقم الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير القائمة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا يوجد زبائن مطابقين للبحث</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>رقم الهاتف</TableHead>
                      <TableHead>عدد الفواتير</TableHead>
                      <TableHead>آخر زيارة</TableHead>
                      <TableHead>الزيت المنتج</TableHead>
                      <TableHead>طريقة الدفع المفضلة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          {customer.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {customer.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">غير محدد</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{customer.totalInvoices}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {customer.lastVisit.toLocaleDateString('ar-SA')}
                          </div>
                        </TableCell>
                        <TableCell>{customer.totalOilProduced} كغم</TableCell>
                        <TableCell>
                          <Badge variant={getPaymentBadgeVariant(customer.preferredPayment)}>
                            {getPaymentText(customer.preferredPayment)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <FileText className="h-4 w-4 ml-1" />
                            التفاصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الزبون</CardTitle>
              <CardDescription>
                عرض التفاصيل الكاملة وسجل الفواتير للزبون المحدد
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCustomer ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لم يتم اختيار زبون</p>
                  <p className="text-sm">اختر زبوناً من القائمة لعرض تفاصيله</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* معلومات الزبون */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{selectedCustomer.totalInvoices}</div>
                        <p className="text-sm text-muted-foreground">إجمالي الفواتير</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">{selectedCustomer.totalOilProduced} كغم</div>
                        <p className="text-sm text-muted-foreground">الزيت المنتج</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-primary">
                          {selectedCustomer.lastVisit.toLocaleDateString('ar-SA')}
                        </div>
                        <p className="text-sm text-muted-foreground">آخر زيارة</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <Badge variant={getPaymentBadgeVariant(selectedCustomer.preferredPayment)} className="text-lg">
                          {getPaymentText(selectedCustomer.preferredPayment)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">الطريقة المفضلة</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* سجل الفواتير */}
                  <Card>
                    <CardHeader>
                      <CardTitle>سجل فواتير {selectedCustomer.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>كمية الزيت</TableHead>
                            <TableHead>طريقة الدفع</TableHead>
                            <TableHead>المبلغ الإجمالي</TableHead>
                            <TableHead>الإجراءات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getCustomerInvoices(selectedCustomer.id).map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.date.toLocaleDateString('ar-SA')}</TableCell>
                              <TableCell>{invoice.oilProduced} كغم</TableCell>
                              <TableCell>
                                <Badge variant={getPaymentBadgeVariant(invoice.paymentType)}>
                                  {getPaymentText(invoice.paymentType)}
                                </Badge>
                              </TableCell>
                              <TableCell>{invoice.totalAmount}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 ml-1" />
                                  تحميل
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Customers;