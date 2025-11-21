'use client';

import { Building2, Home, Wrench, Shield, HardHat, Users, Briefcase, ArrowRight, Hammer, FileText, Car, Stethoscope } from 'lucide-react';
import Link from 'next/link';

const industries = [
  {
    id: 'roofing',
    name: 'Roofing Contractors',
    icon: Home,
    description: 'Manage roofing projects, track estimates, coordinate with adjusters, and maintain customer relationships.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'adjusters',
    name: 'Insurance Adjusters',
    icon: Shield,
    description: 'Streamline claim processing, document management, and communication with contractors and policyholders.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'construction',
    name: 'Construction Companies',
    icon: HardHat,
    description: 'Coordinate projects, manage subcontractors, track progress, and maintain client relationships.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'restoration',
    name: 'Restoration Companies',
    icon: Wrench,
    description: 'Handle emergency response projects, manage insurance claims, and coordinate with multiple stakeholders.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'property',
    name: 'Property Management',
    icon: Building2,
    description: 'Manage properties, track maintenance, coordinate vendors, and maintain tenant relationships.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'contractors',
    name: 'General Contractors',
    icon: Briefcase,
    description: 'Oversee multiple projects, manage teams, track budgets, and maintain client satisfaction.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  {
    id: 'plumbing',
    name: 'Plumbing Contractors',
    icon: Wrench,
    description: 'Track service calls, manage estimates, schedule appointments, and maintain customer history.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    id: 'electrical',
    name: 'Electrical Contractors',
    icon: Hammer,
    description: 'Manage electrical projects, track permits, coordinate inspections, and maintain client records.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'legal',
    name: 'Legal Firms',
    icon: FileText,
    description: 'Manage cases, track deadlines, organize documents, and maintain client communication history.',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
  },
  {
    id: 'automotive',
    name: 'Auto Repair Shops',
    icon: Car,
    description: 'Track vehicle repairs, manage estimates, schedule appointments, and maintain customer service history.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'healthcare',
    name: 'Healthcare Practices',
    icon: Stethoscope,
    description: 'Manage patient relationships, track appointments, organize medical records, and coordinate care.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    id: 'real-estate',
    name: 'Real Estate Agents',
    icon: Building2,
    description: 'Manage listings, track leads, schedule showings, and maintain client communication throughout the sales process.',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
];

export default function WhoWeServe() {
  return (
    <section id="who-we-serve" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Who We <span className="text-blue-600">Serve</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            AdjustFlow is designed for professionals who need powerful project management and CRM tools 
            tailored to their industry's unique needs.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const Icon = industry.icon;
            
            return (
              <div
                key={industry.id}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${industry.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${industry.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {industry.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                      {industry.description}
                    </p>
                    <Link
                      href="#features"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group-hover:gap-2 gap-1 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        const featuresSection = document.getElementById('features');
                        if (featuresSection) {
                          featuresSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            Don't see your industry? <span className="text-blue-600 font-medium">We can customize AdjustFlow for your needs.</span>
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Us
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
