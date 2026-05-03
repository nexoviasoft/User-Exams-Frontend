'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  BookOpen, 
  PenTool, 
  TrendingUp, 
  Phone, 
  Monitor, 
  MapPin, 
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Star,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(11, 'Enter a valid phone number'),
  education: z.string().min(2, 'Education is required'),
  platformName: z.string().min(2, 'Platform name is required'),
  location: z.string().min(2, 'Location is required'),
  photo: z.any().optional(), // In a real app you'd validate File type
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.literal('teacher'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function JoinTeacherPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'teacher',
    }
  });

  const password = watch('password', '');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', data);
      
      if (response.data.isPending) {
        toast.success(response.data.message || 'Registration successful! Pending approval.');
        router.push('/login');
      } else {
        // Fallback if tokens are returned (shouldn't happen for teachers)
        dispatch(setAuth({
          user: { id: '3', email: data.email, name: data.name, role: data.role },
          accessToken: response.data.accessToken,
          role: data.role
        }));
        toast.success('Registration successful!');
        router.push(`/teacher/dashboard`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const steps = [
    {
      icon: BookOpen,
      title: 'Create Question Bank',
      desc: 'Add thousands of MCQs easily and categorize them with ease.',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      icon: Zap,
      title: 'Setup Exams',
      desc: 'Create live exams, set timers, and define your own pricing.',
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    {
      icon: TrendingUp,
      title: 'Earn & Analyze',
      desc: 'Students take your exams, and you earn directly to your dashboard.',
      color: 'text-success',
      bg: 'bg-success/10'
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Back Button */}
      <Link 
        href="/"
        className="fixed top-24 left-4 md:left-8 z-50 group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-white hover:bg-white/10 transition-all shadow-xl active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Back</span>
      </Link>
      
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,15,30,0.8)_100%)] pointer-events-none" />

      <main className="flex-1 flex flex-col md:flex-row pt-20">
        {/* Left side: Steps & Info */}
        <div className="w-full md:w-5/12 lg:w-[45%] p-8 md:p-12 lg:p-20 flex flex-col justify-center relative z-10 border-b md:border-b-0 md:border-r border-border/30 backdrop-blur-3xl bg-bg-dark/40">
          <div className="max-w-xl mx-auto md:mx-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/10">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <span className="font-display font-black text-2xl tracking-tighter text-white">
                  PolyExam<span className="text-primary">Buzz</span><span className="text-accent">.</span>
                </span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] text-[10px] mb-6 inline-block">
                For Educators
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6 leading-tight tracking-tight text-white">
                Empower Students, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary-light bg-[length:200%_auto] animate-gradient">Grow Your Brand.</span>
              </h1>
              <p className="text-text-secondary text-lg mb-12 font-medium leading-relaxed">
                Join Bangladesh's most advanced examination platform. Share your knowledge with thousands and build a sustainable teaching career.
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {steps.map((step, i) => (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  className="group flex gap-5 items-center p-4 rounded-[24px] bg-bg-surface/30 border border-border/20 backdrop-blur-xl transition-all hover:bg-bg-surface/50 hover:border-primary/30"
                >
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110", step.bg)}>
                    <step.icon className={cn("w-7 h-7", step.color)} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg mb-0.5 group-hover:text-primary transition-colors text-white">{step.title}</h3>
                    <p className="text-text-secondary text-sm font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-black text-text-primary">500+</span>
                <span className="text-[10px] uppercase tracking-widest text-text-secondary font-black">Active Teachers</span>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-text-primary">50k+</span>
                <span className="text-[10px] uppercase tracking-widest text-text-secondary font-black">Exams Taken</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right side: Form */}
        <div className="w-full md:w-7/12 lg:w-[55%] p-4 sm:p-8 md:p-12 lg:p-20 flex items-center justify-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl space-y-8 py-8 relative"
          >
            {/* Form Header */}
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight text-white">Create Your <span className="text-primary">Teacher Portal</span></h2>
              <p className="text-text-secondary font-medium text-lg">Step into the future of digital education in seconds.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Photo Upload */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[32px] bg-bg-surface/20 border border-border/20 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-8 group"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-[40px] border-4 border-border/50 flex items-center justify-center overflow-hidden bg-bg-surface relative group-hover:border-primary/50 transition-all shadow-2xl">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-10 h-10 text-text-secondary" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl border-4 border-bg-dark text-white">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="text-center sm:text-left">
                  <h4 className="font-black text-lg mb-1 text-white">Professional Photo</h4>
                  <p className="text-text-secondary text-sm mb-2 font-medium">This helps students identify and trust your platform.</p>
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                     <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black py-0.5 border-border/40 text-text-secondary">JPG / PNG</Badge>
                     <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black py-0.5 border-border/40 text-text-secondary">Max 2MB</Badge>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              >
                {/* Name Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Enter your name"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.name.message}</p>}
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="name@email.com"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.email.message}</p>}
                </motion.div>

                {/* Phone Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.phone.message}</p>}
                </motion.div>

                {/* Education Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Highest Education</label>
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('education')}
                      type="text"
                      placeholder="e.g., BSc in CSE"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.education && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.education.message}</p>}
                </motion.div>

                {/* Platform Name Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Brand/Academy Name</label>
                  <div className="relative group">
                    <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('platformName')}
                      type="text"
                      placeholder="Your Academy"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.platformName && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.platformName.message}</p>}
                </motion.div>

                {/* Location Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Current Location</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="Dhaka, Bangladesh"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.location && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.location.message}</p>}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Security Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  <div className="h-1.5 w-full bg-bg-surface/50 rounded-full mt-2 overflow-hidden border border-border/20">
                    <div 
                      className={cn(
                        "h-full transition-all duration-700",
                        strength <= 25 ? "bg-danger" : strength <= 50 ? "bg-warning" : strength <= 75 ? "bg-accent" : "bg-success"
                      )}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                  {errors.password && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.password.message}</p>}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Confirm Security</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl h-14 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-bold text-text-primary placeholder:text-text-secondary/30"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] font-black text-danger uppercase tracking-tight ml-1">{errors.confirmPassword.message}</p>}
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-4"
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary-light hover:to-accent text-white font-black h-16 rounded-[24px] text-lg shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98] group relative overflow-hidden border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-text-secondary font-medium"
              >
                Already part of the community? {' '}
                <Link href="/login" className="text-primary hover:text-accent font-black transition-colors underline decoration-primary/30 underline-offset-4">Sign In here</Link>
              </motion.p>
            </form>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

