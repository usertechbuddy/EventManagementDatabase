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
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// --- Interfaces and Constants (Unchanged) ---
interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  client_id: string;
  vendor_ids: string[];
  description: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const EventScheduling = () => {
  // --- All your state and data fetching logic is UNCHANGED ---
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    client_id: '',
    vendor_ids: [] as string[],
    description: '',
    status: 'planned' as Event['status']
  });

  useEffect(() => {
    if (user) {
      loadEvents();
      loadClients();
    }
  }, [user]);

  // --- All functionality (load, submit, check conflict, etc.) is UNCHANGED ---
  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select(`*, clients (id, name)`).order('created_at', { ascending: false });
      if (error) throw error;
      const typedEvents = (data || []).map(event => ({ ...event, status: event.status as Event['status'], vendor_ids: event.vendor_ids || [] }));
      setEvents(typedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({ title: "Error", description: "Failed to load events.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('id, name').order('name');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const checkVenueConflict = async (date: string, time: string, venue: string, excludeId?: string) => {
    try {
      const query = supabase.from('events').select('id').eq('date', date).eq('time', time).ilike('venue', venue).neq('status', 'cancelled');
      if (excludeId) { query.neq('id', excludeId); }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error('Error checking venue conflict:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasConflict = await checkVenueConflict(formData.date, formData.time, formData.venue, editingEvent?.id);
    if (hasConflict) {
      toast({ title: "Venue Conflict", description: "This venue is already booked for the selected date and time.", variant: "destructive" });
      return;
    }
    try {
      if (editingEvent) {
        const { error } = await supabase.from('events').update(formData).eq('id', editingEvent.id);
        if (error) throw error;
        toast({ title: "Event Updated", description: "Event has been updated successfully." });
      } else {
        const { error } = await supabase.from('events').insert([{ ...formData, user_id: user?.id }]);
        if (error) throw error;
        toast({ title: "Event Created", description: "New event has been scheduled successfully." });
      }
      await loadEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({ title: "Error", description: "Failed to save event.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', date: '', time: '', venue: '', client_id: '', vendor_ids: [], description: '', status: 'planned' });
    setEditingEvent(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (event: Event) => {
    setFormData({ name: event.name, date: event.date, time: event.time, venue: event.venue, client_id: event.client_id, vendor_ids: event.vendor_ids || [], description: event.description || '', status: event.status });
    setEditingEvent(event);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Event Deleted", description: "Event has been removed successfully." });
      await loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    }
  };
  
  // --- STYLISTIC CHANGE: Updated status badge colors for dark background ---
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-900/80 text-blue-300 border-blue-500/50';
      case 'ongoing': return 'bg-yellow-900/80 text-yellow-300 border-yellow-500/50';
      case 'completed': return 'bg-green-900/80 text-green-300 border-green-500/50';
      case 'cancelled': return 'bg-red-900/80 text-red-300 border-red-500/50';
      default: return 'bg-gray-700 text-gray-300 border-gray-500/50';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const LoadingOrAuthPrompt = ({ message }: { message: string }) => (
    <div className="relative flex min-h-[50vh] w-full items-center justify-center rounded-lg bg-black/60 p-8 text-center text-xl text-gray-300 backdrop-blur-md">
      <p>{message}</p>
    </div>
  );

  if (!user) {
    return <LoadingOrAuthPrompt message="Please sign in to manage events." />;
  }

  if (loading) {
    return <LoadingOrAuthPrompt message="Loading event schedule..." />;
  }

  // --- Main UI with new background container and updated styles ---
  return (
    <div 
      className="relative -m-8 min-h-full p-8 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/ess.jpg')" }} // <-- IMPORTANT: Change this path
    >
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Your original component content, wrapped to stay above the overlay */}
      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>Event Scheduling</h2>
            <p className="text-gray-300">Plan and manage your events</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </DialogTrigger>
            {/* Dialog content is intentionally kept standard for focus and readability */}
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Schedule New Event'}</DialogTitle><DialogDescription>{editingEvent ? 'Update event details' : 'Enter event information below'}</DialogDescription></DialogHeader>
              <form onSubmit={handleSubmit}><div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Event Name</Label><Input id="name" className="col-span-3" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" type="date" className="col-span-3" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="time" className="text-right">Time</Label><Input id="time" type="time" className="col-span-3" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="venue" className="text-right">Venue</Label><Input id="venue" className="col-span-3" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} required /></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Client</Label><Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}><SelectTrigger className="col-span-3"><SelectValue placeholder="Select a client" /></SelectTrigger><SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}</SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Status</Label><Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Event['status'] })}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="ongoing">Ongoing</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Input id="description" className="col-span-3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div></div><DialogFooter><Button type="button" variant="outline" onClick={resetForm}>Cancel</Button><Button type="submit">{editingEvent ? 'Update' : 'Schedule'} Event</Button></DialogFooter></form>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- STYLISTIC CHANGE: Updated Card for dark background --- */}
        <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Events ({events.length})</CardTitle>
            <CardDescription className="text-gray-400">View and manage all scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-gray-800/50">
                  <TableHead className="text-white">Event Name</TableHead>
                  <TableHead className="text-white">Date & Time</TableHead>
                  <TableHead className="text-white">Venue</TableHead>
                  <TableHead className="text-white">Client</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-medium text-gray-200">{event.name}</TableCell>
                    <TableCell><div className="flex items-center space-x-2 text-gray-300"><Calendar className="h-4 w-4 text-gray-400" /><span>{event.date}</span><Clock className="h-4 w-4 text-gray-400" /><span>{event.time}</span></div></TableCell>
                    <TableCell><div className="flex items-center text-gray-300"><MapPin className="h-4 w-4 mr-2 text-gray-400" />{event.venue}</div></TableCell>
                    <TableCell><div className="flex items-center text-gray-300"><Users className="h-4 w-4 mr-2 text-gray-400" />{getClientName(event.client_id)}</div></TableCell>
                    <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>{event.status}</span></TableCell>
                    <TableCell><div className="flex space-x-2"><Button size="sm" variant="outline" className="border-gray-600 hover:bg-gray-700" onClick={() => handleEdit(event)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {events.length === 0 && (<div className="text-center py-8 text-gray-500">No events scheduled. Create your first event to get started.</div>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventScheduling;