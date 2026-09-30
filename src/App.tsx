import { motion } from "motion/react";
import { 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Cpu, 
  BarChart3, 
  Users, 
  Layout,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  Zap,
  Bot,
  Code2,
  Database,
  Terminal,
  Workflow,
  AppWindow,
  LineChart,
  FileJson,
  Settings,
  Shield,
  MessageSquare,
  Target,
  Layers,
  PieChart,
  Award,
  X,
  Search,
  ArrowRight,
  Lock,
  Edit3
} from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolio } from "./context/PortfolioContext";
import { Experience, NavItem, Certification, SkillCategory } from "./types/portfolio";
import { AdminLoginModal } from "./components/Admin/AdminLoginModal";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { downloadCV } from "./utils/downloadCV";

// --- Components ---

const Navigation = ({ 
  items, 
  activeSection, 
  onScrollTo, 
  onOpenAdmin 
}: { 
  items: NavItem[]; 
  activeSection: string; 
  onScrollTo: (id: string) => void;
  onOpenAdmin: () => void;
}) => {
  const { data, isAdminLoggedIn } = usePortfolio();

  return (
    <>
      <nav className="fixed left-0 top-0 w-full h-16 md:h-screen md:w-24 bg-white/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-black/5 flex flex-row md:flex-col items-center px-4 md:px-0 md:py-8 z-50">
        <div className="text-2xl font-bold md:mb-12 mr-6 md:mr-0 tracking-tighter text-blue-600">I.</div>
        <div className="flex flex-row md:flex-col gap-2 sm:gap-4 md:gap-8 flex-1 md:flex-none">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onScrollTo(item.id)}
              className={`group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl transition-all duration-300 cursor-pointer ${
                activeSection === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-zinc-400 hover:text-black hover:bg-black/5"
              }`}
            >
              <div className="scale-90 md:scale-100">{item.icon}</div>
              <span className="absolute md:left-full top-full md:top-auto mt-2 md:mt-0 md:ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-[60]">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden md:flex flex-col gap-3 mt-auto items-center">
          {/* Admin Access Button */}
          <button
            onClick={onOpenAdmin}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer group relative ${
              isAdminLoggedIn
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "text-zinc-400 bg-zinc-50 border border-black/5 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
            }`}
            title={isAdminLoggedIn ? "Admin Dashboard (Active)" : "Admin Portal"}
          >
            {isAdminLoggedIn ? <Edit3 size={18} /> : <Lock size={18} />}
            <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-[60]">
              {isAdminLoggedIn ? "Admin Dashboard" : "Admin Portal"}
            </span>
          </button>

          <a 
            href={data.contact.linkedIn} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-11 h-11 flex items-center justify-center rounded-full text-zinc-600 bg-zinc-50 border border-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 cursor-pointer"
            title="LinkedIn Profile"
          >
            <Linkedin size={20} />
          </a>
          <a 
            href={`mailto:${data.contact.email}`} 
            className="w-11 h-11 flex items-center justify-center rounded-full text-zinc-600 bg-zinc-50 border border-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 cursor-pointer"
            title="Send Email"
          >
            <Mail size={20} />
          </a>
        </div>
      </nav>

      {/* Floating Action Buttons for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 z-50 flex flex-col gap-3">
        <button
          onClick={onOpenAdmin}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-xl border border-white/10 transition-all ${
            isAdminLoggedIn ? "bg-indigo-600 text-white shadow-indigo-600/40" : "bg-zinc-900 text-white"
          }`}
          title="Admin Panel"
        >
          {isAdminLoggedIn ? <Edit3 size={20} /> : <Lock size={20} />}
        </button>
        <a 
          href={data.contact.linkedIn} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-blue-600 shadow-xl shadow-blue-600/40 border border-white/10"
        >
          <Linkedin size={22} />
        </a>
        <a 
          href={`mailto:${data.contact.email}`} 
          className="w-12 h-12 flex items-center justify-center rounded-full text-white bg-blue-600 shadow-xl shadow-blue-600/40 border border-white/10"
        >
          <Mail size={22} />
        </a>
      </div>
    </>
  );
};

