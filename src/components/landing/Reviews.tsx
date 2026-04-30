'use client';

import { Star } from 'lucide-react';

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
    <section id="reviews" className="py-20 md:py-32 px-4 sm:px-6 bg-bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-4 tracking-tight">Student Testimonials</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Thousands of students are sharpening their preparation using our platform. Let's hear some of their experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-bg-dark border border-border p-8 rounded-2xl hover:border-primary/50 transition-colors relative flex flex-col">
              <div className="flex items-center gap-1 mb-6 text-accent">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-text-primary text-lg mb-8 italic flex-1">"{review.content}"</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{review.name}</h4>
                  <p className="text-sm text-text-secondary">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
