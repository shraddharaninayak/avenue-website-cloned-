"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { company, projects } from "@/data/avenue";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    project: projects[0].name,
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#2D3A1F] text-white pt-28">
      {/* Header */}
      <section className="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
        <div className="text-[11px] font-grotesk uppercase tracking-[0.3em] text-brand-gold font-semibold mb-4">
          Get in Touch
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-grotesk font-normal uppercase leading-[1.0] tracking-tight max-w-4xl">
          Connect With Our Advisory Team
        </h1>
        <p className="font-hanken text-white/70 max-w-2xl text-lg md:text-xl mt-8 leading-relaxed">
          Whether you are planning to purchase a signature luxury residence, lease corporate office space, or discuss partnerships, our advisors are here to assist you.
        </p>
      </section>

      {/* Main Grid: Info + Form */}
      <section className="py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-10">
            <div className="bg-[#2D3A1F] border border-white/10 p-8 md:p-10 space-y-8">
              <h3 className="font-grotesk text-2xl uppercase tracking-tight text-white pb-4 border-b border-white/10">
                Corporate Headquarters
              </h3>

              <div className="space-y-6 text-sm font-hanken text-white/70">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold font-grotesk text-xs uppercase tracking-wider mb-1">
                      Office Address
                    </div>
                    <p className="leading-relaxed">
                      {company.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold font-grotesk text-xs uppercase tracking-wider mb-1">
                      Direct Inquiries
                    </div>
                    <a
                      href={company.phoneHref}
                      className="text-brand-gold hover:text-white transition-colors"
                    >
                      {company.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold font-grotesk text-xs uppercase tracking-wider mb-1">
                      Email
                    </div>
                    <a
                      href={company.emailHref}
                      className="hover:text-white transition-colors"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-brand-gold shrink-0 mt-1" />
                  <div>
                    <div className="text-white font-semibold font-grotesk text-xs uppercase tracking-wider mb-1">
                      Operating Hours
                    </div>
                    <p>Monday – Saturday: 10:00 AM – 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#2D3A1F] border border-white/10 p-8 md:p-12">
              <h3 className="font-grotesk text-2xl uppercase tracking-tight text-white mb-2">
                Send an Inquiry
              </h3>
              <p className="font-hanken text-sm text-white/60 mb-8">
                Fill in your details below and a senior relationship manager will get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="p-8 bg-brand-gold/10 border border-brand-gold/40 text-center space-y-4 animate-in fade-in duration-300">
                  <CheckCircle className="w-12 h-12 text-brand-gold mx-auto" />
                  <h4 className="font-grotesk text-2xl uppercase text-white">
                    Inquiry Received
                  </h4>
                  <p className="font-hanken text-sm text-white/70 max-w-md mx-auto">
                    Thank you, {formData.name}. Our relationship manager will contact you at {formData.phone} shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-[#2D3A1F] text-white font-grotesk text-xs uppercase tracking-wider font-semibold"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-grotesk uppercase tracking-[0.2em] text-white/60 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full bg-[#2D3A1F] border border-white/15 px-4 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-grotesk uppercase tracking-[0.2em] text-white/60 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#2D3A1F] border border-white/15 px-4 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-grotesk uppercase tracking-[0.2em] text-white/60 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="w-full bg-[#2D3A1F] border border-white/15 px-4 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-grotesk uppercase tracking-[0.2em] text-white/60 mb-2">
                        Project of Interest
                      </label>
                      <select
                        value={formData.project}
                        onChange={(e) =>
                          setFormData({ ...formData, project: e.target.value })
                        }
                        className="w-full bg-[#2D3A1F] border border-white/15 px-4 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none transition-colors"
                      >
                        {projects.map((project) => (
                          <option key={project.slug} value={project.name}>
                            {project.name} ({project.configuration})
                          </option>
                        ))}
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-grotesk uppercase tracking-[0.2em] text-white/60 mb-2">
                      Message / Requirements
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about your requirements, preferred unit size, or schedule a tour..."
                      className="w-full bg-[#2D3A1F] border border-white/15 px-4 py-3.5 text-sm text-white focus:border-brand-gold focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#2D3A1F] text-white font-grotesk text-xs uppercase tracking-[0.2em] font-semibold hover:bg-brand-bronze transition-colors duration-300"
                  >
                    Submit Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
