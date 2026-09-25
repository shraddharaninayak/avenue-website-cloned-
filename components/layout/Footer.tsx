"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { company, socials, projects } from "@/data/avenue";
import { projectHref } from "@/data/projectDetails";

const socialIcons = {
  Facebook,
  Instagram,
  YouTube: Youtube,
} as const;

const footerProjects = projects.map((p) => ({ name: p.name, slug: p.slug, locality: p.locality }));

const GOLD = "#B59E7D";

export default function Footer() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <footer className="relative isolate overflow-hidden text-white">
      {/* ── Background image + overlay ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/footer/avenue-wall-room.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_100%]"
        />
        <div className="absolute inset-0 bg-[#584738]/[0.88]" />
        {/* subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#584738]/30 via-transparent to-[#584738]/50" />
      </div>

      {/* ── "Get In Touch" banner ── */}
      <div className="border-b border-white/[0.08] px-6 py-14 text-center md:px-10 md:py-16 lg:px-12">
        <span className="block text-[10px] uppercase tracking-[0.32em] text-white/50">
          The Avenue
        </span>
        <h2 className="mt-3 font-serif text-[clamp(34px,3vw,48px)] font-light leading-[1.02] tracking-[-0.04em]">
          Get In Touch
        </h2>
        <div className="mx-auto mt-5 h-px w-12 bg-[#B59E7D]/50" />
      </div>

      {/* ── Four-column content grid ── */}
      <div className="mx-auto max-w-[1450px] px-6 py-14 md:px-10 md:py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 xl:gap-12">

          {/* 1 — Brand */}
          <div className="flex flex-col gap-7">
            <Link href="/" aria-label={`${company.name} — home`} className="block w-fit">
              <Image
                src="/logo-avenue.png"
                alt={company.name}
                width={1942}
                height={810}
                className="w-[200px] h-auto sm:w-[230px] lg:w-[260px]"
              />
            </Link>

            <p className="max-w-[260px] text-[13.5px] leading-[1.78] text-white/55">
              {company.tagline}
            </p>

            <div className="flex items-center gap-2.5">
              {socials.map((social) => {
                const Icon = socialIcons[social.label];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`The Avenue on ${social.label}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.18] text-white/50 transition-all duration-300 hover:border-[#B59E7D] hover:text-[#B59E7D]"
                  >
                    <Icon className="h-[15px] w-[15px]" strokeWidth={1.6} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 2 — Our Projects */}
          <div>
            <h3 className="mb-6 text-[9.5px] uppercase tracking-[0.3em] text-white/35">
              Our Projects
            </h3>
            <ul className="flex flex-col gap-5">
              {footerProjects.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={projectHref(p.slug)}
                    className="group flex items-center gap-2 font-serif text-[17px] font-light tracking-[-0.02em] text-white/70 transition-colors duration-300 hover:text-[#B59E7D]"
                  >
                    <span className="block h-px w-0 origin-left bg-[#B59E7D] transition-all duration-300 group-hover:w-4" />
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 — Contact Details */}
          <div>
            <h3 className="mb-6 text-[9.5px] uppercase tracking-[0.3em] text-white/35">
              Contact Details
            </h3>
            <ul className="flex flex-col gap-5">
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-[3px] h-[15px] w-[15px] shrink-0"
                  strokeWidth={1.5}
                  style={{ color: GOLD }}
                />
                <span className="text-[13px] leading-[1.72] text-white/60">
                  {company.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  className="h-[15px] w-[15px] shrink-0"
                  strokeWidth={1.5}
                  style={{ color: GOLD }}
                />
                <a
                  href={company.phoneHref}
                  className="text-[13px] text-white/60 transition-colors duration-300 hover:text-white"
                >
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  className="h-[15px] w-[15px] shrink-0"
                  strokeWidth={1.5}
                  style={{ color: GOLD }}
                />
                <a
                  href={company.emailHref}
                  className="break-all text-[13px] text-white/60 transition-colors duration-300 hover:text-white"
                >
                  {company.email}
                </a>
              </li>
            </ul>
          </div>

          {/* 4 — Contact Form */}
          <div>
            <h3 className="mb-6 text-[9.5px] uppercase tracking-[0.3em] text-white/35">
              Send a Message
            </h3>

            {submitted ? (
              <div
                className="rounded border px-6 py-8 text-center"
                style={{ borderColor: `${GOLD}40`, backgroundColor: `${GOLD}12` }}
              >
                <p className="font-serif text-[18px] font-light" style={{ color: GOLD }}>
                  Thank you!
                </p>
                <p className="mt-2 text-[12px] text-white/50">
                  We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {(
                  [
                    { name: "name",  type: "text",  placeholder: "Name",       required: true },
                    { name: "email", type: "email", placeholder: "Email",      required: true },
                    { name: "phone", type: "tel",   placeholder: "Contact No", required: true },
                  ] as const
                ).map((field) => (
                  <input
                    key={field.name}
                    name={field.name}
                    type={field.type}
                    value={form[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="border-b border-white/[0.18] bg-transparent py-2 text-[13px] text-white placeholder-white/30 outline-none transition-colors duration-300 focus:border-[#B59E7D]"
                  />
                ))}

                <button
                  type="submit"
                  className="mt-1 self-start px-7 py-[11px] text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#584738] transition-opacity duration-300 hover:opacity-80"
                  style={{ backgroundColor: GOLD }}
                >
                  Request a Callback
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/[0.08] px-6 py-5 md:px-10 lg:px-12">
        <div className="mx-auto flex max-w-[1450px] flex-col items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/contact" className="transition-colors duration-300 hover:text-white/55">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-white/20">/</span>
            <Link href="/contact" className="transition-colors duration-300 hover:text-white/55">
              Terms &amp; Conditions
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