const Hero = () => {
  const { data } = usePortfolio();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    await downloadCV(data.hero.cvFileName);
    setIsDownloading(false);
  };

  return (
    <section id="home" className="min-h-screen flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-2 text-blue-600 font-medium tracking-wide">
          <span className="w-8 h-[1px] bg-blue-600"></span>
          <span>{data.hero.badge}</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight text-zinc-900">
          {data.hero.headlineStart} <span className="text-zinc-400">{data.hero.headlineMuted}</span> <br />
          {data.hero.headlineMiddle} <span className="italic text-blue-600">{data.hero.headlineAccent}</span> {data.hero.headlineEnd}
        </h1>
        <p className="text-zinc-600 text-lg md:text-xl max-w-2xl leading-relaxed">
          {data.hero.subheading}
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-xl shadow-blue-600/20 cursor-pointer"
          >
            Experience <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          {/* Download CV button linked to uploaded file / server endpoint */}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-8 py-4 border border-black/10 text-zinc-900 rounded-full font-semibold hover:bg-black/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-60"
            title="Download latest version of CV"
          >
            <span>{isDownloading ? 'Downloading...' : 'Download CV'}</span>
            <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string, subtitle?: string }) => (
  <div className="mb-16">
    <div className="flex items-center gap-2 text-blue-600 font-medium tracking-wide mb-4">
      <span className="w-8 h-[1px] bg-blue-600"></span>
      <span>{subtitle?.toUpperCase() || "SECTION"}</span>
    </div>
    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-zinc-900">{title}</h2>
  </div>
);

