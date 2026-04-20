'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  collection, 
  getDocs, 
  onSnapshot,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { db, auth, handleFirestoreError } from '@/lib/firebase';
import { DocSection, DocItem, docs as initialDocs } from '@/lib/docs-data';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Layout, 
  FileText, 
  Languages, 
  AlertCircle,
  LogOut,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoveUp,
  MoveDown,
  Monitor,
  Settings,
  GripVertical,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [sections, setSections] = React.useState<DocSection[]>([]);
  const [editingSection, setEditingSection] = React.useState<DocSection | null>(null);
  const [editingItem, setEditingItem] = React.useState<{ sectionId: string, item: DocItem } | null>(null);
  const [isMigrating, setIsMigrating] = React.useState(false);
  const [activeLang, setActiveLang] = React.useState<'en' | 'ar'>(langParam === 'ar' ? 'ar' : 'en');
  const [activeTab, setActiveTab] = React.useState<'content' | 'setup' | 'feedback'>('content');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  const [selectedItems, setSelectedItems] = React.useState<Record<string, string[]>>({}); // sectionId -> itemIds[]
  const [feedbackEntries, setFeedbackEntries] = React.useState<any[]>([]);
  const [sortField, setSortField] = React.useState<'timestamp' | 'type' | 'language'>('timestamp');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const sortedFeedback = React.useMemo(() => {
    return [...feedbackEntries].sort((a, b) => {
      // Handle Firestore Timestamps
      if (sortField === 'timestamp') {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }

      // String comparison
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [feedbackEntries, sortField, sortOrder]);

  const toggleSort = (field: 'timestamp' | 'type' | 'language') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const [siteConfig, setSiteConfig] = React.useState({
    heroTitle: 'Coptogram Learning Docs',
    heroSubtitle: 'Master spiritual knowledge with our comprehensive guides and resources.',
    translations: {
      ar: {
        heroTitle: 'وثائق كوبتوغرام التعليمية',
        heroSubtitle: 'أتقن المعرفة الروحية من خلال أدلتنا ومواردنا الشاملة.'
      }
    }
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isUserAdmin = user?.email?.toLowerCase() === 'mokakokaloka90@gmail.com';

  // Load sections and config from Firestore
  const fetchSections = async () => {
    try {
      // Fetch Site Config
      const configDoc = await getDocs(query(collection(db, 'config')));
      const landingConfig = configDoc.docs.find(d => d.id === 'landing')?.data();
      if (landingConfig) {
        setSiteConfig(landingConfig as any);
      }

      const q = query(collection(db, 'sections'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const sectionsList: DocSection[] = [];
      
      for (const sectionDoc of snapshot.docs) {
        const sectionData = sectionDoc.data() as DocSection;
        // Fetch items subcollection
        const itemsQ = query(collection(db, `sections/${sectionDoc.id}/items`), orderBy('order', 'asc'));
        const itemsSnapshot = await getDocs(itemsQ);
        sectionData.items = itemsSnapshot.docs.map(d => d.data() as DocItem);
        sectionsList.push(sectionData);
      }
      
      setSections(sectionsList);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'feedback') {
      const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setFeedbackEntries(list);
      }, (error) => {
        console.error('Error fetching feedback:', error);
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        fetchSections();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  const migrateData = async () => {
    if (!isUserAdmin) {
      alert(`Unauthorized: Your email (${user?.email}) is not in the administrator list.`);
      return;
    }

    const totalItems = initialDocs.reduce((acc, sec) => acc + 1 + (sec.items?.length || 0), 0);
    if (!confirm(`This will import ${initialDocs.length} sections and ${totalItems - initialDocs.length} articles into Firestore. Existing data will be overwritten if IDs match. Continue?`)) return;
    
    setIsMigrating(true);
    try {
      console.log('Starting migration...');
      const batch = writeBatch(db);
      
      // Recursive helper to clean undefined values and nested objects
      const deepClean = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(deepClean);
        
        const clean: any = {};
        Object.keys(obj).forEach(key => {
          const value = deepClean(obj[key]);
          if (value !== undefined) {
            clean[key] = value;
          }
        });
        return clean;
      };

      for (let i = 0; i < initialDocs.length; i++) {
        const section = initialDocs[i];
        const sectionRef = doc(db, 'sections', section.id);
        const { items, ...sectionMeta } = section;
        
        batch.set(sectionRef, deepClean({ ...sectionMeta, order: i }));
        console.log(`Prepared section: ${section.id}`);
        
        if (items) {
          for (let j = 0; j < items.length; j++) {
            const item = items[j];
            const itemRef = doc(db, `sections/${section.id}/items`, item.id);
            batch.set(itemRef, deepClean({ ...item, order: j }));
            console.log(`  Prepared item: ${item.id}`);
          }
        }
      }
      
      await batch.commit();
      console.log('Batch committed successfully');
      await fetchSections();
      alert(`Success! Imported ${totalItems} records to Firestore.`);
    } catch (error: any) {
      console.error('Migration failed:', error);
      try {
        handleFirestoreError(error, 'write', 'migration-batch');
      } catch (formattedError: any) {
        alert('Migration failed with detailed info: ' + formattedError.message);
      }
    } finally {
      setIsMigrating(false);
    }
  };

  const saveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    
    try {
      const sectionRef = doc(db, 'sections', editingSection.id);
      const { items, ...sectionData } = editingSection;
      
      // If no order, set it to end
      if (sectionData.order === undefined) {
        sectionData.order = sections.length;
      }

      await setDoc(sectionRef, sectionData, { merge: true });
      setEditingSection(null);
      fetchSections();
    } catch (error: any) {
      console.error('Save section failed:', error);
      alert('Save section failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const itemRef = doc(db, `sections/${editingItem.sectionId}/items`, editingItem.item.id);
      await setDoc(itemRef, editingItem.item, { merge: true });
      setEditingItem(null);
      fetchSections();
    } catch (error: any) {
      console.error('Save item failed:', error);
      alert('Save item failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete the section and all its items.')) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'sections', id));
      
      const remaining = sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }));
      remaining.forEach(s => {
        batch.update(doc(db, 'sections', s.id), { order: s.order });
      });
      
      await batch.commit();
      fetchSections();
    } catch (error: any) {
      console.error('Delete section failed:', error);
      alert('Delete section failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const deleteItem = async (sectionId: string, itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section || !section.items) return;

      const batch = writeBatch(db);
      batch.delete(doc(db, `sections/${sectionId}/items`, itemId));
      
      const remaining = section.items.filter(it => it.id !== itemId).map((it, i) => ({ ...it, order: i }));
      remaining.forEach(it => {
        batch.update(doc(db, `sections/${sectionId}/items`, it.id), { order: it.order });
      });

      await batch.commit();
      fetchSections();
    } catch (error: any) {
      console.error('Delete item failed:', error);
      alert('Delete item failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const saveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'config', 'landing'), siteConfig);
      alert('Landing page settings saved successfully!');
    } catch (error) {
      console.error('Save config failed:', error);
      alert('Failed to save settings.');
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[newIndex];
    newSections[newIndex] = temp;

    try {
      const batch = writeBatch(db);
      newSections.forEach((sec, i) => {
        batch.update(doc(db, 'sections', sec.id), { order: i });
      });
      await batch.commit();
      fetchSections();
    } catch (error) {
      console.error('Move section failed:', error);
    }
  };

  const moveItem = async (sectionId: string, itemIndex: number, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.items) return;

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (newIndex < 0 || newIndex >= section.items.length) return;

    const newItems = [...section.items];
    const temp = newItems[itemIndex];
    newItems[itemIndex] = newItems[newIndex];
    newItems[newIndex] = temp;

    try {
      const batch = writeBatch(db);
      newItems.forEach((it, i) => {
        batch.update(doc(db, `sections/${sectionId}/items`, it.id), { order: i });
      });
      await batch.commit();
      fetchSections();
    } catch (error) {
      console.error('Move item failed:', error);
    }
  };

  const handleReorderSections = async (newSections: DocSection[]) => {
    const indexed = newSections.map((s, i) => ({ ...s, order: i }));
    setSections(indexed);
    try {
      const batch = writeBatch(db);
      indexed.forEach((sec) => {
        batch.update(doc(db, 'sections', sec.id), { order: sec.order });
      });
      await batch.commit();
    } catch (error) {
      console.error('Reorder sections failed:', error);
      fetchSections();
    }
  };

  const handleReorderItems = async (sectionId: string, newItems: DocItem[]) => {
    const indexed = newItems.map((it, i) => ({ ...it, order: i }));
    const newSections = sections.map(s => s.id === sectionId ? { ...s, items: indexed } : s);
    setSections(newSections);
    try {
      const batch = writeBatch(db);
      indexed.forEach((it) => {
        batch.update(doc(db, `sections/${sectionId}/items`, it.id), { order: it.order });
      });
      await batch.commit();
    } catch (error) {
      console.error('Reorder items failed:', error);
      fetchSections();
    }
  };

  const toggleItemSelection = (sectionId: string, itemId: string) => {
    setSelectedItems(prev => {
      const current = prev[sectionId] || [];
      if (current.includes(itemId)) {
        return { ...prev, [sectionId]: current.filter(id => id !== itemId) };
      }
      return { ...prev, [sectionId]: [...current, itemId] };
    });
  };

  const toggleSectionAllItems = (sectionId: string, itemIds: string[]) => {
    setSelectedItems(prev => {
      const currentSelection = prev[sectionId] || [];
      if (currentSelection.length === itemIds.length) {
        const newSelection = { ...prev };
        delete newSelection[sectionId];
        return newSelection;
      }
      return { ...prev, [sectionId]: itemIds };
    });
  };

  const bulkDeleteItems = async (sectionId: string) => {
    const ids = selectedItems[sectionId];
    if (!ids || ids.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${ids.length} items?`)) return;

    try {
      const batch = writeBatch(db);
      ids.forEach(id => {
        batch.delete(doc(db, `sections/${sectionId}/items`, id));
      });
      
      const section = sections.find(s => s.id === sectionId);
      if (section && section.items) {
        const remaining = section.items.filter(it => !ids.includes(it.id)).map((it, i) => ({ ...it, order: i }));
        remaining.forEach(it => {
          batch.update(doc(db, `sections/${sectionId}/items`, it.id), { order: it.order });
        });
      }

      await batch.commit();
      
      setSelectedItems(prev => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      fetchSections();
    } catch (error) {
      console.error('Bulk delete failed:', error);
      alert('Bulk delete failed. Check logs.');
    }
  };

  const bulkMoveItems = async (sectionId: string, direction: 'up' | 'down') => {
    const ids = selectedItems[sectionId];
    const section = sections.find(s => s.id === sectionId);
    if (!ids || ids.length === 0 || !section || !section.items) return;

    // Get indices of selected items
    const indices = ids.map(id => section.items!.findIndex(it => it.id === id)).sort((a, b) => a - b);
    
    // Check if we can move the whole block
    if (direction === 'up' && indices[0] === 0) return;
    if (direction === 'down' && indices[indices.length - 1] === section.items.length - 1) return;

    const newItems = [...section.items];
    
    if (direction === 'up') {
      // For each index from top to bottom
      for (const idx of indices) {
        const temp = newItems[idx];
        newItems[idx] = newItems[idx - 1];
        newItems[idx - 1] = temp;
      }
    } else {
      // For each index from bottom to top
      for (let i = indices.length - 1; i >= 0; i--) {
        const idx = indices[i];
        const temp = newItems[idx];
        newItems[idx] = newItems[idx + 1];
        newItems[idx + 1] = temp;
      }
    }

    try {
      const batch = writeBatch(db);
      newItems.forEach((it, i) => {
        batch.update(doc(db, `sections/${sectionId}/items`, it.id), { order: i });
      });
      await batch.commit();
      fetchSections();
    } catch (error) {
      console.error('Bulk move failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl text-center"
        >
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">Sign in with your authorized email to manage the documentation.</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 transition-all active:scale-95"
          >
            <Monitor className="h-5 w-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/10 text-foreground pb-20" dir={activeLang === 'ar' ? 'rtl' : 'ltr'}>
      <a 
        href="#admin-main" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        {activeLang === 'ar' ? 'تخطي إلى المحتوى الرئيسي' : 'Skip to content'}
      </a>
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Link>
            <div className="flex items-center gap-2 font-bold">
              <Layout className="h-5 w-5 text-primary" />
              <span>Dashboard Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{user.displayName}</span>
                {isUserAdmin ? (
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-black">Admin</span>
                ) : (
                  <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded text-[10px] uppercase font-black">Unauthorized</span>
                )}
              </div>
              <span className="text-muted-foreground">{user.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main id="admin-main" className="max-w-6xl mx-auto px-6 py-10" tabIndex={-1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Content Management</h1>
            <p className="text-muted-foreground">Add, edit, or delete sections and articles from A to Z.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all"
            >
              <Layout className="h-4 w-4" />
              View Live Site
            </Link>
            <button 
              onClick={migrateData}
              disabled={isMigrating}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all disabled:opacity-50"
            >
              {isMigrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-primary" />}
              Import Initial Data
            </button>
            <button 
              onClick={() => setEditingSection({ id: '', title: '', category: 'general', content: '', order: sections.length })}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Section
            </button>
          </div>
        </div>

        {/* Language & View Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div 
            className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-border w-fit"
            role="tablist"
            aria-label="Language edit mode"
          >
            <button 
              onClick={() => setActiveLang('en')}
              role="tab"
              aria-selected={activeLang === 'en'}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                activeLang === 'en' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              English Edit
            </button>
            <button 
              onClick={() => setActiveLang('ar')}
              role="tab"
              aria-selected={activeLang === 'ar'}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                activeLang === 'ar' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              تعديل بالعربي
            </button>
          </div>

          <div 
            className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border"
            role="tablist"
            aria-label="Dashboard views"
          >
            <button 
              onClick={() => setActiveTab('content')}
              role="tab"
              aria-selected={activeTab === 'content'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'content' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Layout className="h-3.5 w-3.5" aria-hidden="true" />
              Content
            </button>
            <button 
              onClick={() => setActiveTab('setup')}
              role="tab"
              aria-selected={activeTab === 'setup'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'setup' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className="h-3.5 w-3.5" aria-hidden="true" />
              Site Setup
            </button>
            <button 
              onClick={() => setActiveTab('feedback')}
              role="tab"
              aria-selected={activeTab === 'feedback'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                activeTab === 'feedback' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              Feedback
            </button>
          </div>
        </div>

        {activeTab === 'content' ? (
          <Reorder.Group axis="y" values={sections} onReorder={handleReorderSections} className="space-y-6">
            {sections.length === 0 && !isMigrating && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-card border-2 border-dashed border-border rounded-[2.5rem] px-6"
            >
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <UploadCloud className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">Database is Empty</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed text-lg">
                Your Cloud Firestore database is currently empty. Click below to synchronize your documentation content from the local guide.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={migrateData}
                  disabled={isMigrating}
                  className="flex items-center gap-3 py-4 px-10 rounded-2xl bg-primary text-primary-foreground font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isMigrating ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                  Import Initial Data Now
                </button>
                <button 
                  onClick={() => setEditingSection({ id: '', title: '', category: 'general', content: '', order: sections.length })}
                  className="flex items-center gap-3 py-4 px-8 rounded-2xl border-2 border-primary/20 text-primary font-bold hover:bg-primary/5 transition-all"
                >
                  <Plus className="h-6 w-6" />
                  Manual Setup
                </button>
              </div>
            </motion.div>
          )}

          <div className="mb-6 flex justify-end">
             <button 
                onClick={() => setEditingSection({ id: '', title: '', category: 'general', content: '', order: sections.length })}
                className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add New Section
              </button>
          </div>

          {sections.map((section, idx) => (
            <Reorder.Item 
              key={section.id} 
              value={section}
              className="group border border-border rounded-3xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-default"
            >
              {/* Section Header */}
              <div className="p-6 flex items-center justify-between border-b border-border bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors –pl-2">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <button 
                    onClick={() => toggleSection(section.id)}
                    aria-label={expandedSections[section.id] ? 'Collapse section' : 'Expand section'}
                    aria-expanded={expandedSections[section.id]}
                    className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    {expandedSections[section.id] ? <ChevronDown className="h-5 w-5 text-primary" aria-hidden="true" /> : <ChevronRight className="h-5 w-5 text-primary" aria-hidden="true" />}
                  </button>
                  <div 
                    className="cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {activeLang === 'ar' ? section.translations?.ar?.title || section.title : section.title}
                      {!section.translations?.ar && <AlertCircle className="h-3.5 w-3.5 text-amber-500" title="Missing Arabic Translation" />}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{section.id}</span>
                      <span className="text-[10px] bg-secondary/50 px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">{section.category}</span>
                      {section.icon && (
                        <span className="text-[10px] flex items-center gap-1 text-primary lowercase font-medium">
                          <Layout className="h-3 w-3" />
                          {section.icon}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
                    <button 
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      aria-label="Move section up"
                      className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30"
                    >
                      <MoveUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button 
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      aria-label="Move section down"
                      className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30"
                    >
                      <MoveDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <button 
                    onClick={() => setEditingSection(section)}
                    aria-label="Edit section"
                    className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button 
                    onClick={() => deleteSection(section.id)}
                    aria-label="Delete section"
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <AnimatePresence>
                {expandedSections[section.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-muted/5">
                      <div className="flex items-center justify-between px-2 mb-4">
                         <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                              checked={(selectedItems[section.id] || []).length === (section.items?.length || 0) && (section.items?.length || 0) > 0}
                              onChange={() => toggleSectionAllItems(section.id, (section.items || []).map(it => it.id))}
                            />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Articles & Guides</span>
                         </div>
                         
                         <div className="flex items-center gap-4">
                           {selectedItems[section.id]?.length ? (
                             <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full animate-in fade-in slide-in-from-right-1">
                               <span className="text-[10px] font-bold text-primary">{selectedItems[section.id].length} Selected</span>
                               <div className="h-3 w-[1px] bg-primary/20 mx-1" />
                               <div className="flex items-center gap-1">
                                 <button onClick={() => bulkMoveItems(section.id, 'up')} className="p-1 hover:bg-primary/20 rounded-md text-primary"><MoveUp className="h-3 w-3" /></button>
                                 <button onClick={() => bulkMoveItems(section.id, 'down')} className="p-1 hover:bg-primary/20 rounded-md text-primary"><MoveDown className="h-3 w-3" /></button>
                                 <button onClick={() => bulkDeleteItems(section.id)} className="p-1 hover:bg-destructive/20 rounded-md text-destructive ml-1"><Trash2 className="h-3 w-3" /></button>
                               </div>
                               <button 
                                onClick={() => setSelectedItems(prev => { const n = {...prev}; delete n[section.id]; return n; })}
                                className="ml-1 p-0.5 hover:bg-primary/20 rounded-full"
                               >
                                <X className="h-3 w-3 text-primary" />
                               </button>
                             </div>
                           ) : null}

                           <button 
                            onClick={() => setEditingItem({ sectionId: section.id, item: { id: '', title: '', description: '', order: section.items?.length || 0 } })}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                           >
                             <Plus className="h-3 w-3" />
                             Add Item
                           </button>
                         </div>
                      </div>
                      
                      <Reorder.Group 
                        axis="y" 
                        values={section.items || []} 
                        onReorder={(newItems) => handleReorderItems(section.id, newItems)}
                        className="space-y-2"
                      >
                        {(section.items || []).map((item, iIndex) => (
                          <Reorder.Item 
                            key={item.id} 
                            value={item}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border transition-all group/item cursor-default",
                              selectedItems[section.id]?.includes(item.id) 
                                ? "bg-primary/5 border-primary/20 shadow-sm" 
                                : "bg-secondary/30 border-transparent hover:border-border"
                            )}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors mr-1">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <input 
                                type="checkbox" 
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                                checked={selectedItems[section.id]?.includes(item.id) || false}
                                onChange={() => toggleItemSelection(section.id, item.id)}
                              />
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-sm truncate flex items-center gap-2">
                                {activeLang === 'ar' ? item.translations?.ar?.title || item.title : item.title}
                                {!item.translations?.ar && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Missing Arabic translation" />}
                              </div>
                              <div className="text-[10px] text-muted-foreground/60 truncate">{item.id}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                             <div className="flex items-center gap-0.5 mr-2 pr-2 border-r border-border">
                                <button 
                                  onClick={() => moveItem(section.id, iIndex, 'up')}
                                  disabled={iIndex === 0}
                                  className="p-1.5 hover:bg-card rounded-lg disabled:opacity-30"
                                >
                                  <MoveUp className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => moveItem(section.id, iIndex, 'down')}
                                  disabled={iIndex === (section.items?.length || 0) - 1}
                                  className="p-1.5 hover:bg-card rounded-lg disabled:opacity-30"
                                >
                                  <MoveDown className="h-3 w-3" />
                                </button>
                             </div>
                             <button 
                              onClick={() => setEditingItem({ sectionId: section.id, item })}
                              className="p-2 hover:bg-card rounded-xl transition-colors"
                             >
                               <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                             </button>
                             <button 
                              onClick={() => deleteItem(section.id, item.id)}
                              className="p-2 hover:bg-destructive/10 rounded-xl transition-colors"
                             >
                               <Trash2 className="h-3.5 w-3.5 text-destructive/60" />
                             </button>
                          </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
          </Reorder.Group>
        ) : activeTab === 'setup' ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Landing Page Setup */}
              <div className="p-8 rounded-[2.5rem] bg-card border border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Monitor className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold">Landing Page Text</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Hero Section Content</p>
                  </div>
                </div>

                <form onSubmit={saveSiteConfig} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* English Fields */}
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Hero Title</label>
                        <input 
                          value={siteConfig.heroTitle}
                          onChange={e => setSiteConfig({...siteConfig, heroTitle: e.target.value})}
                          className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Hero Subtitle</label>
                        <textarea 
                          rows={3}
                          value={siteConfig.heroSubtitle}
                          onChange={e => setSiteConfig({...siteConfig, heroSubtitle: e.target.value})}
                          className="w-full p-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                      </div>
                    </div>

                    {/* Arabic Fields */}
                    <div className="space-y-6" dir="rtl">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">العنوان الرئيسي (Arabic Hero Title)</label>
                        <input 
                          value={siteConfig.translations.ar.heroTitle}
                          onChange={e => setSiteConfig({
                            ...siteConfig, 
                            translations: { ...siteConfig.translations, ar: { ...siteConfig.translations.ar, heroTitle: e.target.value }}
                          })}
                          className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-right"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">العنوان الفرعي (Arabic Hero Subtitle)</label>
                        <textarea 
                          rows={3}
                          value={siteConfig.translations.ar.heroSubtitle}
                          onChange={e => setSiteConfig({
                            ...siteConfig, 
                            translations: { ...siteConfig.translations, ar: { ...siteConfig.translations.ar, heroSubtitle: e.target.value }}
                          })}
                          className="w-full p-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-foreground text-background font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Landing Settings
                  </button>
                </form>
              </div>

              {/* Documentation Overview Panel */}
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold">Overview Summary</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Main Introduction Panel</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  The &quot;Overview&quot; section content acts as the primary introductory panel on your landing page. Edit it in the <span className="font-bold text-primary">Content</span> tab to change the body text of the landing page&apos;s main welcome section.
                </p>
                <div className="p-4 rounded-2xl bg-background/50 border border-border text-xs font-mono text-muted-foreground italic">
                  Tip: Use the &apos;overview&apos; section ID to manage this content.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">User Feedback</h2>
                <p className="text-sm text-muted-foreground">Analyze user satisfaction and detailed reports.</p>
              </div>
            </div>

            {feedbackEntries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-2 bg-muted/20 border border-border rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4 mr-2">Sort by:</span>
                {[
                  { id: 'timestamp', label: 'Date', icon: FileText },
                  { id: 'type', label: 'Type', icon: ThumbsUp },
                  { id: 'language', label: 'Language', icon: Languages },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSort(s.id as any)}
                    className={cn(
                      "flex items-center gap-2 py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all border",
                      sortField === s.id 
                        ? "bg-foreground text-background border-foreground shadow-sm" 
                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    <s.icon className="h-3 w-3" />
                    {s.label}
                    {sortField === s.id ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                    ) : <ArrowUpDown className="h-3 w-3 opacity-30" />}
                  </button>
                ))}
              </div>
            )}

            {feedbackEntries.length === 0 ? (
              <div className="text-center py-24 bg-card border-2 border-dashed border-border rounded-3xl">
                <p className="text-muted-foreground">No feedback entries found yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sortedFeedback.map((entry) => (
                  <div key={entry.id} className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {entry.type === 'positive' ? (
                          <div className="h-8 w-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-600">
                            <ThumbsUp className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-600">
                            <ThumbsDown className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold capitalize">{entry.type} Selection</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono">
                            {entry.timestamp?.toDate ? entry.timestamp.toDate().toLocaleString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-secondary/50 px-2 py-1 rounded font-bold text-muted-foreground">
                        {entry.sectionId} / {entry.itemId}
                      </div>
                    </div>

                    {entry.comment && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-4">
                        <p className="text-sm italic">&ldquo;{entry.comment}&rdquo;</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Languages className="h-3 w-3" />
                         <span>Language: {entry.language}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate max-w-xs">
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">URL: {entry.page}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Section Editor Modal */}
      <AnimatePresence>
        {editingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10" role="none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setEditingSection(null)}
              aria-hidden="true"
            />
            <motion.div
              layoutId="section-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="section-modal-title"
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl p-8 scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 id="section-modal-title" className="text-2xl font-bold flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" aria-hidden="true" />
                  {editingSection.id ? 'Edit Section' : 'Add New Section'}
                </h3>
                <button 
                  onClick={() => setEditingSection(null)}
                  className="p-2 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={saveSection} className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Section ID</label>
                    <input 
                      required
                      value={editingSection.id}
                      disabled={!!sections.find(s => s.id === editingSection.id)}
                      onChange={e => setEditingSection({...editingSection, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      placeholder="e.g. overview"
                      className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select
                      value={editingSection.category}
                      onChange={e => setEditingSection({...editingSection, category: e.target.value as any})}
                      className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm appearance-none"
                    >
                      <option value="general">General</option>
                      <option value="organization">Organization</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Icon Name</label>
                    <input 
                      value={editingSection.icon || ''}
                      onChange={e => setEditingSection({...editingSection, icon: e.target.value})}
                      placeholder="Church, Sparkles..."
                      className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Tags (Comma separated)</label>
                  <input 
                    value={activeLang === 'ar' 
                      ? (editingSection.translations?.ar?.tags || []).join(', ')
                      : (editingSection.tags || []).join(', ')
                    }
                    onChange={e => {
                      const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
                      if (activeLang === 'ar') {
                        setEditingSection({
                          ...editingSection,
                          translations: {
                            ...editingSection.translations,
                            ar: { ...(editingSection.translations?.ar || { title: '', content: '' }), tags }
                          }
                        });
                      } else {
                        setEditingSection({...editingSection, tags});
                      }
                    }}
                    className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>

                {activeLang === 'en' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Title</label>
                      <input 
                        required
                        value={editingSection.title}
                        onChange={e => setEditingSection({...editingSection, title: e.target.value})}
                        className="w-full h-11 px-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Content (Markdown)</label>
                      <textarea
                        required
                        rows={6}
                        value={editingSection.content}
                        onChange={e => setEditingSection({...editingSection, content: e.target.value})}
                        className="w-full p-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">العنوان بالعربي</label>
                      <input 
                        value={editingSection.translations?.ar?.title || ''}
                        onChange={e => setEditingSection({
                          ...editingSection, 
                          translations: { 
                            ...editingSection.translations, 
                            ar: { ...(editingSection.translations?.ar || { content: '' }), title: e.target.value } 
                          }
                        })}
                        className="w-full h-11 px-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">المحتوى بالعربي (Markdown)</label>
                      <textarea
                        rows={6}
                        value={editingSection.translations?.ar?.content || ''}
                        onChange={e => setEditingSection({
                          ...editingSection, 
                          translations: { 
                            ...editingSection.translations, 
                            ar: { ...(editingSection.translations?.ar || { title: '' }), content: e.target.value } 
                          }
                        })}
                        className="w-full p-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right font-mono text-sm"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingSection(null)}
                    className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:scale-105 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Editor Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10" role="none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setEditingItem(null)}
              aria-hidden="true"
            />
            <motion.div
              layoutId="item-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="item-modal-title"
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl p-8 scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 id="item-modal-title" className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                  {editingItem.item.id ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="p-2 hover:bg-muted rounded-full"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={saveItem} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Item ID</label>
                  <input 
                    required
                    value={editingItem.item.id}
                    onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, id: e.target.value.toLowerCase().replace(/\s+/g, '-')}})}
                    placeholder="e.g. initial-setup"
                    className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                  />
                </div>

                {activeLang === 'en' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Title</label>
                      <input 
                        required
                        value={editingItem.item.title}
                        onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, title: e.target.value}})}
                        className="w-full h-11 px-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Description</label>
                      <textarea
                        required
                        rows={3}
                        value={editingItem.item.description}
                        onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, description: e.target.value}})}
                        className="w-full p-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Tags (Comma separated)</label>
                      <input 
                        value={(editingItem.item.tags || []).join(', ')}
                        onChange={e => {
                          const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
                          setEditingItem({...editingItem, item: { ...editingItem.item, tags }});
                        }}
                        className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">English Details (One per line)</label>
                      <textarea 
                        rows={4}
                        value={(editingItem.item.details || []).join('\n')}
                        onChange={e => {
                          const details = e.target.value.split('\n').map(d => d.trim()).filter(d => d !== '');
                          setEditingItem({...editingItem, item: { ...editingItem.item, details }});
                        }}
                        className="w-full p-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">العنوان بالعربي</label>
                      <input 
                        value={editingItem.item.translations?.ar?.title || ''}
                        onChange={e => setEditingItem({
                          ...editingItem, 
                          item: {
                            ...editingItem.item,
                            translations: {
                              ...editingItem.item.translations,
                              ar: { ...(editingItem.item.translations?.ar || { description: '' }), title: e.target.value }
                            }
                          }
                        })}
                        className="w-full h-11 px-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">الوصف بالعربي</label>
                      <textarea
                        rows={3}
                        value={editingItem.item.translations?.ar?.description || ''}
                        onChange={e => setEditingItem({
                          ...editingItem, 
                          item: {
                            ...editingItem.item,
                            translations: {
                              ...editingItem.item.translations,
                              ar: { ...(editingItem.item.translations?.ar || { title: '' }), description: e.target.value }
                            }
                          }
                        })}
                        className="w-full p-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">الكلمات المفتاحية بالعربي (فواصل للفصل)</label>
                      <input 
                        value={(editingItem.item.translations?.ar?.tags || []).join(', ')}
                        onChange={e => {
                          const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
                          setEditingItem({
                            ...editingItem,
                            item: {
                              ...editingItem.item,
                              translations: {
                                ...editingItem.item.translations,
                                ar: { ...(editingItem.item.translations?.ar || { title: '', description: '' }), tags }
                              }
                            }
                          });
                        }}
                        className="h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right text-sm"
                      />
                    </div>
                    <div className="space-y-1.5" dir="rtl">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mr-1">التفاصيل بالعربي (نقطة في كل سطر)</label>
                      <textarea 
                        rows={4}
                        value={(editingItem.item.translations?.ar?.details || []).join('\n')}
                        onChange={e => {
                          const details = e.target.value.split('\n').map(d => d.trim()).filter(d => d !== '');
                          setEditingItem({
                            ...editingItem,
                            item: {
                              ...editingItem.item,
                              translations: {
                                ...editingItem.item.translations,
                                ar: { ...(editingItem.item.translations?.ar || { title: '', description: '' }), details }
                              }
                            }
                          });
                        }}
                        className="w-full p-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-right text-sm font-mono"
                      />
                    </div>

                    <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border" dir="rtl">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">روابط ذات صلة (بالعربي)</label>
                        <button 
                          type="button"
                          onClick={() => {
                            const currentLinks = editingItem.item.translations?.ar?.relatedLinks || [];
                            const newLinks = [...currentLinks, { title: '' }];
                            setEditingItem({
                              ...editingItem,
                              item: {
                                ...editingItem.item,
                                translations: {
                                  ...editingItem.item.translations,
                                  ar: { ...(editingItem.item.translations?.ar || { title: '', description: '' }), relatedLinks: newLinks }
                                }
                              }
                            });
                          }}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          + إضافة رابط
                        </button>
                      </div>
                      {(editingItem.item.translations?.ar?.relatedLinks || []).map((link, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input 
                            placeholder="عنوان الرابط"
                            value={link.title}
                            onChange={e => {
                              const newLinks = [...(editingItem.item.translations?.ar?.relatedLinks || [])];
                              newLinks[lIdx] = { ...link, title: e.target.value };
                              setEditingItem({
                                ...editingItem,
                                item: {
                                  ...editingItem.item,
                                  translations: {
                                    ...editingItem.item.translations,
                                    ar: { ...(editingItem.item.translations?.ar || { title: '', description: '' }), relatedLinks: newLinks }
                                  }
                                }
                              });
                            }}
                            className="h-10 px-3 text-xs border border-border rounded-lg bg-background flex-1 text-right"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newLinks = (editingItem.item.translations?.ar?.relatedLinks || []).filter((_, i) => i !== lIdx);
                              setEditingItem({
                                ...editingItem,
                                item: {
                                  ...editingItem.item,
                                  translations: {
                                    ...editingItem.item.translations,
                                    ar: { ...(editingItem.item.translations?.ar || { title: '', description: '' }), relatedLinks: newLinks }
                                  }
                                }
                              });
                            }}
                            className="p-2 text-destructive hover:bg-destructive/5 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Version (Optional)</label>
                    <input 
                      value={editingItem.item.version || ''}
                      onChange={e => setEditingItem({...editingItem, item: { ...editingItem.item, version: e.target.value }})}
                      placeholder="e.g. v1.2"
                      className="w-full h-11 px-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Source Code Snippet (Optional)</label>
                  <textarea 
                    rows={5}
                    value={editingItem.item.code || ''}
                    onChange={e => setEditingItem({...editingItem, item: { ...editingItem.item, code: e.target.value }})}
                    placeholder="Paste code or markdown here..."
                    className="w-full p-4 border border-border bg-muted/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-mono"
                  />
                </div>

                {activeLang === 'en' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Related Links</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const newLinks = [...(editingItem.item.relatedLinks || []), { title: '', sectionId: '' }];
                          setEditingItem({ ...editingItem, item: { ...editingItem.item, relatedLinks: newLinks } });
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        + Add Link
                      </button>
                    </div>
                    {/* ... Rest of Related Links logic moved below ... */}
                    {(editingItem.item.relatedLinks || []).map((link, lIdx) => (
                      <div key={lIdx} className="grid sm:grid-cols-3 gap-2">
                        <input 
                          placeholder="Link Title"
                          value={link.title}
                          onChange={e => {
                            const newLinks = [...(editingItem.item.relatedLinks || [])];
                            newLinks[lIdx] = { ...link, title: e.target.value };
                            setEditingItem({ ...editingItem, item: { ...editingItem.item, relatedLinks: newLinks } });
                          }}
                          className="h-10 px-3 text-xs border border-border rounded-lg bg-background"
                        />
                        <input 
                          placeholder="Section ID"
                          value={link.sectionId}
                          onChange={e => {
                            const newLinks = [...(editingItem.item.relatedLinks || [])];
                            newLinks[lIdx] = { ...link, sectionId: e.target.value };
                            setEditingItem({ ...editingItem, item: { ...editingItem.item, relatedLinks: newLinks } });
                          }}
                          className="h-10 px-3 text-xs border border-border rounded-lg bg-background font-mono"
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            placeholder="Item ID (Opt)"
                            value={link.itemId || ''}
                            onChange={e => {
                              const newLinks = [...(editingItem.item.relatedLinks || [])];
                              newLinks[lIdx] = { ...link, itemId: e.target.value || undefined };
                              setEditingItem({ ...editingItem, item: { ...editingItem.item, relatedLinks: newLinks } });
                            }}
                            className="h-10 px-3 text-xs border border-border rounded-lg bg-background font-mono flex-1"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newLinks = (editingItem.item.relatedLinks || []).filter((_, i) => i !== lIdx);
                              setEditingItem({ ...editingItem, item: { ...editingItem.item, relatedLinks: newLinks } });
                            }}
                            className="p-2 text-destructive hover:bg-destructive/5 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-foreground text-background text-sm font-bold hover:scale-105 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
