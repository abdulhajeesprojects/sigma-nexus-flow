
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
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
                About SiGMA Hub
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting professionals in the global gaming and emerging tech industries
            </p>
          </motion.div>

          {/* Our Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <div className="space-y-4">
              <p>
                SiGMA Hub was founded in 2023 with a mission to create a specialized professional network for individuals and companies in the gaming, AI, blockchain, and emerging tech industries.
              </p>
              <p>
                What started as a simple networking platform for SiGMA conference attendees has evolved into a comprehensive ecosystem that facilitates professional connections, knowledge sharing, and career advancement opportunities for industry professionals worldwide.
              </p>
              <p>
                Today, SiGMA Hub connects thousands of professionals across the globe, from game developers and iGaming specialists to blockchain engineers and AI researchers, creating a vibrant community of industry leaders and innovators.
              </p>
            </div>
          </motion.div>

          {/* Our Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <div className="space-y-4">
              <p>
                At SiGMA Hub, we're on a mission to revolutionize professional networking in specialized tech industries. We believe that meaningful connections drive innovation and growth, both personally and professionally.
              </p>
              <p>
                Our platform is designed to break down geographical barriers and create opportunities for professionals at all career stages, from entry-level developers to C-suite executives, to connect, collaborate, and thrive.
              </p>
              <p>
                By fostering a community built on knowledge sharing, mentorship, and career development, we aim to advance the entire industry ecosystem and help shape the future of gaming, blockchain, and emerging technologies.
              </p>
            </div>
          </motion.div>

          {/* Leadership Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-4">Leadership Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold">Elena Mikhailov</h3>
                <p className="text-sm text-muted-foreground">Founder & CEO</p>
                <p className="mt-2">
                  With over 15 years of experience in the gaming industry, Elena founded SiGMA Hub to create the network she wished existed when starting her career.
                </p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold">Marcus Chen</h3>
                <p className="text-sm text-muted-foreground">CTO</p>
                <p className="mt-2">
                  A blockchain pioneer and former gaming platform architect, Marcus leads our technical strategy and product development initiatives.
                </p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold">Priya Sharma</h3>
                <p className="text-sm text-muted-foreground">COO</p>
                <p className="mt-2">
                  Priya brings her extensive operational experience from leading tech companies to scale SiGMA Hub's global presence and user experience.
                </p>
              </div>

              <div className="border-l-2 border-sigma-blue/50 dark:border-sigma-purple/50 pl-4">
                <h3 className="font-bold">David Torres</h3>
                <p className="text-sm text-muted-foreground">Director of Community</p>
                <p className="mt-2">
                  A veteran community builder, David ensures SiGMA Hub remains a vibrant, valuable network for all members worldwide.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Community Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-8 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6">Our Global Impact</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">50K+</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
              <div>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">120+</p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </div>
              <div>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">5K+</p>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
              <div>
                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sigma-blue to-sigma-purple">3.5M+</p>
                <p className="text-sm text-muted-foreground">Connections Made</p>
              </div>
            </div>
          </motion.div>

          {/* Join Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Whether you're looking to advance your career, find top talent, or simply connect with like-minded professionals, SiGMA Hub is your gateway to the global gaming and emerging tech community.
            </p>
            <Link to="/auth?signup=true">
              <Button className="bg-gradient-to-r from-sigma-blue to-sigma-purple hover:from-sigma-purple hover:to-sigma-blue text-white px-8 py-6 text-lg">
                Join SiGMA Hub Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
