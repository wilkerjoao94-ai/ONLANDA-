import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  PlusCircle, 
  Home as HomeIcon, 
  User, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Share2, 
  ArrowLeft,
  Camera,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Ad, Category, AdFormData } from './types';

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
    <button 
      onClick={() => setActiveTab('home')}
      className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-brand-600' : 'text-slate-400'}`}
    >
      <HomeIcon size={24} />
      <span className="text-[10px] font-medium">Início</span>
    </button>
    <button 
      onClick={() => setActiveTab('sell')}
      className={`flex flex-col items-center gap-1 ${activeTab === 'sell' ? 'text-brand-600' : 'text-slate-400'}`}
    >
      <PlusCircle size={24} />
      <span className="text-[10px] font-medium">Vender</span>
    </button>
    <button 
      onClick={() => setActiveTab('my-ads')}
      className={`flex flex-col items-center gap-1 ${activeTab === 'my-ads' ? 'text-brand-600' : 'text-slate-400'}`}
    >
      <User size={24} />
      <span className="text-[10px] font-medium">Meus Anúncios</span>
    </button>
  </nav>
);

const ProductCard: React.FC<{ ad: Ad, onClick: () => void }> = ({ ad, onClick }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:scale-[0.98] transition-transform"
  >
    <div className="aspect-square relative">
      <img 
        src={ad.imageUrl || 'https://picsum.photos/seed/placeholder/400/400'} 
        alt={ad.title}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 left-2">
        <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          {ad.category}
        </span>
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-slate-800 truncate text-sm">{ad.title}</h3>
      <p className="text-brand-600 font-bold mt-1">{ad.price.toLocaleString('pt-AO')} Kz</p>
      <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-2">
        <MapPin size={10} />
        <span className="truncate">{ad.location}</span>
      </div>
    </div>
  </motion.div>
);

// --- Pages ---

const HomePage = ({ onAdClick }: { onAdClick: (ad: Ad) => void }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'Todos'>('Todos');
  const [loading, setLoading] = useState(true);

  const categories: (Category | 'Todos')[] = ['Todos', 'Carros', 'Eletrônicos', 'Casas', 'Outros'];

  useEffect(() => {
    fetchAds();
  }, [category, search]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (category !== 'Todos') query.append('category', category);
      if (search) query.append('search', search);
      
      const res = await fetch(`/api/ads?${query.toString()}`);
      const data = await res.json();
      setAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 purple-gradient">
      <div className="px-6 pt-12 pb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black text-center text-slate-900 tracking-tighter mb-8"
        >
          ONLANDA
        </motion.h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white h-14 pl-12 pr-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat 
                ? 'bg-brand-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/50 animate-pulse rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {ads.map((ad) => (
              <ProductCard key={ad.id} ad={ad} onClick={() => onAdClick(ad)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p>Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SellPage = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    price: '',
    category: 'Outros',
    description: '',
    location: '',
    phone: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 9) {
      alert('O telefone deve ter exatamente 9 dígitos.');
      return;
    }
    if (!imagePreview) {
      alert('Por favor, adicione uma foto do produto.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          imageUrl: imagePreview,
          userId: 'user-1' // Mock user
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">Vender Produto</h1>
        <p className="text-slate-500 text-sm">Preencha os detalhes do seu anúncio</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Foto do Produto</label>
          <div 
            onClick={() => document.getElementById('image-input')?.click()}
            className="aspect-video bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
          >
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="text-slate-400 mb-2" size={32} />
                <span className="text-xs text-slate-400">Clique para adicionar foto</span>
              </>
            )}
            <input 
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4">
          <input 
            type="text"
            placeholder="Título do anúncio"
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full bg-white h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="number"
              placeholder="Preço (Kz)"
              required
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              className="w-full bg-white h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as Category})}
              className="w-full bg-white h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Carros">Carros</option>
              <option value="Eletrônicos">Eletrônicos</option>
              <option value="Casas">Casas</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <textarea 
            placeholder="Descrição detalhada"
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full bg-white p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <input 
            type="text"
            placeholder="Localização (ex: Luanda, Talatona)"
            required
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            className="w-full bg-white h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="tel"
              placeholder="Telefone (9 dígitos)"
              required
              maxLength={9}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
              className="w-full bg-white h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white h-14 rounded-2xl font-bold shadow-lg shadow-brand-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {submitting ? 'Publicando...' : 'Publicar Anúncio'}
        </button>
      </form>
    </div>
  );
};

