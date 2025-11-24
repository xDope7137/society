'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { billingAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Receipt, CreditCard, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function BillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const [billsRes, statsRes] = await Promise.all([
        billingAPI.getMyBills(),
        billingAPI.getStats(),
      ]);

      setBills(billsRes.data.results || billsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (billId: number) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      const balance = bill.total_amount - bill.paid_amount;
      
      // Record payment (manual payment recording)
      await billingAPI.recordPayment(billId, {
        amount: balance,
        payment_method: 'CASH', // Default to CASH, can be changed to ONLINE, CHEQUE, UPI, CARD
        notes: 'Manual payment recorded'
      });

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      loadBillingData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const statusColors = {
    UNPAID: 'bg-destructive/10 text-destructive',
    PAID: 'bg-emerald-500/10 text-emerald-500',
    OVERDUE: 'bg-orange-500/10 text-orange-500',
    PARTIAL: 'bg-yellow-500/10 text-yellow-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Payments</h2>
        <p className="text-muted-foreground">Manage your maintenance bills and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bills</CardTitle>
            <Receipt className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_bills || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{stats.total_amount?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">{stats.paid || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{stats.total_paid?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{(stats.unpaid || 0) + (stats.overdue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ₹{stats.total_pending?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {bills.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bills found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Billing Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">
                      {new Date(bill.billing_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      {formatDate(bill.due_date)}
                    </TableCell>
                    <TableCell>₹{bill.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-500">₹{bill.paid_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-destructive">₹{bill.balance_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[bill.status as keyof typeof statusColors]}`}>
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {bill.status !== 'PAID' && (
                          <Button size="sm" onClick={() => handlePayment(bill.id)}>
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bill Breakdown Example */}
      {bills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Bill Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maintenance Charge</span>
                <span className="font-medium">₹{bills[0].maintenance_charge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Water Charge</span>
                <span className="font-medium">₹{bills[0].water_charge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Parking Charge</span>
                <span className="font-medium">₹{bills[0].parking_charge.toLocaleString()}</span>
              </div>
              {bills[0].other_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Other Charges</span>
                  <span className="font-medium">₹{bills[0].other_charges.toLocaleString()}</span>
                </div>
              )}
              {bills[0].late_fee > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Late Fee</span>
                  <span className="font-medium">₹{bills[0].late_fee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{bills[0].total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

