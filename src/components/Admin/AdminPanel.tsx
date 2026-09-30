import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  LogOut,
  Upload,
  FileText,
  User,
  Briefcase,
  Cpu,
  Award,
  Mail,
  Shield,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  Eye,
  RotateCcw,
  Link as LinkIcon,
  MapPin,
  GripVertical
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioData, Experience, SkillCategory, Certification } from '../../types/portfolio';
import { downloadCV } from '../../utils/downloadCV';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
    data: initialData,
    updatePortfolio,
    uploadFile,
    logoutAdmin,
    isSaving,
    resetToDefaults,
    changeAdminPassword
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<
    'about' | 'cv-photo' | 'experience' | 'skills' | 'certifications' | 'contact' | 'security'
  >('about');

  // Working local state before saving to server
  const [formData, setFormData] = useState<PortfolioData>(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync state if initialData changes externally
  React.useEffect(() => {
    setFormData(initialData);
    setHasUnsavedChanges(false);
  }, [initialData]);

  // CV & Image file upload state
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Expanded experience & cert item ids for accordion editing
  const [expandedExpId, setExpandedExpId] = useState<string | null>(null);
  const [expandedCertId, setExpandedCertId] = useState<string | null>(null);

  // Certifications drag-and-drop state
  const [draggedCertIndex, setDraggedCertIndex] = useState<number | null>(null);
  const [dragOverCertIndex, setDragOverCertIndex] = useState<number | null>(null);

  const handleCertReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= formData.certifications.length || toIndex >= formData.certifications.length) {
      return;
    }
    const next = [...formData.certifications];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    handleDataChange((prev) => ({ ...prev, certifications: next }));
    showNotify('success', `Certificate moved to #${toIndex + 1}!`);
  };

  if (!isOpen) return null;

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDataChange = (updater: (prev: PortfolioData) => PortfolioData) => {
    setFormData((prev) => {
      const next = updater(prev);
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const handleSaveAll = async () => {
    const res = await updatePortfolio(formData);
    if (res.success) {
      setHasUnsavedChanges(false);
      showNotify('success', 'All changes saved to server and applied live!');
    } else {
      showNotify('error', res.message || 'Error saving changes.');
    }
  };

  // CV Upload Handler
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      showNotify('error', 'Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    setIsUploadingCV(true);
    const res = await uploadFile(file, 'cv');
    setIsUploadingCV(false);

    if (res.success && res.fileUrl) {
      handleDataChange((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          cvUrl: '/api/cv',
          cvFileName: file.name,
          cvUpdatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      }));
      showNotify('success', `File "${file.name}" uploaded successfully and linked to Download CV button!`);
    } else {
      showNotify('error', res.message || 'Error uploading CV file.');
    }
  };

  // Photo Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotify('error', 'Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploadingPhoto(true);
    const res = await uploadFile(file, 'image');
    setIsUploadingPhoto(false);

    if (res.success && res.fileUrl) {
      handleDataChange((prev) => ({
        ...prev,
        about: {
          ...prev.about,
          profileImage: res.fileUrl || prev.about.profileImage
        }
      }));
      showNotify('success', 'New profile photo uploaded and applied!');
    } else {
      showNotify('error', res.message || 'Error uploading profile photo.');
    }
  };

  // Change password handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsChangingPwd(true);
    const res = await changeAdminPassword(oldPassword, newPassword);
    setIsChangingPwd(false);

    if (res.success) {
      setPasswordMsg({ type: 'success', message: res.message });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
            A
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 leading-tight">Admin Dashboard</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-zinc-500">Live Editing Mode</span>
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-[10px]">
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Notification Pill */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  notification.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {notification.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save Button */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 active:scale-95'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {/* View Public Site button */}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center gap-2 transition-colors cursor-pointer"
            title="View Public Website"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">View Site</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logoutAdmin();
              onClose();
            }}
            className="p-2.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout from Admin Panel"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Tabs + Right Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F4F5F7]">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-black/5 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 p-3 gap-1.5 shadow-sm">
          {[
            { id: 'about', label: 'Profile & About', icon: <User size={18} /> },
            { id: 'cv-photo', label: 'Photo & CV File', icon: <FileText size={18} /> },
            { id: 'experience', label: 'Work History', icon: <Briefcase size={18} />, badge: formData.experiences.length },
            { id: 'skills', label: 'Skills & Expertise', icon: <Cpu size={18} />, badge: formData.skills.length },
            { id: 'certifications', label: 'Certifications', icon: <Award size={18} />, badge: formData.certifications.length },
            { id: 'contact', label: 'Contact & Social', icon: <Mail size={18} /> },
            { id: 'security', label: 'Security & Password', icon: <Shield size={18} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap md:whitespace-normal text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="hidden md:block mt-auto pt-6 border-t border-zinc-100 p-2 text-xs text-zinc-400">
            <p className="font-semibold text-zinc-600 mb-1">Ivan Ivanov</p>
            <p>Portfolio Management v2.0</p>
          </div>
        </aside>

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* TAB 1: About Me & Statistics */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">About Me & Hero Section</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Manage the headline, bio text, and key achievement metrics displayed on the home page.
                    </p>
                  </div>

                  {/* Hero Badge & Subheading */}
                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                        Hero Badge / Title
                      </label>
                      <input
                        type="text"
                        value={formData.hero.badge}
                        onChange={(e) =>
                          handleDataChange((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, badge: e.target.value }
                          }))
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider mb-2">
                        Hero Subheading
                      </label>
                      <textarea
                        rows={2}
                        value={formData.hero.subheading}
                        onChange={(e) =>
                          handleDataChange((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, subheading: e.target.value }
                          }))
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <hr className="border-zinc-100" />

                  {/* Paragraphs in About Me */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wider">
                        Bio Paragraphs (About Me)
                      </label>
                      <button
                        onClick={() =>
                          handleDataChange((prev) => ({
                            ...prev,
                            about: {
                              ...prev.about,
                              paragraphs: [...prev.about.paragraphs, 'New bio paragraph...']
                            }
                          }))
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Add Paragraph
                      </button>
                    </div>

                    {formData.about.paragraphs.map((p, idx) => (
                      <div key={idx} className="relative group">
                        <textarea
                          rows={3}
                          value={p}
                          onChange={(e) => {
                            const newP = [...formData.about.paragraphs];
                            newP[idx] = e.target.value;
                            handleDataChange((prev) => ({
                              ...prev,
                              about: { ...prev.about, paragraphs: newP }
                            }));
                          }}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-sm font-medium text-zinc-800 focus:bg-white focus:border-blue-600 outline-none"
                        />
                        {formData.about.paragraphs.length > 1 && (
                          <button
                            onClick={() => {
                              const newP = formData.about.paragraphs.filter((_, i) => i !== idx);
                              handleDataChange((prev) => ({
                                ...prev,
                                about: { ...prev.about, paragraphs: newP }
                              }));
                            }}
                            className="absolute top-3 right-3 p-1.5 bg-white text-zinc-400 hover:text-red-600 rounded-lg shadow-sm border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete paragraph"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <hr className="border-zinc-100" />

                  {/* Key Metrics: Years Experience & Projects Completed */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 mb-3">Key Achievement Metrics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Metric 1: Years Experience</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="10+"
                            value={formData.about.yearsExperience}
                            onChange={(e) =>
                              handleDataChange((prev) => ({
                                ...prev,
                                about: { ...prev.about, yearsExperience: e.target.value }
                              }))
                            }
                            className="w-24 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-base font-bold text-zinc-900 focus:border-blue-600 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Years Experience"
                            value={formData.about.yearsLabel}
                            onChange={(e) =>
                              handleDataChange((prev) => ({
                                ...prev,
                                about: { ...prev.about, yearsLabel: e.target.value }
                              }))
                            }
                            className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 focus:border-blue-600 outline-none"
                          />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Metric 2: Projects Completed</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="50+"
                            value={formData.about.projectsCompleted}
                            onChange={(e) =>
                              handleDataChange((prev) => ({
                                ...prev,
                                about: { ...prev.about, projectsCompleted: e.target.value }
                              }))
                            }
                            className="w-24 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-base font-bold text-zinc-900 focus:border-blue-600 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Projects Completed"
                            value={formData.about.projectsLabel}
                            onChange={(e) =>
                              handleDataChange((prev) => ({
                                ...prev,
                                about: { ...prev.about, projectsLabel: e.target.value }
                              }))
                            }
                            className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 focus:border-blue-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Photo & CV File Upload */}
            {activeTab === 'cv-photo' && (
              <div className="space-y-6">
                {/* CV Upload Box */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <FileText className="text-blue-600" />
                        Upload New CV (Download CV Button)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        The uploaded document will be directly downloaded when visitors click "Download CV" on the website.
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-zinc-200 hover:border-blue-600/50 rounded-3xl p-6 sm:p-8 bg-zinc-50 text-center transition-colors">
                    <input
                      type="file"
                      ref={cvFileInputRef}
                      onChange={handleCVUpload}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />

                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Upload size={28} />
                    </div>

                    <h4 className="text-base font-bold text-zinc-900 mb-1">
                      {isUploadingCV ? 'Uploading document...' : 'Select a new CV document from your computer'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                      Supported formats: PDF, DOC, DOCX. The document is securely hosted on your server.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => cvFileInputRef.current?.click()}
                        disabled={isUploadingCV}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                      >
                        {isUploadingCV ? 'Processing...' : 'Browse & Upload File'}
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadCV(formData.hero.cvFileName)}
                        className="px-5 py-3 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download size={16} /> Test Download
                      </button>
                    </div>
                  </div>

                  {/* Current CV status info */}
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-zinc-700">
                    <div>
                      <span className="font-semibold text-blue-900">Current file: </span>
                      <code className="bg-white px-2 py-0.5 rounded font-mono text-zinc-800 border border-blue-200">
                        {formData.hero.cvFileName || 'Ivan_Ivanov_CV.pdf'}
                      </code>
                    </div>
                    {formData.hero.cvUpdatedAt && (
                      <span className="text-zinc-500">Last updated: {formData.hero.cvUpdatedAt}</span>
                    )}
                  </div>
                </div>

                {/* Profile Photo Box */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <User className="text-blue-600" />
                      Profile Photo Management
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Upload your portrait photograph or select a new avatar image for the About Me section.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6 items-center">
                    {/* Live Preview */}
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-blue-600/30 shadow-xl relative bg-zinc-100">
                        <img
                          src={formData.about.profileImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/src/assets/images/portfolio_avatar_1790596474999.jpg';
                          }}
                        />
                      </div>
                      <span className="text-[11px] text-zinc-400 mt-2 font-medium">Live Website Preview</span>
                    </div>

                    {/* Actions & URL */}
                    <div className="sm:col-span-2 space-y-4">
                      <input
                        type="file"
                        ref={photoFileInputRef}
                        onChange={handlePhotoUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        onClick={() => photoFileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Upload size={18} />
                        <span>{isUploadingPhoto ? 'Uploading image...' : 'Upload New Photo from Device'}</span>
                      </button>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Or enter custom image URL:</label>
                        <input
                          type="text"
                          value={formData.about.profileImage}
                          onChange={(e) =>
                            handleDataChange((prev) => ({
                              ...prev,
                              about: { ...prev.about, profileImage: e.target.value }
                            }))
                          }
                          placeholder="https://example.com/photo.jpg"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-800 focus:bg-white focus:border-blue-600 outline-none"
                        />
                      </div>

                      {/* Quick presets */}
                      <div className="pt-1">
                        <span className="text-xs font-semibold text-zinc-500 block mb-2">Quick Gallery Presets:</span>
                        <div className="flex gap-2">
                          {[
                            '/src/assets/images/profile.jpg',
                            '/src/assets/images/portfolio_avatar_1790596474999.jpg'
                          ].map((path, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handleDataChange((prev) => ({
                                  ...prev,
                                  about: { ...prev.about, profileImage: path }
                                }))
                              }
                              className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                formData.about.profileImage === path ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-zinc-200 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={path} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Work History (Experience) */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <Briefcase className="text-blue-600" />
                        Work History & Experience
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Add new career positions, update companies, date ranges, and detailed bullet points.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newExp: Experience = {
                          id: Date.now().toString(),
                          role: 'Automation Architect & Consultant',
                          company: 'New Company',
                          period: '2026 - Present',
                          description: [
                            'Lead enterprise automation architecture and technology roadmap.',
                            'Design and deploy intelligent automation pipelines.'
                          ]
                        };
                        handleDataChange((prev) => ({
                          ...prev,
                          experiences: [newExp, ...prev.experiences]
                        }));
                        setExpandedExpId(newExp.id);
                        showNotify('success', 'New position added to the top of the list!');
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus size={16} /> Add New Position
                    </button>
                  </div>

                  {/* List of positions */}
                  <div className="space-y-4">
                    {formData.experiences.map((exp, expIdx) => {
                      const isExpanded = expandedExpId === exp.id;
                      return (
                        <div
                          key={exp.id}
                          className="border border-zinc-200 rounded-2xl bg-zinc-50/50 hover:bg-white transition-all overflow-hidden"
                        >
                          {/* Item summary bar */}
                          <div
                            onClick={() => setExpandedExpId(isExpanded ? null : exp.id)}
                            className="p-4 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                              <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                {expIdx + 1}
                              </span>
                              <div className="truncate">
                                <h4 className="font-bold text-zinc-900 text-sm truncate">{exp.role}</h4>
                                <p className="text-xs text-zinc-500 font-medium">
                                  {exp.company} • <span className="text-blue-600">{exp.period}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Move up / down */}
                              {expIdx > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const next = [...formData.experiences];
                                    [next[expIdx - 1], next[expIdx]] = [next[expIdx], next[expIdx - 1]];
                                    handleDataChange((prev) => ({ ...prev, experiences: next }));
                                  }}
                                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg"
                                  title="Move Up"
                                >
                                  <ChevronUp size={16} />
                                </button>
                              )}
                              {expIdx < formData.experiences.length - 1 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const next = [...formData.experiences];
                                    [next[expIdx + 1], next[expIdx]] = [next[expIdx], next[expIdx + 1]];
                                    handleDataChange((prev) => ({ ...prev, experiences: next }));
                                  }}
                                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg"
                                  title="Move Down"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Are you sure you want to delete "${exp.role} at ${exp.company}"?`)) {
                                    handleDataChange((prev) => ({
                                      ...prev,
                                      experiences: prev.experiences.filter((_, i) => i !== expIdx)
                                    }));
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete position"
                              >
                                <Trash2 size={16} />
                              </button>
                              <div className="p-1 text-zinc-400">
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Editor */}
                          {isExpanded && (
                            <div className="p-5 border-t border-zinc-200 bg-white space-y-4">
                              <div className="grid sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Role / Title
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.role}
                                    onChange={(e) => {
                                      const next = [...formData.experiences];
                                      next[expIdx].role = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, experiences: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Company
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => {
                                      const next = [...formData.experiences];
                                      next[expIdx].company = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, experiences: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Period
                                  </label>
                                  <input
                                    type="text"
                                    value={exp.period}
                                    onChange={(e) => {
                                      const next = [...formData.experiences];
                                      next[expIdx].period = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, experiences: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>

                              {/* Bullets */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-zinc-500 uppercase">
                                    Responsibilities & Achievements (Bullets)
                                  </label>
                                  <button
                                    onClick={() => {
                                      const next = [...formData.experiences];
                                      next[expIdx].description.push('New responsibility or project accomplishment...');
                                      handleDataChange((prev) => ({ ...prev, experiences: next }));
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                                  >
                                    <Plus size={12} /> Add Bullet
                                  </button>
                                </div>

                                {exp.description.map((bullet, bIdx) => (
                                  <div key={bIdx} className="flex gap-2 items-start">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                    <textarea
                                      rows={2}
                                      value={bullet}
                                      onChange={(e) => {
                                        const next = [...formData.experiences];
                                        next[expIdx].description[bIdx] = e.target.value;
                                        handleDataChange((prev) => ({ ...prev, experiences: next }));
                                      }}
                                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:bg-white focus:border-blue-600 outline-none"
                                    />
                                    {exp.description.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const next = [...formData.experiences];
                                          next[expIdx].description = next[expIdx].description.filter((_, i) => i !== bIdx);
                                          handleDataChange((prev) => ({ ...prev, experiences: next }));
                                        }}
                                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <Cpu className="text-blue-600" />
                        Skills & Expertise Management
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Organize skills by categories (Automation, Technical, Data & BI, Leadership, etc.).
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newCat: SkillCategory = {
                          id: 'cat_' + Date.now(),
                          name: 'New Category',
                          iconType: 'technical',
                          skills: [{ name: 'New Skill' }]
                        };
                        handleDataChange((prev) => ({
                          ...prev,
                          skills: [...prev.skills, newCat]
                        }));
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={16} /> Add Category
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formData.skills.map((cat, catIdx) => (
                      <div key={cat.id || catIdx} className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const next = [...formData.skills];
                              next[catIdx].name = e.target.value;
                              handleDataChange((prev) => ({ ...prev, skills: next }));
                            }}
                            className="text-base font-bold text-zinc-900 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 focus:border-blue-600 outline-none max-w-xs"
                          />
                          <button
                            onClick={() => {
                              if (confirm(`Delete the entire category "${cat.name}"?`)) {
                                handleDataChange((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter((_, i) => i !== catIdx)
                                }));
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold"
                          >
                            <Trash2 size={14} /> Delete Category
                          </button>
                        </div>

                        {/* Skills tag manager */}
                        <div className="flex flex-wrap gap-2">
                          {cat.skills.map((skill, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-full px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm"
                            >
                              <input
                                type="text"
                                value={skill.name}
                                onChange={(e) => {
                                  const next = [...formData.skills];
                                  next[catIdx].skills[sIdx].name = e.target.value;
                                  handleDataChange((prev) => ({ ...prev, skills: next }));
                                }}
                                className="w-24 sm:w-28 bg-transparent outline-none text-zinc-900"
                              />
                              <button
                                onClick={() => {
                                  const next = [...formData.skills];
                                  next[catIdx].skills = next[catIdx].skills.filter((_, i) => i !== sIdx);
                                  handleDataChange((prev) => ({ ...prev, skills: next }));
                                }}
                                className="text-zinc-400 hover:text-red-500 ml-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}

                          {/* Quick add skill input button */}
                          <button
                            onClick={() => {
                              const skillName = prompt('Enter new skill name:');
                              if (skillName && skillName.trim()) {
                                const next = [...formData.skills];
                                next[catIdx].skills.push({ name: skillName.trim() });
                                handleDataChange((prev) => ({ ...prev, skills: next }));
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                          >
                            <Plus size={12} /> Add Skill
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Certifications */}
            {activeTab === 'certifications' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                        <Award className="text-blue-600" />
                        Certifications & Credentials
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Add and edit professional certifications, issuing organizations, and credential verification links.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const newCert: Certification = {
                          id: 'cert_' + Date.now(),
                          title: 'New Certification',
                          provider: 'Provider (e.g. UiPath / LinkedIn)',
                          date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        };
                        handleDataChange((prev) => ({
                          ...prev,
                          certifications: [newCert, ...prev.certifications]
                        }));
                        setExpandedCertId(newCert.id);
                        showNotify('success', 'New certificate added!');
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus size={16} /> Add New Certificate
                    </button>
                  </div>

                  {/* Cert list header with drag helper */}
                  <div className="flex items-center justify-between text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl">
                    <span className="flex items-center gap-1.5 font-medium">
                      <GripVertical size={14} className="text-zinc-400" />
                      <span>Drag cards using the handle to reorder, or use the <strong>↑ / ↓</strong> buttons</span>
                    </span>
                    <span className="font-semibold text-zinc-700">{formData.certifications.length} certificates</span>
                  </div>

                  {/* Cert list */}
                  <div className="space-y-3">
                    {formData.certifications.map((cert, cIdx) => {
                      const isExpanded = expandedCertId === (cert.id || cIdx.toString());
                      const isBeingDragged = draggedCertIndex === cIdx;
                      const isDropTarget = dragOverCertIndex === cIdx;

                      return (
                        <div
                          key={cert.id || cIdx}
                          draggable
                          onDragStart={(e) => {
                            setDraggedCertIndex(cIdx);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', cIdx.toString());
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (dragOverCertIndex !== cIdx) {
                              setDragOverCertIndex(cIdx);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverCertIndex === cIdx) {
                              setDragOverCertIndex(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedCertIndex !== null && draggedCertIndex !== cIdx) {
                              handleCertReorder(draggedCertIndex, cIdx);
                            }
                            setDraggedCertIndex(null);
                            setDragOverCertIndex(null);
                          }}
                          onDragEnd={() => {
                            setDraggedCertIndex(null);
                            setDragOverCertIndex(null);
                          }}
                          className={`border rounded-2xl transition-all overflow-hidden ${
                            isBeingDragged
                              ? 'opacity-40 scale-[0.98] border-dashed border-blue-500 bg-blue-50/50 shadow-inner'
                              : isDropTarget
                              ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/30 shadow-lg -translate-y-0.5'
                              : 'border-zinc-200 bg-zinc-50/50 hover:bg-white'
                          }`}
                        >
                          <div
                            onClick={() => setExpandedCertId(isExpanded ? null : (cert.id || cIdx.toString()))}
                            className="p-4 flex items-center justify-between cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-4">
                              {/* Drag handle */}
                              <div
                                className="cursor-grab active:cursor-grabbing p-1 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center shrink-0"
                                title="Click & drag to reorder"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GripVertical size={16} />
                              </div>

                              {/* Order Badge */}
                              <span className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-600 font-bold text-[11px] flex items-center justify-center shrink-0 border border-zinc-200">
                                {cIdx + 1}
                              </span>

                              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                                <Award size={16} />
                              </span>
                              <div className="truncate">
                                <h4 className="font-bold text-zinc-900 text-sm truncate">{cert.title}</h4>
                                <p className="text-xs text-zinc-500">
                                  {cert.provider} • <span className="text-blue-600">{cert.date}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {/* Move up button */}
                              {cIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleCertReorder(cIdx, cIdx - 1)}
                                  className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Move Up"
                                >
                                  <ChevronUp size={16} />
                                </button>
                              )}

                              {/* Move down button */}
                              {cIdx < formData.certifications.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleCertReorder(cIdx, cIdx + 1)}
                                  className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Move Down"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete the certification "${cert.title}"?`)) {
                                    handleDataChange((prev) => ({
                                      ...prev,
                                      certifications: prev.certifications.filter((_, i) => i !== cIdx)
                                    }));
                                  }
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Certification"
                              >
                                <Trash2 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedCertId(isExpanded ? null : (cert.id || cIdx.toString()))}
                                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Cert editor */}
                          {isExpanded && (
                            <div className="p-5 border-t border-zinc-200 bg-white space-y-3">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Certificate Title
                                  </label>
                                  <input
                                    type="text"
                                    value={cert.title}
                                    onChange={(e) => {
                                      const next = [...formData.certifications];
                                      next[cIdx].title = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, certifications: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-semibold focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Issuer / Organization (Provider)
                                  </label>
                                  <input
                                    type="text"
                                    value={cert.provider}
                                    onChange={(e) => {
                                      const next = [...formData.certifications];
                                      next[cIdx].provider = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, certifications: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Date Issued
                                  </label>
                                  <input
                                    type="text"
                                    value={cert.date}
                                    onChange={(e) => {
                                      const next = [...formData.certifications];
                                      next[cIdx].date = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, certifications: next }));
                                    }}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                    Credential ID (Optional)
                                  </label>
                                  <input
                                    type="text"
                                    value={cert.certId || ''}
                                    onChange={(e) => {
                                      const next = [...formData.certifications];
                                      next[cIdx].certId = e.target.value;
                                      handleDataChange((prev) => ({ ...prev, certifications: next }));
                                    }}
                                    placeholder="e.g. 415 889"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm font-medium focus:bg-white focus:border-blue-600 outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                  Verification Link (Credential URL)
                                </label>
                                <input
                                  type="text"
                                  value={cert.link || ''}
                                  onChange={(e) => {
                                    const next = [...formData.certifications];
                                    next[cIdx].link = e.target.value;
                                    handleDataChange((prev) => ({ ...prev, certifications: next }));
                                  }}
                                  placeholder="https://www.linkedin.com/learning/certificates/..."
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-800 focus:bg-white focus:border-blue-600 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-zinc-500 uppercase block mb-1">
                                  Certificate Full Image Path or URL
                                </label>
                                <input
                                  type="text"
                                  value={cert.fullImage || ''}
                                  onChange={(e) => {
                                    const next = [...formData.certifications];
                                    next[cIdx].fullImage = e.target.value;
                                    handleDataChange((prev) => ({ ...prev, certifications: next }));
                                  }}
                                  placeholder="/src/assets/certificates/... or https://..."
                                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-zinc-800 focus:bg-white focus:border-blue-600 outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Contact & Social Links */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <Mail className="text-blue-600" />
                      Contact Information & Social Links
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Update your direct email address, LinkedIn profile URL, location, and consultation messages.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.contact.email}
                          onChange={(e) =>
                            handleDataChange((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, email: e.target.value }
                            }))
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 pl-11 text-sm font-semibold text-zinc-900 focus:bg-white focus:border-blue-600 outline-none"
                        />
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1.5">
                        This email address is triggered when visitors click "Send Email" and "Copy Email Address".
                      </p>
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-2">
                        LinkedIn Profile (URL)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.contact.linkedIn}
                          onChange={(e) =>
                            handleDataChange((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, linkedIn: e.target.value }
                            }))
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 pl-11 text-sm font-semibold text-zinc-900 focus:bg-white focus:border-blue-600 outline-none"
                        />
                        <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-2">
                        Location (City / Country)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.contact.location}
                          onChange={(e) =>
                            handleDataChange((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, location: e.target.value }
                            }))
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 pl-11 text-sm font-semibold text-zinc-900 focus:bg-white focus:border-blue-600 outline-none"
                        />
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                      </div>
                    </div>

                    {/* CTA Text */}
                    <div className="pt-2">
                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-2">
                        Contact Section Heading (Call-To-Action)
                      </label>
                      <input
                        type="text"
                        value={formData.contact.ctaTitle}
                        onChange={(e) =>
                          handleDataChange((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, ctaTitle: e.target.value }
                          }))
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:bg-white focus:border-blue-600 outline-none mb-3"
                      />

                      <label className="text-xs font-bold text-zinc-600 uppercase tracking-wider block mb-2">
                        Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={formData.contact.ctaSubtitle}
                        onChange={(e) =>
                          handleDataChange((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, ctaSubtitle: e.target.value }
                          }))
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-medium text-zinc-900 focus:bg-white focus:border-blue-600 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: Security & Password */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/5 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                      <Shield className="text-blue-600" />
                      Security & Password Management
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Change your administrator password to maintain secure access to the dashboard.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 uppercase block mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>

                    {passwordMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          passwordMsg.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {passwordMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        <span>{passwordMsg.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isChangingPwd}
                      className="px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl text-sm font-semibold shadow-md transition-all cursor-pointer"
                    >
                      {isChangingPwd ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>

                  <hr className="border-zinc-100 pt-2" />

                  {/* Reset to Factory Defaults */}
                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-red-700 mb-1">Reset to Original Defaults</h4>
                    <p className="text-xs text-zinc-500 mb-3">
                      Restores the initial portfolio contents and layout if you wish to start from scratch.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('WARNING: This will reset all portfolio data to factory defaults. Do you wish to proceed?')) {
                          await resetToDefaults();
                          showNotify('success', 'Portfolio data has been reset to defaults!');
                        }
                      }}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} /> Restore Default Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Save Reminder Bar when there are unsaved changes */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50 bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              <span>You have unsaved changes!</span>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
