'use client';

import { FolderKanban, FileText, CheckSquare, BarChart3 } from 'lucide-react';

const steps = [
  {
    icon: FolderKanban,
    title: 'Create Projects',
    description: 'Set up new projects or claims with customizable fields and workflows. Track everything from start to finish.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: FileText,
    title: 'Organize Documents',
    description: 'Upload and organize all project documents. Categorize, tag, and find files instantly with powerful search.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: CheckSquare,
    title: 'Manage Tasks',
    description: 'Create tasks, set deadlines, assign team members, and track progress. Never miss a deadline again.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: BarChart3,
    title: 'Track & Report',
    description: 'Monitor project status, track metrics, and generate comprehensive reports. Make data-driven decisions.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

export default function WorkflowSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple workflow,
            <span className="text-blue-600"> powerful results</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Streamline your project management workflow in 4 simple steps. 
            Industry-agnostic design that works for any business.
          </p>
        </div>
        
        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-1 h-0.5 bg-gradient-to-r from-slate-300 to-slate-400 mx-8"></div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex p-4 rounded-2xl ${step.bgColor} mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl relative z-10`}>
                    <Icon className={`h-8 w-8 ${step.color}`} />
                  </div>
                  
                  <div className="mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold mb-4">
                      {index + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            All your projects in one place
          </div>
          <a
            href="/signup"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try It Free Today
          </a>
        </div>
      </div>
    </section>
  );
}





