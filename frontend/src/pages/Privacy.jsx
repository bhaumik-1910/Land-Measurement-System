import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Database, Bell } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Shield size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg">Last updated: May 10, 2026</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[40px] p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <section className="space-y-12">
            <PrivacySection 
              icon={<Lock className="text-indigo-500" />}
              title="1. Information We Collect"
              content="We collect personal information that you provide to us such as name, address, contact information, and specific land details required for measurement. This includes GPS coordinates and property documentation uploaded by users."
            />

            <PrivacySection 
              icon={<Eye className="text-emerald-500" />}
              title="2. How We Use Your Information"
              content="Your data is used solely for the purpose of land measurement, verification, and administrative record-keeping. We use advanced algorithms to process spatial data to ensure the highest degree of accuracy in our survey results."
            />

            <PrivacySection 
              icon={<FileText className="text-amber-500" />}
              title="3. Information Sharing"
              content="We do not sell your personal data. Information is shared only with authorized government bodies and officials involved in the land verification process as required by the law of Gujarat."
            />

            <PrivacySection 
              icon={<Database className="text-rose-500" />}
              title="4. Data Security"
              content="We implement robust security measures to protect your data. All sensitive information is encrypted both at rest and in transit using industry-standard protocols."
            />

            <PrivacySection 
              icon={<Bell className="text-sky-500" />}
              title="5. Your Rights"
              content="You have the right to access, correct, or delete your personal records stored on our platform. You can contact our support team at any time for assistance with your data privacy requests."
            />
          </section>

          <div className="mt-20 p-8 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Our Privacy Team</h3>
            <p className="text-slate-600 mb-6">
              If you have any questions or concerns about our Privacy Policy or data processing practices, 
              please reach out to us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="mailto:privacy@smartsurvey.gujarat.gov.in" className="text-primary font-bold hover:underline">
                privacy@smartsurvey.gujarat.gov.in
              </a>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="text-slate-600">+91 93136 29723</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PrivacySection = ({ icon, title, content }) => (
  <div className="flex gap-6 items-start">
    <div className="bg-slate-50 p-4 rounded-2xl shrink-0 mt-1">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-600 leading-relaxed text-lg">
        {content}
      </p>
    </div>
  </div>
);

export default Privacy;
