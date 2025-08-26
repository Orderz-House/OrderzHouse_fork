import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

export default function Ask() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is freelancing?",
      answer:
        "Freelancing means working independently by offering services like writing, design, programming, etc. You get paid per task or project, and you work from anywhere — as long as you have a laptop.",
    },
    {
      question: "How is freelancing different from a regular job?",
      answer:
        "No fixed hours, no boss. You choose your schedule and get paid based on your effort.",
    },
    {
      question: "What do I need to get started?",
      answer:
        "A laptop, Internet connection, and a skill (or willingness to learn — we'll train you from scratch).",
    },
    {
      question: "What's the minimum age to join?",
      answer: "18 years old and above, with a laptop.",
    },
    {
      question: "Why is there a subscription fee?",
      answer:
        "To identify serious candidates and provide quality training and support — unlike free platforms with no follow-up.",
    },
    {
      question: "Which fields can I work in?",
      answer:
        "Content writing, design, translation, programming, marketing, video editing, academic assistance — based on your skills and interests.",
    },
    {
      question: "What if I have no skills?",
      answer:
        "We train you in content writing — from simple text to full book creation.",
    },
    {
      question: "How much can I earn?",
      answer:
        "There's no fixed salary. Your income depends on your effort and project volume. You'll also learn personal financial management.",
    },
    {
      question: "How do I receive payments?",
      answer:
        "At the beginning of each month via money transfer or e-wallets, depending on your country.",
    },
    {
      question: "I be working alone?",
      answer:
        "No. A full team supports you with training, follow-up, and technical help.",
    },
    {
      question: "Is the training online?",
      answer:
        "Yes — online, recorded, and available anytime. Duration: 2-7 days depending on your effort.",
    },
    {
      question: "Is it suitable for students?",
      answer:
        "Absolutely. The flexible hours allow you to work when it suits your schedule.",
    },
    {
      question: "Is there an interview?",
      answer:
        "Yes. Contact us via WhatsApp to schedule a simple interview and help you choose your field.",
    },
    {
      question: "What's the subscription cost?",
      answer:
        "20 JOD / Trial Month, 45 JOD / One Year, 65 JOD / Two Years. One-time payment only.",
    },
    {
      question: "Do I need a university degree?",
      answer: "No.",
    },
    {
      question: "Can I work from outside Jordan?",
      answer: "Yes.",
    },
    {
      question: "Can I work in multiple fields?",
      answer: "Yes, if you have the required skills.",
    },
    {
      question: "Are there any deductions from earnings?",
      answer: "Yes: 5% income tax (refundable), 25% company commission.",
    },
    {
      question: "Is installment payment available?",
      answer: "No. One-time payment only.",
    },
    {
      question: "Will I get real jobs after training?",
      answer: "Yes. We've had active clients since 2007.",
    },
    {
      question: "How do I receive tasks?",
      answer:
        "Via orderzhouse.com — and you'll be trained through studyzhouse.com.",
    },
    {
      question: "How do I know if I'm a good fit?",
      answer:
        "If you have a skill or a strong desire to learn — you're ready. We'll train you if needed.",
    },
    {
      question: "What's the nature of the work?",
      answer:
        "A remote freelance platform offering jobs in writing, design, and programming.",
    },
    {
      question: "How do I apply?",
      answer: "Send a message on WhatsApp: 0791433341.",
    },
    {
      question: "Why is payment monthly, not per task?",
      answer:
        "Company policy: all payments are processed monthly for all freelancers.",
    },
    {
      question: "Is the subscription auto-renewed?",
      answer: "No.",
    },
    {
      question: "Can I see the contract before signing?",
      answer: "Yes — during the interview, you'll review all contract details.",
    },
    {
      question: "Is the interview in-person or online?",
      answer:
        "In-person at our office: Amman, Madinah Street, Al-Basem Complex 2, Office 405.",
    },
    {
      question: "Do I need to book an appointment to visit?",
      answer: "Yes, to reduce waiting time.",
    },
    {
      question: "How do I protect my rights?",
      answer: "The contract protects both parties equally.",
    },
    {
      question: "Is the training free?",
      answer: "Yes — fully included in your subscription.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <br />
          <br />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about freelancing with ORDERZHOUSE
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                {activeIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {activeIndex === index && (
                <div className="px-6 pb-5">
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4"></div>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-blue-100">
              Get in touch with our team for more information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <MessageCircle className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Chat with us</h3>
              <p className="text-blue-100 text-sm">WhatsApp: 0791433341</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <MapPin className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Visit us</h3>
              <p className="text-blue-100 text-sm">
                Amman, Madinah Street, Al-Basem Complex 2, Office 405
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Clock className="w-8 h-8 mb-3" />
              <h3 className="font-bold mb-1">Working hours</h3>
              <p className="text-blue-100 text-sm">Sun-Thu: 9AM - 5PM</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors duration-300">
              Contact Us Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
