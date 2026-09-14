import { motion } from 'framer-motion';

export default function JobApplication() {
  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-24 text-slate-900">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-sm font-semibold tracking-widest text-slate-500 uppercase flex items-center gap-2 mb-4"
          >
            <div className="w-4 h-px bg-slate-400"></div> APPLICATION
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-extrabold font-poppins text-slate-900 mb-4"
          >
            Apply for Position
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-slate-600"
          >
            Fill out the details below. We'll be in touch shortly.
          </motion.p>
        </div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-200"
        >
          <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-900" htmlFor="name">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-900" htmlFor="mobile">
                  Mobile No. *
                </label>
                <input
                  required
                  type="tel"
                  id="mobile"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
                  placeholder="+91 1234567890"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="email">
                Email Address *
              </label>
              <input
                required
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all"
                placeholder="ks@example.com"
              />
            </div>

            {/* Skills */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="skills">
                Key Skills *
              </label>
              <textarea
                required
                id="skills"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#ccff00] focus:border-transparent transition-all resize-none"
                placeholder="E.g., AutoCAD, Project Management, Electrical Engineering..."
              ></textarea>
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-900" htmlFor="resume">
                Upload Resume (PDF, DOCX) *
              </label>
              <input
                required
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer text-slate-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium mt-4 hover:bg-[#ccff00] hover:text-slate-900 transition-colors duration-300"
            >
              Apply Now
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export { JobApplication };
