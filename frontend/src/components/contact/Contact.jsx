import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  User,
  AlertCircle,
} from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* ✅ BACKGROUND (contained inside this page only) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F0F3BD]/10 via-white to-[#02C39A]/5 pointer-events-none"></div>
      <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#F0F3BD]/20 to-[#02C39A]/10 blur-xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#05668D]/10 to-[#028090]/20 blur-2xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#00A896]/5 to-[#F0F3BD]/10 blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute top-1/4 right-1/3 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#028090]/8 to-[#02C39A]/15 blur-2xl animate-pulse pointer-events-none"></div>

      {/* ✅ PAGE CONTENT */}
      <div className="relative z-10">
        <section className="py-16 text-center">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: "'Merriweather', serif" }}>
            Get in <span className="text-[#028090]">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto" style={{ fontFamily: "'Merriweather', serif" }}>
            Have questions or need assistance? We're here to help you with anything you need.
          </p>
        </section>

        {/* Contact Form & Details */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 xl:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#F0F3BD]/20">
              <h2 className="text-2xl font-bold mb-8 text-gray-700" style={{ fontFamily: "'Merriweather', serif" }}>
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#05668D] to-[#028090] rounded-xl flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Phone Number</h3>
                    <p className="text-gray-600">+962 791 433 341</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#028090] to-[#00A896] rounded-xl flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Email Address</h3>
                    <p className="text-gray-600">info@orderzhouse.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#00A896] to-[#02C39A] rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Office Location</h3>
                    <p className="text-gray-600">Amman, Madinah Street</p>
                    <p className="text-gray-600">Al-Basem Complex 2, Office 405</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="xl:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-[#F0F3BD]/20">
              <h2 className="text-2xl font-bold mb-8 text-gray-700" style={{ fontFamily: "'Merriweather', serif" }}>
                Send us a Message
              </h2>

              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                  Your message has been sent successfully!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
                  Something went wrong. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name *"
                    className="w-full px-4 py-3 border border-[#F0F3BD]/50 rounded-xl focus:ring-2 focus:ring-[#028090]"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Email Address *"
                    className="w-full px-4 py-3 border border-[#F0F3BD]/50 rounded-xl focus:ring-2 focus:ring-[#028090]"
                  />
                </div>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border border-[#F0F3BD]/50 rounded-xl focus:ring-2 focus:ring-[#028090]"
                />

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#F0F3BD]/50 rounded-xl focus:ring-2 focus:ring-[#028090]"
                >
                  <option value="">Select a subject *</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Your Message *"
                  className="w-full px-4 py-3 border border-[#F0F3BD]/50 rounded-xl focus:ring-2 focus:ring-[#028090]"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#028090] to-[#02C39A] text-white font-semibold rounded-xl hover:from-[#05668D] hover:to-[#00A896] transition"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
