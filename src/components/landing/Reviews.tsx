'use client';

import { Star, Quote, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const reviews = [
  {
    id: 1,
    name: 'Rakibul Islam',
    role: 'Medical Admission Candidate',
    content: 'The real-time exam feature of PolyExamBuzz is amazing! It felt like I was actually taking the admission test.',
    rating: 5,
    avatar: 'RI'
  },
  {
    id: 2,
    name: 'Jannatul Ferdous',
    role: 'University Admission Candidate',
    content: 'The detailed report and instant analytics helped me a lot to find out my weaknesses.',
    rating: 5,
    avatar: 'JF'
  },
  {
    id: 3,
    name: 'Sajid Hasan',
    role: 'HSC Candidate',
    content: 'It is very easy to make payments via bKash to take exams. Checking the leaderboard ranking gives me the motivation to improve myself further.',
    rating: 5,
    avatar: 'SH'
  }
];

export const Reviews = () => {
  return (
    <section id="reviews" className="py-24 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-bg-dark z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-primary/5 to-bg-dark z-0" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <Sparkles className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-white/80 tracking-wide">Success Stories</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-extrabold mb-6 tracking-tight text-white"
          >
            Student Testimonials
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl mx-auto text-lg md:text-xl font-light"
          >
            Thousands of students are sharpening their preparation using our platform. Let's hear some of their experiences.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <motion.div 
              key={review.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2, type: "spring", stiffness: 100 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl hover:bg-white/[0.05] hover:border-primary/50 transition-all duration-500 relative flex flex-col group shadow-lg hover:shadow-[0_0_40px_rgba(0,82,204,0.15)] hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                <Quote className="w-20 h-20 text-white" />
              </div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-1 mb-8 text-warning relative z-10">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current filter drop-shadow-[0_0_5px_rgba(246,173,85,0.5)]" />
                ))}
              </div>
              <p className="text-text-primary text-lg mb-10 italic flex-1 relative z-10 font-light leading-relaxed group-hover:text-white transition-colors duration-300">"{review.content}"</p>
              
              <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-white/5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 text-primary-light flex items-center justify-center font-bold text-xl group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-primary-light transition-colors duration-300">{review.name}</h4>
                  <p className="text-sm text-text-secondary font-medium">{review.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
