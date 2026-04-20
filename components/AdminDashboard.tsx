'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  collection, 
  getDocs, 
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
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const isUserAdmin = user?.email?.toLowerCase() === 'mokakokaloka90@gmail.com';

  // Load sections from Firestore
  const fetchSections = async () => {
    try {
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
      await deleteDoc(doc(db, 'sections', id));
      fetchSections();
    } catch (error: any) {
      console.error('Delete section failed:', error);
      alert('Delete section failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const deleteItem = async (sectionId: string, itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteDoc(doc(db, `sections/${sectionId}/items`, itemId));
      fetchSections();
    } catch (error: any) {
      console.error('Delete item failed:', error);
      alert('Delete item failed: ' + (error instanceof Error ? error.message : String(error)));
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
    <div className="min-h-screen bg-secondary/10 text-foreground pb-20">
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Content Management</h1>
            <p className="text-muted-foreground">Add, edit, or delete sections and articles from A to Z.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <a 
              href="/"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all"
            >
              <Layout className="h-4 w-4" />
              View Live Site
            </a>
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

        {/* Language Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-card p-1.5 rounded-2xl border border-border w-fit">
          <button 
            onClick={() => setActiveLang('en')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeLang === 'en' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            English Edit
          </button>
          <button 
            onClick={() => setActiveLang('ar')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-bold transition-all",
              activeLang === 'ar' ? "bg-foreground text-background shadow-md" : "text-muted-foreground hover:text-foreground"
            )}
          >
            تعديل بالعربي
          </button>
        </div>

        {/* Section List */}
        <div className="space-y-6">
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
              <button 
                onClick={migrateData}
                disabled={isMigrating}
                className="flex items-center gap-3 py-4 px-10 rounded-2xl bg-primary text-primary-foreground font-bold shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 mx-auto"
              >
                {isMigrating ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                Import Initial Data Now
              </button>
            </motion.div>
          )}

          {sections.map((section, idx) => (
            <div key={section.id} className="group border border-border rounded-3xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Section Header */}
              <div className="p-6 flex items-center justify-between border-b border-border bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      {activeLang === 'ar' ? section.translations?.ar?.title || section.title : section.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{section.id}</span>
                      <span className="text-[10px] bg-secondary/50 px-2 py-0.5 rounded-full font-bold text-muted-foreground uppercase">{section.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setEditingSection(section)}
                    className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => deleteSection(section.id)}
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between px-2 mb-2">
                   <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Articles & Guides</span>
                   <button 
                    onClick={() => setEditingItem({ sectionId: section.id, item: { id: '', title: '', description: '', order: section.items?.length || 0 } })}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                   >
                     <Plus className="h-3 w-3" />
                     Add Item
                   </button>
                </div>
                
                {(section.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-border transition-all group/item">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="truncate">
                        <div className="font-bold text-sm truncate">
                          {activeLang === 'ar' ? item.translations?.ar?.title || item.title : item.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 truncate">{item.id}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Section Editor Modal */}
      <AnimatePresence>
        {editingSection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setEditingSection(null)}
            />
            <motion.div
              layoutId="section-modal"
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl p-8 scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" />
                  {editingSection.id ? 'Edit Section' : 'Add New Section'}
                </h3>
                <button 
                  onClick={() => setEditingSection(null)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={saveSection} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setEditingItem(null)}
            />
            <motion.div
              layoutId="item-modal"
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-card border border-border shadow-2xl p-8 scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {editingItem.item.id ? 'Edit Item' : 'Add New Item'}
                </h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="h-5 w-5" />
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
                        rows={4}
                        value={editingItem.item.description}
                        onChange={e => setEditingItem({...editingItem, item: {...editingItem.item, description: e.target.value}})}
                        className="w-full p-4 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                        rows={4}
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
                  </>
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
