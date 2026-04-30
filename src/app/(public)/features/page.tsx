import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Clock, BarChart3, ShieldCheck, Trophy, FileText, Lock } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    id: 'real-time-environment',
    title: 'Real-time Exam Environment',
    description: 'Experience the pressure and interface of real exams. Our real-time exam engine features live timers, auto-submission, and a distraction-free interface to help you prepare effectively for the actual test day.',
    icon: Clock,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop',
    align: 'left'
  },
  {
    id: 'performance-analytics',
    title: 'Advanced Performance Analytics',
    description: 'Stop guessing and start measuring. Get immediate insights into your exam performance. Visualize your progress over time, track your accuracy, and understand your speed-to-accuracy ratio with beautiful, interactive charts.',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    align: 'right'
  },
  {
    id: 'leaderboard-ranking',
    title: 'Competitive Leaderboards',
    description: 'See exactly where you stand among thousands of other candidates. Our dynamic leaderboards update in real-time after every exam, helping you gauge your relative position and motivating you to improve your rank.',
    icon: Trophy,
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000&auto=format&fit=crop',
    align: 'left'
  },
  {
    id: 'detailed-reports',
    title: 'In-Depth Solution Reports',
    description: 'Every mistake is a learning opportunity. Access comprehensive post-exam reports featuring detailed explanations for every question, highlighting your weak areas so you can focus your study efforts where they matter most.',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop',
    align: 'right'
  },
  {
    id: 'anti-cheat-security',
    title: 'Fair & Secure Exams',
    description: 'Our platform maintains the integrity of every assessment with robust anti-cheat measures, including browser lockdown, tab-switch monitoring, and secure session management to ensure a level playing field for everyone.',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1000&auto=format&fit=crop',
    align: 'left'
  },
  {
    id: 'secure-payments',
    title: 'Seamless Digital Payments',
    description: 'Enrolling in exams has never been easier. We support seamless, instant payments via local mobile financial services like bKash and Nagad, so you can unlock premium exams with just a few taps.',
    icon: Lock,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop',
    align: 'right'
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Navbar />

      <main className="flex-1 pt-44 pb-20">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-20 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-6 tracking-tight">Platform Features</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Discover the powerful tools and capabilities designed to accelerate your exam preparation and maximize your success.
          </p>
        </div>

        {/* Features List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLeft = feature.align === 'left';

            return (
              <div key={feature.id} className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}>

                {/* Content Side */}
                <div className="flex-1 space-y-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3 pt-4">
                    <li className="flex items-center text-text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                      Optimized for maximum efficiency
                    </li>
                    <li className="flex items-center text-text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                      Works seamlessly on any device
                    </li>
                    <li className="flex items-center text-text-primary">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3" />
                      Constant updates and improvements
                    </li>
                  </ul>
                </div>

                {/* Image/Video Side */}
                <div className="flex-1 w-full">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-border/50 group">
                    {/* Placeholder for video overlay if it were a video */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    {/* Badge */}
                    <div className="absolute bottom-6 left-6 z-20 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg font-medium text-sm text-text-primary flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                      Live Demo Ready
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
