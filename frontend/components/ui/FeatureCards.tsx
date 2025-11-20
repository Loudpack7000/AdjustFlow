'use client';

import { FolderKanban, FileText, CheckSquare, Users, MessageSquare, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Project & Claim Management',
    description: 'Organize and track all your projects and claims in one centralized system. Customize workflows, set priorities, and monitor progress with ease.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    priority: 1,
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Upload, organize, and manage all project documents with version control. Categorize files, add tags, and find what you need instantly.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    priority: 2,
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Create, assign, and track tasks with deadlines and priorities. Stay on top of what needs to be done and never miss a deadline.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    priority: 3,
  },
  {
    icon: Users,
    title: 'Customer CRM',
    description: 'Manage customer relationships, track interactions, and maintain complete client history. Build stronger relationships with organized contact management.',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    priority: 4,
  },
  {
    icon: MessageSquare,
    title: 'Communication & Notes',
    description: 'Record notes, track communications, and maintain a complete history of all interactions. Keep your team aligned with shared notes and updates.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    priority: 5,
  },
  {
    icon: BarChart3,
    title: 'Reporting & Analytics',
    description: 'Generate comprehensive reports, track key metrics, and gain insights into your business performance. Make data-driven decisions with powerful analytics.',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    priority: 6,
  },
];

export default function FeatureCards() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Everything you need to
            <span className="text-blue-600"> manage projects like a pro</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From project creation to client management, AdjustFlow streamlines your entire workflow 
            with powerful features designed to help you stay organized and productive.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative p-8 bg-white rounded-2xl border ${feature.borderColor} hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover effect gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}