const MyAdsPage = ({ onAdClick, onLogout }: { onAdClick: (ad: Ad) => void, onLogout: () => void }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAds();
  }, []);

  const fetchMyAds = async () => {
    try {
      const res = await fetch('/api/ads'); // In a real app, filter by user
      const data = await res.json();
      setAds(data.filter((a: Ad) => a.userId === 'user-1'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      fetchMyAds();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-100 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meus Anúncios</h1>
          <p className="text-slate-500 text-sm">Gerencie seus produtos publicados</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-rose-500 font-semibold text-sm p-2 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : ads.length > 0 ? (
          ads.map(ad => (
            <div 
              key={ad.id} 
              onClick={() => onAdClick(ad)}
              className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center"
            >
              <img src={ad.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{ad.title}</h3>
                <p className="text-brand-600 font-bold text-sm">{ad.price.toLocaleString('pt-AO')} Kz</p>
                <p className="text-[10px] text-slate-400 mt-1">Publicado em {new Date(ad.createdAt).toLocaleDateString('pt-AO')}</p>
              </div>
              <button 
                onClick={(e) => handleDelete(ad.id, e)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-slate-500">
            <p>Você ainda não tem anúncios.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetails = ({ ad, onBack }: { ad: Ad, onBack: () => void }) => {
  const shareAd = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: `Confira este anúncio no ONLANDA: ${ad.title} por ${ad.price.toLocaleString('pt-AO')} Kz`,
        url: window.location.href
      });
    }
  };

  const whatsappUrl = `https://wa.me/244${ad.phone}?text=${encodeURIComponent(`Olá, estou interessado no seu anúncio "${ad.title}" que vi no ONLANDA.`)}`;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 bg-white z-[60] overflow-y-auto pb-32"
    >
      <div className="relative h-96">
        <img src={ad.imageUrl} className="w-full h-full object-cover" />
        <button 
          onClick={onBack}
          className="absolute top-12 left-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={shareAd}
          className="absolute top-12 right-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-lg"
        >
          <Share2 size={20} />
        </button>
      </div>

      <div className="p-6 -mt-6 bg-white rounded-t-[32px] relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              {ad.category}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{ad.title}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-600">{ad.price.toLocaleString('pt-AO')} Kz</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 border-y border-slate-100 mb-6">
          <div className="flex items-center gap-1 text-slate-500 text-sm">
            <MapPin size={16} className="text-brand-500" />
            <span>{ad.location}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="text-slate-500 text-sm">
            {new Date(ad.createdAt).toLocaleDateString('pt-AO')}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-slate-800">Descrição</h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {ad.description}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-4 z-[70]">
        <a 
          href={`tel:+244${ad.phone}`}
          className="flex-1 bg-slate-100 text-slate-800 h-14 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Phone size={20} />
          Ligar
        </a>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-[1.5] bg-emerald-500 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
        >
          <MessageCircle size={20} />
          WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomePage onAdClick={setSelectedAd} />
          </motion.div>
        )}
        {activeTab === 'sell' && (
          <motion.div
            key="sell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SellPage onSuccess={() => setActiveTab('home')} />
          </motion.div>
        )}
        {activeTab === 'my-ads' && (
          <motion.div
            key="my-ads"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MyAdsPage 
              onAdClick={setSelectedAd} 
              onLogout={() => {
                if(confirm('Deseja terminar a sessão?')) {
                  setActiveTab('home');
                }
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAd && (
          <ProductDetails 
            ad={selectedAd} 
            onBack={() => setSelectedAd(null)} 
          />
        )}
      </AnimatePresence>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
