'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import axiosInstance from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { email, password } = data;
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { user, accessToken } = response.data;
      
      dispatch(setAuth({
        user,
        accessToken,
        role: user.role
      }));
      
      toast.success('সফলভাবে লগইন হয়েছে!');
      router.push(`/${user.role}/dashboard`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Welcome back to the portal! 👋">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 w-full max-w-lg mx-auto"
      >
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
              Secure Gateway
            </Badge>
          </div>
          <h2 className="text-4xl font-display font-black text-text-primary tracking-tight leading-tight">
            Account <span className="text-primary">Login</span> 🔐
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            Enter your credentials to access your professional workspace.
          </p>
        </div>

        {/* Premium Form Card */}
        <div className="bg-bg-card/40 backdrop-blur-2xl border-2 border-border/50 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="example@mail.com"
                    className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-4 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Credentials</label>
                  <Link href="#" className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest opacity-60">Forgot?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-bg-surface/50 border border-border/40 rounded-2xl py-4 pl-12 pr-12 text-text-primary font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all placeholder:text-text-secondary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] font-bold text-danger ml-1 uppercase tracking-wider">{errors.password.message}</p>}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-3 ml-1">
                <div className="relative flex items-center h-5">
                   <input
                     {...register('rememberMe')}
                     type="checkbox"
                     id="rememberMe"
                     className="w-5 h-5 rounded-lg border-border/40 bg-bg-surface/50 text-primary focus:ring-primary/40 cursor-pointer transition-all checked:bg-primary"
                   />
                </div>
                <label htmlFor="rememberMe" className="text-[10px] font-black uppercase tracking-widest text-text-secondary cursor-pointer select-none opacity-60 hover:opacity-100 transition-opacity">Keep me logged in</label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-light text-white font-black h-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] group"
              disabled={isLoading}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Authenticating...
                  </motion.div>
                ) : (
                  <motion.div 
                    key="text"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-center"
                  >
                    Authorize Access <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <div className="pt-6 border-t border-border/10">
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                     <ShieldCheck className="w-5 h-5 text-success" />
                     <span className="text-[8px] font-black uppercase tracking-[0.1em]">Encrypted</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                     <Zap className="w-5 h-5 text-accent" />
                     <span className="text-[8px] font-black uppercase tracking-[0.1em]">Turbo Sync</span>
                  </div>
               </div>
            </div>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm font-medium">
          New to the platform? {' '}
          <Link href="/register" className="text-primary hover:text-primary-light font-black uppercase tracking-widest text-xs ml-1 transition-colors">
            Register Now <Sparkles className="w-3.5 h-3.5 inline-block ml-1" />
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}