const About = () => {
  const { data } = usePortfolio();

  return (
    <section id="about" className="py-32 px-8 md:px-20 max-w-7xl mx-auto">
      <SectionHeading title="About Me" subtitle="Profile" />
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-zinc-600 text-lg leading-relaxed"
        >
          {data.about.paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          <div className="flex flex-wrap gap-4 pt-6">
            <div className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-zinc-900">{data.about.yearsExperience}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{data.about.yearsLabel}</div>
            </div>
            <div className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl font-bold text-zinc-900">{data.about.projectsCompleted}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{data.about.projectsLabel}</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square"
        >
          <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-6 opacity-10"></div>
          <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden border border-black/5 shadow-2xl">
            <img 
              src={data.about.profileImage} 
              alt="Ivan Ivanov" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              onError={(e) => {
                e.currentTarget.src = "/src/assets/images/portfolio_avatar_1790596474999.jpg";
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ExperienceCard = ({ exp, index }: { exp: Experience, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    className="group p-8 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all duration-500 shadow-sm hover:shadow-xl shadow-black/5 relative overflow-hidden"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div>
        <h3 className="text-2xl font-bold text-zinc-900">{exp.role}</h3>
        <p className="text-blue-600 font-medium">{exp.company}</p>
      </div>
      <div className="flex items-center gap-2 text-zinc-400 text-sm">
        <Calendar size={16} />
        {exp.period}
      </div>
    </div>
    <ul className="space-y-3">
      {exp.description.map((item, i) => (
        <li key={i} className="flex gap-3 text-zinc-600 leading-relaxed">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

const ExperienceSection = () => {
  const { data } = usePortfolio();

  return (
    <section id="experience" className="py-32 px-8 md:px-20 max-w-7xl mx-auto">
      <SectionHeading title="Work History" subtitle="Experience" />
      <div className="space-y-8">
        {data.experiences.map((exp, idx) => (
          <ExperienceCard key={exp.id || idx} exp={exp} index={idx} />
        ))}
      </div>
    </section>
  );
};

const SkillIcon = ({ slug, fallback }: { slug?: string, fallback: React.ReactNode }) => {
  const [error, setError] = useState(false);
  
  if (!slug || error) return (
    <div className="text-zinc-400 group-hover/skill:text-white transition-colors">
      {fallback}
    </div>
  );

  return (
    <img 
      src={`https://cdn.simpleicons.org/${slug}`} 
      className="w-4 h-4 min-w-[16px] transition-all duration-300 brightness-0 opacity-40 group-hover/skill:opacity-100 group-hover/skill:invert object-contain" 
      alt="" 
      onError={() => setError(true)}
    />
  );
};

const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'automation':
      return <Cpu />;
    case 'technical':
    case 'code':
      return <Code2 />;
    case 'data':
      return <BarChart3 />;
    case 'leadership':
      return <Users />;
    default:
      return <Cpu />;
  }
};

const Skills = () => {
  const { data } = usePortfolio();

  return (
    <section id="skills" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto">
      <SectionHeading title="My Expertise" subtitle="Skills" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {data.skills.map((cat, idx) => (
          <motion.div 
            key={cat.id || cat.name || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-colors group shadow-sm hover:shadow-xl shadow-black/5"
          >
            <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {getCategoryIcon(cat.iconType)}
            </div>
            <h3 className="text-xl font-bold mb-4 text-zinc-900">{cat.name}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, sIdx) => (
                <span 
                  key={skill.name || sIdx} 
                  className="inline-flex items-center gap-2 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-50 rounded-full border border-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 cursor-default group/skill"
                >
                  <SkillIcon slug={skill.slug} fallback={<Zap size={14} />} />
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Certifications = () => {
  const { data } = usePortfolio();
  const [selectedCert, setSelectedCert] = useState<any>(null);

  return (
    <section id="certifications" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 w-full max-w-7xl mx-auto overflow-hidden">
      <SectionHeading title="Accomplishments" subtitle="Certifications" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {data.certifications.map((cert, idx) => (
          <motion.div
            key={cert.id || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            onClick={() => cert.fullImage && setSelectedCert(cert)}
            className={`flex flex-col p-5 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all group shadow-sm hover:shadow-xl relative ${cert.fullImage ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                {cert.logo && typeof cert.logo === 'string' ? (
                  <img src={cert.logo} alt={cert.provider} className="w-8 h-8 object-contain" />
                ) : (
                  <div className="text-blue-600"><Award size={24} /></div>
                )}
              </div>
              <div className="min-w-0 pr-2">
                <h4 className="font-bold text-zinc-900 text-sm leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {cert.title}
                </h4>
                <p className="text-xs text-zinc-500 font-medium">{cert.provider}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{cert.date} {cert.certId && `• ID: ${cert.certId}`}</p>
              </div>
            </div>
            
            {(cert.link || cert.fullImage) && (
              <div className="mt-auto pt-3 border-t border-black/5 flex justify-between items-center">
                {cert.fullImage && (
                  <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-1 group-hover:underline">
                    View Certificate
                  </span>
                )}
                {cert.link && (
                  <a 
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 transition-colors ml-auto flex items-center gap-1 hover:underline"
                  >
                    Verify Credential <ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal for Certificate Preview */}
      {selectedCert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCert(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-3xl overflow-hidden max-w-5xl w-full max-h-full flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-black/5 flex justify-between items-center bg-zinc-50">
              <div>
                <h3 className="font-bold text-zinc-900">{selectedCert.title}</h3>
                <p className="text-xs text-zinc-500">{selectedCert.provider} • {selectedCert.date}</p>
              </div>
              <button 
                onClick={() => setSelectedCert(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-auto p-4 flex items-center justify-center bg-zinc-100">
              <img 
                src={selectedCert.fullImage} 
                alt={selectedCert.title} 
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

const Contact = () => {
  const { data } = usePortfolio();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 w-full max-w-7xl mx-auto mb-20 overflow-hidden">
      <SectionHeading title="Get In Touch" subtitle="Contact" />
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
            {data.contact.ctaTitle}
          </h3>
          <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {data.contact.ctaSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-black/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all group"
          >
            <div className="w-14 h-14 bg-blue-600/5 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Mail size={28} className="text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-bold text-lg mb-2">Email Me</h4>
            <p className="text-zinc-500 text-sm mb-6 break-all">{data.contact.email}</p>
            <a 
              href={`mailto:${data.contact.email}?subject=Inquiry regarding Automation Services`}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all"
            >
              Send Email <ArrowRight size={18} />
            </a>
          </motion.div>

          {/* LinkedIn Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-black/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all group"
          >
            <div className="w-14 h-14 bg-[#0077b5]/5 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-[#0077b5] group-hover:text-white transition-colors">
              <Linkedin size={28} className="text-[#0077b5] group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-bold text-lg mb-2">Connect</h4>
            <p className="text-zinc-500 text-sm mb-6">Technical Network</p>
            <a 
              href={data.contact.linkedIn} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#0077b5] font-semibold hover:gap-3 transition-all"
            >
              LinkedIn Profile <ArrowRight size={18} />
            </a>
          </motion.div>

          {/* Copy Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-black/5 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all group cursor-pointer"
            onClick={copyToClipboard}
          >
            <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <Globe size={28} className="text-zinc-900 group-hover:text-white transition-colors" />
            </div>
            <h4 className="font-bold text-lg mb-2">Location</h4>
            <p className="text-zinc-500 text-sm mb-6">{data.contact.location}</p>
            <button className="inline-flex items-center gap-2 text-zinc-900 font-semibold transition-all">
              {copied ? "Address Copied!" : "Copy Email Address"} <Zap size={16} className={copied ? "text-green-500 fill-green-500" : ""} />
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {data.contact.availabilityText}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default function App() {
  const [activeSection, setActiveSection] = useState("home");
  const { isAdminLoggedIn } = usePortfolio();

  // Admin modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Globe size={20} /> },
    { id: "about", label: "Profile", icon: <Layout size={20} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={20} /> },
    { id: "skills", label: "Expertise", icon: <Cpu size={20} /> },
    { id: "certifications", label: "Certifications", icon: <Award size={20} /> },
    { id: "contact", label: "Contact", icon: <Mail size={20} /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const sections = navItems.map(item => {
        const element = document.getElementById(item.id);
        if (element) {
          return {
            id: item.id,
            offsetTop: element.offsetTop,
            height: element.offsetHeight
          };
        }
        return null;
      }).filter(Boolean);

      const currentSection = sections.find(section => {
        if (!section) return false;
        return scrollPosition >= section.offsetTop && scrollPosition < (section.offsetTop + section.height);
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
      } else if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row font-['Plus_Jakarta_Sans'] bg-[#F8F9FA] min-h-screen overflow-x-hidden">
      <Navigation 
        items={navItems} 
        activeSection={activeSection} 
        onScrollTo={scrollTo} 
        onOpenAdmin={handleOpenAdmin}
      />

      <main className="flex-1 pt-16 md:pt-0 md:ml-24 w-full overflow-x-hidden">
        <Hero />
        <About />
        <ExperienceSection />
        <Skills />
        <Certifications />
        <Contact />
        
        <footer className="py-10 px-8 md:px-20 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto text-zinc-400 text-sm">
          <p>© 2026 Ivan Ivanov. Automation & Technical Leadership.</p>
          <div className="flex items-center gap-8">
            <button
              onClick={handleOpenAdmin}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-blue-600 transition-colors font-medium cursor-pointer"
            >
              <Lock size={14} />
              <span>Admin Portal</span>
            </button>
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>

      {/* Admin Floating Badge if logged in */}
      {isAdminLoggedIn && !isAdminPanelOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-6 right-6 z-40 hidden md:block"
        >
          <button
            onClick={() => setIsAdminPanelOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-600/40 text-xs font-bold transition-all cursor-pointer hover:scale-105"
          >
            <Edit3 size={15} />
            <span>Edit Website</span>
          </button>
        </motion.div>
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Admin Dashboard Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}
