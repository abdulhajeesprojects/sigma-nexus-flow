
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">
                SiGMA Hub Features
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Powerful tools designed for gaming and tech professionals
            </p>
          </motion.div>

          {/* Core Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Core Platform Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Industry-Focused Networking</h3>
                <p>Connect with professionals specifically in gaming, blockchain, AI, and emerging tech industries. Our intelligent algorithm suggests connections based on your experience, skills, and industry focus.</p>
              </div>

              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Customized Content Feed</h3>
                <p>Experience a personalized content stream featuring industry news, job opportunities, and updates from your network. Our advanced filtering ensures you see what matters most to your professional growth.</p>
              </div>

              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-full bg-sigma-blue/20 flex items-center justify-center text-sigma-blue mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Specialized Job Marketplace</h3>
                <p>Discover opportunities tailored to your skills and experience. Our job matching algorithm connects you with positions that align with your career goals and technical expertise in the gaming and tech sectors.</p>
              </div>

              <div className="flex flex-col">
                <div className="w-12 h-12 rounded-full bg-sigma-purple/20 flex items-center justify-center text-sigma-purple mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Messaging</h3>
                <p>Connect instantly with your professional network through our secure messaging platform. Share files, schedule meetings, and build meaningful industry relationships with ease.</p>
              </div>
            </div>
          </motion.div>

          {/* Advanced Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Advanced Features</h2>

            <div className="space-y-6">
              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="text-xl font-bold mb-2">Enhanced Profile Analytics</h3>
                <p>Gain insights into who's viewing your profile and how you appear in search results. Our analytics tools help you optimize your professional presence and increase your visibility within the industry.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="text-xl font-bold mb-2">Industry Event Integration</h3>
                <p>Stay connected to major industry events, including SiGMA conferences. Discover who's attending, schedule meetings, and maximize networking opportunities before, during, and after events.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="text-xl font-bold mb-2">Company Pages & Verification</h3>
                <p>Verified company profiles establish credibility and showcase your organization to potential talent and partners. Build your employer brand with dedicated company pages featuring team members, culture, and open positions.</p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="text-xl font-bold mb-2">Skills Assessment & Endorsement</h3>
                <p>Validate your expertise through our specialized skills assessment system. Receive endorsements from colleagues and showcase your verified abilities to potential employers and collaborators.</p>
              </div>
            </div>
          </motion.div>

          {/* Premium Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 mb-10"
          >
            <h2 className="text-2xl font-bold mb-6">Premium Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Advanced Search Filters</h3>
                <p className="text-sm">Find exactly who you're looking for with granular search filters including company, experience level, skills, and more.</p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Priority Messaging</h3>
                <p className="text-sm">Your messages appear at the top of recipients' inboxes, ensuring your communication gets noticed quickly.</p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Recruiter Tools</h3>
                <p className="text-sm">Access powerful hiring tools including candidate tracking, bulk messaging, and applicant notes.</p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Incognito Mode</h3>
                <p className="text-sm">Browse profiles anonymously when researching competitors or exploring new opportunities.</p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Featured Applications</h3>
                <p className="text-sm">Your job applications are highlighted to employers, increasing visibility and response rates.</p>
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">Market Insights</h3>
                <p className="text-sm">Access exclusive industry data and reports on hiring trends, salary benchmarks, and skill demand.</p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Experience SiGMA Hub?</h2>
            <p className="mb-6">
              Join thousands of gaming and tech professionals building meaningful connections and advancing their careers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/auth?signup=true">
                <Button className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white px-8">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
