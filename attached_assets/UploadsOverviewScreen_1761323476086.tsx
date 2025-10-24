import { useState } from 'react';
import { Upload, Calendar, Image, ChevronRight, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

type UploadStatus = 'Neu' | 'In Bearbeitung' | 'Fertig';

interface UploadProject {
  id: string;
  name: string;
  date: string;
  photoCount: number;
  status: UploadStatus;
  thumbnail: string;
  price?: number;
}

const mockProjects: UploadProject[] = [
  {
    id: '1',
    name: 'Einfamilienhaus Musterstraße 12',
    date: '2025-10-20',
    photoCount: 24,
    status: 'Fertig',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
    price: 89.99,
  },
  {
    id: '2',
    name: 'Moderne Penthouse-Wohnung',
    date: '2025-10-22',
    photoCount: 18,
    status: 'In Bearbeitung',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
  },
  {
    id: '3',
    name: 'Gewerbeimmobilie Zentrum',
    date: '2025-10-23',
    photoCount: 32,
    status: 'Neu',
    thumbnail: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=400',
  },
];

const statusConfig: Record<UploadStatus, { color: string; bg: string }> = {
  'Neu': { color: 'text-[#4A5849]', bg: 'bg-[#4A5849]/10 border-[#4A5849]/30' },
  'In Bearbeitung': { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  'Fertig': { color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
};

export function UploadsOverviewScreen() {
  const [selectedFilter, setSelectedFilter] = useState<UploadStatus | 'Alle'>('Alle');

  const filteredProjects = selectedFilter === 'Alle' 
    ? mockProjects 
    : mockProjects.filter(p => p.status === selectedFilter);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontSize: '28px' }} className="text-gray-900">
                Uploads
              </h1>
              <p style={{ fontSize: '16px' }} className="text-gray-600 mt-1">
                Verwalte deine Immobilienfoto-Projekte
              </p>
            </div>
            <Button 
              className="bg-[#4A5849] hover:bg-[#3A4839] text-white"
              style={{ fontSize: '16px' }}
            >
              <Upload strokeWidth={1.5} className="w-4 h-4 mr-2" />
              Neues Projekt
            </Button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <Filter strokeWidth={1.5} className="w-4 h-4 text-gray-400" />
            <span style={{ fontSize: '14px' }} className="text-gray-600 mr-2">
              Status:
            </span>
            {(['Alle', 'Neu', 'In Bearbeitung', 'Fertig'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === filter
                    ? 'bg-[#4A5849] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ fontSize: '14px' }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
            >
              {/* Thumbnail */}
              <div className="aspect-video relative bg-gray-100">
                <img
                  src={project.thumbnail}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-3 right-3 ${statusConfig[project.status].bg} ${statusConfig[project.status].color} border`}
                  style={{ fontSize: '12px' }}
                >
                  {project.status}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 style={{ fontSize: '16px' }} className="text-gray-900 mb-2">
                  {project.name}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    <span style={{ fontSize: '14px' }}>
                      {new Date(project.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Image strokeWidth={1.5} className="w-4 h-4 mr-2" />
                    <span style={{ fontSize: '14px' }}>
                      {project.photoCount} Fotos
                    </span>
                  </div>
                </div>

                {/* Price or Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {project.price ? (
                    <span style={{ fontSize: '16px' }} className="text-gray-900">
                      {project.price.toFixed(2)} €
                    </span>
                  ) : (
                    <span style={{ fontSize: '14px' }} className="text-gray-500">
                      Preis noch nicht festgelegt
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#4A5849] hover:bg-[#4A5849]/10"
                    style={{ fontSize: '14px' }}
                  >
                    Details
                    <ChevronRight strokeWidth={1.5} className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <Upload strokeWidth={1.5} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 style={{ fontSize: '18px' }} className="text-gray-900 mb-2">
              Keine Projekte gefunden
            </h3>
            <p style={{ fontSize: '14px' }} className="text-gray-600">
              Es gibt keine Projekte mit dem Status "{selectedFilter}"
            </p>
          </div>
        )}
      </main>
    </div>
  );
}