'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { societyAPI } from '@/lib/api';
import { Users, Search, Phone, Mail, Home } from 'lucide-react';

export default function DirectoryPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    try {
      const response = await societyAPI.getDirectory();
      setResidents(response.data);
    } catch (error) {
      console.error('Error loading directory:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resident directory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resident.flat_number.toLowerCase().includes(searchLower) ||
      (resident.current_resident &&
        (resident.current_resident.first_name.toLowerCase().includes(searchLower) ||
          resident.current_resident.last_name.toLowerCase().includes(searchLower) ||
          resident.current_resident.email.toLowerCase().includes(searchLower)))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <Users className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground">Only administrators can view the resident directory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resident Directory</h2>
        <p className="text-muted-foreground">Find and connect with residents</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by flat number, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResidents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No residents found</p>
            </CardContent>
          </Card>
        ) : (
          filteredResidents.map((resident) => (
            <Card key={resident.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {resident.current_resident ?
                      `${resident.current_resident.first_name[0]}${resident.current_resident.last_name[0]}` :
                      'V'
                    }
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {resident.current_resident ?
                        `${resident.current_resident.first_name} ${resident.current_resident.last_name}` :
                        'Vacant'
                      }
                    </CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {resident.occupancy_status.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Flat {resident.flat_number} • Floor {resident.floor}
                  </span>
                </div>

                {resident.current_resident && (
                  <>
                    {resident.current_resident.email && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{resident.current_resident.email}</span>
                      </div>
                    )}

                    {resident.current_resident.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{resident.current_resident.phone}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-3 border-t text-xs text-muted-foreground">
                  <span className="font-medium">{resident.bhk}</span>
                  {resident.parking_slots > 0 && (
                    <span> • {resident.parking_slots} Parking</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Flats</p>
              <p className="text-2xl font-bold">{residents.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold text-emerald-500">
                {residents.filter(r => r.current_resident).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vacant</p>
              <p className="text-2xl font-bold text-orange-500">
                {residents.filter(r => !r.current_resident).length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Owner Occupied</p>
              <p className="text-2xl font-bold text-blue-500">
                {residents.filter(r => r.occupancy_status === 'OWNER').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

