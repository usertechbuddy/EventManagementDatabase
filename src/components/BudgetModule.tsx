import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, Edit, Trash2, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
}

interface Event {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  budget_id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const expenseCategories = [
  'Venue', 'Catering', 'Decoration', 'Entertainment', 'Photography',
  'Transportation', 'Security', 'Equipment', 'Marketing', 'Miscellaneous'
];

const BudgetModule = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [budgetFormData, setBudgetFormData] = useState({ eventId: '', totalBudget: '' });
  const [expenseFormData, setExpenseFormData] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load data from Supabase
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadBudgets(), loadEvents(), loadExpenses()]);
    setLoading(false);
  };

  const loadBudgets = async () => {
    const { data, error } = await supabase.from('budgets').select('*').order('created_at', { ascending: false });
    if (!error) setBudgets(data || []);
    // Optionally handle error
  };

  const loadEvents = async () => {
    const { data, error } = await supabase.from('events').select('id, name').order('name');
    if (!error) setEvents(data || []);
  };

  const loadExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    if (!error) setExpenses(data || []);
  };

  // Helpers
  const getEventName = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event?.name || 'Unknown Event';
  };

  const getBudgetExpenses = (budgetId: string) => {
    return expenses.filter(expense => expense.budget_id === budgetId);
  };

  // CRUD
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalBudget = parseFloat(budgetFormData.totalBudget);
    try {
      if (editingBudget) {
        // Update
        const { error } = await supabase
          .from('budgets')
          .update({
            event_id: budgetFormData.eventId,
            total_budget: totalBudget
          })
          .eq('id', editingBudget.id);
        if (error) throw error;
        toast({ title: "Budget Updated", description: "Budget has been updated successfully." });
      } else {
        // Insert
        // Check if budget exists for event
        if (budgets.some(b => b.event_id === budgetFormData.eventId)) {
          toast({ title: "Budget Exists", description: "A budget already exists for this event.", variant: "destructive" });
          return;
        }
        const { error } = await supabase
          .from('budgets')
          .insert([{
            event_id: budgetFormData.eventId,
            total_budget: totalBudget,
            user_id: user?.id
          }]);
        if (error) throw error;
        toast({ title: "Budget Created", description: "New budget has been created successfully." });
      }
      await loadBudgets();
      setIsBudgetDialogOpen(false);
      setEditingBudget(null);
      setBudgetFormData({ eventId: '', totalBudget: '' });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save budget.", variant: "destructive" });
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseFormData.amount);
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          budget_id: selectedBudgetId,
          category: expenseFormData.category,
          description: expenseFormData.description,
          amount,
          date: expenseFormData.date,
          user_id: user?.id
        }]);
      if (error) throw error;
      await loadExpenses();

      // Budget exceeded check
      const budget = budgets.find(b => b.id === selectedBudgetId);
      const budgetExpenses = getBudgetExpenses(selectedBudgetId);
      const totalExpenses = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0) + amount;
      if (budget && totalExpenses > budget.total_budget) {
        toast({
          title: "Budget Exceeded!",
          description: `You exceeded the budget by $${(totalExpenses - budget.total_budget).toFixed(2)}`,
          variant: "destructive"
        });
      } else {
        toast({ title: "Expense Added", description: "New expense has been recorded." });
      }
      setIsExpenseDialogOpen(false);
      setExpenseFormData({ category: '', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save expense.", variant: "destructive" });
    }
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) {
      toast({ title: "Budget Deleted", description: "Budget removed." });
      await loadBudgets();
    }
  };

  const deleteExpense = async (budgetId: string, expenseId: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (!error) {
      toast({ title: "Expense Deleted", description: "Expense removed." });
      await loadExpenses();
    }
  };

  // Auth and loading UI
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Please sign in to manage budgets.</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Loading budgets...</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/bugg.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold drop-shadow">Budget & Expense Management</h2>
            <p className="text-gray-200">Track budgets and expenses for your events</p>
          </div>
          <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" /> Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                <DialogDescription>Fill in the details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBudgetSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Event</Label>
                    <select
                      className="col-span-3 rounded border px-3 py-2 text-sm text-black"
                      value={budgetFormData.eventId}
                      onChange={(e) => setBudgetFormData({ ...budgetFormData, eventId: e.target.value })}
                      required
                    >
                      <option value="">Select event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Total Budget</Label>
                    <Input type="number" step="0.01" className="col-span-3" value={budgetFormData.totalBudget} onChange={(e) => setBudgetFormData({ ...budgetFormData, totalBudget: e.target.value })} required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingBudget ? 'Update' : 'Create'} Budget</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {budgets.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-md text-center text-gray-700 py-10">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-500" />
            <h3 className="text-lg font-semibold mb-2">No Budgets Found</h3>
            <p>Create your first budget to begin tracking expenses.</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {budgets.map((budget) => {
              const budgetExpenses = getBudgetExpenses(budget.id);
              const totalExpenses = budgetExpenses.reduce((sum, e) => sum + e.amount, 0);
              const progress = Math.min((totalExpenses / budget.total_budget) * 100, 100);
              const isOver = totalExpenses > budget.total_budget;

              return (
                <Card key={budget.id} className="bg-white/80 backdrop-blur-md text-gray-900">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getEventName(budget.event_id)}
                          {isOver && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        </CardTitle>
                        <CardDescription>
                          Budget: ${budget.total_budget} | Spent: ${totalExpenses} | Remaining: ${Math.max(0, budget.total_budget - totalExpenses)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => { setSelectedBudgetId(budget.id); setIsExpenseDialogOpen(true); }}>
                          <Plus className="h-4 w-4 mr-2" /> Expense
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingBudget(budget);
                          setBudgetFormData({ eventId: budget.event_id, totalBudget: budget.total_budget.toString() });
                          setIsBudgetDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteBudget(budget.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={progress} className={`h-2 ${isOver ? '[&>div]:bg-red-500' : ''}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {budgetExpenses.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {budgetExpenses.map(exp => (
                            <TableRow key={exp.id}>
                              <TableCell>{exp.category}</TableCell>
                              <TableCell>{exp.description}</TableCell>
                              <TableCell><DollarSign className="h-4 w-4 mr-1 inline text-slate-400" />{exp.amount}</TableCell>
                              <TableCell>{exp.date}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="destructive" onClick={() => deleteExpense(budget.id, exp.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-slate-500 py-4 text-center">No expenses yet.</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Expense Dialog */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleExpenseSubmit}>
              <div className="grid gap-4 py-4">
                {['category', 'description', 'amount', 'date'].map((field, idx) => (
                  <div className="grid grid-cols-4 items-center gap-4" key={idx}>
                    <Label htmlFor={field} className="text-right capitalize">{field}</Label>
                    {field === 'category' ? (
                      <select id={field} className="col-span-3 px-3 py-2 text-sm rounded border" value={expenseFormData.category} onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })} required>
                        <option value="">Select Category</option>
                        {expenseCategories.map((cat) => <option key={cat}>{cat}</option>)}
                      </select>
                    ) : (
                      <Input id={field} className="col-span-3" type={field === 'amount' ? 'number' : field === 'date' ? 'date' : 'text'} value={(expenseFormData as any)[field]} onChange={(e) => setExpenseFormData({ ...expenseFormData, [field]: e.target.value })} required />
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Expense</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BudgetModule;
