import { motion, useScroll, useSpring, AnimatePresence } from "motion/react";
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
  Menu,
  Search,
  ArrowRight,
  Lock,
  Edit3,
  Building2,
  GraduationCap
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { usePortfolio } from "./context/PortfolioContext";
import { Experience, NavItem, Certification, SkillCategory } from "./types/portfolio";
import { AdminLoginModal } from "./components/Admin/AdminLoginModal";
import { AdminPanel } from "./components/Admin/AdminPanel";
import { downloadCV } from "./utils/downloadCV";
import { getAssetUrl } from "./utils/assetUrl";
import { AnimatedCounter } from "./components/AnimatedCounter";

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
  const [isPastHero, setIsPastHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById("home");
      const heroThreshold = heroEl ? heroEl.offsetHeight * 0.45 : 220;
      setIsPastHero(window.scrollY > heroThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      onScrollTo(id);
    }, 60);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isPastHero 
            ? "bg-white/90 backdrop-blur-md border-b border-black/5 shadow-sm py-3" 
            : "bg-white/60 backdrop-blur-sm border-b border-black/[0.04] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 flex items-center justify-between">
          {/* Brand Left: Blue badge that expands from 'I.' to 'Ivan Ivanov' on scroll */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => handleNavClick("home")}
              layout
              className={`h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/25 hover:bg-blue-700 transition-colors cursor-pointer focus:outline-none overflow-hidden ${
                isPastHero ? "px-3.5 tracking-tight text-sm md:text-base" : "w-9 text-lg font-black tracking-tighter"
              }`}
              title={isPastHero ? "Home (Scroll to top)" : "Ivan Ivanov"}
              transition={{ layout: { duration: 0.25, ease: "easeOut" } }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {!isPastHero ? (
                  <motion.span
                    key="badge-short"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="leading-none select-none"
                  >
                    I.
                  </motion.span>
                ) : (
                  <motion.span
                    key="badge-full"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap leading-none select-none flex items-center gap-1.5"
                  >
                    <span className="hidden sm:inline">Ivan Ivanov</span>
                    <span className="sm:hidden">I. Ivanov</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Minimal Navigation Menu (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/80 p-1.5 rounded-full border border-black/5 shadow-inner">
            {items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-black/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Right) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Portal Button */}
            <button
              onClick={onOpenAdmin}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer group relative ${
                isAdminLoggedIn
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-zinc-500 bg-zinc-50 border border-black/5 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
              }`}
              title={isAdminLoggedIn ? "Admin Dashboard (Active)" : "Admin Portal"}
            >
              {isAdminLoggedIn ? <Edit3 size={16} /> : <Lock size={16} />}
              <span className="absolute right-0 top-full mt-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-[60]">
                {isAdminLoggedIn ? "Admin Dashboard" : "Admin Portal"}
              </span>
            </button>

            {/* LinkedIn */}
            <a 
              href={data.contact.linkedIn} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 hidden sm:flex items-center justify-center rounded-full text-zinc-600 bg-zinc-50 border border-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 cursor-pointer"
              title="LinkedIn Profile"
            >
              <Linkedin size={16} />
            </a>

            {/* Contact / Email CTA */}
            <button
              onClick={() => handleNavClick("contact")}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-zinc-900 hover:bg-blue-600 transition-all shadow-sm cursor-pointer"
            >
              <Mail size={14} />
              <span>Contact</span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl px-6 py-4 shadow-xl overflow-hidden mt-3"
            >
              <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer select-none ${
                      activeSection === item.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200"
                    }`}
                  >
                    <span className="scale-90">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}

                <div className="pt-3 mt-2 border-t border-black/5 flex items-center justify-between">
                  <a 
                    href={data.contact.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-blue-600 py-1"
                  >
                    <Linkedin size={15} />
                    <span>LinkedIn Profile</span>
                  </a>
                  <a 
                    href={`mailto:${data.contact.email}`} 
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 py-1"
                  >
                    <Mail size={15} />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
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
    <section id="home" className="min-h-screen flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto pt-20 relative scroll-mt-20 md:scroll-mt-24">
      {/* Dynamic ambient background orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            x: [0, 15, 0],
            scale: [1, 1.06, 1] 
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            x: [0, -15, 0],
            scale: [1, 1.08, 1] 
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 -left-20 w-[26rem] h-[26rem] bg-indigo-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-blue-50/80 border border-blue-200/60 rounded-full text-blue-700 text-xs font-semibold tracking-wide shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
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
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 group shadow-xl shadow-blue-600/20 cursor-pointer"
          >
            Experience <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          {/* Download CV button linked to uploaded file / server endpoint */}
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-8 py-4 border border-black/10 bg-white/60 backdrop-blur-sm text-zinc-900 rounded-full font-semibold hover:bg-black/5 transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-60"
            title="Download latest version of CV"
          >
            <span>{isDownloading ? 'Downloading...' : 'Download CV'}</span>
            <Download size={18} className={isDownloading ? 'animate-bounce' : ''} />
          </motion.button>
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
    <section id="about" className="py-32 px-8 md:px-20 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="About Me" subtitle="Profile" />
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-zinc-600 text-lg leading-relaxed"
        >
          <div className="border-b border-black/5 pb-4">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              Ivan Ivanov
            </h3>
            <p className="text-blue-600 font-semibold text-sm md:text-base mt-1">
              Automation Architect & Technical Lead
            </p>
          </div>

          {data.about.paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}

          <div className="flex flex-wrap gap-4 pt-6">
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-3xl font-bold text-zinc-900 tracking-tight">
                <AnimatedCounter value={data.about.yearsExperience} />
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mt-1">{data.about.yearsLabel}</div>
            </motion.div>
            <motion.div 
              whileHover={{ y: -4, scale: 1.02 }}
              className="px-6 py-4 bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-lg transition-all"
            >
              <div className="text-3xl font-bold text-zinc-900 tracking-tight">
                <AnimatedCounter value={data.about.projectsCompleted} />
              </div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mt-1">{data.about.projectsLabel}</div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square max-w-md mx-auto w-full group"
        >
          {/* Animated decorative backdrop */}
          <motion.div 
            animate={{ rotate: [6, 12, 6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl opacity-15 blur-sm"
          />
          <div className="absolute inset-0 bg-white rounded-3xl overflow-hidden border border-black/5 shadow-2xl relative">
            <img 
              src={getAssetUrl(data.about.profileImage)} 
              alt="Ivan Ivanov" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              onError={(e) => {
                e.currentTarget.src = getAssetUrl("/src/assets/images/portfolio_avatar_1790596474999.jpg");
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

interface CompanyExperienceGroup {
  company: string;
  overallPeriod: string;
  logo?: string;
  roles: Experience[];
}

const getOverallPeriod = (roles: Experience[]): string => {
  if (roles.length === 1) return roles[0].period;
  const latestPeriod = roles[0].period;
  const oldestPeriod = roles[roles.length - 1].period;
  const latestEnd = latestPeriod.includes("-") ? latestPeriod.split("-")[1].trim() : latestPeriod;
  const oldestStart = oldestPeriod.includes("-") ? oldestPeriod.split("-")[0].trim() : oldestPeriod;
  return `${oldestStart} - ${latestEnd}`;
};

const CompanyExperienceCard = ({ 
  group, 
  groupIndex 
}: { 
  group: CompanyExperienceGroup; 
  groupIndex: number; 
}) => {
  const hasMultipleRoles = group.roles.length > 1;
  const isPresent = group.roles.some(r => r.period.toLowerCase().includes('present'));

  return (
    <div className="relative group">
      {/* Outer timeline node for the company */}
      <div className="absolute -left-[33px] md:-left-[49px] top-8 w-4 h-4 rounded-full bg-white border-2 border-blue-600 shadow-md group-hover:scale-125 group-hover:bg-blue-600 transition-all duration-300 z-10 flex items-center justify-center">
        {isPresent && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute" />
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: groupIndex * 0.08 }}
        className="p-6 md:p-8 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all duration-300 shadow-sm hover:shadow-xl shadow-black/5 relative overflow-hidden"
      >
        {/* Company Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-black/5 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-black/10 p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
              {group.logo ? (
                <img 
                  src={getAssetUrl(group.logo)} 
                  alt={group.company} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Building2 size={24} className="text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  {group.company}
                </h3>
                {isPresent && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                )}
                {hasMultipleRoles && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200">
                    {group.roles.length} positions
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-0.5">
                Career progression & responsibilities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 font-semibold text-xs sm:text-sm bg-zinc-50 px-3.5 py-1.5 rounded-full border border-black/5 self-start md:self-auto shrink-0">
            <Calendar size={15} className="text-blue-600" />
            <span>{group.overallPeriod}</span>
          </div>
        </div>

        {/* Roles Sub-timeline within this company */}
        <div className={`space-y-8 ${hasMultipleRoles ? 'relative border-l-2 border-blue-100/80 ml-2.5 sm:ml-3 pl-6 sm:pl-8' : ''}`}>
          {group.roles.map((role, rIdx) => {
            const isRoleActive = role.period.toLowerCase().includes('present');

            return (
              <div key={role.id || rIdx} className="relative group/role">
                {/* Internal sub-timeline node */}
                {hasMultipleRoles && (
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center group-hover/role:scale-125 transition-transform">
                    {isRoleActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-xl md:text-2xl font-bold text-zinc-900 group-hover/role:text-blue-600 transition-colors">
                        {role.role}
                      </h4>
                      {isRoleActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Current Role
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-black/5 self-start sm:self-auto">
                      {role.period}
                    </span>
                  </div>

                  <ul className="space-y-2.5 pt-1">
                    {role.description.map((item, i) => (
                      <li key={i} className="flex gap-3 text-zinc-600 leading-relaxed text-sm md:text-base">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 group-hover/role:scale-125 transition-transform" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const ExperienceSection = () => {
  const { data } = usePortfolio();

  const groupedExperiences = useMemo(() => {
    const groups: CompanyExperienceGroup[] = [];

    data.experiences.forEach((exp) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.company.trim().toLowerCase() === exp.company.trim().toLowerCase()) {
        lastGroup.roles.push(exp);
        if (!lastGroup.logo && exp.logo) lastGroup.logo = exp.logo;
      } else {
        groups.push({
          company: exp.company,
          overallPeriod: exp.period,
          logo: exp.logo,
          roles: [exp]
        });
      }
    });

    return groups.map(g => ({
      ...g,
      overallPeriod: getOverallPeriod(g.roles)
    }));
  }, [data.experiences]);

  return (
    <section id="experience" className="py-32 px-8 md:px-20 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="Work History" subtitle="Experience" />
      <div className="relative border-l-2 border-blue-100 ml-4 md:ml-8 pl-6 md:pl-10 space-y-12">
        {groupedExperiences.map((group, idx) => (
          <CompanyExperienceCard key={`${group.company}-${idx}`} group={group} groupIndex={idx} />
        ))}
      </div>
    </section>
  );
};

const EducationSection = () => {
  const { data } = usePortfolio();
  if (!data.education || data.education.length === 0) return null;

  return (
    <section id="education" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="Academic Background" subtitle="Education" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {data.education.map((edu, idx) => (
          <motion.div
            key={edu.id || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all duration-300 shadow-sm hover:shadow-xl shadow-black/5 flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white border border-black/10 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  {edu.logo ? (
                    <img 
                      src={getAssetUrl(edu.logo)} 
                      alt={edu.institution} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <GraduationCap size={28} className="text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">
                    {edu.institution}
                  </h3>
                  <p className="text-blue-600 font-semibold text-sm sm:text-base">
                    {edu.degree}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 font-medium mt-2.5">
                    <span className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1 rounded-full border border-black/5">
                      <Calendar size={13} className="text-blue-600" />
                      {edu.period}
                    </span>
                    {edu.location && (
                      <span className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1 rounded-full border border-black/5">
                        <MapPin size={13} className="text-blue-600" />
                        {edu.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {edu.description && edu.description.length > 0 && (
                <ul className="space-y-2 pt-4 border-t border-black/5 text-zinc-600 text-sm leading-relaxed">
                  {edu.description.map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
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
    <section id="skills" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="My Expertise" subtitle="Skills" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {data.skills.map((cat, idx) => (
          <motion.div 
            key={cat.id || cat.name || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="p-8 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all group shadow-sm hover:shadow-xl shadow-black/5"
          >
            <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              {getCategoryIcon(cat.iconType)}
            </div>
            <h3 className="text-xl font-bold mb-4 text-zinc-900">{cat.name}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, sIdx) => (
                <motion.span 
                  key={skill.name || sIdx} 
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 text-xs text-zinc-500 px-3 py-1.5 bg-zinc-50 rounded-full border border-black/5 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 cursor-default group/skill"
                >
                  <SkillIcon slug={skill.slug} fallback={<Zap size={14} />} />
                  {skill.name}
                </motion.span>
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
    <section id="certifications" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 w-full max-w-7xl mx-auto overflow-hidden scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="Accomplishments" subtitle="Certifications" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {data.certifications.map((cert, idx) => (
          <motion.div
            key={cert.id || idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.015 }}
            transition={{ duration: 0.4, delay: idx * 0.04 }}
            onClick={() => cert.fullImage && setSelectedCert(cert)}
            className={`flex flex-col p-5 bg-white rounded-3xl border border-black/5 hover:border-blue-600/30 transition-all group shadow-sm hover:shadow-xl relative ${cert.fullImage ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 overflow-hidden">
                {cert.logo && typeof cert.logo === 'string' ? (
                  <img src={getAssetUrl(cert.logo)} alt={cert.provider} className="w-8 h-8 object-contain" />
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
                src={getAssetUrl(selectedCert.fullImage)} 
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
    <section id="contact" className="py-20 md:py-32 px-6 sm:px-12 md:px-20 w-full max-w-7xl mx-auto mb-20 overflow-hidden scroll-mt-20 md:scroll-mt-24">
      <SectionHeading title="Get In Touch" subtitle="Contact" />
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
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

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

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
    { id: "about", label: "About", icon: <Layout size={18} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
    { id: "education", label: "Education", icon: <GraduationCap size={18} /> },
    { id: "skills", label: "Skills", icon: <Cpu size={18} /> },
    { id: "certifications", label: "Certifications", icon: <Award size={18} /> },
    { id: "contact", label: "Contact", icon: <Mail size={18} /> },
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
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      let top = 0;
      let curr: HTMLElement | null = element;
      while (curr) {
        top += curr.offsetTop;
        curr = curr.offsetParent as HTMLElement | null;
      }
      const headerOffset = window.innerWidth < 768 ? 65 : 75;
      const targetTop = Math.max(0, top - headerOffset);

      window.scrollTo({
        top: targetTop,
        behavior: "smooth"
      });

      try {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        // fallback
      }

      setActiveSection(id);
    }
  };

  return (
    <div className="flex flex-col font-['Plus_Jakarta_Sans'] bg-[#F8F9FA] min-h-screen overflow-x-hidden relative">
      {/* Dynamic top reading scroll progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 z-[100] origin-left pointer-events-none" 
        style={{ scaleX }} 
      />

      <Navigation 
        items={navItems} 
        activeSection={activeSection} 
        onScrollTo={scrollTo} 
        onOpenAdmin={handleOpenAdmin}
      />

      <main className="flex-1 w-full overflow-x-hidden">
        <Hero />
        <About />
        <ExperienceSection />
        <EducationSection />
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
