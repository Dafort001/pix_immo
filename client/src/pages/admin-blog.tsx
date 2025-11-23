import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Plus, Edit2, Trash2, FileText, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@shared/components';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { BlogPost, InsertBlogPost } from '@shared/schema';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminPageHeader } from '@/components/AdminPageHeader';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminBlog() {
  const { user, isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'pix.immo Redaktion',
    category: 'Tipps',
    tags: '',
    featuredImage: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog/all'],
  });

  const filteredPosts = statusFilter === 'all' 
    ? posts 
    : posts.filter(post => post.status === statusFilter);

  const stats = {
    total: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    published: posts.filter(p => p.status === 'published').length,
  };

  useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title,
        slug: editingPost.slug,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        author: editingPost.author,
        category: editingPost.category,
        tags: editingPost.tags?.join(', ') || '',
        featuredImage: editingPost.featuredImage || '',
      });
    }
  }, [editingPost]);

  useEffect(() => {
    if (!editingPost && formData.title) {
      const slug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingPost]);

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertBlogPost, 'createdBy'>) => {
      return await apiRequest('POST', '/api/blog', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({ title: "Blog-Beitrag erstellt" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Blog-Beitrag konnte nicht erstellt werden",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<InsertBlogPost> }) => {
      return await apiRequest('PATCH', '/api/blog/' + data.id, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({ title: "Blog-Beitrag aktualisiert" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Blog-Beitrag konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/blog/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({ title: "Blog-Beitrag veröffentlicht" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Blog-Beitrag konnte nicht veröffentlicht werden",
        variant: "destructive"
      });
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('PATCH', `/api/blog/${id}/unpublish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({ title: "Blog-Beitrag als Entwurf gespeichert" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Blog-Beitrag konnte nicht zurückgezogen werden",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', '/api/blog/' + id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog/all'] });
      toast({ title: "Blog-Beitrag gelöscht" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Blog-Beitrag konnte nicht gelöscht werden",
        variant: "destructive"
      });
    },
  });

  if (authLoading) return null;

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'pix.immo Redaktion',
        category: 'Tipps',
        tags: '',
        featuredImage: '',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingPost(null);
    setSelectedImageFile(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      author: 'pix.immo Redaktion',
      category: 'Tipps',
      tags: '',
      featuredImage: '',
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
    }
  };

  const handleUploadFeaturedImage = async () => {
    if (!selectedImageFile) {
      toast({ 
        title: "Keine Datei ausgewählt", 
        variant: "destructive" 
      });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('files', selectedImageFile);
      formData.append('page', 'blog');

      const response = await fetch('/api/media-library/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload fehlgeschlagen');
      }

      const result = await response.json();
      
      if (result.images && result.images.length > 0) {
        const uploadedImage = result.images[0];
        setFormData(prev => ({ ...prev, featuredImage: uploadedImage.url }));
        setSelectedImageFile(null);
        toast({ title: "Bild erfolgreich hochgeladen" });
      }
    } catch (error: any) {
      toast({ 
        title: "Upload fehlgeschlagen", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = () => {
    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      category: formData.category,
      tags,
      featuredImage: formData.featuredImage || undefined,
      status: 'draft' as const,
      updatedAt: Date.now(),
    };

    if (editingPost) {
      updateMutation.mutate({
        id: editingPost.id,
        updates: postData,
      });
    } else {
      createMutation.mutate(postData as any);
    }
  };

  const handlePublish = (post: BlogPost) => {
    publishMutation.mutate(post.id);
  };

  const handleUnpublish = (post: BlogPost) => {
    unpublishMutation.mutate(post.id);
  };

  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete.id);
      setShowDeleteDialog(false);
      setPostToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published') {
      return <Badge variant="outline">Veröffentlicht</Badge>;
    }
    return <Badge variant="secondary">Entwurf</Badge>;
  };

  if (!user) return null;

  return (
    <AdminLayout userRole={user.role}>
      <SEOHead title="Blog-Verwaltung – pix.immo Admin" description="Blog-Beiträge verwalten" path="/admin/blog" />
      
      <div className="flex flex-col h-full">
        <AdminPageHeader
          title="Blog-Verwaltung"
          showBackButton
          actions={
            <Button onClick={() => handleOpenDialog()} data-testid="button-create-post">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Beitrag
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stats.total} Beiträge gesamt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Entwürfe: {stats.draft}</Badge>
                  <Badge variant="outline">Veröffentlicht: {stats.published}</Badge>
                </div>
              </div>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all" data-testid="filter-all">Alle</TabsTrigger>
                  <TabsTrigger value="draft" data-testid="filter-draft">Entwürfe</TabsTrigger>
                  <TabsTrigger value="published" data-testid="filter-published">Veröffentlicht</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {isLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex items-center gap-4 mt-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-base font-semibold mb-2">Noch keine Blog-Beiträge</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Erstelle deinen ersten Blog-Beitrag
                  </p>
                  <Button onClick={() => handleOpenDialog()} data-testid="button-create-first">
                    <Plus className="h-4 w-4 mr-2" />
                    Ersten Beitrag erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} data-testid={`post-card-${post.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{post.author}</span>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            {post.publishedAt && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(post.publishedAt).toLocaleDateString('de-DE')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(post)}
                            data-testid={`button-edit-${post.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          {post.status === 'draft' ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(post)}
                              data-testid={`button-publish-${post.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnpublish(post)}
                              data-testid={`button-unpublish-${post.id}`}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post)}
                            data-testid={`button-delete-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDialog && (
        <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Beitrag bearbeiten' : 'Neuer Blog-Beitrag'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Titel *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="So fotografieren Sie Immobilien professionell"
                  data-testid="input-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Slug (URL) *
                </label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="so-fotografieren-sie-immobilien-professionell"
                  data-testid="input-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Zusammenfassung *
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Kurze Zusammenfassung des Beitrags..."
                  className="min-h-[80px]"
                  data-testid="textarea-excerpt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Inhalt *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Vollständiger Inhalt des Blog-Beitrags..."
                  className="min-h-[300px]"
                  data-testid="textarea-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Autor
                  </label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    data-testid="input-author"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Kategorie *
                  </label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tipps">Tipps</SelectItem>
                      <SelectItem value="Trends">Trends</SelectItem>
                      <SelectItem value="Guides">Guides</SelectItem>
                      <SelectItem value="News">News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tags (kommagetrennt)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="fotografie, immobilien, tipps"
                  data-testid="input-tags"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Featured Image
                </label>
                
                {formData.featuredImage && (
                  <div className="mb-3">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured preview" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      data-testid="input-featured-image-file"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleUploadFeaturedImage}
                      disabled={!selectedImageFile || uploadingImage}
                      data-testid="button-upload-featured-image"
                    >
                      {uploadingImage ? 'Lädt...' : 'Hochladen'}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Oder URL direkt eingeben:
                  </p>
                  
                  <Input
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                    placeholder="https://..."
                    data-testid="input-featured-image-url"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-1"
                  disabled={!formData.title || !formData.slug || !formData.excerpt || !formData.content || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-post"
                >
                  {editingPost ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Beitrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Beitrag "{postToDelete?.title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
