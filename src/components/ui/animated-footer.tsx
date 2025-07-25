"use client";
import React from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Github, Twitter, Linkedin, Mail, Heart, Code, Zap } from "lucide-react";

export function AnimatedFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-slate-900 text-white">
      {/* Background Boxes Animation */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />

      {/* Footer Content - Allow pointer events to pass through to boxes */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="evalu8 Logo" className="h-8 w-auto" />
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Empowering developers with AI-powered assessments and personalized learning paths. 
              Master your coding skills with confidence.
            </p>
            <div className="flex items-center space-x-2 text-sm text-neutral-400">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Made with passion for developers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/practice" className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">Practice Hub</a></li>
              <li><a href="/mastery" className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">Mastery Assessments</a></li>
              <li><a href="/profile" className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">Profile</a></li>
              <li><a href="/activity" className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">Activity</a></li>
              <li><a href="/settings" className="text-neutral-300 hover:text-white transition-colors pointer-events-auto">Settings</a></li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Code className="h-3 w-3 text-green-400" />
                <span className="text-neutral-300">AI-Powered Coding Tests</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-neutral-300">Real-time Feedback</span>
              </li>
              <li className="flex items-center space-x-2">
                <Heart className="h-3 w-3 text-red-400" />
                <span className="text-neutral-300">Personalized Interviews</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors pointer-events-auto"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors pointer-events-auto"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors pointer-events-auto"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors pointer-events-auto"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-neutral-400 text-xs">
              Follow us for updates and coding tips
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-neutral-400">
              © 2024 evalu8. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-neutral-400">
              <a href="#" className="hover:text-white transition-colors pointer-events-auto">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors pointer-events-auto">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors pointer-events-auto">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
