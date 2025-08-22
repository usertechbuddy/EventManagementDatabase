import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// --- Interfaces and Constants (Unchanged) ---
interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_category: string;
  services: string;
  pricing: string;
  availability: 'available' | 'busy' | 'unavailable';
  created_at: string;
}

const serviceCategories = [
  'Catering',
  'Decoration',
  'Photography',
  'Music & Entertainment',
  'Transportation',
  'Venue',
  'Security',
  'Flowers',
  'Equipment Rental',
  'Other'
];

const VendorManagement = () => {
  // --- All your state and data fetching logic is UNCHANGED ---
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_category: '',
    services: '',
    pricing: '',
    availability: 'available' as Vendor['availability']
  });

  useEffect(() => {
    if (user) {
      loadVendors();
    }
  }, [user]);

  // --- All functionality (load, submit, edit, delete) is UNCHANGED ---
  const loadVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      const typedVendors = (data || []).map(vendor => ({ ...vendor, availability: vendor.availability as Vendor['availability'], pricing: vendor.pricing || '' }));
      setVendors(typedVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({ title: "Error", description: "Failed to load vendors.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        const { error } = await supabase.from('vendors').update(formData).eq('id', editingVendor.id);
        if (error) throw error;
        toast({ title: "Vendor Updated", description: "Vendor information has been updated successfully." });
      } else {
        const { error } = await supabase.from('vendors').insert([{ ...formData, user_id: user?.id }]);
        if (error) throw error;
        toast({ title: "Vendor Added", description: "New vendor has been added successfully." });
      }
      await loadVendors();
      resetForm();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({ title: "Error", description: "Failed to save vendor.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', service_category: '', services: '', pricing: '', availability: 'available' });
    setEditingVendor(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({ name: vendor.name, email: vendor.email, phone: vendor.phone, service_category: vendor.service_category, services: vendor.services, pricing: vendor.pricing || '', availability: vendor.availability });
    setEditingVendor(vendor);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Vendor Deleted", description: "Vendor has been removed successfully." });
      await loadVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({ title: "Error", description: "Failed to delete vendor.", variant: "destructive" });
    }
  };

  // --- STYLISTIC CHANGE: Updated badge colors for dark background ---
  const getAvailabilityColor = (availability: Vendor['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-900/80 text-green-300 border-green-500/50';
      case 'busy': return 'bg-yellow-900/80 text-yellow-300 border-yellow-500/50';
      case 'unavailable': return 'bg-red-900/80 text-red-300 border-red-500/50';
      default: return 'bg-gray-700 text-gray-300 border-gray-500/50';
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.service_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.services.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.service_category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const LoadingOrAuthPrompt = ({ message }: { message: string }) => (
    <div className="relative flex min-h-[50vh] w-full items-center justify-center rounded-lg bg-black/60 p-8 text-center text-xl text-gray-300 backdrop-blur-md">
      <p>{message}</p>
    </div>
  );

  if (!user) {
    return <LoadingOrAuthPrompt message="Please sign in to manage vendors." />;
  }

  if (loading) {
    return <LoadingOrAuthPrompt message="Loading vendor data..." />;
  }

  // --- Main UI with new background container and updated styles ---
  return (
    <div 
      className="relative -m-8 min-h-full p-8 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/bdd.jpg')" }} // <-- IMPORTANT: Change this path
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Your original component content, wrapped to stay above the overlay */}
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Vendor Management</h2>
            <p className="text-gray-300">Manage your vendor network</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            {/* The dialog content remains unchanged for readability */}
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle><DialogDescription>{editingVendor ? 'Update vendor information' : 'Enter vendor details below'}</DialogDescription></DialogHeader>
              <form onSubmit={handleSubmit}><div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" className="col-span-3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" className="col-span-3" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Phone</Label><Input id="phone" className="col-span-3" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Category</Label><Select value={formData.service_category} onValueChange={(value) => setFormData({ ...formData, service_category: value })}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select service category" /></SelectTrigger><SelectContent>{serviceCategories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="services" className="text-right">Services</Label><Input id="services" className="col-span-3" value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} placeholder="Describe services offered" required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="pricing" className="text-right">Pricing</Label><Input id="pricing" className="col-span-3" value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} placeholder="e.g., $100/hour, $500/event" /></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Availability</Label><Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value as Vendor['availability'] })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="busy">Busy</SelectItem><SelectItem value="unavailable">Unavailable</SelectItem></SelectContent></Select></div></div><DialogFooter><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button><Button type="submit">{editingVendor ? 'Update' : 'Add'} Vendor</Button></DialogFooter></form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- STYLISTIC CHANGE: Updated Card for dark background --- */}
        <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendors ({filteredVendors.length})</CardTitle>
                <CardDescription className="text-gray-400">View and manage all your vendors</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input placeholder="Search vendors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-48 bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">{/* You might need to style SelectItem as well if it doesn't inherit */}
                    <SelectItem value="all">All Categories</SelectItem>
                    {serviceCategories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Contact</TableHead>
                  <TableHead className="text-white">Category</TableHead>
                  <TableHead className="text-white">Services</TableHead>
                  <TableHead className="text-white">Pricing</TableHead>
                  <TableHead className="text-white">Availability</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell><div className="space-y-1"><div className="flex items-center text-sm"><Mail className="h-3 w-3 mr-1.5 text-gray-400" />{vendor.email}</div><div className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1.5 text-gray-400" />{vendor.phone}</div></div></TableCell>
                    <TableCell><Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">{vendor.service_category}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate text-gray-300">{vendor.services}</TableCell>
                    <TableCell><div className="flex items-center"><DollarSign className="h-4 w-4 mr-1 text-gray-400" />{vendor.pricing || 'Contact'}</div></TableCell>
                    <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(vendor.availability)}`}>{vendor.availability}</span></TableCell>
                    <TableCell><div className="flex space-x-2"><Button size="sm" variant="outline" className="border-gray-600 hover:bg-gray-700" onClick={() => handleEdit(vendor)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(vendor.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredVendors.length === 0 && (<div className="text-center py-8 text-gray-500">No vendors found. Add your first vendor to get started.</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorManagement;