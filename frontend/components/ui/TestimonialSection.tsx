'use client';

import { Star } from 'lucide-react';

const testimonials = [
  {
    content: "AdjustFlow has completely transformed how we manage projects and clients. Everything is organized in one place, and we're staying on top of deadlines better than ever.",
    author: "Sarah Chen",
    role: "Project Manager",
    company: "Premier Solutions",
    avatar: "SC",
    rating: 5,
  },
  {
    content: "The document management and task tracking features are incredible. We can track every interaction, document, and deadline. This tool has become essential to our workflow.",
    author: "Marcus Rodriguez",
    role: "Operations Director",
    company: "Apex Services",
    avatar: "MR",
    rating: 5,
  },
  {
    content: "ROI was immediate. We've saved countless hours on project organization and client management. The ability to have everything in one place is a game-changer for our team.",
    author: "Jennifer Walsh",
    role: "Business Owner",
    company: "Walsh & Associates",
    avatar: "JW",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted by
            <span className="text-blue-400"> industry leaders</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            See why professionals choose AdjustFlow for their project and client management needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/70 transition-all duration-300 group"
            >
              {/* Rating */}
              <div className="flex items-center mb-6">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Content */}
              <blockquote className="text-slate-300 text-lg leading-relaxed mb-8">
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {testimonial.author}
                  </div>
                  <div className="text-slate-400 text-sm">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust indicators */}
        <div className="mt-16 pt-16 border-t border-slate-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-400">Projects Managed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-slate-400">Industries Served</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-slate-400">Time Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-400">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}





